/**
 * Auth Routes
 */

/**
 * Auth Routes
 */

const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema, forgotPasswordSchema, updateProfileSchema } = require('../validators/auth.validator');

const upload = require('../middlewares/upload');

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.get('/me', authenticate, authController.getProfile);
router.put('/me', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.post('/profile-picture', authenticate, upload.single('avatar'), authController.updateProfilePicture);

module.exports = router;
