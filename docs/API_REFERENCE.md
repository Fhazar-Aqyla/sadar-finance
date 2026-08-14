# SADAR Finance — Backend API Reference

> Referensi endpoint REST API. Base URL: `http://localhost:3000/api/v1` (dev).
> Semua route (kecuali yang ditandai **Publik**) membutuhkan header `Authorization: Bearer <token>`.

---

## Ringkasan

| Prefix | Deskripsi |
|---|---|
| `/auth` | Autentikasi & profil |
| `/accounts` | Akun keuangan (Cash, Bank, E-wallet) |
| `/transactions` | Pengeluaran + agregasi |
| `/incomes` | Pemasukan + agregasi |
| `/ocr` | Upload struk & scan |
| `/analytics` | AI, budget, insight, alert, score |
| `/categories` | Daftar kategori |

Response standar:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "...", "message": "..." } }
```

---

## 1. Auth `/auth`

### PUBLIK

| Method | Endpoint | Deskripsi | Body |
|---|---|---|---|
| POST | `/auth/register` | Daftar akun | `first_name`, `last_name`, `email`, `password` |
| POST | `/auth/login` | Login | `email`, `password` |
| POST | `/auth/forgot-password` | Lupa kata sandi | `email` |

### TERPROTEKSI (Bearer token)

| Method | Endpoint | Deskripsi | Body/Notes |
|---|---|---|---|
| GET | `/auth/me` | Profil user aktif | - |
| PUT | `/auth/me` | Update profil | `first_name`, `last_name`, `gender`, `date_of_birth`, `address`, `occupation`, dll. |
| PUT | `/auth/password` | Ganti kata sandi | `current_password`, `new_password` |
| POST | `/auth/change-password` | Ganti kata sandi (alt) | sama seperti di atas |
| POST | `/auth/profile-picture` | Upload foto profil | multipart/form-data `image` |
| DELETE | `/auth/me` | Hapus akun | - |

---

## 2. Accounts `/accounts`

| Method | Endpoint | Deskripsi | Body |
|---|---|---|---|
| POST | `/accounts` | Tambah akun | `account_name`, `account_number`, `account_type`, `balance` |
| GET | `/accounts` | List akun | query: `type` |
| GET | `/accounts/:id` | Detail akun | - |
| PUT | `/accounts/:id` | Update akun | field opsional |
| DELETE | `/accounts/:id` | Hapus akun | - |

> **Validasi nomor rekening** (backend): max 50 karakter (Joi). Validasi 6–20 digit bank di-handle frontend.

---

## 3. Transactions `/transactions`

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/transactions` | Tambah transaksi pengeluaran |
| GET | `/transactions` | List transaksi (query: `from`, `to`, `category`, `page`, `limit`) |
| GET | `/transactions/:id` | Detail transaksi |
| PUT | `/transactions/:id` | Update transaksi |
| DELETE | `/transactions/:id` | Hapus transaksi |
| GET | `/transactions/summary` | Ringkasan agregasi (query: bulan/tahun) |
| GET | `/transactions/trend/monthly` | Tren bulanan |

Body create/update: `account_id`, `category_group` (`Needs`/`Wants`/`Savings`), `category_detail`, `amount`, `transaction_date`, `description`, `source`.

---

## 4. Incomes `/incomes`

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/incomes` | Tambah pemasukan |
| GET | `/incomes` | List pemasukan |
| GET | `/incomes/:id` | Detail pemasukan |
| PUT | `/incomes/:id` | Update pemasukan |
| DELETE | `/incomes/:id` | Hapus pemasukan |
| GET | `/incomes/trend/monthly` | Tren pemasukan bulanan |

Body: `account_id`, `amount`, `income_date`, `source` (misal: Gaji, Freelance).

---

## 5. OCR `/ocr`

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/ocr/upload` | Upload struk (multipart `image`) |
| GET | `/ocr` | List scan OCR |
| GET | `/ocr/:id` | Detail scan |
| POST | `/ocr/:id/confirm-transaction` | Konfirmasi scan → buat transaksi |

Alur: upload → status `pending` → diproses AI → `completed` → frontend preview → confirm → transaksi tersimpan.

---

## 6. Analytics `/analytics`

### Kategorisasi & Behavior
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/analytics/categorize` | Klasifikasi kategori transaksi (AI) |
| POST | `/analytics/behavior` | Analisis perilaku → insight |
| POST | `/analytics/behavior/predict` | Prediksi spike behavior |

### Overspending
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/analytics/overspending` | Prediksi overspending → alert |

### Financial Health Score
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/analytics/health-score` | Hitung skor kesehatan (0–100) |
| GET | `/analytics/health-score/latest` | Skor terbaru |
| GET | `/analytics/health-score/history` | Riwayat skor |

### Budget
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/analytics/budget` | Simpan/update budget |
| GET | `/analytics/budget` | Budget terbaru |

### Insight & Alert
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/analytics/insights` | List insight |
| GET | `/analytics/alerts` | List alert |

---

## 7. Categories `/categories`

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/categories` | List kategori transaksi |

---

## 8. Kredensial

| Mode | Email | Password | Skenario |
|---|---|---|---|
| Backend auth | `demo@sadarfinance.com` | `Demo@12345` | `VITE_SADAR_DATA_SCENARIO=mock-with-backend-auth` |
| Fake auth | `aqyla@example.com` | `123456` | `VITE_DEFAULTAUTH=fake` |

---

## 9. Catatan Teknis

- Rate limit khusus pada `/auth/login`, `/auth/register`, `/auth/forgot-password`.
- Upload OCR memakai middleware multer (`upload.single('image')`), max size diatur `.env` (`MAX_FILE_SIZE_MB`).
- Jika AI microservice mati, `/ocr/upload` fallback ke tesseract.js lokal.
- Swagger docs tersedia di `http://localhost:3000/api-docs`.
