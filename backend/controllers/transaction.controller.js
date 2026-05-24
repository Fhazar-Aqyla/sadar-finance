/**
 * Transaction Controller — Handles expense transaction HTTP requests.
 * Matches ERD: transaction_id, user_id, account_id, category_group, etc.
 */

const asyncHandler = require('../utils/asyncHandler');
const { success, created, noContent, paginated } = require('../utils/response');
const transactionService = require('../services/transaction.service');

/**
 * @swagger
 * /api/v1/transactions:
 *   post:
 *     tags: [Transactions]
 *     summary: Create a new expense transaction
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               accountId:
 *                 type: string
 *                 format: uuid
 *               categoryGroup:
 *                 type: string
 *                 example: "Food & Dining"
 *               transactionDate:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *                 example: "Makan siang di Warung Padang"
 *               source:
 *                 type: string
 *                 example: "manual"
 *               amount:
 *                 type: number
 *                 example: 35000
 *     responses:
 *       201:
 *         description: Transaction created
 */
const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.create(req.user.id, req.body);
  return created(res, { data: transaction, message: 'Transaction created successfully' });
});

/**
 * @swagger
 * /api/v1/transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: Get all expense transactions (paginated, filterable)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: categoryGroup
 *         schema:
 *           type: string
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [transaction_date, amount, created_at]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: List of transactions
 */
const getTransactions = asyncHandler(async (req, res) => {
  const { data, total } = await transactionService.findAll(req.user.id, req.query);
  return paginated(res, {
    data,
    page: req.query.page || 1,
    limit: req.query.limit || 20,
    total,
    message: 'Transactions retrieved successfully',
  });
});

/**
 * @swagger
 * /api/v1/transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Get a single transaction by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Transaction details
 *       404:
 *         description: Transaction not found
 */
const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.findById(req.params.id, req.user.id);
  return success(res, { data: transaction, message: 'Transaction retrieved successfully' });
});

/**
 * @swagger
 * /api/v1/transactions/{id}:
 *   put:
 *     tags: [Transactions]
 *     summary: Update a transaction
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountId:
 *                 type: string
 *                 format: uuid
 *               categoryGroup:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Transaction updated
 */
const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.update(req.params.id, req.user.id, req.body);
  return success(res, { data: transaction, message: 'Transaction updated successfully' });
});

/**
 * @swagger
 * /api/v1/transactions/{id}:
 *   delete:
 *     tags: [Transactions]
 *     summary: Delete a transaction
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Transaction deleted
 */
const deleteTransaction = asyncHandler(async (req, res) => {
  await transactionService.delete(req.params.id, req.user.id);
  return noContent(res);
});

/**
 * @swagger
 * /api/v1/transactions/summary:
 *   get:
 *     tags: [Transactions]
 *     summary: Get expense summary with category breakdown
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Expense summary
 */
const getSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const summary = await transactionService.getSummary(req.user.id, startDate, endDate);
  return success(res, { data: summary, message: 'Expense summary retrieved successfully' });
});

/**
 * @swagger
 * /api/v1/transactions/trend/monthly:
 *   get:
 *     tags: [Transactions]
 *     summary: Get monthly expense trend
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 6
 *     responses:
 *       200:
 *         description: Monthly expense trend
 */
const getMonthlyTrend = asyncHandler(async (req, res) => {
  const trend = await transactionService.getMonthlyTrend(req.user.id, req.query.months);
  return success(res, { data: trend, message: 'Monthly trend retrieved successfully' });
});

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getMonthlyTrend,
};
