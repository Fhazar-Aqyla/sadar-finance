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

    // ── 3. Seed Monthly Data (January to Current Month) ──────────────────────
    for (let m = 0; m <= currentMonth; m++) {
      // Calculate dynamic date helper for day X in month m
      const dateInMonth = (day) => {
        // Prevent returning future dates for the current month
        let targetDay = day;
        if (m === currentMonth) {
          targetDay = Math.min(day, currentDate.getDate());
        }
        return new Date(currentYear, m, targetDay);
      };

      // A. Seed Incomes (Gaji Bulanan)
      const gajiResult = await client.query(
        `INSERT INTO incomes (user_id, account_id, amount, income_date, source)
         VALUES ($1, $2, 10000000, $3, 'Gaji Bulanan') RETURNING income_id, amount, income_date, source`,
        [userId, bcaAccId, dateInMonth(1)]
      );
      const gajiIncome = gajiResult.rows[0];

      let totalMonthlyIncome = 10000000;

      // Add freelance income on the 15th (alternating amounts/sources for realism)
      const sideIncomeAmount = m % 2 === 0 ? 2500000 : 1800000;
      const sideIncomeSource = m % 2 === 0 ? 'Freelance Project Web' : 'Freelance Project Design';
      
      if (m < currentMonth || currentDate.getDate() >= 15) {
        await client.query(
          `INSERT INTO incomes (user_id, account_id, amount, income_date, source)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, bcaAccId, sideIncomeAmount, dateInMonth(15), sideIncomeSource]
        );
        totalMonthlyIncome += sideIncomeAmount;
      }

      // B. Seed Budgets for this month (Needs 50%, Wants 30%, Savings 20%)
      const needsBudget = totalMonthlyIncome * 0.5;
      const wantsBudget = totalMonthlyIncome * 0.3;
      const savingsBudget = totalMonthlyIncome * 0.2;
      
      await client.query(
        `INSERT INTO budgets (
           user_id, income_id, needs_budget, wants_budget, investment_budget,
           income_amount, budget_limit, source, income_date,
           needs_amount, wants_amount, savings_amount, investment_amount,
           percentage, limit_amount
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,
                 $3, $4, $5, $5, 50, $7)`,
        [
          userId, 
          gajiIncome.income_id, 
          needsBudget, 
          wantsBudget, 
          savingsBudget, 
          totalMonthlyIncome, 
          totalMonthlyIncome, 
          gajiIncome.source, 
          gajiIncome.income_date
        ]
      );

      // C. Seed Expenses (Transactions)
      const monthlyExpenses = [
        [bcaAccId, 'Needs', 'Rent', 2, 'Bayar Kos Bulanan', 1500000],
        [bcaAccId, 'Needs', 'Bills & Utilities', 3, 'Bayar Listrik & Internet', 400000 + (m * 15000)],
        [bcaAccId, 'Needs', 'Food & Dining', 5, 'Belanja Bulanan Superindo', 500000 + (m * 10000)],
        [gopayAccId, 'Wants', 'Entertainment', 8, 'Langganan Netflix & Spotify', 99000],
        [bcaAccId, 'Wants', 'Shopping', 10, m % 2 === 0 ? 'Beli Baju Uniqlo' : 'Beli Sepatu Olahraga', 300000 + (m * 25000)],
        [bcaAccId, 'Needs', 'Transportation', 12, 'Bensin Pertamax', 150000],
        [gopayAccId, 'Wants', 'Food & Dining', 18, 'Kopi & Roti Kenangan', 50000 + (m * 3000)],
        [gopayAccId, 'Needs', 'Healthcare', 22, 'Beli Vitamin & Obat Apotek', 40000 + (m * 2000)],
        [bcaAccId, 'Wants', 'Food & Dining', 25, m % 2 === 0 ? 'Makan Malam Solaria' : 'Makan Malam Senopati', 150000 + (m * 30000)],
        [bcaAccId, 'Needs', 'Transportation', 28, 'Bensin & Service Motor', 150000 + (m * 10000)]
      ];

      for (const exp of monthlyExpenses) {
        const expenseDay = exp[3];
        // Only insert if this day has passed in the current month
        if (m < currentMonth || currentDate.getDate() >= expenseDay) {
          await client.query(
            `INSERT INTO transactions (user_id, account_id, category_group, category_detail, transaction_date, description, source, amount)
             VALUES ($1, $2, $3, $4, $5, $6, 'manual', $7)`,
            [userId, exp[0], exp[1], exp[2], dateInMonth(expenseDay), exp[4], exp[5]]
          );
        }
      }
    }

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
