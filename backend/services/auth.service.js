/**
 * Auth Service — Business logic for authentication.
 * Uses ERD users table: first_name, last_name, gender, email, etc.
 */

const bcrypt = require('bcryptjs');
const fs = require('fs/promises');
const jwt = require('jsonwebtoken');
const config = require('../config');
const userRepository = require('../repositories/user.repository');
const { UnauthorizedError, ConflictError, BadRequestError } = require('../utils/errors');

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
    await userRepository.findByEmail(email);

    return {
      email,
      resetAvailable: false,
      message: 'If the email is registered, reset instructions will be sent when email delivery is configured.',
    };
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
    const { password_hash, ...sanitized } = user;
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
