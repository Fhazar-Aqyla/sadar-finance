/**
 * User Repository — Data access layer for users table.
 * Matches ERD: users_id, first_name, last_name, gender, email, password_hash,
 *              phone_number, date_of_birth, address, profile_picture, occupation, status
 */

const { query } = require('../config/database');

class UserRepository {
  async findByEmail(email) {
    const result = await query(
      `SELECT users_id, first_name, last_name, gender, email, password_hash,
              phone_number, date_of_birth, address, profile_picture, occupation, status,
              created_at, updated_at
       FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  }

  async findById(id) {
    const result = await query(
      `SELECT users_id, first_name, last_name, gender, email,
              phone_number, date_of_birth, address, profile_picture, occupation, status,
              created_at, updated_at
       FROM users WHERE users_id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create({ firstName, lastName, gender, email, passwordHash, phoneNumber, dateOfBirth, address, occupation }) {
    const result = await query(
      `INSERT INTO users (first_name, last_name, gender, email, password_hash, phone_number, date_of_birth, address, occupation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING users_id, first_name, last_name, gender, email, phone_number, date_of_birth, address, occupation, status, created_at`,
      [firstName, lastName, gender || null, email, passwordHash, phoneNumber || null, dateOfBirth || null, address || null, occupation || null]
    );
    return result.rows[0];
  }

  async updateProfile(id, data) {
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
       RETURNING users_id, first_name, last_name, gender, email, phone_number, date_of_birth, address, profile_picture, occupation, status, updated_at`,
      params
    );
    return result.rows[0] || null;
  }
}

module.exports = new UserRepository();
