/**
 * Reset Script — drops all tables and re-runs the schema.
 * WARNING: destroys all data. Dev only.
 *
 * Run with: node scripts/reset-db.js
 */

import { config } from 'dotenv';
import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

config({ path: '.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function reset() {
 console.log('[WARN] Resetting database — all data will be lost...\n');
 try {
 await pool.query(`
 DROP TABLE IF EXISTS notifications CASCADE;
 DROP TABLE IF EXISTS forum_replies CASCADE;
 DROP TABLE IF EXISTS forum_posts CASCADE;
 DROP TABLE IF EXISTS user_skills CASCADE;
 DROP TABLE IF EXISTS user_profiles CASCADE;
 DROP TABLE IF EXISTS users CASCADE;
 DROP TYPE IF EXISTS user_role CASCADE;
 `);
 console.log('[OK] All tables dropped.');

 const schema = readFileSync(join(__dirname, 'create-schema.sql'), 'utf8');
 await pool.query(schema);
 console.log('[OK] Schema recreated.\n');
 console.log('[INFO] Run "node scripts/seed-db.js" to repopulate with demo data.');
 } catch (err) {
 console.error('[ERROR] Reset failed:', err.message);
 process.exit(1);
 } finally {
 await pool.end();
 }
}

reset();
