/**
 * Financial Plans Routes — Cloud sync for Savings Goals, Recurring Items, Debts & Transfers
 */
const { Router } = require('express');
const authenticate = require('../middlewares/authenticate');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const plansRepository = require('../repositories/plans.repository');

const router = Router();
router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const data = await plansRepository.getByUser(req.user.id);
    return success(res, {
      data,
      message: 'Financial plans retrieved successfully',
    });
  })
);

const sanitizeObjectList = (arr, normalizer) =>
  Array.isArray(arr)
    ? arr
        .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
        .slice(0, 200)
        .map((item) => (typeof normalizer === 'function' ? normalizer(item) : item))
    : undefined;

const normalizeDebtItem = (item) => {
  const clean = { ...item };
  if (clean.id !== undefined) clean.id = String(clean.id).trim().slice(0, 80);
  if (clean.personName !== undefined) {
    clean.personName = String(clean.personName).trim().slice(0, 120);
  }
  if (clean.phone !== undefined) {
    clean.phone = String(clean.phone).trim().slice(0, 40);
  }
  if (clean.note !== undefined) {
    clean.note = String(clean.note).trim().slice(0, 300);
  }
  if (clean.amount !== undefined) {
    const num = Number(clean.amount);
    clean.amount = Number.isFinite(num) && num >= 0 ? num : 0;
  }
  if (clean.isReceivable !== undefined) {
    clean.isReceivable = Boolean(clean.isReceivable);
  }
  if (clean.isSettled !== undefined) {
    clean.isSettled = Boolean(clean.isSettled);
  }
  if (clean.dueDate !== undefined && clean.dueDate !== null && clean.dueDate !== '') {
    const parsedDue = new Date(clean.dueDate);
    clean.dueDate = Number.isNaN(parsedDue.getTime())
      ? null
      : parsedDue.toISOString();
  } else if (clean.dueDate === '') {
    clean.dueDate = null;
  }
  return clean;
};

router.put(
  '/',
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const data = await plansRepository.upsertByUser(req.user.id, {
      savingsGoals: sanitizeObjectList(body.savingsGoals),
      recurringItems: sanitizeObjectList(body.recurringItems),
      debts: sanitizeObjectList(body.debts, normalizeDebtItem),
      transfers: sanitizeObjectList(body.transfers),
    });
    return success(res, {
      data,
      message: 'Financial plans synced to cloud successfully',
    });
  })
);

module.exports = router;
