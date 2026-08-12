/**
 * Database Seed Script
 * Populates tables with balanced, realistic financial data from February through July 2026.
 *
 * Usage: npm run db:seed
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const seed = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── 1. Seed Demo User ──────────────────────────────────────
    const hashedPassword = await bcrypt.hash('Demo@12345', 12);
    const userResult = await client.query(
      `INSERT INTO users (first_name, last_name, gender, email, password_hash, phone_number, date_of_birth, address, occupation, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
       ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name
       RETURNING users_id`,
      ['Demo', 'User', 'male', 'demo@sadarfinance.com', hashedPassword, '+628123456789', '2000-01-15', 'Jakarta, Indonesia', 'Software Engineer']
    );
    const userId = userResult.rows[0].users_id;

    // Clear old data for clean balance calculation
    await client.query('DELETE FROM alerts WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM insights WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM scores WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM budgets WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM transactions WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM incomes WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM accounts WHERE user_id = $1', [userId]);

    // ── 2. Seed Demo Accounts with Balanced Balances ─────────────
    const accountResult = await client.query(
      `INSERT INTO accounts (user_id, account_name, account_number, balance)
       VALUES
         ($1, 'BCA Utama', '1234567890', 24800000),
         ($1, 'Gopay', '0812345678', 1450000),
         ($1, 'Dana Darurat', '9876543210', 15000000)
       RETURNING account_id, account_name`,
      [userId]
    );
    const mainAccountId = accountResult.rows[0].account_id;
    const gopayAccountId = accountResult.rows[1].account_id;

    // ── 3. Seed Balanced Incomes (Feb - Jul 2026) ───────────────
    const incomeData = [
      // February 2026 (Total: 10.000.000)
      { amount: 8500000, date: '2026-02-01T09:00:00.000Z', source: 'Gaji Bulanan Feb' },
      { amount: 1500000, date: '2026-02-15T14:00:00.000Z', source: 'Freelance Web Design' },

      // March 2026 (Total: 11.000.000)
      { amount: 8500000, date: '2026-03-01T09:00:00.000Z', source: 'Gaji Bulanan Mar' },
      { amount: 2500000, date: '2026-03-20T16:30:00.000Z', source: 'Bonus Performance Q1' },

      // April 2026 (Total: 10.350.000)
      { amount: 8500000, date: '2026-04-01T09:00:00.000Z', source: 'Gaji Bulanan Apr' },
      { amount: 1500000, date: '2026-04-18T11:15:00.000Z', source: 'Side Project API' },
      { amount: 350000,  date: '2026-04-28T17:00:00.000Z', source: 'Cashback Tokopedia' },

      // May 2026 (Total: 13.500.000)
      { amount: 8500000, date: '2026-05-01T09:00:00.000Z', source: 'Gaji Bulanan Mei' },
      { amount: 5000000, date: '2026-05-15T10:00:00.000Z', source: 'THR Lebaran' },

      // June 2026 (Total: 10.300.000)
      { amount: 8500000, date: '2026-06-01T09:00:00.000Z', source: 'Gaji Bulanan Jun' },
      { amount: 1800000, date: '2026-06-22T13:45:00.000Z', source: 'Freelance Mobile App' },

      // July 2026 (Total: 10.250.000)
      { amount: 8500000, date: '2026-07-01T09:00:00.000Z', source: 'Gaji Bulanan Jul' },
      { amount: 1500000, date: '2026-07-15T14:00:00.000Z', source: 'Consulting Session' },
      { amount: 250000,  date: '2026-07-25T18:20:00.000Z', source: 'Cashback Promo' },
    ];

    let lastIncomeId = null;
    for (const inc of incomeData) {
      const res = await client.query(
        `INSERT INTO incomes (user_id, account_id, amount, income_date, source)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING income_id`,
        [userId, mainAccountId, inc.amount, inc.date, inc.source]
      );
      lastIncomeId = res.rows[0].income_id;
    }

    // ── 4. Seed Balanced Transactions (Feb - Jul 2026) ──────────
    const transactionsData = [
      // February 2026 (Total Expense: 5.534.000)
      { group: 'Needs', detail: 'Food & Dining', date: '2026-02-02T12:30:00.000Z', desc: 'Belanja Sembako Supermarket', acc: mainAccountId, amount: 850000 },
      { group: 'Needs', detail: 'Bills & Utilities', date: '2026-02-05T08:00:00.000Z', desc: 'Tagihan Listrik & WiFi', acc: mainAccountId, amount: 520000 },
      { group: 'Needs', detail: 'Transportation', date: '2026-02-08T17:30:00.000Z', desc: 'Bensin Mobil & Toll', acc: mainAccountId, amount: 350000 },
      { group: 'Wants', detail: 'Shopping', date: '2026-02-12T19:15:00.000Z', desc: 'Beli Sepatu Nike', acc: mainAccountId, amount: 1299000 },
      { group: 'Needs', detail: 'Food & Dining', date: '2026-02-16T13:00:00.000Z', desc: 'Makan Malam Resto Solaria', acc: gopayAccountId, amount: 185000 },
      { group: 'Wants', detail: 'Entertainment', date: '2026-02-20T20:00:00.000Z', desc: 'Nonton Bioskop XXI', acc: gopayAccountId, amount: 120000 },
      { group: 'Needs', detail: 'Healthcare', date: '2026-02-25T10:45:00.000Z', desc: 'Vitamin & Obat Apotek', acc: mainAccountId, amount: 210000 },
      { group: 'Savings', detail: 'Investment', date: '2026-02-27T15:00:00.000Z', desc: 'Investasi Deposito Bank', acc: mainAccountId, amount: 2000000 },

      // March 2026 (Total Expense: 5.409.000)
      { group: 'Needs', detail: 'Food & Dining', date: '2026-03-03T11:30:00.000Z', desc: 'Belanja Fresh Market', acc: mainAccountId, amount: 780000 },
      { group: 'Needs', detail: 'Bills & Utilities', date: '2026-03-05T09:10:00.000Z', desc: 'Tagihan Listrik & Air', acc: mainAccountId, amount: 480000 },
      { group: 'Needs', detail: 'Transportation', date: '2026-03-10T18:00:00.000Z', desc: 'Servis Berkala Motor', acc: mainAccountId, amount: 280000 },
      { group: 'Needs', detail: 'Education', date: '2026-03-14T14:00:00.000Z', desc: 'Buku & Course Udemy', acc: mainAccountId, amount: 350000 },
      { group: 'Wants', detail: 'Shopping', date: '2026-03-18T16:45:00.000Z', desc: 'Kemeja Uniqlo', acc: mainAccountId, amount: 499000 },
      { group: 'Needs', detail: 'Food & Dining', date: '2026-03-24T12:15:00.000Z', desc: 'Kopi Kenangan & Snack', acc: gopayAccountId, amount: 95000 },
      { group: 'Wants', detail: 'Entertainment', date: '2026-03-28T21:00:00.000Z', desc: 'Langganan Spotify & Netflix', acc: gopayAccountId, amount: 175000 },
      { group: 'Savings', detail: 'Investment', date: '2026-03-29T16:00:00.000Z', desc: 'Investasi Reksa Dana Saham', acc: mainAccountId, amount: 2500000 },

      // April 2026 (Total Expense: 5.810.000)
      { group: 'Needs', detail: 'Food & Dining', date: '2026-04-02T10:00:00.000Z', desc: 'Stok Sembako Bulanan', acc: mainAccountId, amount: 950000 },
      { group: 'Needs', detail: 'Bills & Utilities', date: '2026-04-05T08:30:00.000Z', desc: 'Listrik, Air & Indihome', acc: mainAccountId, amount: 550000 },
      { group: 'Needs', detail: 'Transportation', date: '2026-04-09T17:00:00.000Z', desc: 'E-Toll & Bensin', acc: mainAccountId, amount: 400000 },
      { group: 'Wants', detail: 'Shopping', date: '2026-04-15T15:20:00.000Z', desc: 'Gadget Anker', acc: mainAccountId, amount: 650000 },
      { group: 'Needs', detail: 'Healthcare', date: '2026-04-20T11:00:00.000Z', desc: 'Checkup Gigi Dokter', acc: mainAccountId, amount: 450000 },
      { group: 'Wants', detail: 'Food & Dining', date: '2026-04-25T19:30:00.000Z', desc: 'Buka Bersama Teman', acc: gopayAccountId, amount: 320000 },
      { group: 'Wants', detail: 'Shopping', date: '2026-04-27T18:00:00.000Z', desc: 'Belanja Online HNM', acc: mainAccountId, amount: 490000 },
      { group: 'Savings', detail: 'Investment', date: '2026-04-29T10:00:00.000Z', desc: 'Tabungan Emas Antam', acc: mainAccountId, amount: 2000000 },

      // May 2026 (Total Expense: 9.490.000 - Lebaran)
      { group: 'Needs', detail: 'Food & Dining', date: '2026-05-02T12:00:00.000Z', desc: 'Belanja Makanan Lebaran', acc: mainAccountId, amount: 1450000 },
      { group: 'Needs', detail: 'Bills & Utilities', date: '2026-05-05T09:00:00.000Z', desc: 'Tagihan PLN & PAM', acc: mainAccountId, amount: 510000 },
      { group: 'Wants', detail: 'Shopping', date: '2026-05-10T14:30:00.000Z', desc: 'Baju Lebaran Keluarga', acc: mainAccountId, amount: 2150000 },
      { group: 'Needs', detail: 'Transportation', date: '2026-05-14T06:00:00.000Z', desc: 'Tiket Mudik & Bensin', acc: mainAccountId, amount: 1800000 },
      { group: 'Wants', detail: 'Food & Dining', date: '2026-05-22T18:45:00.000Z', desc: 'Kuliner Kampung Halaman', acc: gopayAccountId, amount: 580000 },
      { group: 'Needs', detail: 'Education', date: '2026-05-25T11:00:00.000Z', desc: 'Zakat & Donasi', acc: mainAccountId, amount: 1000000 },
      { group: 'Savings', detail: 'Investment', date: '2026-05-28T16:00:00.000Z', desc: 'Tabungan Lebaran', acc: mainAccountId, amount: 2000000 },

      // June 2026 (Total Expense: 6.645.000)
      { group: 'Needs', detail: 'Food & Dining', date: '2026-06-03T10:30:00.000Z', desc: 'Belanja Bulanan Hypermart', acc: mainAccountId, amount: 890000 },
      { group: 'Needs', detail: 'Bills & Utilities', date: '2026-06-05T08:15:00.000Z', desc: 'Listrik & Internet', acc: mainAccountId, amount: 490000 },
      { group: 'Needs', detail: 'Transportation', date: '2026-06-11T17:15:00.000Z', desc: 'Bensin & Transport Kantor', acc: mainAccountId, amount: 320000 },
      { group: 'Wants', detail: 'Entertainment', date: '2026-06-16T20:00:00.000Z', desc: 'Tiket Konser Musik', acc: mainAccountId, amount: 850000 },
      { group: 'Needs', detail: 'Education', date: '2026-06-21T14:00:00.000Z', desc: 'Sertifikasi AWS Cloud', acc: mainAccountId, amount: 1500000 },
      { group: 'Wants', detail: 'Food & Dining', date: '2026-06-27T13:10:00.000Z', desc: 'Pepper Lunch & Cafe', acc: gopayAccountId, amount: 245000 },
      { group: 'Wants', detail: 'Shopping', date: '2026-06-28T19:00:00.000Z', desc: 'Game Steam Summer Sale', acc: gopayAccountId, amount: 350000 },
      { group: 'Savings', detail: 'Investment', date: '2026-06-29T15:00:00.000Z', desc: 'SBN Ritel Obligasi', acc: mainAccountId, amount: 2000000 },

      // July 2026 (Total Expense: 5.313.000)
      { group: 'Needs', detail: 'Food & Dining', date: '2026-07-02T11:00:00.000Z', desc: 'Belanja Bulanan Super Indo', acc: mainAccountId, amount: 920000 },
      { group: 'Needs', detail: 'Bills & Utilities', date: '2026-07-05T09:30:00.000Z', desc: 'Tagihan Listrik & WiFi', acc: mainAccountId, amount: 530000 },
      { group: 'Needs', detail: 'Transportation', date: '2026-07-08T17:00:00.000Z', desc: 'GrabCar & Bensin', acc: gopayAccountId, amount: 280000 },
      { group: 'Wants', detail: 'Shopping', date: '2026-07-12T16:00:00.000Z', desc: 'Headphones Bluetooth', acc: mainAccountId, amount: 799000 },
      { group: 'Needs', detail: 'Healthcare', date: '2026-07-18T10:15:00.000Z', desc: 'Vitamin & Supplemen', acc: mainAccountId, amount: 310000 },
      { group: 'Wants', detail: 'Food & Dining', date: '2026-07-24T19:00:00.000Z', desc: 'Makan Malam Sushi Tei', acc: mainAccountId, amount: 320000 },
      { group: 'Wants', detail: 'Entertainment', date: '2026-07-29T21:00:00.000Z', desc: 'Streaming Subscriptions', acc: gopayAccountId, amount: 154000 },
      { group: 'Savings', detail: 'Investment', date: '2026-07-30T14:00:00.000Z', desc: 'Tabungan Masa Depan', acc: mainAccountId, amount: 2000000 },
    ];

    for (const tx of transactionsData) {
      await client.query(
        `INSERT INTO transactions (user_id, account_id, category_group, category_detail, transaction_date, description, source, amount)
         VALUES ($1, $2, $3, $4, $5, $6, 'manual', $7)`,
        [userId, tx.acc, tx.group, tx.detail, tx.date, tx.desc, tx.amount]
      );
    }

    // ── 5. Seed Demo Budget ────────────────────────────────────
    await client.query(
      `INSERT INTO budgets (
         user_id, income_id,
         needs_budget, wants_budget, investment_budget,
         income_amount, budget_limit, source, income_date,
         needs_amount, wants_amount, savings_amount, investment_amount,
         percentage, limit_amount
       )
       VALUES ($1, $2, 4250000, 2550000, 1700000, 8500000, 6800000, 'Gaji Bulanan Jul', '2026-07-01T09:00:00.000Z',
               4250000, 2550000, 1700000, 1700000, 50, 6800000)`,
      [userId, lastIncomeId]
    );

    // ── 6. Seed Demo Insights ──────────────────────────────────
    await client.query(
      `INSERT INTO insights (user_id, title, description)
       VALUES
         ($1, 'Arus Kas Sehat & Seimbang (Feb - Jul)', 'Pemasukan rata-rata Rp 10,9 juta/bulan dengan pengeluaran Rp 6,4 juta/bulan. Rasio tabungan konsisten di atas 20%.'),
         ($1, 'Kategori Utama: Food & Dining', 'Kategori Kebutuhan (Makanan & Sembako) menyumbang 36% dari total pengeluaran 6 bulan terakhir.'),
         ($1, 'Performa Anggaran 50/30/20', 'Alokasi 50% Needs, 30% Wants, dan 20% Investment berhasil dipertahankan secara seimbang.')`,
      [userId]
    );

    // ── 7. Seed Demo Alerts ────────────────────────────────────
    await client.query(
      `INSERT INTO alerts (user_id, message, alert_type)
       VALUES
         ($1, 'Pengeluaran Juli berjalan sebesar Rp 5.313.000 dari alokasi Rp 6.800.000 (78% terpakai).', 'budget_exceeded')`,
      [userId]
    );

    // ── 8. Seed Demo Score ─────────────────────────────────────
    await client.query(
      `INSERT INTO scores (user_id, score)
       VALUES ($1, 91)`,
      [userId]
    );

    await client.query('COMMIT');
    console.log('✅ Balanced demo database seeded successfully (Feb - Jul 2026).');
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
