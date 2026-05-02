/**
 * OCR Repository — Data access layer for ocr_scans table.
 */

const { query } = require('../config/database');

class OcrRepository {
  async create(userId, data) {
    const result = await query(
      `INSERT INTO ocr_scans (user_id, image_url, original_name, mime_type, file_size, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [userId, data.imageUrl, data.originalName, data.mimeType, data.fileSize]
    );
    return result.rows[0];
  }

  async findById(ocrId, userId) {
    const result = await query(
      `SELECT * FROM ocr_scans WHERE ocr_id = $1 AND user_id = $2`,
      [ocrId, userId]
    );
    return result.rows[0] || null;
  }

  async findByUser(userId, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;

    const countResult = await query(
      `SELECT COUNT(*) as total FROM ocr_scans WHERE user_id = $1`,
      [userId]
    );

    const dataResult = await query(
      `SELECT * FROM ocr_scans
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  async updateStatus(ocrId, status, parsedData = {}) {
    const result = await query(
      `UPDATE ocr_scans
       SET status = $2,
           raw_text = $3,
           parsed_data = $4,
           confidence = $5,
           error_message = $6,
           processed_at = NOW()
       WHERE ocr_id = $1
       RETURNING *`,
      [
        ocrId,
        status,
        parsedData.rawText || null,
        JSON.stringify(parsedData.data || {}),
        parsedData.confidence || null,
        parsedData.errorMessage || null,
      ]
    );
    return result.rows[0] || null;
  }

  async linkTransaction(ocrId, transactionId) {
    const result = await query(
      `UPDATE ocr_scans SET transaction_id = $2 WHERE ocr_id = $1 RETURNING *`,
      [ocrId, transactionId]
    );
    return result.rows[0] || null;
  }
}

module.exports = new OcrRepository();
