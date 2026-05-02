/**
 * Income Routes
 */
const { Router } = require('express');
const incomeController = require('../controllers/income.controller');
const authenticate = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const { createIncomeSchema, updateIncomeSchema, queryIncomeSchema } = require('../validators/income.validator');

const router = Router();
router.use(authenticate);

// Aggregation routes (before /:id)
router.get('/trend/monthly', incomeController.getMonthlyTrend);

// CRUD
router.post('/', validate(createIncomeSchema), incomeController.createIncome);
router.get('/', validate(queryIncomeSchema, 'query'), incomeController.getIncomes);
router.get('/:id', incomeController.getIncome);
router.put('/:id', validate(updateIncomeSchema), incomeController.updateIncome);
router.delete('/:id', incomeController.deleteIncome);

module.exports = router;
