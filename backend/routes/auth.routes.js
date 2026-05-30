/**
 * Auth Routes
 */

const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/authenticate');
const upload = require('../middlewares/upload');
const validate = require('../middlewares/validate');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require('../validators/auth.validator');

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.get('/me', authenticate, authController.getProfile);
router.put('/me', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.put('/password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.post('/profile-picture', authenticate, upload.any(), authController.uploadProfilePicture);

module.exports = router;
