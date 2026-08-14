# SADAR Finance — Design Document (Arsitektur & Desain Sistem)

> Referensi arsitektur untuk seluruh tim: Data Science, AI Engineer, dan Full Stack Developer.

---

## 1. Arsitektur Sistem (Decoupled Full-Stack)

SADAR Finance terdiri dari **3 layanan mandiri** + 1 gateway:

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │ ───► │   Backend    │ ───► │   Database   │
│  React SPA   │      │   Express    │      │  PostgreSQL  │
│  (Vite 6)    │      │   (Node.js)  │      │  (9 tabel)   │
└──────────────┘      └──────┬───────┘      └──────────────┘
                             │
                             ▼
                    ┌──────────────┐
                    │  AI Service  │
                    │  Flask/Py    │
                    │ OCR+ML+GenAI │
                    └──────────────┘
```

### Komponen & Lokasi Direktori

| Layanan | Direktori | Teknologi | Port Dev |
|---|---|---|---|
| Frontend Web | `frontend/` | React 18, Vite 6, Redux Toolkit, Tailwind v4, Bootstrap 5 | 5173 |
| Frontend Mobile | `frontend-mobile/` | (mobile UI choice) | - |
| Backend API | `backend/` | Node.js, Express.js, PostgreSQL (pg) | 3000 |
| AI Microservice | `ai/` | Python, Flask, PyTesseract, TensorFlow | 5000 |
| Gateway | `gateway/` | nginx | 80/443 |
| Dataset & Notebook | `data/`, `notebooks/` | - | - |

---

## 2. Backend (Express.js)

### Struktur Berlapis (Layered)
```
request → routes/ → middlewares/ → controllers/ → services/ → repositories/ → DB
```

- **routes/** — Deklarasi endpoint, ter-mount di `/api/v1`.
- **middlewares/** — `authenticate` (JWT), `validate` (Joi), `upload` (multer), `errorHandler`.
- **controllers/** — Logika penangan request & response.
- **repositories/** — Query SQL langsung ke PostgreSQL.
- **services/** — Logika bisnis & pemanggil AI microservice.
- **validators/** — Skema Joi per request body/query.
- **config/** — DB, CORS, JWT, Swagger OpenAPI spec.

### Struktur Route (`backend/routes/index.js`)
Semua route terproteksi JWT (`authenticate`) kecuali auth publik.

| Prefix | Modul | Deskripsi |
|---|---|---|
| `/auth` | auth | register, login, forgot-password, me, password, profile-picture, delete |
| `/accounts` | account | CRUD akun keuangan |
| `/transactions` | transaction | CRUD + summary + monthly trend |
| `/incomes` | income | CRUD + monthly trend |
| `/ocr` | ocr | upload struk, list scans, confirm transaction |
| `/analytics` | analytics | categorize, behavior, overspending, health-score, budget, insights, alerts |
| `/categories` | category | list kategori |

### Keamanan
- JWT (`JWT_SECRET`, expiry default 7d).
- bcrypt salt rounds 12.
- Helmet, CORS whitelist, express-rate-limit.
- Rate limit khusus untuk endpoint auth.
- Validasi Joi pada semua input.

---

## 3. Frontend (React SPA)

### Struktur `frontend/src`
```
Components/    → Komponen UI global + api client (api.js)
Layouts/       → Sidebar, Topbar, Footer, Layout
pages/         → SadarDashboard, SadarTransactionInput, SadarBehaviorInsight,
                 SadarFinancialScore, SadarProfileAccount, SadarProfileEdit,
                 SadarFinancialHistory, Authentication, Landing, Pages
Routes/        → allRoutes.jsx, index.jsx, AuthProtected, GuestProtected
slices/        → Redux slices (auth, layout, dll)
constants/     → bankData.js, layout config
utils/         → accountValidation, dsll
```

### Arsitektur State
- **Redux Toolkit** untuk state global (auth user, layout).
- **localStorage** untuk persist login (`authUser`) — refresh tidak logout.
- Form pakai **Formik + Yup**.

### Autentikasi & Route Guard
- `AuthProtected` — melindungi halaman setelah login.
- `GuestProtected` — mencegah user yang sudah login mengakses halaman login/register/landing (redirect ke `/dashboard`).
- Skenario data diatur `VITE_SADAR_DATA_SCENARIO`:
  - `mock-with-backend-auth` (demo): auth real backend, data mock.
  - `backend-with-backend-auth`: auth + data real.
  - `backend-only`: mode produksi ketat.

### Bank & Validasi Nomor Rekening
- Daftar bank di `constants/bankData.js` (DBS di posisi teratas, `featured`).
- Validasi generic di `utils/accountValidation.js`:
  - Bank: **6–20 digit** (semua bank sama).
  - E-wallet: 10–13 / 11–14 digit (nomor HP).
- Format input dikelompokkan per 4 digit.

---

## 4. AI Microservice (Flask + Python)

### Direktori `ai/`
```
app.py                    → Entrypoint Flask server
behavior_model.py         → Arsitektur DCN
train_behavior.py         → Training behavior model
inference/                → Logika inferensi
  ocr.py                  → OCR & NLP parser
  merchant_classifier.py  → Klasifikasi merchant
  behavior.py             → Behavior spike prediction + normalize_category_primary
  overspending_forecast.py→ Overspending forecast
