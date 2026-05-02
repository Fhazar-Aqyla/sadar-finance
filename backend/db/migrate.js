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
        transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        description      TEXT,
        source           VARCHAR(100),
        amount           DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );
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
        needs_amount     DECIMAL(15, 2) DEFAULT 0,
        wants_amount     DECIMAL(15, 2) DEFAULT 0,
        savings_amount   DECIMAL(15, 2) DEFAULT 0,
        percentage       DECIMAL(5, 2),
        limit_amount     DECIMAL(15, 2) DEFAULT 0,
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );
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
    await client.query(`CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_group);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON incomes(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(income_date DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);`);
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
