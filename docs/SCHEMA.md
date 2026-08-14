# SADAR Finance — Database Schema

> Skema database PostgreSQL sesuai migrasi resmi (`backend/db/migrate.js`). Total 9 tabel + 3 ENUM + 14 index.
> Migrasi: `cd backend && npm run db:migrate` | Seed: `npm run db:seed`.

---

## 1. Diagram Relasi

```
users
 ├── accounts      (user_id FK)
 ├── transactions  (user_id FK, account_id FK)
 ├── incomes       (user_id FK, account_id FK)
 ├── budgets       (user_id FK, income_id FK)
 ├── insights      (user_id FK)
 ├── alerts        (user_id FK)
 ├── scores        (user_id FK)
 └── ocr_scans     (user_id FK, transaction_id FK)
```

### Aturan Foreign Key
| Kolom | Referensi | On Delete |
|---|---|---|
| `accounts.user_id` | `users(users_id)` | CASCADE |
| `transactions.user_id` | `users(users_id)` | CASCADE |
| `transactions.account_id` | `accounts(account_id)` | SET NULL |
| `incomes.user_id` | `users(users_id)` | CASCADE |
| `incomes.account_id` | `accounts(account_id)` | SET NULL |
| `budgets.user_id` | `users(users_id)` | CASCADE |
| `budgets.income_id` | `incomes(income_id)` | SET NULL |
| `insights.user_id` | `users(users_id)` | CASCADE |
| `alerts.user_id` | `users(users_id)` | CASCADE |
| `scores.user_id` | `users(users_id)` | CASCADE |
| `ocr_scans.user_id` | `users(users_id)` | CASCADE |
| `ocr_scans.transaction_id` | `transactions(transaction_id)` | SET NULL |

---

## 2. ENUM Types

| Type | Nilai |
|---|---|
| `user_status` | `'active'`, `'inactive'`, `'suspended'` |
| `alert_type` | `'overspending'`, `'budget_exceeded'`, `'anomaly'`, `'reminder'`, `'info'` |
| `ocr_status` | `'pending'`, `'processing'`, `'completed'`, `'failed'` |

---

## 3. Tabel Detail

### 3.1 `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `users_id` | UUID PK | Default `uuid_generate_v4()` |
| `first_name` | VARCHAR(100) NOT NULL | |
| `last_name` | VARCHAR(100) NOT NULL | |
| `gender` | VARCHAR(20) | |
| `email` | VARCHAR(255) UNIQUE NOT NULL | |
| `password_hash` | VARCHAR(255) NOT NULL | bcrypt 12 rounds |
| `phone_number` | VARCHAR(20) | |
| `date_of_birth` | DATE | |
| `address` | TEXT | |
| `profile_picture` | TEXT | URL/path foto |
| `occupation` | VARCHAR(100) | |
| `status` | user_status | Default `'active'` |
| `created_at` | TIMESTAMPTZ | Default `NOW()` |
| `updated_at` | TIMESTAMPTZ | Default `NOW()` |

### 3.2 `accounts`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `account_id` | UUID PK | |
| `user_id` | UUID NOT NULL FK | → users |
| `account_name` | VARCHAR(100) NOT NULL | |
| `account_number` | VARCHAR(50) | |
| `balance` | DECIMAL(15,2) | Default 0 |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### 3.3 `transactions`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `transaction_id` | UUID PK | |
| `user_id` | UUID NOT NULL FK | → users |
| `account_id` | UUID FK | → accounts, SET NULL |
| `category_group` | VARCHAR(100) | `'Needs'`, `'Wants'`, `'Savings'`, `'Other'` |
| `category_detail` | VARCHAR(100) | Kategori spesifik |
| `transaction_date` | TIMESTAMPTZ NOT NULL | Default `NOW()` |
| `description` | TEXT | |
| `source` | VARCHAR(100) | `'manual'`, `'ocr'` |
| `amount` | DECIMAL(15,2) NOT NULL | CHECK `amount > 0` |
| `created_at` | TIMESTAMPTZ | |

> **Migrasi normalisasi category_group** (dari `migrate.js`):
> - mengandung `tabungan|saving|savings|invest|dana darurat` → `Savings`
> - mengandung `makan|food|beverage|groceries|transport|tagihan|utilit|kesehatan|health|pendidikan|education|bills` → `Needs`
> - NULL/kosong → `Other`
> - selain itu → `Wants`

