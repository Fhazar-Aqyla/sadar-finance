/**
 * Central Route Index — Mounts all route modules under /api/v1.
 */
const { Router } = require('express');

const authRoutes = require('./auth.routes');
const accountRoutes = require('./account.routes');
const transactionRoutes = require('./transaction.routes');
const incomeRoutes = require('./income.routes');
const ocrRoutes = require('./ocr.routes');
const analyticsRoutes = require('./analytics.routes');
const categoryRoutes = require('./category.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/transactions', transactionRoutes);
router.use('/incomes', incomeRoutes);
router.use('/ocr', ocrRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;
