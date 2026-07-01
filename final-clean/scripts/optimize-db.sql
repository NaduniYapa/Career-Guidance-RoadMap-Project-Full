-- Database Performance Optimization Script
-- Run with: psql $DATABASE_URL -f scripts/optimize-db.sql

-- Add UNIQUE constraint on user_skills (if not exists)
-- This enables efficient UPSERT operations
DO $$ BEGIN
  ALTER TABLE user_skills ADD CONSTRAINT unique_user_skill UNIQUE(user_id, skill_name);
EXCEPTION WHEN duplicate_object THEN
  -- Constraint already exists, nothing to do
  NULL;
END $$;

-- Add composite index on user_skills for better query performance
CREATE INDEX IF NOT EXISTS idx_user_skills_user_completed 
  ON user_skills(user_id, completed) WHERE completed = true;

-- Add index on forum_posts for efficient ordering and filtering
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_career 
  ON forum_posts(created_at DESC, career);

-- Add index on forum_replies for efficient filtering by post
CREATE INDEX IF NOT EXISTS idx_forum_replies_post_created 
  ON forum_replies(post_id, created_at ASC);

-- Add index on notifications for common query patterns
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_id, read) WHERE read = false;

-- Analyze all tables to update query planner statistics
ANALYZE;
