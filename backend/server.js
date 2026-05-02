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

const app = express();

// ── Ensure upload directory exists ──────────────────────────
const uploadDir = path.join(__dirname, config.upload.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ── Global Middleware ───────────────────────────────────────
app.use(helmet());                                      // Security headers
app.use(cors());                                        // CORS
app.use(express.json({ limit: '10mb' }));               // Parse JSON body
app.use(express.urlencoded({ extended: true }));         // Parse URL-encoded body
app.use(morgan(config.env === 'production' ? 'combined' : 'dev')); // Logging

// Rate limiter
app.use('/api/', rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

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
