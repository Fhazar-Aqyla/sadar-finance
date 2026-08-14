# SADAR Finance — Architecture Document

> Dokumentasi arsitektur teknis tingkat lanjut: komponen, alur request, integrasi AI, dan deployment.

---

## 1. Gambaran Arsitektur

SADAR Finance menggunakan arsitektur **Decoupled Full-Stack** dengan 4 komponen utama:

```
┌─────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   FRONTEND      │      │    BACKEND       │      │     DATABASE     │
│  React 18 SPA   │ ───► │  Express (Node)  │ ───► │  PostgreSQL 15   │
│  Vite 6 + RTK   │      │  /api/v1         │      │   (9 tabel)      │
│  Port 5173      │      │  Port 3000       │      │                  │
└────────┬────────┘      └────────┬─────────┘      └──────────────────┘
         │                       │
         │                       ▼
         │              ┌──────────────────┐
         └────────────► │   AI MICROSERVICE │
            (upload     │  Flask (Python)   │
             struk)     │  Port 5000        │
                        │  OCR + DCN + MLP  │
                        └──────────────────┘
```

**Gateway nginx** (`gateway/`) berfungsi sebagai reverse proxy untuk routing frontend/backend/AI di produksi.

---

## 2. Komponen & Tanggung Jawab

### 2.1 Frontend Web (`frontend/`)
- **SPA React**: React 18, Vite 6, Redux Toolkit, React Router v7.
- **UI**: Tailwind CSS v4, Bootstrap 5, Reactstrap, Sass.
- **Charts**: ApexCharts, ECharts.
- **State**: Redux (auth, layout) + `localStorage` untuk persist login (`authUser`).
- **Route Guard**:
  - `AuthProtected` → halaman butuh login.
  - `GuestProtected` → halaman `/`, `/login`, `/register`, `/landing` hanya untuk yang belum login.
- **Skenario data** (`.env`): `mock-with-backend-auth`, `backend-with-backend-auth`, `backend-only`.

### 2.2 Backend API (`backend/`)
- Express.js, PostgreSQL via `pg`.
- Struktur berlapis: `routes → middlewares → controllers → services → repositories → DB`.
- Swagger OpenAPI di `/api-docs`.
- Keamanan: JWT, bcrypt (12 rounds), Helmet, CORS, rate-limit (khusus auth lebih ketat).

### 2.3 AI Microservice (`ai/`)
- Python 3.8+, Flask REST server.
- **Module inferensi** (`ai/inference/`):
  - `ocr.py` — ekstraksi teks struk + NLP parser.
  - `merchant_classifier.py` — klasifikasi merchant → kategori.
  - `behavior.py` — prediksi spike perilaku belanja.
  - `overspending_forecast.py` — proyeksi pembengkakan budget.
- **Model**: TensorFlow `.keras` (DCN, Multitask MLP) + metadata JSON.
- **GenAI**: Gemini SDK opsional untuk rekomendasi naratif.

### 2.4 Gateway (`gateway/`)
- nginx reverse proxy.
- `Dockerfile` + `nginx.conf`.

---

## 3. Alur Request (End-to-End)

### 3.1 Autentikasi
```
User login → POST /api/v1/auth/login → backend validasi Joi →
           → cek bcrypt password → generate JWT →
           → frontend simpan {user, token} di localStorage → redirect /dashboard
```

### 3.2 Dashboard (data real)
```
Frontend GET /transactions, /incomes, /analytics/budget, /analytics/insights
   → backend query PostgreSQL (dengan user_id dari JWT)
   → frontend render summary + charts
```

### 3.3 Upload Struk (OCR)
```
Frontend upload image → POST /ocr/upload (multipart, Bearer token)
   → backend simpan ocr_scans status=pending
   → backend panggil AI POST /process (Flask) [timeout AI_SERVICE_TIMEOUT_MS]
       → OCR ekstrak teks (pytesseract) → NLP parse merchant/items/total
   → jika AI gagal → fallback tesseract.js lokal
   → update ocr_scans status=completed + parsed_data
   → frontend preview hasil → user confirm → POST /ocr/:id/confirm-transaction
```

### 3.4 Behavior Insight
```
Frontend POST /analytics/behavior {periodStart, periodEnd}
   → backend ambil transaksi+income → panggil AI behavior.py
   → hasil disimpan ke insights → frontend render
```

### 3.5 Financial Score
```
Frontend POST /analytics/health-score
   → backend hitung rasio (needs/wants/savings vs income) → skor 0-100
   → simpan ke scores → frontend tampil breakdown
```

### 3.6 Predictive Alert (Background)
```
Scheduler backend (interval) → ambil transaksi + budget bulan berjalan
   → panggil AI overspending_forecast.py
   → jika probabilitas > ambang → simpan alerts
   → tampil di dashboard & notifikasi
```

---

## 4. Integrasi Backend ↔ AI

### Endpoint yang dipanggil backend ke AI (internal)
| Tujuan | Panggilan Backend | AI Handler |
|---|---|---|
| OCR struk | `POST {AI_URL}/process` (atau `/ocr/upload`) | `ocr.py` |
| Klasifikasi kategori | `POST {AI_URL}/categorize` | `merchant_classifier.py` |
| Prediksi behavior | `POST {AI_URL}/behavior/predict` | `behavior.py` |
| Prediksi overspending | `POST {AI_URL}/overspending` | `overspending_forecast.py` |

### Fallback
- `AI_MOCK_MODE=true` → backend mensimulasikan hasil tanpa Flask.
- OCR fallback → `tesseract.js` di backend jika AI service mati/timeout.
- Behavior & overspending → rule-based fallback (sigmoid).

---

## 5. Deployment Topology

```
                          ┌────────────────────────────┐
                          │        GATEWAY (nginx)     │
                          │  /api/*  → backend         │
                          │  /ai/*   → ai service      │
                          │  /*      → frontend static │
                          └────────────────────────────┘
```

### Target Platform
- **Backend**: Railway (Dockerfile + `railway.json`, upload dir ephemeral → simpan `image_data` BYTEA di DB).
- **Frontend**: Vercel (`vercel.json`) / statis via nginx.
- **AI**: Railway / Docker (Flask).

### Catatan Ephemeral Storage
- Backend Railway tidak menjamin persistensi folder `uploads/`.
- Solusi: `ocr_scans.image_data` (BYTEA) menyimpan gambar struk biner di database.

---

## 6. Konvensi Kode & Integrasi

| Aspek | Aturan |
|---|---|
| Naming API | `camelCase` di request, `snake_case` di DB (backend menerima keduanya) |
| Response format | `{ success, data }` / `{ success, error: { code, message } }` |
| Auth | JWT Bearer, kecuali `/auth/login|register|forgot-password` |
| Error | `utils/response.js` + `middlewares/errorHandler.js` + `utils/dbError.js` |
| .env | Jangan commit; ikuti `.env.example` tiap service |

---

## 7. Daftar Service & Port

| Service | Direktori | Port Dev | Healthcheck |
|---|---|---|---|
| Frontend | `frontend/` | 5173 | - |
| Backend | `backend/` | 3000 | `/api-docs` |
| AI | `ai/` | 5000 | `/health` |
| Database | PostgreSQL | 5432 | - |
| Gateway | `gateway/` | 80/443 | - |
