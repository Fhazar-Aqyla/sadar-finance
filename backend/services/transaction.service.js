/**
 * Transaction Service — Business logic for expense transactions.
 * Transactions in ERD represent expenses (income is separate).
 */

const transactionRepository = require('../repositories/transaction.repository');
const accountRepository = require('../repositories/account.repository');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class TransactionService {
  async create(userId, data) {
    await this._ensureAccountBelongsToUser(data.accountId, userId);
    return transactionRepository.create(userId, data);
  }

  async findAll(userId, filters) {
    return transactionRepository.findAll(userId, filters);
  }

  async findById(transactionId, userId) {
    const transaction = await transactionRepository.findById(transactionId, userId);
    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }
    return transaction;
  }

  async update(transactionId, userId, data) {
    await this.findById(transactionId, userId);
    await this._ensureAccountBelongsToUser(data.accountId, userId);
    return transactionRepository.update(transactionId, userId, data);
  }

  async delete(transactionId, userId) {
    const deleted = await transactionRepository.delete(transactionId, userId);
    if (!deleted) {
      throw new NotFoundError('Transaction not found');
    }
    return true;
  }

  async getSummary(userId, startDate, endDate) {
    const [categoryBreakdown, totalExpense] = await Promise.all([
      transactionRepository.getSummary(userId, startDate, endDate),
      transactionRepository.getTotalExpense(userId, startDate, endDate),
    ]);

    return {
      totalExpense: parseFloat(totalExpense.total),
      transactionCount: totalExpense.count,
      categoryBreakdown: categoryBreakdown.map((c) => ({
        categoryGroup: c.category_group || 'Uncategorized',
        count: c.count,
        total: parseFloat(c.total),
        percentage: parseFloat(totalExpense.total) > 0
          ? parseFloat((parseFloat(c.total) / parseFloat(totalExpense.total) * 100).toFixed(1))
          : 0,
      })),
    };
  }

  async getMonthlyTrend(userId, months) {
    return transactionRepository.getMonthlyExpenseTrend(userId, months);
  }

  async _ensureAccountBelongsToUser(accountId, userId) {
    if (!accountId) return;

    const account = await accountRepository.findById(accountId, userId);
    if (!account) {
      throw new BadRequestError('Account does not exist or does not belong to the current user');
    }
  }
}

module.exports = new TransactionService();
