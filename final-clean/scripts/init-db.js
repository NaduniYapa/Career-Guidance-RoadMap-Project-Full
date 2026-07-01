/**
 * Init Script — creates all tables from create-schema.sql.
 * Safe to run on an existing DB (uses CREATE IF NOT EXISTS).
 *
 * Run with: node scripts/init-db.js
 */

import { config } from 'dotenv';
import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

config({ path: '.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
 console.error('[ERROR] DATABASE_URL not set in .env.local');
 process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function init() {
 console.log(' Initialising database...\n');
 try {
 const schema = readFileSync(join(__dirname, 'create-schema.sql'), 'utf8');
 await pool.query(schema);
 console.log('[OK] All tables created successfully.');
 console.log('[INFO] Run "node scripts/seed-db.js" to populate with demo data.\n');
 } catch (err) {
 console.error('[ERROR] Init failed:', err.message);
 process.exit(1);
 } finally {
 await pool.end();
 }
}

init();
