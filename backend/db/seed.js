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

    // ── 0. Clear Existing Demo Data (Truncate/Delete previous seed) ─────────
    const checkUser = await client.query('SELECT users_id FROM users WHERE email = $1', ['demo@sadarfinance.com']);
    if (checkUser.rows.length > 0) {
      const oldUserId = checkUser.rows[0].users_id;
      await client.query('DELETE FROM scores WHERE user_id = $1', [oldUserId]);
      await client.query('DELETE FROM alerts WHERE user_id = $1', [oldUserId]);
      await client.query('DELETE FROM insights WHERE user_id = $1', [oldUserId]);
      await client.query('DELETE FROM budgets WHERE user_id = $1', [oldUserId]);
      await client.query('DELETE FROM incomes WHERE user_id = $1', [oldUserId]);
      await client.query('DELETE FROM transactions WHERE user_id = $1', [oldUserId]);
      await client.query('DELETE FROM accounts WHERE user_id = $1', [oldUserId]);
      await client.query('DELETE FROM users WHERE users_id = $1', [oldUserId]);
      console.log('🧹 Old demo data cleared successfully.');
    }

    // ── Dynamic Date Helpers ────────────────────────────────────────────────
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-indexed

    // Helper to get specific date in current month
    const dateInCurrentMonth = (day) => {
      // Prevent returning future dates for testing
      const targetDay = Math.min(day, currentDate.getDate());
      return new Date(currentYear, currentMonth, targetDay);
    };

    // Helper to get specific date in previous month
    const dateInPreviousMonth = (day) => {
      const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
      return new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), day);
    };

    // ── 1. Seed Demo User ───────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash('Demo@12345', 12);
    const userResult = await client.query(
      `INSERT INTO users (first_name, last_name, gender, email, password_hash, phone_number, date_of_birth, address, profile_picture, occupation, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
       RETURNING users_id`,
      [
        'Sadar',
        'Finance',
        'male',
        'demo@sadarfinance.com',
        hashedPassword,
        '+628123456789',
        '2000-01-15',
        'Jakarta, Indonesia',
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&h=256&q=80',
        'Financial Assistant'
      ]
    );
    const userId = userResult.rows[0].users_id;

    // ── 2. Seed Demo Accounts ───────────────────────────────────────────────
    const accountResult = await client.query(
      `INSERT INTO accounts (user_id, account_name, account_number, balance)
       VALUES
         ($1, 'BCA', '1234567890', 12000000),
         ($1, 'GoPay', '0812345678', 650000),
         ($1, 'Mandiri', '9876543210', 8000000)
       RETURNING account_id, account_name`,
      [userId]
    );
    
    // Map account ids
    const bcaAccId = accountResult.rows.find(acc => acc.account_name === 'BCA').account_id;
    const gopayAccId = accountResult.rows.find(acc => acc.account_name === 'GoPay').account_id;
    const mandiriAccId = accountResult.rows.find(acc => acc.account_name === 'Mandiri').account_id;

    // ── 3. Seed Demo Incomes (Coherent cash flow) ───────────────────────────
    // Previous Month Incomes
    const incPrev1 = await client.query(
      `INSERT INTO incomes (user_id, account_id, amount, income_date, source)
       VALUES ($1, $2, 10000000, $3, 'Gaji Bulanan') RETURNING income_id, amount, income_date, source`,
      [userId, bcaAccId, dateInPreviousMonth(1)]
    );
    const incPrev2 = await client.query(
      `INSERT INTO incomes (user_id, account_id, amount, income_date, source)
       VALUES ($1, $2, 2500000, $3, 'Freelance Project Web') RETURNING income_id, amount, income_date, source`,
      [userId, bcaAccId, dateInPreviousMonth(15)]
    );

    // Current Month Incomes (recurrent)
    const incCurr1 = await client.query(
      `INSERT INTO incomes (user_id, account_id, amount, income_date, source)
       VALUES ($1, $2, 10000000, $3, 'Gaji Bulanan') RETURNING income_id, amount, income_date, source`,
      [userId, bcaAccId, dateInCurrentMonth(1)]
    );
    const incCurr2 = await client.query(
      `INSERT INTO incomes (user_id, account_id, amount, income_date, source)
       VALUES ($1, $2, 1800000, $3, 'Freelance Project Design') RETURNING income_id, amount, income_date, source`,
      [userId, bcaAccId, dateInCurrentMonth(15)]
    );

    // ── 4. Seed Demo Transactions (Coherent, chronological expenses) ────────
    // Previous Month Expenses
    const prevExpenses = [
      [bcaAccId, 'Needs', 'Rent', dateInPreviousMonth(2), 'Bayar Kos Bulanan', 1500000],
      [bcaAccId, 'Needs', 'Bills & Utilities', dateInPreviousMonth(3), 'Bayar Listrik & Internet', 450000],
      [bcaAccId, 'Needs', 'Food & Dining', dateInPreviousMonth(5), 'Belanja Bulanan Superindo', 600000],
      [gopayAccId, 'Wants', 'Entertainment', dateInPreviousMonth(8), 'Langganan Netflix & Spotify', 99000],
      [bcaAccId, 'Needs', 'Transportation', dateInPreviousMonth(12), 'Bensin Pertamax', 150000],
      [gopayAccId, 'Wants', 'Shopping', dateInPreviousMonth(18), 'Beli Baju Uniqlo', 399000],
      [gopayAccId, 'Needs', 'Healthcare', dateInPreviousMonth(22), 'Beli Vitamin & Obat Apotek', 85000],
      [gopayAccId, 'Wants', 'Food & Dining', dateInPreviousMonth(25), 'Makan Malam Solaria', 120000],
      [bcaAccId, 'Needs', 'Transportation', dateInPreviousMonth(28), 'Service Motor Berkala', 250000]
    ];

    // Current Month Expenses (Up to today)
    const currExpenses = [
      [bcaAccId, 'Needs', 'Rent', dateInCurrentMonth(2), 'Bayar Kos Bulanan', 1500000],
      [bcaAccId, 'Needs', 'Bills & Utilities', dateInCurrentMonth(3), 'Bayar Listrik & Internet', 480000],
      [bcaAccId, 'Needs', 'Food & Dining', dateInCurrentMonth(5), 'Belanja Bulanan Superindo', 550000],
      [gopayAccId, 'Wants', 'Entertainment', dateInCurrentMonth(8), 'Langganan Netflix & Spotify', 99000],
      [bcaAccId, 'Wants', 'Shopping', dateInCurrentMonth(10), 'Beli Sepatu Olahraga', 599000],
      [bcaAccId, 'Needs', 'Transportation', dateInCurrentMonth(12), 'Bensin Pertamax', 150000],
      [gopayAccId, 'Wants', 'Food & Dining', dateInCurrentMonth(18), 'Kopi Kenangan & Roti', 65000],
      [gopayAccId, 'Needs', 'Healthcare', dateInCurrentMonth(22), 'Beli Obat Flu & Demam', 45000],
      [bcaAccId, 'Wants', 'Food & Dining', dateInCurrentMonth(25), 'Makan Malam Senopati', 350000],
      [bcaAccId, 'Needs', 'Transportation', dateInCurrentMonth(28), 'Bensin Pertamax', 150000],
      [gopayAccId, 'Needs', 'Food & Dining', dateInCurrentMonth(30), 'Makan Siang Nasi Padang', 35000]
    ];

    const allExpenses = [...prevExpenses, ...currExpenses];
    for (const exp of allExpenses) {
      await client.query(
        `INSERT INTO transactions (user_id, account_id, category_group, category_detail, transaction_date, description, source, amount)
         VALUES ($1, $2, $3, $4, $5, $6, 'manual', $7)`,
        [userId, exp[0], exp[1], exp[2], exp[3], exp[4], exp[5]]
      );
    }

    // ── 5. Seed Demo Budgets (Needs 50%, Wants 30%, Savings/Investment 20%) ─
    // Budget for previous month
    await client.query(
      `INSERT INTO budgets (
         user_id, income_id, needs_budget, wants_budget, investment_budget,
         income_amount, budget_limit, source, income_date,
         needs_amount, wants_amount, savings_amount, investment_amount,
         percentage, limit_amount
       )
       VALUES ($1, $2, 6250000, 3750000, 2500000, $3, 10000000, $4, $5,
               6250000, 3750000, 2500000, 2500000, 50, 10000000)`,
      [userId, incPrev1.rows[0].income_id, incPrev1.rows[0].amount, incPrev1.rows[0].source, incPrev1.rows[0].income_date]
    );

    // Budget for current month
    await client.query(
      `INSERT INTO budgets (
         user_id, income_id, needs_budget, wants_budget, investment_budget,
         income_amount, budget_limit, source, income_date,
         needs_amount, wants_amount, savings_amount, investment_amount,
         percentage, limit_amount
       )
       VALUES ($1, $2, 5900000, 3540000, 2360000, $3, 11800000, $4, $5,
               5900000, 3540000, 2360000, 2360000, 50, 11800000)`,
      [userId, incCurr1.rows[0].income_id, incCurr1.rows[0].amount + (incCurr2.rows[0]?.amount || 0), incCurr1.rows[0].source, incCurr1.rows[0].income_date]
    );

    // ── 6. Seed Demo Insights ───────────────────────────────────────────────
    await client.query(
      `INSERT INTO insights (user_id, title, description)
       VALUES
         ($1, 'Kondisi Cashflow Stabil', 'Arus kas bulanan kamu seimbang dan terkendali dengan baik bulan ini.'),
         ($1, 'Pengeluaran Kategori: Sewa & Makanan', 'Sewa kos dan belanja makanan mengambil porsi terbesar kebutuhan primer kamu.'),
         ($1, 'Tingkat Tabungan Sehat', 'Kamu berhasil mengalokasikan rata-rata 20% penghasilan ke tabungan darurat.')`,
      [userId]
    );

    // ── 7. Seed Demo Alerts ──────────────────────────────────────────────────
    await client.query(
      `INSERT INTO alerts (user_id, message, alert_type)
       VALUES
         ($1, 'Pengeluaran Makan & Minum di luar (Senopati) sedikit meningkat bulan ini.', 'overspending'),
         ($1, 'Alokasi kebutuhan primer (Needs) berada di batas sehat (52% dari limit).', 'budget_exceeded')`,
      [userId]
    );

    // ── 8. Seed Demo Score ───────────────────────────────────────────────────
    await client.query(
      `INSERT INTO scores (user_id, score)
       VALUES 
         ($1, 84)`, // Coherent healthy score
      [userId]
    );

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully with chronological & coherent transaction logs.');
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
