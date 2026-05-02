/**
 * OCR Service — Business logic for receipt scanning and parsing.
 *
 * In production, this would integrate with Google Cloud Vision, AWS Textract,
 * or the Python AI microservice. For now, it simulates OCR processing.
 */

const ocrRepository = require('../repositories/ocr.repository');
const config = require('../config');
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
    // In production: send to AI microservice queue
    this._processAsync(scan.id, file);

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
   * Simulate async OCR processing.
   * In production, this would call the Python AI service.
   */
  async _processAsync(scanId, file) {
    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update status to processing
      await ocrRepository.updateStatus(scanId, 'processing');

      // In production: call AI service
      // const result = await axios.post(`${config.ai.serviceUrl}/ocr`, { imageUrl: file.path });

      // Simulated parsed result
      const parsedData = {
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
        },
        confidence: 0.9235,
      };

      await ocrRepository.updateStatus(scanId, 'completed', parsedData);
    } catch (err) {
      await ocrRepository.updateStatus(scanId, 'failed', {
        errorMessage: err.message,
      });
    }
  }
}

module.exports = new OcrService();
