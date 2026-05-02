/**
 * Account Controller — Handles bank account HTTP requests.
 */

const asyncHandler = require('../utils/asyncHandler');
const { success, created, noContent } = require('../utils/response');
const accountService = require('../services/account.service');

/**
 * @swagger
 * /api/v1/accounts:
 *   post:
 *     tags: [Accounts]
 *     summary: Create a new bank account
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [accountName]
 *             properties:
 *               accountName:
 *                 type: string
 *                 example: "BCA Utama"
 *               accountNumber:
 *                 type: string
 *                 example: "1234567890"
 *               balance:
 *                 type: number
 *                 example: 5000000
 *     responses:
 *       201:
 *         description: Account created
 */
const createAccount = asyncHandler(async (req, res) => {
  const account = await accountService.create(req.user.id, req.body);
  return created(res, { data: account, message: 'Account created successfully' });
});

/**
 * @swagger
 * /api/v1/accounts:
 *   get:
 *     tags: [Accounts]
 *     summary: Get all accounts for current user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of accounts
 */
const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await accountService.findAll(req.user.id);
  return success(res, { data: accounts, message: 'Accounts retrieved successfully' });
});

/**
 * @swagger
 * /api/v1/accounts/{id}:
 *   get:
 *     tags: [Accounts]
 *     summary: Get a single account by ID
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
 *         description: Account details
 *       404:
 *         description: Account not found
 */
const getAccount = asyncHandler(async (req, res) => {
  const account = await accountService.findById(req.params.id, req.user.id);
  return success(res, { data: account, message: 'Account retrieved successfully' });
});

/**
 * @swagger
 * /api/v1/accounts/{id}:
 *   put:
 *     tags: [Accounts]
 *     summary: Update an account
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
 *               accountName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               balance:
 *                 type: number
 *     responses:
 *       200:
 *         description: Account updated
 */
const updateAccount = asyncHandler(async (req, res) => {
  const account = await accountService.update(req.params.id, req.user.id, req.body);
  return success(res, { data: account, message: 'Account updated successfully' });
});

/**
 * @swagger
 * /api/v1/accounts/{id}:
 *   delete:
 *     tags: [Accounts]
 *     summary: Delete an account
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
 *         description: Account deleted
 */
const deleteAccount = asyncHandler(async (req, res) => {
  await accountService.delete(req.params.id, req.user.id);
  return noContent(res);
});

module.exports = { createAccount, getAccounts, getAccount, updateAccount, deleteAccount };
