/**
 * Income Service — Business logic for income management.
 */

const incomeRepository = require('../repositories/income.repository');
const accountRepository = require('../repositories/account.repository');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class IncomeService {
  async create(userId, data) {
    await this._ensureAccountBelongsToUser(data.accountId, userId);
    return incomeRepository.create(userId, data);
  }

  async findAll(userId, filters) {
    return incomeRepository.findAll(userId, filters);
  }

  async findById(incomeId, userId) {
    const income = await incomeRepository.findById(incomeId, userId);
    if (!income) {
      throw new NotFoundError('Income not found');
    }
    return income;
  }

  async update(incomeId, userId, data) {
    await this.findById(incomeId, userId);
    await this._ensureAccountBelongsToUser(data.accountId, userId);
    return incomeRepository.update(incomeId, userId, data);
  }

  async delete(incomeId, userId) {
    const deleted = await incomeRepository.delete(incomeId, userId);
    if (!deleted) {
      throw new NotFoundError('Income not found');
    }
    return true;
  }

  async getTotalIncome(userId, startDate, endDate) {
    return incomeRepository.getTotalIncome(userId, startDate, endDate);
  }

  async getMonthlyTrend(userId, months) {
    return incomeRepository.getMonthlyIncomeTrend(userId, months);
  }

  async _ensureAccountBelongsToUser(accountId, userId) {
    if (!accountId) return;

    const account = await accountRepository.findById(accountId, userId);
    if (!account) {
      throw new BadRequestError('Account does not exist or does not belong to the current user');
    }
  }
}

module.exports = new IncomeService();
