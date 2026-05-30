/**
 * Auth Service — Business logic for authentication.
 * Uses ERD users table: first_name, last_name, gender, email, etc.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const userRepository = require('../repositories/user.repository');
const { UnauthorizedError, ConflictError } = require('../utils/errors');

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
    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new UnauthorizedError('Password saat ini wajib diisi untuk mengubah password');
      }
      const currentHash = await userRepository.getPasswordHash(userId);
      const isMatch = await bcrypt.compare(data.currentPassword, currentHash);
      if (!isMatch) {
        throw new UnauthorizedError('Password saat ini tidak cocok');
      }
      const passwordHash = await bcrypt.hash(data.newPassword, 12);
      await userRepository.updatePassword(userId, passwordHash);

      delete data.currentPassword;
      delete data.newPassword;
    }

    const remainingFields = Object.keys(data).filter((k) => data[k] !== undefined);
    if (remainingFields.length === 0) {
      return this.getProfile(userId);
    }

    const user = await userRepository.updateProfile(userId, data);
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
}

module.exports = new AuthService();
