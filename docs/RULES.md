# SADAR Finance — Business Rules & Validation

> Ringkasan aturan bisnis dan validasi yang diterapkan di frontend, backend, dan AI. Referensi agar semua tim satu pemahaman.

---

## 1. Aturan Budget 50/30/20

Setiap transaksi dikelompokkan ke salah satu bucket dan dibandingkan dengan alokasi ideal berdasarkan income.

| Bucket | UI (Indonesia) | Kode Sistem (Frontend/Backend/Budget) | Kode AI (Classifier/Behavior) | Alokasi |
|---|---|---|---|---|
| Kebutuhan | Kebutuhan | `Needs` | `Needs` | 50% |
| Keinginan | Keinginan | `Wants` | `Wants` | 30% |
| Tabungan | Tabungan | `Savings` | `Investment` | 20% |

### ⚠️ Mismatch Label yang Diketahui
- Sistem budget/frontend/backend memakai label **`Savings`**.
- Model AI (classifier & behavior) memakai label **`Investment`**.
- **Frontend sudah menormalkan** lewat `toCategoryPrimary` (regex `tabungan|saving|savings|invest|dana darurat` → `Investment`).
- **Open item tim AI/DS**: sinkronkan `category_primary_map.json` & `budgetRule` di `behavior.py` agar label selaras.

---

## 2. Validasi Backend (Joi)

### 2.1 Auth
| Field | Aturan |
|---|---|
| `firstName`, `lastName` | min 2, max 100, required |
| `email` | format email, lowercase, required |
| `password` (register) | min 8, max 128, wajib mengandung huruf besar + kecil + angka + karakter khusus |
| `password` (ganti) | min 8, max 128, wajib huruf + angka |
| `phoneNumber` | pattern `^\+?[\d\s-]{10,20}$` |
| `gender` | `male` / `female` / `other` |
| `address` | max 500 |
| `occupation` | max 100 |

### 2.2 Account
| Field | Aturan |
|---|---|
| `accountName` | min 1, max 100, required |
| `accountNumber` | max 50, opsional (boleh kosong) |
| `balance` | numeric, precision 2, default 0 |

### 2.3 Transaction
| Field | Aturan |
|---|---|
| `amount` | **wajib**, positif (> 0); menerima string rupiah (`"500.000"` → 500000) atau number |
| `accountId` | UUID opsional |
| `categoryGroup` / `category_detail` | max 100 |
| `description` / `name` / `merchant` / `note` | max 500 |
| `source` | default `manual` |
| `transactionDate` | ISO date |

**Query** (`/transactions`):
- `page` min 1, `limit` 1–100 (default 20).
- `sortBy`: `transaction_date` / `amount` / `created_at`.
- `sortOrder`: `asc` / `desc`.
- `summary`: `startDate` & `endDate` wajib, `endDate >= startDate`.
- `monthly-trend`: `months` 1–24 (default 6).

### 2.4 Income
| Field | Aturan |
|---|---|
| `amount` | positif, required |
| `incomeDate` | ISO, default now |
| `source` | max 100 |

### 2.5 OCR
- `confirm-transaction`: menerima field transaksi (category, amount opsional). `source` default `ocr`.

### 2.6 Analytics
| Endpoint | Aturan |
|---|---|
| `/categorize` | `text` 1–1000 char required |
| `/behavior` | `periodStart` & `periodEnd` (end > start) |
| `/behavior/predict` | `amount` positif required; field opsional: merchant, category, paymentMethod, rolling7dSpending |
| `/overspending` | `month` wajib, `budgetLimit` opsional |
| `/health-score` | `periodMonths` 1–24 (default 3), `period` enum |
| `/budget` | minimal salah satu dari needs/wants/savings terisi; `percentage` 0–100 |

---

## 3. Validasi Frontend

### 3.1 Nomor Rekening / E-Wallet (`utils/accountValidation.js`)

| Tipe | Aturan | Pesan Error |
|---|---|---|
| **Bank** (semua bank) | **6–20 digit** (hanya angka) | "Nomor rekening bank harus terdiri dari 6-20 digit." |
| **E-wallet** | Dimulai `08` atau `628`; 10–13 digit (`08...`) atau 11–14 digit (`628...`) | "Nomor HP e-wallet harus dimulai dengan 08 atau 628." |

