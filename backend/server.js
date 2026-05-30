/**
 * ────────────────────────────────────────────────────────────
 * SADAR Finance API — Server Entry Point
 * Smart AI-Driven Automated Receipt & Finance Management
 * ────────────────────────────────────────────────────────────
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');

const config = require('./config');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const ocrRepository = require('./repositories/ocr.repository');
const { query: dbQuery } = require('./config/database');
const { error: errorResponse } = require('./utils/response');
const { getDatabaseErrorResponse } = require('./utils/dbError');

const app = express();
app.set('trust proxy', 1);
app.set('etag', false);

// ── Ensure upload directory exists ──────────────────────────
const uploadDir = path.join(__dirname, config.upload.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const rateLimitMessage = {
  success: false,
  error: {
    code: 'TOO_MANY_REQUESTS',
    message: 'Too many requests, please try again later.',
  },
};

const authRateLimitedPaths = new Set([
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/forgot-password',
]);

const normalizePath = (req) => (req.originalUrl || '')
  .split('?')[0]
  .replace(/\/+$/, '');

const isAuthRateLimitedPath = (req) => authRateLimitedPaths.has(normalizePath(req));

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isCorsOriginAllowed = (origin) => {
  const allowedOrigins = config.cors.allowedOrigins;
  const normalizedOrigin = origin.replace(/\/$/, '');

  return allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin === '*') return true;
    if (!allowedOrigin.includes('*')) return allowedOrigin === normalizedOrigin;

    const originPattern = escapeRegExp(allowedOrigin).replace(/\\\*/g, '[^/]+');
    return new RegExp(`^${originPattern}$`, 'i').test(normalizedOrigin);
  });
};

const setUploadResponseHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'none'; img-src * data: blob:;");
};

// ── Global Middleware ───────────────────────────────────────
app.use(helmet());                                      // Security headers
app.use(cors({
  origin(origin, callback) {
    const allowedOrigins = config.cors.allowedOrigins;

    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 && config.env !== 'production') {
      return callback(null, true);
    }
    if (isCorsOriginAllowed(origin)) return callback(null, true);

    return callback(null, false);
  },
  credentials: true,
}));                                                    // CORS
app.use(express.json({ limit: '10mb' }));               // Parse JSON body
app.use(express.urlencoded({ extended: true }));         // Parse URL-encoded body
app.use(morgan(config.env === 'production' ? 'combined' : 'dev')); // Logging

app.use('/api/v1', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Auth limiter protects sensitive auth actions without sharing the dashboard/profile quota.
app.use(['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/forgot-password'], rateLimit({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMax,
  skip: (req) => req.method === 'OPTIONS',
  skipSuccessfulRequests: true,
  message: rateLimitMessage,
  standardHeaders: true,
  legacyHeaders: false,
}));

// General API limiter for regular app traffic.
app.use('/api/', rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  skip: (req) => req.method === 'OPTIONS' || isAuthRateLimitedPath(req),
  message: rateLimitMessage,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Serve uploaded files statically. Receipts can be embedded by the Vercel frontend.
app.use('/uploads', express.static(uploadDir, {
  setHeaders: setUploadResponseHeaders,
}));
app.get('/uploads/:filename', async (req, res, next) => {
  try {
    const image = await ocrRepository.findImageByUrl(`/uploads/${req.params.filename}`);

    if (!image?.image_data) {
      return next();
    }

    setUploadResponseHeaders(res);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.type(image.mime_type || 'application/octet-stream');
    return res.send(image.image_data);
  } catch (err) {
    return next(err);
  }
});

// ── Swagger Documentation ──────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SADAR Finance API Docs',
}));

// Serve Swagger spec as JSON
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ── Health Check ────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'SADAR Finance API is running',
    data: {
      version: '1.0.0',
      environment: config.env,
      timestamp: new Date().toISOString(),
    },
  });
});

app.get('/health/db', async (_req, res, next) => {
  try {
    await dbQuery('SELECT 1');

    return res.json({
      success: true,
      message: 'PostgreSQL connection is healthy',
      data: config.env === 'production' ? {
        status: 'ok',
      } : {
        host: config.db.host,
        port: config.db.port,
        database: config.db.database,
      },
    });
  } catch (err) {
    const dbError = getDatabaseErrorResponse(err);
    if (dbError) return errorResponse(res, dbError);
    return next(err);
  }
});

// ── API Routes ──────────────────────────────────────────────
app.use('/api/v1', routes);

// ── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist',
    },
  });
});

// ── Centralized Error Handler ───────────────────────────────
app.use(errorHandler);

// ── Start Server ────────────────────────────────────────────
const server = app.listen(config.port, () => {
  console.log(`
  ╔══════════════════════════════════════════════════════╗
  ║                                                      ║
  ║   🚀 SADAR Finance API                               ║
  ║                                                      ║
  ║   Environment : ${config.env.padEnd(35)}║
  ║   Port        : ${String(config.port).padEnd(35)}║
  ║   API Docs    : http://localhost:${config.port}/api-docs${' '.repeat(13)}║
  ║   Health      : http://localhost:${config.port}/health${' '.repeat(15)}║
  ║                                                      ║
  ╚══════════════════════════════════════════════════════╝
  `);
});

// ── Graceful Shutdown ───────────────────────────────────────
const gracefulShutdown = (signal) => {
  console.log(`\n[${signal}] Shutting down gracefully...`);
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });

  // Force shutdown after 10s
  setTimeout(() => {
    console.error('⚠️ Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION]', err.message);
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = app;
