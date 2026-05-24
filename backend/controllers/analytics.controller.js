/**
 * Analytics Controller — AI/analytics endpoints.
 * Results are stored in ERD tables: insights, alerts, scores, budgets
 */

const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const analyticsService = require('../services/analytics.service');

// AI Categorization
const categorize = asyncHandler(async (req, res) => {
  const result = await analyticsService.categorize(req.user.id, req.body);
  return created(res, { data: result, message: 'Transaction categorized successfully' });
});

// Behavior Analysis → saves insights
const analyzeBehavior = asyncHandler(async (req, res) => {
  const result = await analyticsService.analyzeBehavior(req.user.id, req.body);
  return created(res, { data: result, message: 'Behavior analysis completed' });
});

// Overspending Prediction → saves alerts
const predictBehavior = asyncHandler(async (req, res) => {
  const result = await analyticsService.predictBehavior(req.user.id, req.body);
  return created(res, { data: result, message: 'Behavior spike prediction completed' });
});

const predictOverspending = asyncHandler(async (req, res) => {
  const result = await analyticsService.predictOverspending(req.user.id, req.body);
  return created(res, { data: result, message: 'Overspending prediction completed' });
});

// Financial Health Score → saves score
const calculateHealthScore = asyncHandler(async (req, res) => {
  const result = await analyticsService.calculateHealthScore(req.user.id, req.body);
  return created(res, { data: result, message: 'Financial health score calculated' });
});

// Budget CRUD
const createBudget = asyncHandler(async (req, res) => {
  const budget = await analyticsService.createBudget(req.user.id, req.body);
  return created(res, { data: budget, message: 'Budget created successfully' });
});

const getLatestBudget = asyncHandler(async (req, res) => {
  const budget = await analyticsService.getLatestBudget(req.user.id);
  return success(res, { data: budget, message: 'Budget retrieved' });
});

// Read insights, alerts, scores
const getInsights = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await analyticsService.getInsights(req.user.id, { page, limit });
  return success(res, { data: result.data, message: 'Insights retrieved', meta: { pagination: { page: parseInt(page), limit: parseInt(limit), total: result.total, totalPages: Math.ceil(result.total / limit) } } });
});

const getAlerts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await analyticsService.getAlerts(req.user.id, { page, limit });
  return success(res, { data: result.data, message: 'Alerts retrieved', meta: { pagination: { page: parseInt(page), limit: parseInt(limit), total: result.total, totalPages: Math.ceil(result.total / limit) } } });
});

const getScoreHistory = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const data = await analyticsService.getScoreHistory(req.user.id, limit);
  return success(res, { data, message: 'Score history retrieved' });
});

const getLatestScore = asyncHandler(async (req, res) => {
  const data = await analyticsService.getLatestScore(req.user.id);
  return success(res, { data, message: 'Latest score retrieved' });
});

module.exports = {
  categorize, analyzeBehavior, predictBehavior, predictOverspending, calculateHealthScore,
  createBudget, getLatestBudget,
  getInsights, getAlerts, getScoreHistory, getLatestScore,
};