- Format tampilan: bank dikelompokkan per 4 digit (`1234-5678-...`).
- E-wallet: `0812-3456-7890` atau `62-812-3456-7890`.
- Saldo: tidak boleh negatif.

### 3.2 Form Lainnya
- Register/Login: pola sama dengan backend Joi.
- Nama: min 2 karakter.
- Password: min 8 + huruf besar/kecil/angka/simbol.

---

## 4. Aturan Financial Score (0–100)

Dihitung dari 5 komponen (rata-rata):

| Komponen | Formula (contoh implementasi mock) |
|---|---|
| Expense Score | `100 - max(expenseRatio - 0.7, 0) * 160` |
| Budget Score | `100 - max(budgetUsage - 0.8, 0) * 200` |
| Savings Score | `min(100, (savingsRate / 0.2) * 100)` |
| Consistency Score | konstanta (82 di mock) |
| Allocation Score | `100 - |0.5 - needsRatio|*100 - |0.3 - wantsRatio|*100 - |0.2 - savingsRatio|*100` |

### Kategori Status
| Skor | Status |
|---|---|
| 71–100 | Sehat (hijau) |
| 41–70 | Cukup Sehat (jingga) |
| 0–40 | Perlu Perhatian (merah) |

---

## 5. Aturan AI

### 5.1 Budget Rule (`behavior.py`)
```python
"budgetRule": {"Needs": 0.5, "Wants": 0.3, "Investment": 0.2}
```

### 5.2 Normalisasi Kategori (`normalize_category_primary`)
Mapping variasi label ke `Investment`:
```python
"investment" → Investment
"investasi"  → Investment
"saving"     → Investment
"savings"    → Investment
```

### 5.3 Risk Level Overspending (`overspending_forecast.py`)
- `_risk_level(probability, over_amount, budget)` → level risiko (low/medium/high).
- `material_over_amount = max(1000, budget * 0.01)`.
- Probabilitas fallback: `1 / (1 + exp(-5 * (ratio - 1)))`.

### 5.4 Dictionary Kategori Merchant
- Total ±959 rule dictionary (Needs ≈494, Wants ≈400, Investment ≈65).
- Classifier menghasilkan `category_primary` → bucket.

---

## 6. Aturan Auth & Skenario Data

| Skenario (`VITE_SADAR_DATA_SCENARIO`) | Auth | Data |
|---|---|---|
| `mock-with-backend-auth` | Backend JWT real | Mock (`mockData.js`) |
| `backend-with-backend-auth` | Backend JWT real | Database real |
| `backend-only` | Backend JWT real | Database (ketat, tanpa fallback) |

### Kredensial
| Mode | Email | Password |
|---|---|---|
| Demo backend | `demo@sadarfinance.com` | `Demo@12345` |
| Fake auth | `aqyla@example.com` | `123456` |

### Persist Login
- Token & user disimpan di **`localStorage`** (`authUser`).
- Refresh halaman → tidak logout.
- Tidak ada auto-logout khusus saat 401 (JWT expired → error biasa).

---

## 7. Aturan UI & Konten

- **Bahasa UI**: Bahasa Indonesia (semua label).
- **Hanya 5 menu utama** di sidebar: Dashboard, Catat Keuangan, Behavior Insight, Financial Score, Profile & Account.
- **Logout** ada di dropdown profil (sidenav bawah), bukan menu utama.
- Dilarang konten Velzon: sales, invoice, crypto, CRM, business admin.
- Desain: clean, modern, card-based, tidak AI-heavy.

---

## 8. Checklist Konsistensi (untuk tim)

- [ ] Kategori bucket: gunakan `Needs` / `Wants` / `Savings` di sisi sistem; `Investment` di sisi AI (sampai disinkronkan).
- [ ] Validasi rekening: bank 6–20 digit; e-wallet mengikuti aturan 08/628.
- [ ] Jangan commit `.env`.
- [ ] `eslint` di `frontend/` harus 0 error sebelum push.
- [ ] Update dokumen ini jika ada perubahan aturan.
