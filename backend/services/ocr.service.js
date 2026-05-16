/**
 * OCR Service — Business logic for receipt scanning and parsing.
 *
 * In production, this would integrate with Google Cloud Vision, AWS Textract,
 * or the Python AI microservice. For now, it simulates OCR processing.
 */

const ocrRepository = require('../repositories/ocr.repository');
const config = require('../config');
const aiClient = require('./aiClient.service');
const analyticsService = require('./analytics.service');
const transactionService = require('./transaction.service');
const { NotFoundError, BadRequestError } = require('../utils/errors');

class OcrService {
  /**
   * Upload and process a receipt image.
   */
  async uploadAndProcess(userId, file) {
    if (!file) {
      throw new BadRequestError('Image file is required');
    }

    // Create scan record
    const scan = await ocrRepository.create(userId, {
      imageUrl: `/${config.upload.dir}/${file.filename}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
    });

    // Trigger async OCR processing
    this._processAsync(scan.ocr_id, userId, file);

    return scan;
  }

  /**
   * Get scan result by ID.
   */
  async getScan(id, userId) {
    const scan = await ocrRepository.findById(id, userId);
    if (!scan) {
      throw new NotFoundError('OCR scan not found');
    }
    return scan;
  }

  /**
   * Get all scans for a user.
   */
  async getScans(userId, pagination) {
    return ocrRepository.findByUser(userId, pagination);
  }

  /**
   * Create a transaction from a completed OCR scan after user confirmation.
   */
  async confirmTransaction(scanId, userId, data) {
    const scan = await this.getScan(scanId, userId);

    if (scan.transaction_id) {
      throw new BadRequestError('OCR scan is already linked to a transaction');
    }

    if (scan.status !== 'completed') {
      throw new BadRequestError('OCR scan must be completed before creating a transaction');
    }

    const parsedData = this._getParsedData(scan);
    const amount = Number(data.amount ?? parsedData.total);

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      throw new BadRequestError('Transaction amount is required. Provide amount or wait for OCR total result.');
    }

    const description = data.description || this._buildReceiptDescription(parsedData);
    let categoryGroup = data.categoryGroup || parsedData.categoryGroup || parsedData.category_group || null;

    if (!categoryGroup) {
      const category = await analyticsService.categorize(userId, {
        text: [scan.raw_text, description, parsedData.merchant].filter(Boolean).join(' '),
      });
      categoryGroup = category.predictedCategory;
    }

    const transaction = await transactionService.create(userId, {
      accountId: data.accountId,
      categoryGroup,
      transactionDate: data.transactionDate || parsedData.date || new Date(),
      description,
      source: data.source || 'ocr',
      amount,
    });

    const linkedScan = await ocrRepository.linkTransaction(scan.ocr_id, transaction.transaction_id);

    return {
      transaction,
      scan: linkedScan,
    };
  }

  /**
   * Process OCR in the background.
   */
  async _processAsync(scanId, userId, file) {
    try {
      // Update status to processing
      await ocrRepository.updateStatus(scanId, 'processing');

      const parsedData = await aiClient.extractReceipt({ file, scanId });
      await this._attachCategory(userId, parsedData);

      await ocrRepository.updateStatus(scanId, 'completed', parsedData);
    } catch (err) {
      await ocrRepository.updateStatus(scanId, 'failed', {
        errorMessage: err.message,
      });
    }
  }

  async _attachCategory(userId, parsedData) {
    if (parsedData.data?.categoryGroup) return;

    const categoryText = [
      parsedData.rawText,
      parsedData.data?.merchant,
      ...(parsedData.data?.items || []).map((item) => item.name),
    ].filter(Boolean).join(' ');

    if (!categoryText) return;

    const category = await analyticsService.categorize(userId, { text: categoryText });
    parsedData.data.categoryGroup = category.predictedCategory;
    parsedData.data.categoryConfidence = category.confidence;
    parsedData.data.categorySource = category.source;
  }

  _getParsedData(scan) {
    if (!scan.parsed_data) return {};
    if (typeof scan.parsed_data === 'string') {
      try {
        return JSON.parse(scan.parsed_data);
      } catch (_err) {
        return {};
      }
    }
    return scan.parsed_data;
  }

  _buildReceiptDescription(parsedData) {
    const merchant = parsedData.merchant || 'OCR receipt';
    const items = Array.isArray(parsedData.items)
      ? parsedData.items.map((item) => item.name).filter(Boolean).slice(0, 3)
      : [];

    return [merchant, items.length ? items.join(', ') : null]
      .filter(Boolean)
      .join(' - ')
      .slice(0, 500);
  }
}

module.exports = new OcrService();
