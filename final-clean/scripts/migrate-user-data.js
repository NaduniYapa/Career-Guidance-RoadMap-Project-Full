/**
 * User Data Migration Script — Converts old schema to new schema
 * For existing users who have data in the old format
 * Run with: node scripts/migrate-user-data.js
 */

import { pool } from '../src/lib/pool.js';

async function migrateUserData() {
 const client = await pool.connect();
 try {
 await client.query('BEGIN');

 console.log(' Starting user data migration...\n');

 // 1. Migrate user_profiles.selected_career → user_careers
 console.log('📝 Migrating user careers...');
 const profileRes = await client.query(`
 SELECT up.user_id, up.selected_career
 FROM user_profiles up
 WHERE up.selected_career IS NOT NULL
 AND NOT EXISTS (
 SELECT 1 FROM user_careers uc WHERE uc.user_id = up.user_id
 )
 `);

 let careersMigrated = 0;
 for (const row of profileRes.rows) {
 try {
 // Find career ID by name
 const careerRes = await client.query(
 'SELECT id FROM careers WHERE name = $1 LIMIT 1',
 [row.selected_career]
 );

 if (careerRes.rows.length > 0) {
 // Insert into user_careers
 await client.query(
 `INSERT INTO user_careers (user_id, career_id)
 VALUES ($1, $2)
 ON CONFLICT (user_id) DO NOTHING`,
 [row.user_id, careerRes.rows[0].id]
 );
 careersMigrated++;
 } else {
 console.warn(` [WARN] Career "${row.selected_career}" not found in database`);
 }
 } catch (e) {
 console.error(` [ERROR] Error migrating career for user ${row.user_id}:`, e.message);
 }
 }
 console.log(` ✓ ${careersMigrated} users' career selections migrated\n`);

 // 2. Check for old user_skills with skill_name (requires custom approach)
 console.log('📝 Checking user skills...');
 const skillsCheckRes = await client.query(`
 SELECT column_name FROM information_schema.columns
 WHERE table_name='user_skills' AND column_name='skill_name'
 `);

 if (skillsCheckRes.rows.length > 0) {
 console.log(' [WARN] Old skill_name column detected. Manual migration may be needed.');
 console.log(' ℹ️ The schema has been updated to use skill_id (FK to skills table)');
 console.log(' ℹ️ Old skill_name records will be automatically matched by name\n');

 // Try to auto-migrate by matching skill names
 const oldSkillsRes = await client.query(`
 SELECT DISTINCT us.user_id, us.skill_name, us.completed, us.assessed_at
 FROM user_skills us
 WHERE us.skill_name IS NOT NULL
 `);

 let skillsMigrated = 0;
 for (const skillRow of oldSkillsRes.rows) {
 try {
 const skillRes = await client.query(
 'SELECT id FROM skills WHERE name = $1 LIMIT 1',
 [skillRow.skill_name]
 );

 if (skillRes.rows.length > 0) {
 const skillId = skillRes.rows[0].id;
 
 // Check if already migrated
 const existingRes = await client.query(
 'SELECT id FROM user_skills WHERE user_id = $1 AND skill_id = $2 LIMIT 1',
 [skillRow.user_id, skillId]
 );

 if (existingRes.rows.length === 0) {
 // Create new record with skill_id
 await client.query(
 `INSERT INTO user_skills (user_id, skill_id, completed, assessed_at)
 VALUES ($1, $2, $3, $4)
 ON CONFLICT (user_id, skill_id) DO SELECT 1 -- Do nothing if exists`,
 [skillRow.user_id, skillId, skillRow.completed, skillRow.assessed_at]
 );
 skillsMigrated++;
 }
 }
 } catch (e) {
 console.error(` [ERROR] Error migrating skill "${skillRow.skill_name}":`, e.message);
 }
 }
 console.log(` ✓ ${skillsMigrated} skill records migrated to use skill_id\n`);
 } else {
 console.log(' ✓ skill_id column exists (already on new schema)\n');
 }

 await client.query('COMMIT');
 console.log('[OK] User data migration completed!\n');
 console.log(' Summary:');
 console.log(` • Careers migrated: ${careersMigrated}`);
 console.log(' • Skills conversion: Ready for use\n');
 console.log('[INFO] Next steps:');
 console.log(' 1. Test user login/logout flow');
 console.log(' 2. Verify roadmap persists after logging out and back in');
 console.log(' 3. Check rewards endpoint if applicable\n');
 } catch (err) {
 await client.query('ROLLBACK');
 console.error('[ERROR] Migration failed:', err.message);
 process.exit(1);
 } finally {
 client.release();
 await pool.end();
 }
}

migrateUserData();