### 3.4 `incomes`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `income_id` | UUID PK | |
| `user_id` | UUID NOT NULL FK | → users |
| `account_id` | UUID FK | → accounts, SET NULL |
| `amount` | DECIMAL(15,2) NOT NULL | CHECK `amount > 0` |
| `income_date` | TIMESTAMPTZ NOT NULL | Default `NOW()` |
| `source` | VARCHAR(100) | `'Gaji'`, `'Freelance'`, dll. |
| `created_at` | TIMESTAMPTZ | |

### 3.5 `budgets`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `budget_id` | UUID PK | |
| `user_id` | UUID NOT NULL FK | → users |
| `income_id` | UUID FK | → incomes, SET NULL |
| `needs_budget` | DECIMAL(15,2) | Alokasi Kebutuhan |
| `wants_budget` | DECIMAL(15,2) | Alokasi Keinginan |
| `investment_budget` | DECIMAL(15,2) | Alokasi Tabungan/Investasi |
| `income_amount` | DECIMAL(15,2) | |
| `budget_limit` | DECIMAL(15,2) | Limit gabungan |
| `source` | VARCHAR(100) | |
| `income_date` | TIMESTAMPTZ | |
| `needs_amount` | DECIMAL(15,2) | Alias legacy |
| `wants_amount` | DECIMAL(15,2) | Alias legacy |
| `savings_amount` | DECIMAL(15,2) | Alias legacy (Tabungan) |
| `investment_amount` | DECIMAL(15,2) | Alias legacy |
| `percentage` | DECIMAL(5,2) | |
| `limit_amount` | DECIMAL(15,2) | Alias legacy |
| `created_at` | TIMESTAMPTZ | |

> **Catatan**: kolom budget memiliki banyak alias (legacy vs ERD baru). Migrasi `migrate.js` menyinkronkan nilai antar alias (`needs_budget` ↔ `needs_amount`, `investment_amount` ↔ `savings_amount`, dll.).

### 3.6 `insights`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `insight_id` | UUID PK | |
| `user_id` | UUID NOT NULL FK | → users |
| `title` | VARCHAR(255) NOT NULL | |
| `description` | TEXT | |
| `created_at` | TIMESTAMPTZ | |

### 3.7 `alerts`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `alert_id` | UUID PK | |
| `user_id` | UUID NOT NULL FK | → users |
| `message` | TEXT NOT NULL | |
| `alert_type` | alert_type | Default `'info'` |
| `created_at` | TIMESTAMPTZ | |

### 3.8 `scores`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `score_id` | UUID PK | |
| `user_id` | UUID NOT NULL FK | → users |
| `score` | INTEGER | CHECK `score BETWEEN 0 AND 100` |
| `created_at` | TIMESTAMPTZ | |

### 3.9 `ocr_scans`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `ocr_id` | UUID PK | |
| `user_id` | UUID NOT NULL FK | → users |
| `image_url` | TEXT NOT NULL | |
| `image_data` | BYTEA | Biner gambar (persist di cloud ephemeral) |
| `original_name` | VARCHAR(255) | |
| `mime_type` | VARCHAR(50) | |
| `file_size` | INTEGER | |
| `status` | ocr_status | Default `'pending'` |
| `raw_text` | TEXT | Hasil OCR mentah |
| `parsed_data` | JSONB | Hasil parsing NLP (merchant, items, total) |
| `confidence` | DECIMAL(5,4) | |
| `transaction_id` | UUID FK | → transactions, SET NULL |
| `error_message` | TEXT | |
| `processed_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |

---

## 4. Indexes

```sql
idx_accounts_user_id            ON accounts(user_id)
idx_transactions_user_id        ON transactions(user_id)
idx_transactions_account_id     ON transactions(account_id)
idx_transactions_date           ON transactions(transaction_date DESC)
idx_transactions_category       ON transactions(category_group)
idx_transactions_category_detail ON transactions(category_detail)
idx_incomes_user_id             ON incomes(user_id)
idx_incomes_date                ON incomes(income_date DESC)
idx_budgets_user_id             ON budgets(user_id)
idx_budgets_income_id           ON budgets(income_id)
idx_insights_user_id            ON insights(user_id)
idx_alerts_user_id              ON alerts(user_id)
idx_scores_user_id              ON scores(user_id)
idx_ocr_scans_user_id           ON ocr_scans(user_id)
idx_ocr_scans_status            ON ocr_scans(status)
```

---

## 5. Extension

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- uuid_generate_v4()
```

---

## 6. Naming Convention

| Lapisan | Convention | Contoh |
|---|---|---|
| Database | `snake_case` | `category_group`, `transaction_date` |
| API Request | `camelCase` + menerima snake_case | `categoryGroup` / `category_group` |
| Frontend | `camelCase` | `budgetGroup` |