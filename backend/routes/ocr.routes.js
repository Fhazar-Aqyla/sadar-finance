/**
 * OCR Routes
 */

const { Router } = require('express');
const ocrController = require('../controllers/ocr.controller');
const authenticate = require('../middlewares/authenticate');
const upload = require('../middlewares/upload');

const router = Router();

router.use(authenticate);

router.post('/upload', upload.single('image'), ocrController.uploadReceipt);
router.get('/', ocrController.getScans);
router.get('/:id', ocrController.getScan);

module.exports = router;
