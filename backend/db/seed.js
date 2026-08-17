/**
 * Database Seed Script
 * Populates tables with balanced, realistic financial data for the DEMO user
 * from January through August 2026.
 *
 * Scope: Strictly targets only demo@sadarfinance.com without affecting other users.
 *
 * Usage: npm run db:seed
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// Default embedded realistic avatar data URI for demo account
const DEFAULT_DEMO_AVATAR = (() => {
  try {
    const candidatePath = path.join(__dirname, '../../frontend/src/assets/images/users/avatar-1.jpg');
    if (fs.existsSync(candidatePath)) {
      const buffer = fs.readFileSync(candidatePath);
      return `data:image/jpeg;base64,${buffer.toString('base64')}`;
    }
  } catch {
    // fallback
  }
  return '';
})();

const seed = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── 1. Seed / Upsert Demo User ─────────────────────────────────
    const hashedPassword = await bcrypt.hash('Demo@12345', 12);
    const userResult = await client.query(
      `INSERT INTO users (
         first_name, last_name, gender, email, password_hash,
         phone_number, date_of_birth, address, occupation, profile_picture, status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
       ON CONFLICT (email) DO UPDATE SET
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         occupation = EXCLUDED.occupation,
         profile_picture = COALESCE(EXCLUDED.profile_picture, users.profile_picture),
         phone_number = EXCLUDED.phone_number,
         address = EXCLUDED.address
       RETURNING users_id`,
      [
        'Demo',
        'User',
        'male',
        'demo@sadarfinance.com',
        hashedPassword,
        '+628123456789',
        '2000-01-15',
        'Jakarta, Indonesia',
        'Software Engineer',
        DEFAULT_DEMO_AVATAR || null,
      ]
    );
    const userId = userResult.rows[0].users_id;

    // Clear old data ONLY for demo user to ensure accurate balance & transaction history
    await client.query('DELETE FROM alerts WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM insights WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM scores WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM budgets WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM transactions WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM incomes WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM accounts WHERE user_id = $1', [userId]);

    // ── 2. Seed Demo Accounts (Bank DBS Indonesia & GoPay only, NO Dana Darurat) ─
    const accountResult = await client.query(
      `INSERT INTO accounts (user_id, account_name, account_number, balance)
       VALUES
         ($1, 'Bank DBS Indonesia', '1234-5678-90', 26407000),
         ($1, 'Gopay', '0812-3456-78', 1450000)
       RETURNING account_id, account_name`,
      [userId]
    );
    const dbsAccountId = accountResult.rows.find((r) => r.account_name.includes('DBS')).account_id;
    const gopayAccountId = accountResult.rows.find((r) => r.account_name.includes('Gopay')).account_id;

    // ── 3. Seed Realistic Incomes (Jan - Aug 2026) ──────────────────
    const incomeData = [
      // January 2026 (DBS: 9.000.000, Gopay: 400.000)
      { acc: dbsAccountId, amount: 7000000, date: '2026-01-01T09:00:00.000Z', source: 'Gaji Bulanan Jan' },
      { acc: dbsAccountId, amount: 2000000, date: '2026-01-15T14:00:00.000Z', source: 'Bonus Awal Tahun' },
      { acc: gopayAccountId, amount: 400000, date: '2026-01-20T10:00:00.000Z', source: 'Topup GoPay' },

      // February 2026 (DBS: 8.500.000, Gopay: 450.000)
      { acc: dbsAccountId, amount: 7000000, date: '2026-02-01T09:00:00.000Z', source: 'Gaji Bulanan Feb' },
      { acc: dbsAccountId, amount: 1500000, date: '2026-02-15T14:00:00.000Z', source: 'Freelance Web Design' },
      { acc: gopayAccountId, amount: 450000, date: '2026-02-18T10:00:00.000Z', source: 'Topup GoPay' },

      // March 2026 (DBS: 8.500.000, Gopay: 450.000)
      { acc: dbsAccountId, amount: 7000000, date: '2026-03-01T09:00:00.000Z', source: 'Gaji Bulanan Mar' },
      { acc: dbsAccountId, amount: 1500000, date: '2026-03-20T16:30:00.000Z', source: 'Bonus Performance Q1' },
      { acc: gopayAccountId, amount: 450000, date: '2026-03-22T10:00:00.000Z', source: 'Topup GoPay' },

      // April 2026 (DBS: 8.850.000, Gopay: 450.000)
      { acc: dbsAccountId, amount: 7000000, date: '2026-04-01T09:00:00.000Z', source: 'Gaji Bulanan Apr' },
      { acc: dbsAccountId, amount: 1500000, date: '2026-04-18T11:15:00.000Z', source: 'Side Project API' },
      { acc: dbsAccountId, amount: 350000,  date: '2026-04-28T17:00:00.000Z', source: 'Cashback Tokopedia' },
      { acc: gopayAccountId, amount: 450000, date: '2026-04-22T10:00:00.000Z', source: 'Topup GoPay' },

      // May 2026 (DBS: 10.500.000, Gopay: 800.000)
      { acc: dbsAccountId, amount: 7000000, date: '2026-05-01T09:00:00.000Z', source: 'Gaji Bulanan Mei' },
      { acc: dbsAccountId, amount: 3500000, date: '2026-05-15T10:00:00.000Z', source: 'THR Lebaran' },
      { acc: gopayAccountId, amount: 800000, date: '2026-05-20T10:00:00.000Z', source: 'Topup GoPay' },

      // June 2026 (DBS: 8.800.000, Gopay: 700.000)
      { acc: dbsAccountId, amount: 7000000, date: '2026-06-01T09:00:00.000Z', source: 'Gaji Bulanan Jun' },
      { acc: dbsAccountId, amount: 1800000, date: '2026-06-22T13:45:00.000Z', source: 'Freelance Mobile App' },
      { acc: gopayAccountId, amount: 700000, date: '2026-06-25T10:00:00.000Z', source: 'Topup GoPay' },

      // July 2026 (DBS: 8.494.000, Gopay: 600.000)
      { acc: dbsAccountId, amount: 7000000, date: '2026-07-01T09:00:00.000Z', source: 'Gaji Bulanan Jul' },
      { acc: dbsAccountId, amount: 1250000, date: '2026-07-15T14:00:00.000Z', source: 'Consulting Session' },
      { acc: dbsAccountId, amount: 244000,  date: '2026-07-25T18:20:00.000Z', source: 'Cashback Promo' },
      { acc: gopayAccountId, amount: 600000, date: '2026-07-20T10:00:00.000Z', source: 'Topup GoPay' },

      // August 2026 (DBS: 8.000.000, Gopay: 849.000)
      { acc: dbsAccountId, amount: 7000000, date: '2026-08-01T09:00:00.000Z', source: 'Gaji Bulanan Ags' },
      { acc: dbsAccountId, amount: 1000000, date: '2026-08-10T14:00:00.000Z', source: 'Project Maintenance' },
      { acc: gopayAccountId, amount: 849000, date: '2026-08-12T10:00:00.000Z', source: 'Topup GoPay' },
    ];

    let lastIncomeId = null;
    for (const inc of incomeData) {
      const res = await client.query(
        `INSERT INTO incomes (user_id, account_id, amount, income_date, source)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING income_id`,
        [userId, inc.acc, inc.amount, inc.date, inc.source]
      );
      lastIncomeId = res.rows[0].income_id;
    }

    // ── 4. Seed Realistic Transactions (Jan - Aug 2026) ────────────
    const transactionsData = [
      // January 2026
      { group: 'Needs', detail: 'Food & Dining', date: '2026-01-03T12:00:00.000Z', desc: 'Belanja Awal Tahun Sembako', acc: dbsAccountId, amount: 800000 },
      { group: 'Needs', detail: 'Bills & Utilities', date: '2026-01-05T08:30:00.000Z', desc: 'Tagihan Listrik & WiFi', acc: dbsAccountId, amount: 500000 },
      { group: 'Needs', detail: 'Transportation', date: '2026-01-09T17:00:00.000Z', desc: 'Bensin & Transportasi Kantor', acc: dbsAccountId, amount: 350000 },
      { group: 'Wants', detail: 'Shopping', date: '2026-01-14T15:00:00.000Z', desc: 'Beli Jaket Musim Hujan', acc: dbsAccountId, amount: 650000 },
      { group: 'Wants', detail: 'Food & Dining', date: '2026-01-21T13:00:00.000Z', desc: 'Makan Bersama Teman Cafe', acc: gopayAccountId, amount: 180000 },
      { group: 'Wants', detail: 'Entertainment', date: '2026-01-26T20:00:00.000Z', desc: 'Nonton Bioskop & Popcorn', acc: gopayAccountId, amount: 120000 },
      { group: 'Savings', detail: 'Investment', date: '2026-01-29T15:00:00.000Z', desc: 'Investasi Deposito Bank DBS', acc: dbsAccountId, amount: 2500000 },

      // February 2026
      { group: 'Needs', detail: 'Food & Dining', date: '2026-02-02T12:30:00.000Z', desc: 'Belanja Sembako Supermarket', acc: dbsAccountId, amount: 850000 },
      { group: 'Needs', detail: 'Bills & Utilities', date: '2026-02-05T08:00:00.000Z', desc: 'Tagihan Listrik & WiFi', acc: dbsAccountId, amount: 520000 },
      { group: 'Needs', detail: 'Transportation', date: '2026-02-08T17:30:00.000Z', desc: 'Bensin Mobil & Toll', acc: dbsAccountId, amount: 350000 },
      { group: 'Wants', detail: 'Shopping', date: '2026-02-12T19:15:00.000Z', desc: 'Beli Sepatu Nike', acc: dbsAccountId, amount: 1299000 },
      { group: 'Needs', detail: 'Food & Dining', date: '2026-02-16T13:00:00.000Z', desc: 'Makan Malam Resto Solaria', acc: gopayAccountId, amount: 185000 },
      { group: 'Wants', detail: 'Entertainment', date: '2026-02-20T20:00:00.000Z', desc: 'Nonton Bioskop XXI', acc: gopayAccountId, amount: 120000 },
      { group: 'Needs', detail: 'Healthcare', date: '2026-02-25T10:45:00.000Z', desc: 'Vitamin & Obat Apotek', acc: dbsAccountId, amount: 210000 },
      { group: 'Savings', detail: 'Investment', date: '2026-02-27T15:00:00.000Z', desc: 'Investasi Deposito Bank', acc: dbsAccountId, amount: 2000000 },

      // March 2026
      { group: 'Needs', detail: 'Food & Dining', date: '2026-03-03T11:30:00.000Z', desc: 'Belanja Fresh Market', acc: dbsAccountId, amount: 780000 },
      { group: 'Needs', detail: 'Bills & Utilities', date: '2026-03-05T09:10:00.000Z', desc: 'Tagihan Listrik & Air', acc: dbsAccountId, amount: 480000 },
      { group: 'Needs', detail: 'Transportation', date: '2026-03-10T18:00:00.000Z', desc: 'Servis Berkala Motor', acc: dbsAccountId, amount: 280000 },
      { group: 'Needs', detail: 'Education', date: '2026-03-14T14:00:00.000Z', desc: 'Buku & Course Udemy', acc: dbsAccountId, amount: 350000 },
      { group: 'Wants', detail: 'Shopping', date: '2026-03-18T16:45:00.000Z', desc: 'Kemeja Uniqlo', acc: dbsAccountId, amount: 499000 },
      { group: 'Needs', detail: 'Food & Dining', date: '2026-03-24T12:15:00.000Z', desc: 'Kopi Kenangan & Snack', acc: gopayAccountId, amount: 95000 },
      { group: 'Wants', detail: 'Entertainment', date: '2026-03-28T21:00:00.000Z', desc: 'Langganan Spotify & Netflix', acc: gopayAccountId, amount: 175000 },
      { group: 'Savings', detail: 'Investment', date: '2026-03-29T16:00:00.000Z', desc: 'Investasi Reksa Dana Saham', acc: dbsAccountId, amount: 2500000 },

      // April 2026
      { group: 'Needs', detail: 'Food & Dining', date: '2026-04-02T10:00:00.000Z', desc: 'Stok Sembako Bulanan', acc: dbsAccountId, amount: 950000 },
      { group: 'Needs', detail: 'Bills & Utilities', date: '2026-04-05T08:30:00.000Z', desc: 'Listrik, Air & Indihome', acc: dbsAccountId, amount: 550000 },
      { group: 'Needs', detail: 'Transportation', date: '2026-04-09T17:00:00.000Z', desc: 'E-Toll & Bensin', acc: dbsAccountId, amount: 400000 },
      { group: 'Wants', detail: 'Shopping', date: '2026-04-15T15:20:00.000Z', desc: 'Gadget Anker Powerbank', acc: dbsAccountId, amount: 650000 },
      { group: 'Needs', detail: 'Healthcare', date: '2026-04-20T11:00:00.000Z', desc: 'Checkup Gigi Dokter', acc: dbsAccountId, amount: 450000 },
      { group: 'Wants', detail: 'Food & Dining', date: '2026-04-25T19:30:00.000Z', desc: 'Buka Bersama Teman', acc: gopayAccountId, amount: 320000 },
      { group: 'Wants', detail: 'Shopping', date: '2026-04-27T18:00:00.000Z', desc: 'Belanja Online HNM', acc: dbsAccountId, amount: 490000 },
      { group: 'Savings', detail: 'Investment', date: '2026-04-29T10:00:00.000Z', desc: 'Tabungan Emas Antam', acc: dbsAccountId, amount: 2000000 },

      // May 2026
      { group: 'Needs', detail: 'Food & Dining', date: '2026-05-02T12:00:00.000Z', desc: 'Belanja Makanan Lebaran', acc: dbsAccountId, amount: 1450000 },
      { group: 'Needs', detail: 'Bills & Utilities', date: '2026-05-05T09:00:00.000Z', desc: 'Tagihan PLN & PAM', acc: dbsAccountId, amount: 510000 },
      { group: 'Wants', detail: 'Shopping', date: '2026-05-10T14:30:00.000Z', desc: 'Baju Lebaran Keluarga', acc: dbsAccountId, amount: 2150000 },
      { group: 'Needs', detail: 'Transportation', date: '2026-05-14T06:00:00.000Z', desc: 'Tiket Mudik & Bensin', acc: dbsAccountId, amount: 1800000 },
      { group: 'Wants', detail: 'Food & Dining', date: '2026-05-22T18:45:00.000Z', desc: 'Kuliner Kampung Halaman', acc: gopayAccountId, amount: 580000 },
      { group: 'Needs', detail: 'Education', date: '2026-05-25T11:00:00.000Z', desc: 'Zakat & Donasi', acc: dbsAccountId, amount: 1000000 },
      { group: 'Savings', detail: 'Investment', date: '2026-05-28T16:00:00.000Z', desc: 'Tabungan Lebaran', acc: dbsAccountId, amount: 2000000 },

      // June 2026
      { group: 'Needs', detail: 'Food & Dining', date: '2026-06-03T10:30:00.000Z', desc: 'Belanja Bulanan Hypermart', acc: dbsAccountId, amount: 890000 },
      { group: 'Needs', detail: 'Bills & Utilities', date: '2026-06-05T08:15:00.000Z', desc: 'Listrik & Internet', acc: dbsAccountId, amount: 490000 },
      { group: 'Needs', detail: 'Transportation', date: '2026-06-11T17:15:00.000Z', desc: 'Bensin & Transport Kantor', acc: dbsAccountId, amount: 320000 },
      { group: 'Wants', detail: 'Entertainment', date: '2026-06-16T20:00:00.000Z', desc: 'Tiket Konser Musik', acc: dbsAccountId, amount: 850000 },
      { group: 'Needs', detail: 'Education', date: '2026-06-21T14:00:00.000Z', desc: 'Sertifikasi AWS Cloud', acc: dbsAccountId, amount: 1500000 },
      { group: 'Wants', detail: 'Food & Dining', date: '2026-06-27T13:10:00.000Z', desc: 'Pepper Lunch & Cafe', acc: gopayAccountId, amount: 245000 },
      { group: 'Wants', detail: 'Shopping', date: '2026-06-28T19:00:00.000Z', desc: 'Game Steam Summer Sale', acc: gopayAccountId, amount: 350000 },
      { group: 'Savings', detail: 'Investment', date: '2026-06-29T15:00:00.000Z', desc: 'SBN Ritel Obligasi', acc: dbsAccountId, amount: 2000000 },

      // July 2026
      { group: 'Needs', detail: 'Food & Dining', date: '2026-07-02T11:00:00.000Z', desc: 'Belanja Bulanan Super Indo', acc: dbsAccountId, amount: 920000 },
      { group: 'Needs', detail: 'Bills & Utilities', date: '2026-07-05T09:30:00.000Z', desc: 'Tagihan Listrik & WiFi', acc: dbsAccountId, amount: 530000 },
      { group: 'Needs', detail: 'Transportation', date: '2026-07-08T17:00:00.000Z', desc: 'GrabCar & Bensin', acc: gopayAccountId, amount: 280000 },
      { group: 'Wants', detail: 'Shopping', date: '2026-07-12T16:00:00.000Z', desc: 'Headphones Bluetooth', acc: dbsAccountId, amount: 799000 },
      { group: 'Needs', detail: 'Healthcare', date: '2026-07-18T10:15:00.000Z', desc: 'Vitamin & Supplemen', acc: dbsAccountId, amount: 310000 },
      { group: 'Wants', detail: 'Food & Dining', date: '2026-07-24T19:00:00.000Z', desc: 'Makan Malam Sushi Tei', acc: dbsAccountId, amount: 320000 },
      { group: 'Wants', detail: 'Entertainment', date: '2026-07-29T21:00:00.000Z', desc: 'Streaming Subscriptions', acc: gopayAccountId, amount: 154000 },
      { group: 'Savings', detail: 'Investment', date: '2026-07-30T14:00:00.000Z', desc: 'Tabungan Masa Depan', acc: dbsAccountId, amount: 2000000 },

      // August 2026 (Bulan Berjalan)
      { group: 'Needs', detail: 'Food & Dining', date: '2026-08-03T11:00:00.000Z', desc: 'Belanja Sembako Mingguan', acc: dbsAccountId, amount: 820000 },
      { group: 'Needs', detail: 'Bills & Utilities', date: '2026-08-05T09:00:00.000Z', desc: 'Tagihan Listrik PLN & Internet', acc: dbsAccountId, amount: 540000 },
      { group: 'Needs', detail: 'Transportation', date: '2026-08-08T16:30:00.000Z', desc: 'Bensin Pertamax & Tol', acc: dbsAccountId, amount: 380000 },
      { group: 'Wants', detail: 'Shopping', date: '2026-08-12T14:00:00.000Z', desc: 'Belanja Diskon Kemerdekaan', acc: dbsAccountId, amount: 750000 },
      { group: 'Wants', detail: 'Food & Dining', date: '2026-08-15T19:30:00.000Z', desc: 'Makan Bareng Resto', acc: gopayAccountId, amount: 360000 },
      { group: 'Needs', detail: 'Food & Dining', date: '2026-08-16T15:00:00.000Z', desc: 'Kopi & Camilan Sore', acc: gopayAccountId, amount: 85000 },
      { group: 'Savings', detail: 'Investment', date: '2026-08-17T10:00:00.000Z', desc: 'Reksadana Pasar Uang DBS', acc: dbsAccountId, amount: 1500000 },
    ];

    for (const tx of transactionsData) {
      await client.query(
        `INSERT INTO transactions (user_id, account_id, category_group, category_detail, transaction_date, description, source, amount)
         VALUES ($1, $2, $3, $4, $5, $6, 'manual', $7)`,
        [userId, tx.acc, tx.group, tx.detail, tx.date, tx.desc, tx.amount]
      );
    }

    // ── 5. Seed Demo Budget (August 2026 50/30/20) ───────────────────
    await client.query(
      `INSERT INTO budgets (
         user_id, income_id,
         needs_budget, wants_budget, investment_budget,
         income_amount, budget_limit, source, income_date,
         needs_amount, wants_amount, savings_amount, investment_amount,
         percentage, limit_amount
       )
       VALUES ($1, $2, 4250000, 2550000, 1700000, 8500000, 6800000, 'Gaji Bulanan Ags', '2026-08-01T09:00:00.000Z',
               4250000, 2550000, 1700000, 1700000, 50, 6800000)`,
      [userId, lastIncomeId]
    );

    // ── 6. Seed Demo Insights ───────────────────────────────────────
    await client.query(
      `INSERT INTO insights (user_id, title, description)
       VALUES
         ($1, 'Arus Kas Sehat & Seimbang (Jan - Ags 2026)', 'Pemasukan rata-rata Rp 9,4 juta/bulan dengan pengeluaran Rp 5,9 juta/bulan. Rasio tabungan dan investasi konsisten di atas 20%.'),
         ($1, 'Kategori Utama: Food & Dining', 'Kategori Kebutuhan (Makanan & Sembako) menyumbang 34% dari total pengeluaran 8 bulan terakhir.'),
         ($1, 'Performa Anggaran 50/30/20', 'Alokasi 50% Needs, 30% Wants, dan 20% Investment berhasil dipertahankan secara seimbang.')`,
      [userId]
    );

    // ── 7. Seed Demo Alerts ─────────────────────────────────────────
    await client.query(
      `INSERT INTO alerts (user_id, message, alert_type)
       VALUES
         ($1, 'Pengeluaran Agustus berjalan sebesar Rp 4.435.000 dari alokasi Rp 6.800.000 (65% terpakai).', 'reminder')`,
      [userId]
    );

    // ── 8. Seed Demo Score ──────────────────────────────────────────
    await client.query(
      `INSERT INTO scores (user_id, score)
       VALUES ($1, 92)`,
      [userId]
    );

    await client.query('COMMIT');
    console.log('✅ Realistic demo database seeded successfully (Jan - Aug 2026).');
    console.log(`   Demo account: demo@sadarfinance.com / Demo@12345`);
    console.log(`   Accounts: Bank DBS Indonesia (Rp 26.407.000), Gopay (Rp 1.450.000)`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seed;
