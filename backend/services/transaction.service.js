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

    await this._ensureAccountBelongsToUser(input.accountId, userId);

    const normalized = this._normalizeCategoryData(input);
    if (!input.ocrScanId) {
      return transactionRepository.create(userId, normalized);
    }

    await this._ensureLinkableOcrScan(input.ocrScanId, userId);

    const client = await getClient();
    try {
      await client.query('BEGIN');
      const transaction = await transactionRepository.create(userId, normalized, client);
      const linkedScan = await ocrRepository.linkTransaction(input.ocrScanId, transaction.transaction_id, client);

      if (!linkedScan) {
        throw new BadRequestError('OCR scan is already linked to a transaction');
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
    const input = this._normalizeTransactionInput(data);

    await this.findById(transactionId, userId);
    await this._ensureAccountBelongsToUser(input.accountId, userId);
    return transactionRepository.update(transactionId, userId, this._normalizeCategoryData(input));
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

  async _ensureAccountBelongsToUser(accountId, userId) {
    if (!accountId) return;

    const account = await accountRepository.findById(accountId, userId);
    if (!account) {
      throw new BadRequestError('Account does not exist or does not belong to the current user');
    }
  }

  async _ensureLinkableOcrScan(ocrScanId, userId) {
    const scan = await ocrRepository.findById(ocrScanId, userId);
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

  _normalizeTransactionInput(data = {}, { defaultSource = undefined } = {}) {
    return {
      ...data,
      accountId: data.accountId ?? data.account_id ?? null,
      categoryGroup: data.categoryGroup ?? data.category_group ?? data.budgetGroup ?? data.budget_group ?? null,
      categoryDetail: data.categoryDetail ?? data.category_detail ?? data.category ?? null,
      transactionDate: data.transactionDate ?? data.transaction_date ?? data.date ?? undefined,
      description: data.description ?? data.name ?? data.merchant ?? data.note ?? null,
      source: data.source || defaultSource,
      amount: data.amount,
      ocrScanId: data.ocrScanId ?? data.ocr_scan_id ?? null,
    };
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
