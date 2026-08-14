/**
 * Transaction Service — Business logic for expense transactions.
 * Transactions in ERD represent expenses (income is separate).
 */

const transactionRepository = require('../repositories/transaction.repository');
const accountRepository = require('../repositories/account.repository');
const ocrRepository = require('../repositories/ocr.repository');
const { getClient } = require('../config/database');
const { BadRequestError, NotFoundError } = require('../utils/errors');

const primaryCategoryGroups = new Set(['Needs', 'Wants', 'Savings', 'Other']);

const canonicalGroupByKey = new Map([
  ['needs', 'Needs'],
  ['kebutuhan', 'Needs'],
  ['wants', 'Wants'],
  ['keinginan', 'Wants'],
  ['savings', 'Savings'],
  ['saving', 'Savings'],
  ['tabungan', 'Savings'],
  ['investment', 'Savings'],
  ['investasi', 'Savings'],
  ['other', 'Other'],
  ['lainnya', 'Other'],
]);

class TransactionService {
  async create(userId, data) {
    const input = this._normalizeTransactionInput(data, { defaultSource: 'manual' });
    const normalized = this._normalizeCategoryData(input);
    this._validateAmount(normalized.amount);

    const client = await getClient();
    try {
      await client.query('BEGIN');
      await this._ensureAccountBelongsToUser(normalized.accountId, userId, client, true);
      if (input.ocrScanId) await this._ensureLinkableOcrScan(input.ocrScanId, userId, client);
      const transaction = await transactionRepository.create(userId, normalized, client);
      if (normalized.accountId) {
        await accountRepository.adjustBalance(normalized.accountId, userId, -Number(normalized.amount), client);
      }
      if (input.ocrScanId) {
        const linkedScan = await ocrRepository.linkTransaction(input.ocrScanId, transaction.transaction_id, client);
        if (!linkedScan) throw new BadRequestError('OCR scan is already linked to a transaction');
      }

      await client.query('COMMIT');
      return transaction;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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
    const input = this._normalizeTransactionInput(data, { partial: true });
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const previous = await transactionRepository.findById(transactionId, userId, client, { forUpdate: true });
      if (!previous) throw new NotFoundError('Transaction not found');
      const merged = {
        ...input,
        accountId: this._provided(data, ['accountId', 'account_id']) ? input.accountId : previous.account_id,
        amount: this._provided(data, ['amount']) ? input.amount : Number(previous.amount),
      };
      this._validateAmount(merged.amount);
      await this._ensureAccountBelongsToUser(merged.accountId, userId, client, true);
      if (previous.account_id) await accountRepository.adjustBalance(previous.account_id, userId, Number(previous.amount), client);
      const updated = await transactionRepository.update(transactionId, userId, this._normalizeCategoryData(merged), client);
      if (merged.accountId) await accountRepository.adjustBalance(merged.accountId, userId, -Number(merged.amount), client);
      await client.query('COMMIT');
      return updated;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(transactionId, userId) {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const previous = await transactionRepository.findById(transactionId, userId, client, { forUpdate: true });
      if (!previous) throw new NotFoundError('Transaction not found');
      await transactionRepository.delete(transactionId, userId, client);
      if (previous.account_id) await accountRepository.adjustBalance(previous.account_id, userId, Number(previous.amount), client);
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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
        categoryDetail: c.category_detail || null,
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

  async _ensureAccountBelongsToUser(accountId, userId, db, forUpdate = false) {
    if (!accountId) return;

    const account = await accountRepository.findById(accountId, userId, db, { forUpdate });
    if (!account) {
      throw new BadRequestError('Account does not exist or does not belong to the current user');
    }
  }

  async _ensureLinkableOcrScan(ocrScanId, userId, db) {
    const scan = await ocrRepository.findById(ocrScanId, userId, db);
    if (!scan) {
      throw new BadRequestError('OCR scan does not exist or does not belong to the current user');
    }
    if (scan.transaction_id) {
      throw new BadRequestError('OCR scan is already linked to a transaction');
    }
    if (scan.status !== 'completed') {
      throw new BadRequestError('OCR scan must be completed before creating a transaction');
    }
    return scan;
  }

  _normalizeTransactionInput(data = {}, { defaultSource = undefined, partial = false } = {}) {
    const normalized = { ...data };
    const assign = (key, aliases, fallback) => {
      const provided = this._provided(data, aliases);
      if (provided || !partial) {
        const found = aliases.find((alias) => Object.prototype.hasOwnProperty.call(data, alias));
        normalized[key] = found ? data[found] : fallback;
      }
    };
    assign('accountId', ['accountId', 'account_id'], null);
    assign('categoryGroup', ['categoryGroup', 'category_group', 'budgetGroup', 'budget_group'], null);
    assign('categoryDetail', ['categoryDetail', 'category_detail', 'category'], null);
    assign('transactionDate', ['transactionDate', 'transaction_date', 'date'], undefined);
    assign('description', ['description', 'name', 'merchant', 'note'], null);
    assign('amount', ['amount'], undefined);
    assign('ocrScanId', ['ocrScanId', 'ocr_scan_id'], null);
    if (data.source !== undefined || !partial) normalized.source = data.source || defaultSource;
    return normalized;
  }

  _normalizeCategoryData(data) {
    const normalized = { ...data };
    const categoryGroup = this._cleanCategory(normalized.categoryGroup);
    const categoryDetail = this._cleanCategory(normalized.categoryDetail);

    if (categoryGroup && this._isPrimaryGroup(categoryGroup)) {
      normalized.categoryGroup = this._canonicalGroup(categoryGroup);
      normalized.categoryDetail = categoryDetail || null;
      return normalized;
    }

    if (categoryGroup && !this._isPrimaryGroup(categoryGroup)) {
      normalized.categoryGroup = this._inferCategoryGroup(categoryGroup);
      normalized.categoryDetail = categoryDetail || categoryGroup;
      return normalized;
    }

    if (categoryDetail) {
      normalized.categoryGroup = this._inferCategoryGroup(categoryDetail);
      normalized.categoryDetail = categoryDetail;
    }

    return normalized;
  }

  _provided(data, keys) {
    return keys.some((key) => Object.prototype.hasOwnProperty.call(data || {}, key));
  }

  _validateAmount(amount) {
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      throw new BadRequestError('Transaction amount must be greater than zero');
    }
  }

  _cleanCategory(value) {
    const text = String(value || '').trim();
    return text || null;
  }

  _isPrimaryGroup(value) {
    const key = String(value || '').toLowerCase();
    return primaryCategoryGroups.has(value) || canonicalGroupByKey.has(key);
  }

  _canonicalGroup(value) {
    const key = String(value || '').toLowerCase();
    if (primaryCategoryGroups.has(value)) return value;
    return canonicalGroupByKey.get(key) || 'Other';
  }

  _inferCategoryGroup(value) {
    const text = String(value || '').toLowerCase();
    if (/kebutuhan|needs|need/.test(text)) return 'Needs';
    if (/keinginan|wants|want/.test(text)) return 'Wants';
    if (/tabungan|saving|savings|invest|dana darurat/.test(text)) return 'Savings';
    if (/makan|food|beverage|groceries|transport|tagihan|utilit|kesehatan|health|pendidikan|education|bills/.test(text)) return 'Needs';
    if (!text || text === 'other' || text === 'lainnya') return 'Other';
    return 'Wants';
  }
}

module.exports = new TransactionService();
