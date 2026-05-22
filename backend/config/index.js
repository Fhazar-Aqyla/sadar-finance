/**
 * Centralized configuration module.
 * All environment variables are validated and exported from here.
 */

const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const rawDbPassword = process.env.DB_PASSWORD;
const dbPassword = rawDbPassword === 'your_password_here' ? '' : String(rawDbPassword ?? '');

if (rawDbPassword === 'your_password_here') {
  console.warn('[CONFIG] DB_PASSWORD masih placeholder. Dianggap kosong; isi backend/.env dengan password PostgreSQL lokal jika user postgres memakai password.');
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'sadar_finance',
    user: process.env.DB_USER || 'postgres',
    password: dbPassword,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  ai: {
    serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:5000',
    timeoutMs: parseInt(process.env.AI_SERVICE_TIMEOUT_MS, 10) || 10000,
    mockMode: process.env.AI_MOCK_MODE === 'true',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  upload: {
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10,
    dir: process.env.UPLOAD_DIR || 'uploads',
  },
};

module.exports = config;
