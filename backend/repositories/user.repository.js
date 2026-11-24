/**
 * User Repository — Data access layer for users table.
 * Matches ERD + Fase 3 Auth extensions:
 *   users_id, first_name, last_name, gender, email, password_hash,
 *   phone_number, date_of_birth, address, profile_picture, occupation, status,
 *   email_verified, google_id, google_email, otp_code, otp_expires_at
 */

const { query } = require('../config/database');

const PUBLIC_USER_COLS = `
  users_id, first_name, middle_name, last_name, username, gender, email,
  phone_number, date_of_birth, address, city, province, postal_code,
  profile_picture, occupation, financial_goal, status,
  COALESCE(streak_days, 1) AS streak_days,
  COALESCE(xp_points, 50) AS xp_points,
  COALESCE(financial_level, 1) AS financial_level,
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
          ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100),
          ADD COLUMN IF NOT EXISTS username VARCHAR(60),
          ADD COLUMN IF NOT EXISTS city VARCHAR(120),
          ADD COLUMN IF NOT EXISTS province VARCHAR(120),
          ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
          ADD COLUMN IF NOT EXISTS financial_goal VARCHAR(160),
          ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 1,
          ADD COLUMN IF NOT EXISTS xp_points INTEGER DEFAULT 50,
          ADD COLUMN IF NOT EXISTS financial_level INTEGER DEFAULT 1,
          ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS google_id VARCHAR(255),
          ADD COLUMN IF NOT EXISTS google_email VARCHAR(255),
          ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10),
          ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;
      `);
      // Auto-populate middle_name (nickname) if empty and last_name has 2+ words (e.g. "Habib Rafi" -> middle="Habib", last="Rafi")
      await query(`
        UPDATE users
        SET
          middle_name = split_part(TRIM(last_name), ' ', 1),
          last_name = SUBSTRING(TRIM(last_name) FROM LENGTH(split_part(TRIM(last_name), ' ', 1)) + 2)
        WHERE (middle_name IS NULL OR TRIM(middle_name) = '')
          AND POSITION(' ' IN TRIM(last_name)) > 0;
      `);
      // Auto-populate username if empty
      await query(`
        UPDATE users
        SET username = LOWER(REGEXP_REPLACE(
          COALESCE(NULLIF(TRIM(middle_name), ''), TRIM(first_name)) || COALESCE(NULLIF(TRIM(last_name), ''), ''),
          '[^a-zA-Z0-9_]', '', 'g'
        ))
        WHERE username IS NULL OR TRIM(username) = '';
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
    middleName,
    lastName,
    username,
    gender,
    email,
    passwordHash,
    phoneNumber,
    dateOfBirth,
    address,
    city,
    province,
    postalCode,
    occupation,
    financialGoal,
    profilePicture,
    emailVerified = false,
    googleId = null,
    googleEmail = null,
  }) {
    await this._ensureColumns();
    const cleanUsername =
      (username || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '') ||
      `${(middleName || firstName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const result = await query(
      `INSERT INTO users (
         first_name, middle_name, last_name, username, gender, email, password_hash,
         phone_number, date_of_birth, address, city, province, postal_code,
         occupation, financial_goal, profile_picture,
         email_verified, google_id, google_email
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING ${PUBLIC_USER_COLS}`,
      [
        firstName,
        middleName || null,
        lastName,
        cleanUsername,
        gender || null,
        email,
        passwordHash,
        phoneNumber || null,
        dateOfBirth || null,
        address || null,
        city || null,
        province || null,
        postalCode || null,
        occupation || null,
        financialGoal || null,
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
      middleName: 'middle_name',
      lastName: 'last_name',
      username: 'username',
      gender: 'gender',
      phoneNumber: 'phone_number',
      dateOfBirth: 'date_of_birth',
      address: 'address',
      city: 'city',
      province: 'province',
      postalCode: 'postal_code',
      profilePicture: 'profile_picture',
      occupation: 'occupation',
      financialGoal: 'financial_goal',
      streakDays: 'streak_days',
      xpPoints: 'xp_points',
      financialLevel: 'financial_level',
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

  async getStreakLeaderboard(limit = 30) {
    await this._ensureColumns();
    const result = await query(
      `SELECT
         u.users_id,
         u.first_name,
         u.middle_name,
         u.last_name,
         u.username,
         u.profile_picture,
         u.occupation,
         u.city,
         COALESCE(act.active_days, 0) AS streak_days,
         (
           COALESCE(acc.acc_count, 0) * 25 +
           COALESCE(tx.tx_count, 0) * 15 +
           COALESCE(inc.inc_count, 0) * 15 +
           COALESCE(bdg.has_budget, 0) * 50 +
           COALESCE(act.active_days, 0) * 20
         ) AS xp_points
       FROM users u
       LEFT JOIN (
         SELECT user_id, COUNT(*)::int AS tx_count
         FROM transactions
         GROUP BY user_id
       ) tx ON tx.user_id = u.users_id
       LEFT JOIN (
         SELECT user_id, COUNT(*)::int AS inc_count
         FROM incomes
         GROUP BY user_id
       ) inc ON inc.user_id = u.users_id
       LEFT JOIN (
         SELECT user_id, COUNT(*)::int AS acc_count
         FROM accounts
         GROUP BY user_id
       ) acc ON acc.user_id = u.users_id
       LEFT JOIN (
         SELECT user_id, CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END AS has_budget
         FROM budgets
         GROUP BY user_id
       ) bdg ON bdg.user_id = u.users_id
       LEFT JOIN (
         SELECT user_id, COUNT(DISTINCT activity_day)::int AS active_days
         FROM (
           SELECT user_id, (transaction_date AT TIME ZONE 'Asia/Jakarta')::date AS activity_day FROM transactions
           UNION
           SELECT user_id, (income_date AT TIME ZONE 'Asia/Jakarta')::date AS activity_day FROM incomes
         ) d
         GROUP BY user_id
       ) act ON act.user_id = u.users_id
       WHERE u.status = 'active'
         AND LOWER(u.email) != 'demo@sadarfinance.com'
       ORDER BY streak_days DESC, xp_points DESC, u.created_at ASC
       LIMIT $1`,
      [limit]
    );
    return result.rows.map((r) => {
      const xp = Number(r.xp_points || 0);
      const level = xp >= 800 ? 5 : xp >= 450 ? 4 : xp >= 220 ? 3 : xp >= 80 ? 2 : 1;
      return {
        ...r,
        streak_days: Number(r.streak_days || 0),
        xp_points: xp,
        financial_level: level,
      };
    });
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
