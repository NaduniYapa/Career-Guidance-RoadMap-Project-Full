/**
 * Centralized Database Connection Pool
 * 
 * Shared by all migration and utility scripts to avoid duplication.
 * Configured from .env.local DATABASE_URL with SSL support.
 * 
 * Usage:
 *   import { pool } from './pool.js';
 *   const result = await pool.query('SELECT * FROM users');
 */

import pg from 'pg';
import { config } from 'dotenv';

config({ path: '.env.local' });

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL not set in .env.local');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default pool;
