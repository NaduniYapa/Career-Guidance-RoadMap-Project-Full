-- Career Guidance Platform — Database Schema
-- Run with: psql $DATABASE_URL -f scripts/create-schema.sql
-- This script safely handles both fresh installs and upgrades from old schemas

-- User roles enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'professional', 'admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(255) NOT NULL UNIQUE,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'student',
  title         VARCHAR(255),
  org           VARCHAR(255),
  specialty     VARCHAR(255),
  avatar        TEXT,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role     ON users(role);

-- Careers (replaces hardcoded career data)
CREATE TABLE IF NOT EXISTS careers (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL UNIQUE,
  description   TEXT,
  icon          VARCHAR(50),
  color         VARCHAR(7),
  accent        VARCHAR(7),
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_careers_name ON careers(name);

-- Levels/Stages (Foundation, Core Technical, Tools, Projects, Soft Skills, Job Preparation)
CREATE TABLE IF NOT EXISTS levels (
  id            SERIAL PRIMARY KEY,
  career_id     INTEGER NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  order_index   INTEGER NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(career_id, name)
);
CREATE INDEX IF NOT EXISTS idx_levels_career_id ON levels(career_id);
CREATE INDEX IF NOT EXISTS idx_levels_order ON levels(career_id, order_index);

-- Skills (with resources embedded as JSON)
CREATE TABLE IF NOT EXISTS skills (
  id            SERIAL PRIMARY KEY,
  level_id      INTEGER NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  weight        INTEGER NOT NULL DEFAULT 5,
  resources     JSONB DEFAULT '[]',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_skills_level_id ON skills(level_id);
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);

-- User careers (track which career each user selected)
CREATE TABLE IF NOT EXISTS user_careers (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  career_id     INTEGER NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  selected_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
CREATE INDEX IF NOT EXISTS idx_user_careers_user_id ON user_careers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_careers_career_id ON user_careers(career_id);

-- ============================================================================
-- USER_SKILLS TABLE - Handle both old and new schemas intelligently
-- ============================================================================
-- Check if old user_skills table exists and needs migration
DO $$
DECLARE
  v_old_table_exists BOOLEAN;
  v_new_table_exists BOOLEAN;
BEGIN
  -- Check if old user_skills table exists with skill_name column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_skills' AND column_name = 'skill_name'
  ) INTO v_old_table_exists;

  -- Check if new user_skills table exists with skill_id column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_skills' AND column_name = 'skill_id'
  ) INTO v_new_table_exists;

  -- If old table exists but not new, migrate it
  IF v_old_table_exists AND NOT v_new_table_exists THEN
    RAISE NOTICE 'Migrating old user_skills schema to new schema...';
    
    -- Drop old indexes if they exist
    DROP INDEX IF EXISTS idx_user_skills_user_id;
    DROP INDEX IF EXISTS idx_user_skills_completed;
    RAISE NOTICE '  - Dropped old indexes';
    
    -- Rename old table temporarily
    ALTER TABLE user_skills RENAME TO user_skills_old;
    RAISE NOTICE '  - Renamed old table to user_skills_old';
    
    -- Create new table with skill_id FK
    CREATE TABLE user_skills (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      skill_id    INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      completed   BOOLEAN NOT NULL DEFAULT false,
      assessed_at TIMESTAMP,
      UNIQUE(user_id, skill_id)
    );
    RAISE NOTICE '  - Created new user_skills table with skill_id';
    
    -- Create indexes
    CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
    CREATE INDEX idx_user_skills_skill_id ON user_skills(skill_id);
    CREATE INDEX idx_user_skills_completed ON user_skills(completed);
    RAISE NOTICE '  - Created new indexes';
  
  ELSIF NOT v_new_table_exists THEN
    -- Fresh install - create new table directly
    CREATE TABLE user_skills (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      skill_id    INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      completed   BOOLEAN NOT NULL DEFAULT false,
      assessed_at TIMESTAMP,
      UNIQUE(user_id, skill_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills(skill_id);
    CREATE INDEX IF NOT EXISTS idx_user_skills_completed ON user_skills(completed);
    RAISE NOTICE 'Created new user_skills table (fresh install)';
  END IF;
END $$;

-- User profiles (legacy, kept for backward compatibility)
CREATE TABLE IF NOT EXISTS user_profiles (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  selected_career VARCHAR(255),
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Forum posts
CREATE TABLE IF NOT EXISTS forum_posts (
  id               SERIAL PRIMARY KEY,
  author_username  VARCHAR(255) NOT NULL,
  author_name      VARCHAR(255) NOT NULL,
  career           VARCHAR(255) NOT NULL,
  question         TEXT NOT NULL,
  tagged_mentor    VARCHAR(255),
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author     ON forum_posts(author_username);
CREATE INDEX IF NOT EXISTS idx_forum_posts_career     ON forum_posts(career);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at);

-- Forum replies
CREATE TABLE IF NOT EXISTS forum_replies (
  id               SERIAL PRIMARY KEY,
  post_id          INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_username  VARCHAR(255) NOT NULL,
  author_name      VARCHAR(255) NOT NULL,
  text             TEXT NOT NULL,
  is_professional  BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post_id    ON forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author     ON forum_replies(author_username);
CREATE INDEX IF NOT EXISTS idx_forum_replies_created_at ON forum_replies(created_at);

-- Notifications (for professionals when students post questions)
CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id     INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  type        VARCHAR(50) NOT NULL,
  career      VARCHAR(255) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  question    TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read       ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Chatbot Responses (for AI-driven chatbot)
CREATE TABLE IF NOT EXISTS chatbot_responses (
  id        SERIAL PRIMARY KEY,
  keywords  TEXT[] NOT NULL,
  response  TEXT NOT NULL,
  category  VARCHAR(100),
  priority  INTEGER NOT NULL DEFAULT 0,
  active    BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_chatbot_responses_category ON chatbot_responses(category);
CREATE INDEX IF NOT EXISTS idx_chatbot_responses_active ON chatbot_responses(active);
CREATE INDEX IF NOT EXISTS idx_chatbot_responses_priority ON chatbot_responses(priority DESC);

-- Learning Phases (replaces hardcoded STAGES - Foundation, Core Technical, Tools, Projects, Soft Skills, Job Preparation)
CREATE TABLE IF NOT EXISTS learning_phases (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL UNIQUE,
  icon          VARCHAR(10) NOT NULL,
  order_idx     INTEGER NOT NULL UNIQUE,
  description   TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_learning_phases_order ON learning_phases(order_idx);

-- Resource Types (replaces hardcoded RESOURCE_COLORS)
CREATE TABLE IF NOT EXISTS resource_types (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(50) NOT NULL UNIQUE,
  color       VARCHAR(7) NOT NULL,
  icon        VARCHAR(10),
  created_at  TIMESTAMP DEFAULT NOW()
);