models/                   → Model .keras & metadata JSON
preprocessing/            → Ekstraksi NLP struk
docs/                     → Dokumentasi AI
```

### Modul AI
1. **Receipt OCR & NLP** — Pytesseract (`--psm 6`, `ind+eng`), preprocessing Pillow (grayscale, kontras 1.8x, sharpen, width 600px / max height 1800px), parser regex merchant/tanggal/item/total.
2. **Behavior Spike Prediction (DCN)** — Deep & Cross Network untuk mendeteksi pola belanja anomali; fallback rule-based.
3. **Overspending Forecast (Multitask MLP)** — Input vektor 61 → probabilitas overspending + estimasi nominal; fallback sigmoid.

### GenAI (Opsional)
- `GEMINI_API_KEY` → rekomendasi narasi 1–2 kalimat (Bahasa Indonesia).
- Tanpa key → fallback rule-based.

### Kategori AI (Penting)
- Classifier menghasilkan bucket `Needs` / `Wants` / `Investment`.
- `normalize_category_primary` memetakan variasi label (termasuk `savings`) → `Investment`.
- **Mismatch yang diketahui:** frontend/backend/budget pakai `Savings`, AI pakai `Investment`. Sudah dinormalisasi di sisi frontend; sinkronisasi penuh di sisi AI masih open item tim AI/DS.

---

## 5. Database (PostgreSQL)

### 9 Tabel
```
users → accounts → transactions
users → incomes → budgets
users → insights, alerts, scores, ocr_scans
```

| Tabel | PK | Relasi Utama |
|---|---|---|
| users | users_id | - |
| accounts | account_id | FK user_id |
| transactions | transaction_id | FK user_id, account_id |
| incomes | income_id | FK user_id, account_id |
| budgets | budget_id | FK user_id, income_id |
| insights | insight_id | FK user_id |
| alerts | alert_id | FK user_id |
| scores | score_id | FK user_id |
| ocr_scans | ocr_id | FK user_id, transaction_id |

### Catatan Penting
- `ocr_scans.image_data` (BYTEA) menyimpan gambar struk biner agar persist di cloud serverless (Railway ephemeral).
- Skema lengkap kolom ada di `README.md` root.

---

## 6. Alur Data Utama

### Upload Struk (OCR)
```
User upload gambar → backend /ocr/upload → simpan ocr_scans (pending)
→ panggil AI /ocr (Flask) → ekstrak teks & parse → update status completed
→ frontend tampilkan preview → user confirm → simpan transaksi
```
- Jika AI service mati → fallback lokal `tesseract.js` di backend.

### Behavior Insight
```
Frontend minta /analytics/behavior → backend ambil transactions+incomes
→ panggil AI behavior → simpan insight → tampilkan
```

### Predictive Spending Alert (Background)
```
Scheduler backend → ambil transactions+budget → AI overspending
→ jika terdeteksi → simpan alert → tampil dashboard & notifikasi
```

---

## 7. Keputusan Desain (ADRs Ringkas)

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Persist login pakai `localStorage` | Refresh tidak logout; tanpa auto-handling 401 khusus |
| 2 | Validasi rekening generic 6–20 digit | Bank bervariasi; hindari format kaku per bank |
| 3 | Profil & logout di sidenav bawah | Kemudahan akses, rapi |
| 4 | DBS `featured` paling atas | Prioritas bank rekomendasi |
| 5 | `sadar-finance.md` & `docs/` | Dokumentasi rancangan & teknis terpisah dari README |

---

## 8. Konvensi Tim

- **Bahasa kode/komentar**: Inggris (di kode) — UI tetap Indonesia.
- **Commit message**: `feat:` / `fix:` / `refactor:` / `docs:` + deskripsi singkat.
- **Lint**: `eslint` bersih di `frontend/` (0 error) sebelum push.
- **Branch**: `main` untuk produksi; kerja di branch fitur.
