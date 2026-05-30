/**
 * Database Migration Script
 * Creates all tables for SADAR Finance matching the official ERD.
 *
 * Tables: users, accounts, transactions, incomes, budgets, insights, alerts, scores, ocr_scans
 *
 * Usage: npm run db:migrate
 */

const { pool } = require('../config/database');

const migrate = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── Extensions ──────────────────────────────────────────
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // ── ENUM Types ──────────────────────────────────────────
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE alert_type AS ENUM ('overspending', 'budget_exceeded', 'anomaly', 'reminder', 'info');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE ocr_status AS ENUM ('pending', 'processing', 'completed', 'failed');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1. Users
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        users_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        first_name       VARCHAR(100) NOT NULL,
        last_name        VARCHAR(100) NOT NULL,
        gender           VARCHAR(20),
        email            VARCHAR(255) UNIQUE NOT NULL,
        password_hash    VARCHAR(255) NOT NULL,
        phone_number     VARCHAR(20),
        date_of_birth    DATE,
        address          TEXT,
        profile_picture  TEXT,
        occupation       VARCHAR(100),
        status           user_status DEFAULT 'active',
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        updated_at       TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 2. Account
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        account_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id          UUID NOT NULL REFERENCES users(users_id) ON DELETE CASCADE,
        account_name     VARCHAR(100) NOT NULL,
        account_number   VARCHAR(50),
        balance          DECIMAL(15, 2) DEFAULT 0,
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        updated_at       TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 3. Transaction (expenses)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        transaction_id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id          UUID NOT NULL REFERENCES users(users_id) ON DELETE CASCADE,
        account_id       UUID REFERENCES accounts(account_id) ON DELETE SET NULL,
        category_group   VARCHAR(100),
        category_detail  VARCHAR(100),
        transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        description      TEXT,
        source           VARCHAR(100),
        amount           DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      ALTER TABLE transactions
        ADD COLUMN IF NOT EXISTS category_detail VARCHAR(100);
    `);

    await client.query(`
      UPDATE transactions
      SET category_detail = category_group
      WHERE category_detail IS NULL
        AND category_group IS NOT NULL
        AND category_group NOT IN ('Needs', 'Wants', 'Savings', 'Other');
    `);

    await client.query(`
      UPDATE transactions
      SET category_group = CASE
        WHEN category_group ~* '(tabungan|saving|savings|invest|dana darurat)' THEN 'Savings'
        WHEN category_group ~* '(makan|food|beverage|groceries|transport|tagihan|utilit|kesehatan|health|pendidikan|education|bills)' THEN 'Needs'
        WHEN category_group IS NULL OR category_group = '' THEN 'Other'
        WHEN category_group IN ('Needs', 'Wants', 'Savings', 'Other') THEN category_group
        ELSE 'Wants'
      END;
    `);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 4. Income
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await client.query(`
      CREATE TABLE IF NOT EXISTS incomes (
        income_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id          UUID NOT NULL REFERENCES users(users_id) ON DELETE CASCADE,
        account_id       UUID REFERENCES accounts(account_id) ON DELETE SET NULL,
        amount           DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
        income_date      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        source           VARCHAR(100),
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 5. Budget
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await client.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        budget_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id          UUID NOT NULL REFERENCES users(users_id) ON DELETE CASCADE,
        income_id        UUID,
        needs_budget     DECIMAL(15, 2) DEFAULT 0,
        wants_budget     DECIMAL(15, 2) DEFAULT 0,
        investment_budget DECIMAL(15, 2) DEFAULT 0,
        income_amount    DECIMAL(15, 2) DEFAULT 0,
        budget_limit     DECIMAL(15, 2) DEFAULT 0,
        source           VARCHAR(100),
        income_date      TIMESTAMPTZ,
        needs_amount     DECIMAL(15, 2) DEFAULT 0,
        wants_amount     DECIMAL(15, 2) DEFAULT 0,
        savings_amount   DECIMAL(15, 2) DEFAULT 0,
        investment_amount DECIMAL(15, 2) DEFAULT 0,
        percentage       DECIMAL(5, 2),
        limit_amount     DECIMAL(15, 2) DEFAULT 0,
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Upgrade existing budget tables to the latest ERD while keeping legacy
    // column names used by the current frontend.
    await client.query(`
      ALTER TABLE budgets
        ADD COLUMN IF NOT EXISTS income_id UUID,
        ADD COLUMN IF NOT EXISTS needs_budget DECIMAL(15, 2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS wants_budget DECIMAL(15, 2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS investment_budget DECIMAL(15, 2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS income_amount DECIMAL(15, 2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS budget_limit DECIMAL(15, 2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS source VARCHAR(100),
        ADD COLUMN IF NOT EXISTS income_date TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS needs_amount DECIMAL(15, 2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS wants_amount DECIMAL(15, 2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS savings_amount DECIMAL(15, 2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS investment_amount DECIMAL(15, 2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS percentage DECIMAL(5, 2),
        ADD COLUMN IF NOT EXISTS limit_amount DECIMAL(15, 2) DEFAULT 0;
    `);

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_budgets_income_id'
        ) THEN
          ALTER TABLE budgets
            ADD CONSTRAINT fk_budgets_income_id
            FOREIGN KEY (income_id) REFERENCES incomes(income_id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    await client.query(`
      UPDATE budgets
      SET
        needs_budget = COALESCE(NULLIF(needs_budget, 0), needs_amount, 0),
        wants_budget = COALESCE(NULLIF(wants_budget, 0), wants_amount, 0),
        investment_amount = COALESCE(NULLIF(investment_amount, 0), NULLIF(savings_amount, 0), NULLIF(investment_budget, 0), 0),
        investment_budget = COALESCE(NULLIF(investment_budget, 0), NULLIF(investment_amount, 0), NULLIF(savings_amount, 0), 0);
    `);

    await client.query(`
      UPDATE budgets
      SET
        needs_amount = COALESCE(NULLIF(needs_amount, 0), needs_budget, 0),
        wants_amount = COALESCE(NULLIF(wants_amount, 0), wants_budget, 0),
        savings_amount = COALESCE(NULLIF(savings_amount, 0), NULLIF(investment_budget, 0), NULLIF(investment_amount, 0), 0),
        limit_amount = COALESCE(NULLIF(limit_amount, 0), NULLIF(budget_limit, 0), needs_budget + wants_budget, 0),
        budget_limit = COALESCE(NULLIF(budget_limit, 0), needs_budget + wants_budget, NULLIF(limit_amount, 0), 0);
    `);

    await client.query(`
      UPDATE budgets b
      SET
        income_amount = COALESCE(NULLIF(b.income_amount, 0), i.amount, 0),
        source = COALESCE(b.source, i.source),
        income_date = COALESCE(b.income_date, i.income_date)
      FROM incomes i
      WHERE b.income_id = i.income_id;
    `);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 6. Insight
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await client.query(`
      CREATE TABLE IF NOT EXISTS insights (
        insight_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id          UUID NOT NULL REFERENCES users(users_id) ON DELETE CASCADE,
        title            VARCHAR(255) NOT NULL,
        description      TEXT,
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 7. Alert
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await client.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        alert_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id          UUID NOT NULL REFERENCES users(users_id) ON DELETE CASCADE,
        message          TEXT NOT NULL,
        alert_type       alert_type DEFAULT 'info',
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 8. Score
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await client.query(`
      CREATE TABLE IF NOT EXISTS scores (
        score_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id          UUID NOT NULL REFERENCES users(users_id) ON DELETE CASCADE,
        score            INTEGER CHECK (score BETWEEN 0 AND 100),
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 9. OCR Scans (supplementary — for receipt scanning feature)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await client.query(`
      CREATE TABLE IF NOT EXISTS ocr_scans (
        ocr_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id          UUID NOT NULL REFERENCES users(users_id) ON DELETE CASCADE,
        image_url        TEXT NOT NULL,
        image_data       BYTEA,
        original_name    VARCHAR(255),
        mime_type        VARCHAR(50),
        file_size        INTEGER,
        status           ocr_status DEFAULT 'pending',
        raw_text         TEXT,
        parsed_data      JSONB DEFAULT '{}',
        confidence       DECIMAL(5, 4),
        transaction_id   UUID REFERENCES transactions(transaction_id) ON DELETE SET NULL,
        error_message    TEXT,
        processed_at     TIMESTAMPTZ,
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ── Indexes ─────────────────────────────────────────────
    await client.query(`
      ALTER TABLE ocr_scans
      ADD COLUMN IF NOT EXISTS image_data BYTEA;
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_group);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_transactions_category_detail ON transactions(category_detail);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON incomes(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(income_date DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_budgets_income_id ON budgets(income_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_insights_user_id ON insights(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ocr_scans_user_id ON ocr_scans(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ocr_scans_status ON ocr_scans(status);`);

    await client.query('COMMIT');
    console.log('✅ Database migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

migrate().catch(() => process.exit(1));
