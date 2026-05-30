/**
 * Multer file upload middleware for OCR image uploads.
 */

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const { BadRequestError } = require('../utils/errors');

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
]);

const MIME_TYPE_ALIASES = new Map([
  ['image/jpg', 'image/jpeg'],
  ['image/pjpeg', 'image/jpeg'],
  ['image/x-png', 'image/png'],
]);

const EXTENSION_MIME_TYPES = new Map([
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
  ['.heic', 'image/heic'],
  ['.heif', 'image/heif'],
]);

const allowedTypesText = Array.from(ALLOWED_MIME_TYPES).join(', ');
const uploadDir = path.resolve(__dirname, '..', config.upload.dir);

const normalizeImageMimeType = (file) => {
  const originalMimeType = String(file.mimetype || '').toLowerCase();
  const aliasedMimeType = MIME_TYPE_ALIASES.get(originalMimeType) || originalMimeType;

  if (ALLOWED_MIME_TYPES.has(aliasedMimeType)) {
    file.mimetype = aliasedMimeType;
    return true;
  }

  const ext = path.extname(file.originalname || '').toLowerCase();
  const mimeTypeFromExt = EXTENSION_MIME_TYPES.get(ext);

  if ((!aliasedMimeType || aliasedMimeType === 'application/octet-stream') && mimeTypeFromExt) {
    file.mimetype = mimeTypeFromExt;
    return true;
  }

  return false;
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (normalizeImageMimeType(file)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`Invalid file type. Allowed: ${allowedTypesText}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSizeMB * 1024 * 1024,
  },
});

module.exports = upload;
