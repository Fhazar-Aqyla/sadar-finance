/**
 * PostgreSQL connection pool using node-pg.
 * Uses a connection pool for performance and connection reuse.
 */

const { Pool } = require('pg');
const config = require('./index');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: String(config.db.password ?? ''),
  max: 20,                     // Maximum pool size
  idleTimeoutMillis: 30000,    // Close idle clients after 30s
  connectionTimeoutMillis: 5000, // Timeout after 5s if can't connect
});

// Log pool errors
pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

/**
 * Helper: execute a query against the pool.
 * @param {string} text - SQL query string
 * @param {Array}  params - Parameterized values
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = async (text, params) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  if (config.env === 'development') {
    console.log('[DB] Query executed', { text: text.substring(0, 80), duration: `${duration}ms`, rows: result.rowCount });
  }

  return result;
};

/**
 * Helper: get a client from the pool (for transactions).
 */
const getClient = () => pool.connect();

module.exports = { pool, query, getClient };
