/**
 * Account Service — Business logic for bank account management.
 */

const accountRepository = require('../repositories/account.repository');
const { getClient } = require('../config/database');
const { BadRequestError, NotFoundError } = require('../utils/errors');

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

  async transfer(userId, { fromAccountId, toAccountId, amount, note }) {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new BadRequestError('Nominal transfer harus lebih dari 0');
    }
    if (fromAccountId === toAccountId) {
      throw new BadRequestError('Akun asal dan akun tujuan tidak boleh sama');
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Lock accounts in deterministic order to avoid deadlocks
      const orderedIds = [fromAccountId, toAccountId].sort();
      const locked = {};
      for (const id of orderedIds) {
        const acc = await accountRepository.findById(id, userId, client, { forUpdate: true });
        if (!acc) {
          throw new NotFoundError('Akun keuangan tidak ditemukan');
        }
        locked[id] = acc;
      }

      const sourceAccount = locked[fromAccountId];
      if (Number(sourceAccount.balance) < numericAmount) {
        throw new BadRequestError(
          `Saldo akun "${sourceAccount.account_name}" tidak mencukupi. Saldo saat ini: Rp ${Number(sourceAccount.balance).toLocaleString('id-ID')}.`
        );
      }

      const updatedFrom = await accountRepository.adjustBalance(
        fromAccountId,
        userId,
        -numericAmount,
        client
      );
      const updatedTo = await accountRepository.adjustBalance(
        toAccountId,
        userId,
        numericAmount,
        client
      );

      await client.query('COMMIT');
      return {
        fromAccount: updatedFrom,
        toAccount: updatedTo,
        amount: numericAmount,
        note: note || '',
        transferredAt: new Date().toISOString(),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new AccountService();
