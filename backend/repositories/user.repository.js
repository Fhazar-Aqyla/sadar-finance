/**
 * User Repository — Data access layer for users table.
 * Matches ERD + Fase 3 Auth extensions:
 *   users_id, first_name, last_name, gender, email, password_hash,
 *   phone_number, date_of_birth, address, profile_picture, occupation, status,
 *   email_verified, google_id, google_email, otp_code, otp_expires_at
 */

const { query } = require('../config/database');

const PUBLIC_USER_COLS = `
  users_id, first_name, last_name, gender, email,
  phone_number, date_of_birth, address, profile_picture, occupation, status,
  COALESCE(email_verified, FALSE) AS email_verified,
  google_id, google_email,
  created_at, updated_at
`;

class UserRepository {
  constructor() {
    this._colsEnsured = false;
  }

  async _ensureColumns() {
    if (this._colsEnsured) return;
    try {
      await query(`
        ALTER TABLE users
          ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS google_id VARCHAR(255),
          ADD COLUMN IF NOT EXISTS google_email VARCHAR(255),
          ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10),
          ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;
      `);
      this._colsEnsured = true;
    } catch (_) {}
  }

  async findByEmail(email) {
    await this._ensureColumns();
    const result = await query(
      `SELECT ${PUBLIC_USER_COLS}, password_hash, otp_code, otp_expires_at
       FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    );
    return result.rows[0] || null;
  }

  async findByGoogleId(googleId) {
    await this._ensureColumns();
    const result = await query(
      `SELECT ${PUBLIC_USER_COLS}, password_hash
       FROM users WHERE google_id = $1`,
      [googleId]
    );
    return result.rows[0] || null;
  }

  async findById(id) {
    await this._ensureColumns();
    const result = await query(
      `SELECT ${PUBLIC_USER_COLS}
       FROM users WHERE users_id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findByIdWithPassword(id) {
    await this._ensureColumns();
    const result = await query(
      `SELECT ${PUBLIC_USER_COLS}, password_hash, otp_code, otp_expires_at
       FROM users WHERE users_id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create({
    firstName,
    lastName,
    gender,
    email,
    passwordHash,
    phoneNumber,
    dateOfBirth,
    address,
    occupation,
    profilePicture,
    emailVerified = false,
    googleId = null,
    googleEmail = null,
  }) {
    await this._ensureColumns();
    const result = await query(
      `INSERT INTO users (
         first_name, last_name, gender, email, password_hash,
         phone_number, date_of_birth, address, occupation, profile_picture,
         email_verified, google_id, google_email
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING ${PUBLIC_USER_COLS}`,
      [
        firstName,
        lastName,
        gender || null,
        email,
        passwordHash,
        phoneNumber || null,
        dateOfBirth || null,
        address || null,
        occupation || null,
        profilePicture || null,
        Boolean(emailVerified),
        googleId,
        googleEmail,
      ]
    );
    return result.rows[0];
  }

  async updateProfile(id, data) {
    await this._ensureColumns();
    const fields = [];
    const params = [id];
    let paramIndex = 2;

    const fieldMap = {
      firstName: 'first_name',
      lastName: 'last_name',
      gender: 'gender',
      phoneNumber: 'phone_number',
      dateOfBirth: 'date_of_birth',
      address: 'address',
      profilePicture: 'profile_picture',
      occupation: 'occupation',
      emailVerified: 'email_verified',
      googleId: 'google_id',
      googleEmail: 'google_email',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${paramIndex++}`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) return null;

    fields.push('updated_at = NOW()');

    const result = await query(
      `UPDATE users SET ${fields.join(', ')}
       WHERE users_id = $1
       RETURNING ${PUBLIC_USER_COLS}`,
      params
    );
    return result.rows[0] || null;
  }

  async saveOtp(id, otpCode, expiresAt) {
    await this._ensureColumns();
    const result = await query(
      `UPDATE users
       SET otp_code = $2,
           otp_expires_at = $3,
           updated_at = NOW()
       WHERE users_id = $1
       RETURNING ${PUBLIC_USER_COLS}`,
      [id, otpCode, expiresAt]
    );
    return result.rows[0] || null;
  }

  async markEmailVerified(id) {
    await this._ensureColumns();
    const result = await query(
      `UPDATE users
       SET email_verified = TRUE,
           otp_code = NULL,
           otp_expires_at = NULL,
           updated_at = NOW()
       WHERE users_id = $1
       RETURNING ${PUBLIC_USER_COLS}`,
      [id]
    );
    return result.rows[0] || null;
  }

  async updatePassword(id, passwordHash) {
    await this._ensureColumns();
    const result = await query(
      `UPDATE users
       SET password_hash = $2,
           otp_code = NULL,
           otp_expires_at = NULL,
           updated_at = NOW()
       WHERE users_id = $1
       RETURNING ${PUBLIC_USER_COLS}`,
      [id, passwordHash]
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await query(
      `DELETE FROM users WHERE users_id = $1 RETURNING users_id`,
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = new UserRepository();
