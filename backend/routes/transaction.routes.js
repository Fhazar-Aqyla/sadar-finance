/**
 * Transaction Routes (expenses)
 */
const { Router } = require('express');
const transactionController = require('../controllers/transaction.controller');
const authenticate = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const {
  createTransactionSchema,
  updateTransactionSchema,
  queryTransactionSchema,
  summaryQuerySchema,
  monthlyTrendQuerySchema,
} = require('../validators/transaction.validator');

const router = Router();
router.use(authenticate);

// Aggregation routes (before /:id)
router.get('/summary', validate(summaryQuerySchema, 'query'), transactionController.getSummary);
router.get('/trend/monthly', validate(monthlyTrendQuerySchema, 'query'), transactionController.getMonthlyTrend);

// CRUD
router.post('/', validate(createTransactionSchema), transactionController.createTransaction);
router.get('/', validate(queryTransactionSchema, 'query'), transactionController.getTransactions);
router.get('/:id', transactionController.getTransaction);
router.put('/:id', validate(updateTransactionSchema), transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
