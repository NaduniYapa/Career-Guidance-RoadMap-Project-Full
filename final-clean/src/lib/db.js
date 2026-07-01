import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const isProduction = process.env.NODE_ENV === 'production';

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: isProduction ? 50 : 20,  // Maximum connections (production: 50, dev: 20)
  min: isProduction ? 10 : 5,   // Minimum connections (increased for faster response)
  idleTimeoutMillis: 30000,     // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Faster connection timeout for better error detection
  keepAlive: true,              // Keep connections alive
};

const globalKey = Symbol.for('pg.pool');

const pool = global[globalKey] || new Pool(poolConfig);

if (!global[globalKey]) {
  global[globalKey] = pool;
}

const retryableCodes = new Set([
  'ECONNRESET',
  'ENOTFOUND',
  'ETIMEDOUT',
  'ECONNREFUSED',
  '57P01', // admin_shutdown
  '57P02', // crash_shutdown
  '53300', // too_many_connections
  '08006', // connection_failure
  '08003', // connection_does_not_exist
]);

function isRetryableError(error) {
  if (!error) return false;
  if (typeof error.code === 'string' && retryableCodes.has(error.code)) return true;
  const msg = String(error.message || '').toLowerCase();
  return msg.includes('connection terminated unexpectedly') || msg.includes('connection reset') || msg.includes('timeout');
}

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export async function query(text, params, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await pool.query(text, params);
    } catch (error) {
      if (isRetryableError(error) && attempt < retries) {
        await new Promise((r) => setTimeout(r, Math.min(1000 * 2 ** (attempt - 1), 5000)));
        continue;
      }
      throw error;
    }
  }
}

export async function getClient(retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await pool.connect();
    } catch (error) {
      if (isRetryableError(error) && attempt < retries) {
        await new Promise((r) => setTimeout(r, Math.min(1000 * 2 ** (attempt - 1), 5000)));
        continue;
      }
      throw error;
    }
  }
}

export async function transaction(callback) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Rollback failed:', rollbackErr);
    }
    throw error;
  } finally {
    try {
      client.release();
    } catch (releaseErr) {
      console.error('Client release failed:', releaseErr);
    }
  }
}

export default pool;
