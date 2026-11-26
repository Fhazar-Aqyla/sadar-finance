/**
 * Database Seed Script (V 3.0 — Powered by SADAR-Finance-Dashboard Dataset)
 * Populates tables with rich, realistic Indonesian financial data for the DEMO user
 * using real merchant transactions from `backend/data/main_transactions_clean.csv`
 * shifted dynamically to the last 6 months up to the current date.
 *
 * Scope: Strictly targets only demo@sadarfinance.com without affecting other users.
 *
 * Usage: npm run db:seed
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const DATASET_PATH = path.join(__dirname, '../data/main_transactions_clean.csv');

const DETAIL_TO_LABEL = {
  food: 'Makanan & Minuman',
  groceries: 'Belanja Harian & Sembako',
  utilities: 'Tagihan & Utilitas',
  transport: 'Transportasi',
  health: 'Kesehatan & Kebugaran',
  education: 'Pendidikan & Kursus',
  entertainment: 'Hiburan & Langganan',
  shopping: 'Belanja & Gaya Hidup',
  travel: 'Perjalanan & Liburan',
  self_care: 'Perawatan Diri',
  investment: 'Tabungan & Investasi',
};

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

function loadDatasetDemoSlice() {
  if (!fs.existsSync(DATASET_PATH)) return [];
  const lines = fs.readFileSync(DATASET_PATH, 'utf8').trim().split(/\r?\n/);
  const parsed = [];

  for (let i = 1; i < lines.length; i++) {
    const c = lines[i].split(',');
    if (c.length < 9) continue;
    const amount = Math.round(Number(c[4] || 0));
    if (!Number.isFinite(amount) || amount <= 0) continue;
    const rawPrimary = String(c[6] || '').trim();
    const detailKey = String(c[5] || '').trim().toLowerCase();
    const group =
      rawPrimary.toLowerCase() === 'investment' || detailKey === 'investment'
        ? 'Savings'
        : rawPrimary.toLowerCase() === 'needs'
          ? 'Needs'
          : 'Wants';
    parsed.push({
      user: c[1],
      rawDate: c[2],
      merchant: c[3].trim(),
      amount,
      detailKey,
      detail: DETAIL_TO_LABEL[detailKey] || c[5].trim(),
      group,
      method: c[7].trim(),
      media: c[8].trim(),
    });
  }

  // Pick a balanced, rich 6-month slice (~150 real transactions across all 11 categories)
  const now = new Date();
  const selected = [];
  const byCat = {};
  for (const row of parsed) {
    if (!byCat[row.detailKey]) byCat[row.detailKey] = [];
    if (byCat[row.detailKey].length < 24) {
      byCat[row.detailKey].push(row);
    }
  }

  const perMonthTargets = [
    { detailKey: 'groceries', count: 3 },
    { detailKey: 'food', count: 5 },
    { detailKey: 'utilities', count: 2 },
    { detailKey: 'transport', count: 4 },
    { detailKey: 'health', count: 1 },
    { detailKey: 'education', count: 1 },
    { detailKey: 'entertainment', count: 2 },
    { detailKey: 'shopping', count: 2 },
    { detailKey: 'self_care', count: 1 },
    { detailKey: 'travel', count: 1 },
    { detailKey: 'investment', count: 2 },
  ];

  const cursors = {};
  for (let mOffset = 5; mOffset >= 0; mOffset--) {
    const baseDate = new Date(now.getFullYear(), now.getMonth() - mOffset, 1);
    const maxDay =
      mOffset === 0
        ? Math.max(1, now.getDate())
        : new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();

    let daySlot = 1;
    for (const target of perMonthTargets) {
      const poolRows = byCat[target.detailKey] || [];
      if (poolRows.length === 0) continue;
      for (let k = 0; k < target.count; k++) {
        const idx = (cursors[target.detailKey] || 0) % poolRows.length;
        cursors[target.detailKey] = idx + 1;
        const src = poolRows[idx];
        const day = Math.min(maxDay, ((daySlot * 3 + k * 5) % maxDay) + 1);
        daySlot++;
        const txDate = new Date(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          day,
          9 + ((daySlot * 2) % 12),
          (daySlot * 11) % 60,
          0
        );
        selected.push({
          ...src,
          dateIso: txDate.toISOString(),
          monthOffset: mOffset,
        });
      }
    }
  }

  return selected.sort((a, b) => new Date(a.dateIso) - new Date(b.dateIso));
}

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

    // Clear old data ONLY for demo user
    await client.query('DELETE FROM alerts WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM insights WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM scores WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM budgets WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM transactions WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM incomes WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM accounts WHERE user_id = $1', [userId]);

    // ── 2. Seed Demo Accounts (Matching Dataset Payment Medias) ────
    const accountResult = await client.query(
      `INSERT INTO accounts (user_id, account_name, account_number, balance)
       VALUES
         ($1, 'Bank BCA', '5410-8821-09', 18500000),
         ($1, 'Bank DBS Indonesia', '1234-5678-90', 14250000),
         ($1, 'GoPay', '0812-3456-78', 2450000),
         ($1, 'DANA', '0812-3456-78', 1350000)
       RETURNING account_id, account_name`,
      [userId]
    );
    const bcaId = accountResult.rows.find((r) => r.account_name.includes('BCA')).account_id;
    const dbsId = accountResult.rows.find((r) => r.account_name.includes('DBS')).account_id;
    const gopayId = accountResult.rows.find((r) => r.account_name.includes('GoPay')).account_id;
    const danaId = accountResult.rows.find((r) => r.account_name.includes('DANA')).account_id;

    const mapMediaToAccount = (media) => {
      const m = String(media || '').toLowerCase();
      if (m.includes('gopay') || m.includes('ovo') || m.includes('linkaja')) return gopayId;
      if (m.includes('dana') || m.includes('shopee')) return danaId;
      if (m.includes('bca') || m.includes('mandiri') || m.includes('bni') || m.includes('bri')) return bcaId;
      return dbsId;
    };

    // ── 3. Seed Realistic Monthly Incomes (Last 6 Months) ──────────
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    let lastIncomeId = null;

    for (let mOffset = 5; mOffset >= 0; mOffset--) {
      const d = new Date(now.getFullYear(), now.getMonth() - mOffset, 1, 9, 0, 0);
      const mLabel = monthNames[d.getMonth()];
      const monthlyIncomes = [
        { acc: bcaId, amount: 9500000, date: new Date(d.getFullYear(), d.getMonth(), 1, 9, 0).toISOString(), source: `Gaji Bulanan ${mLabel}` },
        { acc: dbsId, amount: 2200000 + (mOffset % 3) * 450000, date: new Date(d.getFullYear(), d.getMonth(), Math.min(15, mOffset === 0 ? Math.max(1, now.getDate()) : 15), 14, 0).toISOString(), source: `Project Freelance ${mLabel}` },
        { acc: gopayId, amount: 750000, date: new Date(d.getFullYear(), d.getMonth(), Math.min(10, mOffset === 0 ? Math.max(1, now.getDate()) : 10), 11, 0).toISOString(), source: `Topup GoPay ${mLabel}` },
      ];
      for (const inc of monthlyIncomes) {
        const res = await client.query(
          `INSERT INTO incomes (user_id, account_id, amount, income_date, source)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING income_id`,
          [userId, inc.acc, inc.amount, inc.date, inc.source]
        );
        lastIncomeId = res.rows[0].income_id;
      }
    }

    // ── 4. Seed Real Merchant Transactions from CSV Dataset ────────
    const datasetRows = loadDatasetDemoSlice();
    let currentMonthExpense = 0;
    for (const tx of datasetRows) {
      if (tx.monthOffset === 0) currentMonthExpense += tx.amount;
      await client.query(
        `INSERT INTO transactions (user_id, account_id, category_group, category_detail, transaction_date, description, source, amount)
         VALUES ($1, $2, $3, $4, $5, $6, 'manual', $7)`,
        [
          userId,
          mapMediaToAccount(tx.media),
          tx.group,
          tx.detail,
          tx.dateIso,
          `${tx.merchant} (${tx.method})`,
          tx.amount,
        ]
      );
    }

    // ── 5. Seed Active 50/30/20 Budget ─────────────────────────────
    const budgetIncome = 12450000;
    const needsBudget = Math.round(budgetIncome * 0.5);
    const wantsBudget = Math.round(budgetIncome * 0.3);
    const savingsBudget = Math.round(budgetIncome * 0.2);
    const totalLimit = needsBudget + wantsBudget;

    await client.query(
      `INSERT INTO budgets (
         user_id, income_id,
         needs_budget, wants_budget, investment_budget,
         income_amount, budget_limit, source, income_date,
         needs_amount, wants_amount, savings_amount, investment_amount,
         percentage, limit_amount
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Gaji & Freelance Bulanan', $8,
               $3, $4, $5, $5, 50, $7)`,
      [
        userId,
        lastIncomeId,
        needsBudget,
        wantsBudget,
        savingsBudget,
        budgetIncome,
        totalLimit,
        new Date(now.getFullYear(), now.getMonth(), 1, 9, 0).toISOString(),
      ]
    );

    // ── 6. Seed Dataset-Backed Demo Insights & Score ───────────────
    await client.query(
      `INSERT INTO insights (user_id, title, description)
       VALUES
         ($1, 'Arus Kas 6 Bulan Terkendali (Dataset SADAR)', 'Data 6 bulan terakhir berisi ${datasetRows.length} transaksi riil merchant Indonesia di 11 kategori utama dengan rasio tabungan & investasi terjaga di atas 20%.'),
         ($1, 'Klasifikasi Otomatis 187 Merchant Indonesia', 'Seluruh transaksi merchant seperti Alfamidi, First Media, Fore Coffee, Netflix, dan Pintu Crypto telah terkalibrasi otomatis pada pos 50/30/20.')`,
      [userId]
    );

    const usedPct = Math.round((currentMonthExpense / totalLimit) * 100);
    await client.query(
      `INSERT INTO alerts (user_id, message, alert_type)
       VALUES ($1, $2, 'reminder')`,
      [
        userId,
        `Pengeluaran bulan berjalan Rp ${currentMonthExpense.toLocaleString('id-ID')} dari batas anggaran Rp ${totalLimit.toLocaleString('id-ID')} (${usedPct}% terpakai).`,
      ]
    );

    await client.query(
      `INSERT INTO scores (user_id, score) VALUES ($1, 88)`,
      [userId]
    );

    await client.query('COMMIT');
    console.log(`✅ Demo database seeded with ${datasetRows.length} real dataset transactions (6 months).`);
    console.log('   Demo account: demo@sadarfinance.com / Demo@12345');
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
