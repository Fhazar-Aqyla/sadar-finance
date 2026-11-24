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
    const { savingsGoals, recurringItems, debts, transfers } = req.body || {};
    const data = await plansRepository.upsertByUser(req.user.id, {
      savingsGoals,
      recurringItems,
      debts,
      transfers,
    });
    return success(res, {
      data,
      message: 'Financial plans synced to cloud successfully',
    });
  })
);

module.exports = router;
