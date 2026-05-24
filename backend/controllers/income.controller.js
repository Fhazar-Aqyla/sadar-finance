/**
 * Income Controller — Handles income HTTP requests.
 */

const asyncHandler = require('../utils/asyncHandler');
const { success, created, noContent, paginated } = require('../utils/response');
const incomeService = require('../services/income.service');

const createIncome = asyncHandler(async (req, res) => {
  const income = await incomeService.create(req.user.id, req.body);
  return created(res, { data: income, message: 'Income created successfully' });
});

const getIncomes = asyncHandler(async (req, res) => {
  const { data, total } = await incomeService.findAll(req.user.id, req.query);
  return paginated(res, {
    data, page: req.query.page || 1, limit: req.query.limit || 20, total,
    message: 'Incomes retrieved successfully',
  });
});

const getIncome = asyncHandler(async (req, res) => {
  const income = await incomeService.findById(req.params.id, req.user.id);
  return success(res, { data: income, message: 'Income retrieved successfully' });
});

const updateIncome = asyncHandler(async (req, res) => {
  const income = await incomeService.update(req.params.id, req.user.id, req.body);
  return success(res, { data: income, message: 'Income updated successfully' });
});

const deleteIncome = asyncHandler(async (req, res) => {
  await incomeService.delete(req.params.id, req.user.id);
  return noContent(res);
});

const getMonthlyTrend = asyncHandler(async (req, res) => {
  const trend = await incomeService.getMonthlyTrend(req.user.id, req.query.months);
  return success(res, { data: trend, message: 'Monthly income trend retrieved' });
});

module.exports = { createIncome, getIncomes, getIncome, updateIncome, deleteIncome, getMonthlyTrend };
