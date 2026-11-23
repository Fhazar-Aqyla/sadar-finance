/**
 * Auth Service — Business logic for authentication.
 * Uses ERD users table: first_name, last_name, gender, email, etc.
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs/promises');
const jwt = require('jsonwebtoken');
const config = require('../config');
const userRepository = require('../repositories/user.repository');
const emailService = require('./email.service');
const { UnauthorizedError, ConflictError, BadRequestError, NotFoundError } = require('../utils/errors');

class AuthService {
  /**
   * Register a new user.
   */
  async register({ firstName, lastName, gender, email, password, phoneNumber, dateOfBirth, address, occupation }) {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await userRepository.create({
      firstName,
      lastName,
      gender,
      email,
      passwordHash,
      phoneNumber,
      dateOfBirth,
      address,
      occupation,
    });

    // Generate JWT
    const token = this._generateToken(user);

    return {
      user: this._sanitizeUser(user),
      token,
    };
  }

  /**
   * Login with email and password.
   */
  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Account is not active');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this._generateToken(user);

    return {
      user: this._sanitizeUser(user),
      token,
    };
  }

  /**
   * Get current user profile.
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    return this._sanitizeUser(user);
  }

  async forgotPassword(email) {
    return this.sendOtp({ email, purpose: 'reset' });
  }

  /**
   * Generate and send 6-digit OTP code via Email (for email verification or password reset).
   */
  async sendOtp({ userId, email, purpose = 'verify' }) {
    let user = null;
    if (userId) {
      user = await userRepository.findByIdWithPassword(userId);
    } else if (email) {
      user = await userRepository.findByEmail(email);
    }

    if (!user) {
      throw new NotFoundError('Email akun tidak ditemukan di SADAR Finance.');
    }

    const otp = String(crypto.randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await userRepository.saveOtp(user.users_id, otp, expiresAt);

    const delivery = await emailService.sendOtpEmail({
      toEmail: user.email,
      name: user.first_name,
      otp,
      purpose,
    });

    return {
      email: user.email,
      resetAvailable: true,
      expiresInSeconds: 600,
      deliveryMode: delivery.provider,
      ...(delivery.sent ? {} : { otpPreview: otp }),
      message: delivery.sent
        ? `Kode verifikasi 6 digit telah dikirim ke email ${user.email}.`
        : `Kode OTP berhasil dibuat untuk ${user.email} (Mode Sandbox: ${otp}).`,
    };
  }

  /**
   * Verify 6-digit OTP and mark user's email as verified.
   */
  async verifyOtp({ userId, email, otp }) {
    let user = null;
    if (userId) {
      user = await userRepository.findByIdWithPassword(userId);
    } else if (email) {
      user = await userRepository.findByEmail(email);
    }
    if (!user) {
      throw new NotFoundError('Akun tidak ditemukan.');
    }
    if (!user.otp_code || String(user.otp_code) !== String(otp).trim()) {
      throw new BadRequestError('Kode verifikasi OTP tidak sesuai.');
    }
    if (user.otp_expires_at && new Date(user.otp_expires_at) < new Date()) {
      throw new BadRequestError('Kode OTP sudah kedaluwarsa. Silakan kirim ulang kode baru.');
    }

    const updated = await userRepository.markEmailVerified(user.users_id);
    return this._sanitizeUser(updated);
  }

  /**
   * Reset password using 6-digit OTP sent to email.
   */
  async resetPasswordWithOtp({ email, otp, newPassword }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('Email akun tidak ditemukan.');
    }
    if (!user.otp_code || String(user.otp_code) !== String(otp).trim()) {
      throw new BadRequestError('Kode OTP tidak valid.');
    }
    if (user.otp_expires_at && new Date(user.otp_expires_at) < new Date()) {
      throw new BadRequestError('Kode OTP sudah kedaluwarsa. Silakan minta kode baru.');
    }
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestError('Kata sandi baru minimal 8 karakter.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await userRepository.updatePassword(user.users_id, passwordHash);
    const verifiedUser = await userRepository.markEmailVerified(user.users_id);
    return {
      user: this._sanitizeUser(verifiedUser),
      message: 'Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.',
    };
  }

  /**
   * Login / Register / Link via Google Account.
   */
  async authenticateWithGoogle({ idToken, accessToken, googleId, email, displayName, photoUrl }) {
    let verifiedEmail = (email || '').trim().toLowerCase();
    let verifiedSub = googleId || '';

    // Verify Google token if provided
    if (idToken) {
      try {
        const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
        if (res.ok) {
          const info = await res.json();
          if (info.email) verifiedEmail = info.email.toLowerCase();
          if (info.sub) verifiedSub = info.sub;
        }
      } catch (_) {}
    } else if (accessToken) {
      try {
        const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const info = await res.json();
          if (info.email) verifiedEmail = info.email.toLowerCase();
          if (info.sub) verifiedSub = info.sub;
        }
      } catch (_) {}
    }

    if (!verifiedEmail) {
      throw new BadRequestError('Email Google tidak valid.');
    }
    if (!verifiedSub) {
      verifiedSub = `google_${crypto.createHash('sha256').update(verifiedEmail).digest('hex').slice(0, 20)}`;
    }

    let user = await userRepository.findByGoogleId(verifiedSub);
    if (!user) {
      user = await userRepository.findByEmail(verifiedEmail);
    }

    if (user) {
      // Link Google ID & mark email verified if not already linked
      user = await userRepository.updateProfile(user.users_id, {
        googleId: verifiedSub,
        googleEmail: verifiedEmail,
        emailVerified: true,
        ...(user.profile_picture ? {} : { profilePicture: photoUrl || 'avatar2d:boss_cuan' }),
      });
    } else {
      const parts = (displayName || verifiedEmail.split('@')[0]).trim().split(/\s+/);
      const firstName = parts[0] || 'Pengguna';
      const lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'SADAR';
      const randomPassHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);

      user = await userRepository.create({
        firstName,
        lastName,
        email: verifiedEmail,
        passwordHash: randomPassHash,
        profilePicture: photoUrl || 'avatar2d:boss_cuan',
        emailVerified: true,
        googleId: verifiedSub,
        googleEmail: verifiedEmail,
      });
    }

    const token = this._generateToken(user);
    return {
      user: this._sanitizeUser(user),
      token,
    };
  }

  async linkGoogleAccount(userId, { googleId, email, idToken }) {
    const current = await userRepository.findById(userId);
    if (!current) throw new UnauthorizedError('User not found');

    const googleEmail = (email || current.email).trim().toLowerCase();
    const sub =
      googleId ||
      `google_${crypto.createHash('sha256').update(googleEmail).digest('hex').slice(0, 20)}`;

    const updated = await userRepository.updateProfile(userId, {
      googleId: sub,
      googleEmail,
      emailVerified: true,
    });
    return this._sanitizeUser(updated);
  }

  async unlinkGoogleAccount(userId) {
    const updated = await userRepository.updateProfile(userId, {
      googleId: null,
      googleEmail: null,
    });
    return this._sanitizeUser(updated);
  }

  async updateProfile(userId, data) {
    const user = await userRepository.updateProfile(userId, data);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    return this._sanitizeUser(user);
  }

  async updateProfileAndPassword(userId, data) {
    const profileData = this._pickProfileFields(data);
    const shouldChangePassword = this.hasPasswordChange(data);

    if (shouldChangePassword) {
      await this.changePassword(userId, data);
    }

    if (Object.keys(profileData).length) {
      return this.updateProfile(userId, profileData);
    }

    if (shouldChangePassword) {
      return this.getProfile(userId);
    }

    throw new BadRequestError('No profile or password changes were provided');
  }

  hasPasswordChange(data = {}) {
    const passwordData = this._normalizePasswordInput(data);
    return Boolean(passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword);
  }

  async changePassword(userId, data) {
    const { currentPassword, newPassword, confirmPassword } = this._normalizePasswordInput(data);

    if (!currentPassword) {
      throw new BadRequestError('Current password is required');
    }
    if (!newPassword) {
      throw new BadRequestError('New password is required');
    }
    if (newPassword !== confirmPassword) {
      throw new BadRequestError('New password confirmation does not match');
    }
    if (!this._isValidPassword(newPassword)) {
      throw new BadRequestError('New password must be at least 8 characters and contain letters and numbers');
    }
    if (currentPassword === newPassword) {
      throw new BadRequestError('New password must be different from the current password');
    }

    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const updatedUser = await userRepository.updatePassword(userId, passwordHash);

    if (!updatedUser) {
      throw new UnauthorizedError('User not found');
    }

    return this._sanitizeUser(updatedUser);
  }

  async updateProfilePicture(userId, file) {
    if (!file) {
      throw new BadRequestError('Profile picture file is required');
    }

    const imageBuffer = await fs.readFile(file.path);
    await fs.unlink(file.path).catch(() => {});

    const profilePicture = `data:${file.mimetype};base64,${imageBuffer.toString('base64')}`;
    const user = await userRepository.updateProfile(userId, { profilePicture });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return this._sanitizeUser(user);
  }

  async deleteAccount(userId, password) {
    if (!password) {
      throw new BadRequestError('Password is required to delete your account');
    }

    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Password yang Anda masukkan salah. Gagal menghapus akun.');
    }

    const deleted = await userRepository.delete(userId);
    if (!deleted) {
      throw new BadRequestError('Failed to delete account');
    }

    return { success: true };
  }

  /**
   * Generate a JWT token.
   */
  _generateToken(user) {
    return jwt.sign(
      {
        id: user.users_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  /**
   * Remove sensitive fields from user object.
   */
  _sanitizeUser(user) {
    const { password_hash, otp_code, otp_expires_at, ...sanitized } = user;
    return sanitized;
  }

  _pickProfileFields(data = {}) {
    const fields = [
      'firstName',
      'lastName',
      'gender',
      'phoneNumber',
      'dateOfBirth',
      'address',
      'profilePicture',
      'occupation',
    ];

    return fields.reduce((profileData, field) => {
      if (data[field] !== undefined) {
        profileData[field] = data[field];
      }
      return profileData;
    }, {});
  }

  _normalizePasswordInput(data = {}) {
    return {
      currentPassword: data.currentPassword || data.current_password || data.oldPassword || data.old_password || data.passwordCurrent || '',
      newPassword: data.newPassword || data.new_password || data.passwordNew || data.password_new || data.password || '',
      confirmPassword: data.confirmPassword || data.confirm_password || data.passwordConfirmation || data.password_confirmation || data.newPasswordConfirm || data.new_password_confirm || data.newPassword || data.new_password || data.password || '',
    };
  }

  _isValidPassword(password) {
    return typeof password === 'string'
      && password.length >= 8
      && /[A-Za-z]/.test(password)
      && /\d/.test(password);
  }
}

module.exports = new AuthService();
