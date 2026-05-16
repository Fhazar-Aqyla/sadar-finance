/**
 * OCR Routes
 */

const { Router } = require('express');
const ocrController = require('../controllers/ocr.controller');
const authenticate = require('../middlewares/authenticate');
const upload = require('../middlewares/upload');
const validate = require('../middlewares/validate');
const { confirmOcrTransactionSchema } = require('../validators/ocr.validator');

const router = Router();

router.use(authenticate);

router.post('/upload', upload.single('image'), ocrController.uploadReceipt);
router.get('/', ocrController.getScans);
router.post('/:id/confirm-transaction', validate(confirmOcrTransactionSchema), ocrController.confirmTransaction);
router.get('/:id', ocrController.getScan);

module.exports = router;
