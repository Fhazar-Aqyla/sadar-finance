/**
 * Income Service — Business logic for income management.
 */

const incomeRepository = require('../repositories/income.repository');
const accountRepository = require('../repositories/account.repository');
const { getClient } = require('../config/database');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class IncomeService {
  async create(userId, data) {
    this._validateAmount(data.amount);
    const client = await getClient();
    try {
      await client.query('BEGIN');
      await this._ensureAccountBelongsToUser(data.accountId, userId, client, true);
      const income = await incomeRepository.create(userId, data, client);
      if (data.accountId) await accountRepository.adjustBalance(data.accountId, userId, Number(data.amount), client);
      await client.query('COMMIT');
      return income;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
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
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const previous = await incomeRepository.findById(incomeId, userId, client, { forUpdate: true });
      if (!previous) throw new NotFoundError('Income not found');
      const accountId = Object.prototype.hasOwnProperty.call(data, 'accountId') ? data.accountId : previous.account_id;
      const amount = Object.prototype.hasOwnProperty.call(data, 'amount') ? data.amount : Number(previous.amount);
      this._validateAmount(amount);
      await this._ensureAccountBelongsToUser(accountId, userId, client, true);
      if (previous.account_id) await accountRepository.adjustBalance(previous.account_id, userId, -Number(previous.amount), client);
      const updated = await incomeRepository.update(incomeId, userId, { ...data, accountId, amount }, client);
      if (accountId) await accountRepository.adjustBalance(accountId, userId, Number(amount), client);
      await client.query('COMMIT');
      return updated;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }

  async delete(incomeId, userId) {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const previous = await incomeRepository.findById(incomeId, userId, client, { forUpdate: true });
      if (!previous) throw new NotFoundError('Income not found');
      await incomeRepository.delete(incomeId, userId, client);
      if (previous.account_id) await accountRepository.adjustBalance(previous.account_id, userId, -Number(previous.amount), client);
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }

  async getTotalIncome(userId, startDate, endDate) {
    return incomeRepository.getTotalIncome(userId, startDate, endDate);
  }

  async getMonthlyTrend(userId, months) {
    return incomeRepository.getMonthlyIncomeTrend(userId, months);
  }

  async _ensureAccountBelongsToUser(accountId, userId, db, forUpdate = false) {
    if (!accountId) return;

    const account = await accountRepository.findById(accountId, userId, db, { forUpdate });
    if (!account) {
      throw new BadRequestError('Account does not exist or does not belong to the current user');
    }
  }

  _validateAmount(amount) {
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) throw new BadRequestError('Income amount must be greater than zero');
  }
}

module.exports = new IncomeService();
