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
  sendOtpSchema,
  verifyOtpSchema,
  resetPasswordOtpSchema,
  googleAuthSchema,
} = require('../validators/auth.validator');

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/google', validate(googleAuthSchema), authController.googleAuth);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password-otp', validate(resetPasswordOtpSchema), authController.resetPasswordOtp);
router.post('/send-otp', authenticate, validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', authenticate, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/google/link', authenticate, validate(googleAuthSchema), authController.linkGoogle);
router.delete('/google/link', authenticate, authController.unlinkGoogle);
router.get('/leaderboard', authenticate, authController.getLeaderboard);
router.get('/me', authenticate, authController.getProfile);
router.put('/me', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.put('/password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.post('/profile-picture', authenticate, upload.any(), authController.uploadProfilePicture);
router.delete('/me', authenticate, authController.deleteAccount);

module.exports = router;
