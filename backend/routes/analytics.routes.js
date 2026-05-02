/**
 * Analytics Routes — AI features + budget/insight/alert/score reads
 */
const { Router } = require('express');
const c = require('../controllers/analytics.controller');
const authenticate = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const { categorizeSchema, behaviorAnalysisSchema, overspendingSchema, healthScoreSchema, createBudgetSchema } = require('../validators/analytics.validator');

const router = Router();
router.use(authenticate);

// AI Categorization
router.post('/categorize', validate(categorizeSchema), c.categorize);

// Behavior Analysis → insights
router.post('/behavior', validate(behaviorAnalysisSchema), c.analyzeBehavior);

// Overspending Prediction → alerts
router.post('/overspending', validate(overspendingSchema), c.predictOverspending);

// Financial Health Score → scores
router.post('/health-score', validate(healthScoreSchema), c.calculateHealthScore);
router.get('/health-score/latest', c.getLatestScore);
router.get('/health-score/history', c.getScoreHistory);

// Budget
router.post('/budget', validate(createBudgetSchema), c.createBudget);
router.get('/budget', c.getLatestBudget);

// Read insights & alerts
router.get('/insights', c.getInsights);
router.get('/alerts', c.getAlerts);

module.exports = router;
