/**
 * Account Service — Business logic for bank account management.
 */

const accountRepository = require('../repositories/account.repository');
const { NotFoundError } = require('../utils/errors');

class AccountService {
  async create(userId, data) {
    return accountRepository.create(userId, data);
  }

  async findAll(userId) {
    return accountRepository.findByUser(userId);
  }

  async findById(accountId, userId) {
    const account = await accountRepository.findById(accountId, userId);
    if (!account) {
      throw new NotFoundError('Account not found');
    }
    return account;
  }

  async update(accountId, userId, data) {
    await this.findById(accountId, userId);
    const updated = await accountRepository.update(accountId, userId, data);
    return updated;
  }

  async delete(accountId, userId) {
    const deleted = await accountRepository.delete(accountId, userId);
    if (!deleted) {
      throw new NotFoundError('Account not found');
    }
    return true;
  }
}

module.exports = new AccountService();
