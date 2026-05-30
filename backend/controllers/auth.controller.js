/**
 * Auth Controller — Handles authentication HTTP requests.
 */

const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const authService = require('../services/auth.service');

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: male
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@sadarfinance.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: SecurePass@123
 *               phoneNumber:
 *                 type: string
 *                 example: "+628123456789"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "2000-01-15"
 *               address:
 *                 type: string
 *                 example: "Jakarta, Indonesia"
 *               occupation:
 *                 type: string
 *                 example: "Software Engineer"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email already exists
 *       422:
 *         description: Validation error
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return created(res, {
    data: result,
    message: 'User registered successfully',
  });
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@sadarfinance.com
 *               password:
 *                 type: string
 *                 example: SecurePass@123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return success(res, {
    data: result,
    message: 'Login successful',
  });
});

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  return success(res, {
    data: user,
    message: 'Profile retrieved successfully',
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  return success(res, {
    data: result,
    message: 'Password reset request received',
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  return success(res, {
    data: user,
    message: 'Profile updated successfully',
  });
});

const updateProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new Error('Pilih file foto profil terlebih dahulu');
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  const user = await authService.updateProfile(req.user.id, { profilePicture: imageUrl });
  return success(res, {
    data: user,
    message: 'Foto profil berhasil diperbarui',
  });
});

module.exports = { register, login, getProfile, forgotPassword, updateProfile, updateProfilePicture };
