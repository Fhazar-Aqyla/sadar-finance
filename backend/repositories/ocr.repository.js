/**
 * OCR Repository — Data access layer for ocr_scans table.
 */

const { query } = require('../config/database');

const ocrScanColumns = `
  ocr_id,
  user_id,
  transaction_id,
  image_url,
  original_name,
  mime_type,
  file_size,
  status,
  raw_text,
  parsed_data,
  confidence,
  error_message,
  processed_at,
  created_at
`;

const ocrScanListColumns = `
  ocr_id,
  user_id,
  transaction_id,
  image_url,
  original_name,
  mime_type,
  file_size,
  status,
  parsed_data,
  confidence,
  error_message,
  processed_at,
  created_at
`;

class OcrRepository {
  async create(userId, data) {
    const result = await query(
      `INSERT INTO ocr_scans (user_id, image_url, image_data, original_name, mime_type, file_size, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING ${ocrScanColumns}`,
      [userId, data.imageUrl, data.imageData, data.originalName, data.mimeType, data.fileSize]
    );
    return result.rows[0];
  }

  async findById(ocrId, userId, db = query) {
    const runQuery = typeof db === 'function' ? db : db.query.bind(db);
    const result = await runQuery(
      `SELECT ${ocrScanColumns} FROM ocr_scans WHERE ocr_id = $1 AND user_id = $2`,
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
      `SELECT ${ocrScanListColumns} FROM ocr_scans
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
       RETURNING ${ocrScanColumns}`,
      [
        ocrId,
        status,
        parsedData.rawText || null,
        JSON.stringify(parsedData.data || {}),
        parsedData.confidence ?? null,
        parsedData.errorMessage || null,
      ]
    );
    return result.rows[0] || null;
  }

  async linkTransaction(ocrId, transactionId, db = query) {
    const runQuery = typeof db === 'function' ? db : db.query.bind(db);
    const result = await runQuery(
      `UPDATE ocr_scans
       SET transaction_id = $2
       WHERE ocr_id = $1 AND transaction_id IS NULL
       RETURNING ${ocrScanColumns}`,
      [ocrId, transactionId]
    );
    return result.rows[0] || null;
  }

  async findImageByUrl(imageUrl) {
    const result = await query(
      `SELECT image_data, mime_type, original_name
       FROM ocr_scans
       WHERE image_url = $1 AND image_data IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [imageUrl]
    );
    return result.rows[0] || null;
  }
}

module.exports = new OcrRepository();
