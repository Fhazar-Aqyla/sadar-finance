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

router.put(
  '/',
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const sanitizeList = (arr) =>
      Array.isArray(arr)
        ? arr
            .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
            .slice(0, 200)
        : undefined;
    const data = await plansRepository.upsertByUser(req.user.id, {
      savingsGoals: sanitizeList(body.savingsGoals),
      recurringItems: sanitizeList(body.recurringItems),
      debts: sanitizeList(body.debts),
      transfers: sanitizeList(body.transfers),
    });
    return success(res, {
      data,
      message: 'Financial plans synced to cloud successfully',
    });
  })
);

module.exports = router;
