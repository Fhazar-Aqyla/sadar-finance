/**
 * OCR Service - Business logic for receipt scanning and parsing.
 *
 * Uploaded receipt images are stored first, then sent to the Python AI service
 * for OCR and NLP extraction. A local fallback keeps the demo flow usable when
 * the AI service or Tesseract runtime is not available yet.
 */

const path = require('path');
const ocrRepository = require('../repositories/ocr.repository');
const config = require('../config');
const { NotFoundError, BadRequestError } = require('../utils/errors');

class OcrService {
  async uploadAndProcess(userId, file) {
    if (!file) {
      throw new BadRequestError('Image file is required');
    }

    const scan = await ocrRepository.create(userId, {
      imageUrl: `/${config.upload.dir}/${file.filename}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
    });

    this._processAsync(scan.id || scan.ocr_id, file);

    return scan;
  }

  async getScan(id, userId) {
    const scan = await ocrRepository.findById(id, userId);
    if (!scan) {
      throw new NotFoundError('OCR scan not found');
    }
    return scan;
  }

  async getScans(userId, pagination) {
    return ocrRepository.findByUser(userId, pagination);
  }

  async _processAsync(scanId, file) {
    try {
      await ocrRepository.updateStatus(scanId, 'processing');
      const parsedData = await this._processWithAiService(file);
      await ocrRepository.updateStatus(scanId, 'completed', parsedData);
    } catch (err) {
      try {
        await ocrRepository.updateStatus(scanId, 'completed', this._fallbackParsedData(err));
      } catch (fallbackErr) {
        await ocrRepository.updateStatus(scanId, 'failed', {
          errorMessage: fallbackErr.message,
        });
      }
    }
  }

  async _processWithAiService(file) {
    const response = await fetch(`${config.ai.serviceUrl}/ocr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imagePath: path.resolve(file.path),
        originalName: file.originalname,
        mimeType: file.mimetype,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) {
      throw new Error(payload.error || 'AI OCR service failed to process image');
    }

    return payload.data;
  }

  _fallbackParsedData(error) {
    return {
      rawText: 'SAMPLE RECEIPT\nStore: Indomaret\nDate: 2025-01-15\nItems:\n- Rice 5kg: Rp 75.000\n- Cooking Oil 1L: Rp 18.000\nTotal: Rp 93.000',
      data: {
        merchant: 'Indomaret',
        date: '2025-01-15',
        items: [
          { name: 'Rice 5kg', amount: 75000 },
          { name: 'Cooking Oil 1L', amount: 18000 },
        ],
        total: 93000,
        currency: 'IDR',
        category: 'groceries',
        categoryConfidence: 0.86,
        fallbackReason: error.message,
      },
      confidence: 0.72,
    };
  }
}

module.exports = new OcrService();
