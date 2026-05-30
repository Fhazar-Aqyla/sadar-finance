/**
 * Database Seed Script
 * Populates tables with demo data matching the official ERD.
 *
 * Usage: npm run db:seed
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const seed = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── Seed Demo User ──────────────────────────────────────
    const hashedPassword = await bcrypt.hash('Demo@12345', 12);
    const userResult = await client.query(
      `INSERT INTO users (first_name, last_name, gender, email, password_hash, phone_number, date_of_birth, address, occupation, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
       ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name
       RETURNING users_id`,
      ['Demo', 'User', 'male', 'demo@sadarfinance.com', hashedPassword, '+628123456789', '2000-01-15', 'Jakarta, Indonesia', 'Software Engineer']
    );
    const userId = userResult.rows[0].users_id;

    // ── Seed Demo Accounts ──────────────────────────────────
    const accountResult = await client.query(
      `INSERT INTO accounts (user_id, account_name, account_number, balance)
       VALUES
         ($1, 'BCA Utama', '1234567890', 15000000),
         ($1, 'Gopay', '0812345678', 500000),
         ($1, 'Dana Darurat', '9876543210', 5000000)
       RETURNING account_id`,
      [userId]
    );
    const mainAccountId = accountResult.rows[0].account_id;

    // ── Seed Demo Transactions (expenses) ───────────────────
    await client.query(
      `INSERT INTO transactions (user_id, account_id, category_group, transaction_date, description, source, amount)
       VALUES
         ($1, $2, 'Food & Dining', NOW() - INTERVAL '1 day', 'Makan siang di Warung Padang', 'manual', 35000),
         ($1, $2, 'Transportation', NOW() - INTERVAL '2 days', 'Grab ke kantor', 'manual', 25000),
         ($1, $2, 'Shopping', NOW() - INTERVAL '3 days', 'Beli baju di Uniqlo', 'manual', 399000),
         ($1, $2, 'Bills & Utilities', NOW() - INTERVAL '5 days', 'Bayar listrik bulan ini', 'manual', 350000),
         ($1, $2, 'Entertainment', NOW() - INTERVAL '7 days', 'Netflix subscription', 'manual', 54000),
         ($1, $2, 'Food & Dining', NOW() - INTERVAL '8 days', 'Ngopi di Starbucks', 'manual', 65000),
         ($1, $2, 'Healthcare', NOW() - INTERVAL '10 days', 'Beli obat di apotek', 'manual', 75000),
         ($1, $2, 'Education', NOW() - INTERVAL '12 days', 'Course Udemy', 'manual', 150000)`,
      [userId, mainAccountId]
    );

    // ── Seed Demo Incomes ───────────────────────────────────
    await client.query(
      `INSERT INTO incomes (user_id, account_id, amount, income_date, source)
       VALUES
         ($1, $2, 8000000, NOW() - INTERVAL '5 days', 'Gaji Bulanan'),
         ($1, $2, 1500000, NOW() - INTERVAL '10 days', 'Freelance Project'),
         ($1, $2, 250000, NOW() - INTERVAL '15 days', 'Cashback Promo')`,
      [userId, mainAccountId]
    );

    // ── Seed Demo Budget ────────────────────────────────────
    await client.query(
      `INSERT INTO budgets (user_id, needs_amount, wants_amount, savings_amount, percentage, limit_amount)
       VALUES ($1, 4000000, 2400000, 1600000, 50, 8000000)`,
      [userId]
    );

    // ── Seed Demo Insights ──────────────────────────────────
    await client.query(
      `INSERT INTO insights (user_id, title, description)
       VALUES
         ($1, 'Tren Pengeluaran: Stabil', 'Pengeluaran Anda bulan ini konsisten dengan bulan lalu. Disiplin yang sangat baik!'),
         ($1, 'Kategori Terbesar: Makanan', 'Makanan menyumbang 35% dari total pengeluaran Anda.'),
         ($1, 'Rasio Tabungan: 20%', 'Anda menghemat 20% dari pemasukan Anda bulan ini. Pertahankan!')`,
      [userId]
    );

    // ── Seed Demo Alerts ────────────────────────────────────
    await client.query(
      `INSERT INTO alerts (user_id, message, alert_type)
       VALUES
         ($1, 'Pengeluaran Makanan Anda 10% lebih tinggi dibandingkan bulan lalu.', 'overspending'),
         ($1, 'Pengeluaran Anda mendekati batas anggaran bulanan (85% terpakai).', 'budget_exceeded')`,
      [userId]
    );

    // ── Seed Demo Score ─────────────────────────────────────
    await client.query(
      `INSERT INTO scores (user_id, score)
       VALUES ($1, 72)`,
      [userId]
    );

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully.');
    console.log(`   Demo account: demo@sadarfinance.com / Demo@12345`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

seed().catch(() => process.exit(1));
