/**
 * OCR Controller — Handles receipt image upload and parsing.
 */

const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const ocrService = require('../services/ocr.service');

/**
 * @swagger
 * /api/v1/ocr/upload:
 *   post:
 *     tags: [OCR]
 *     summary: Upload a receipt image for OCR processing
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Receipt image (JPEG, PNG, WebP, HEIC)
 *     responses:
 *       201:
 *         description: Image uploaded and queued for processing
 *       400:
 *         description: Invalid file type or missing image
 */
const uploadReceipt = asyncHandler(async (req, res) => {
  const scan = await ocrService.uploadAndProcess(req.user.id, req.file);
  return created(res, {
    data: scan,
    message: 'Receipt uploaded and queued for processing',
  });
});

/**
 * @swagger
 * /api/v1/ocr/{id}:
 *   get:
 *     tags: [OCR]
 *     summary: Get OCR scan result by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: OCR scan details
 *       404:
 *         description: Scan not found
 */
const getScan = asyncHandler(async (req, res) => {
  const scan = await ocrService.getScan(req.params.id, req.user.id);
  return success(res, {
    data: scan,
    message: 'OCR scan retrieved successfully',
  });
});

/**
 * @swagger
 * /api/v1/ocr:
 *   get:
 *     tags: [OCR]
 *     summary: Get all OCR scans for current user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of OCR scans
 */
const getScans = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const { data, total } = await ocrService.getScans(req.user.id, { page, limit });
  return success(res, {
    data,
    message: 'OCR scans retrieved successfully',
    meta: {
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

module.exports = { uploadReceipt, getScan, getScans };
