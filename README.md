# SADAR Finance

SADAR Finance adalah aplikasi web personal finance untuk membantu pengguna mencatat pemasukan, mengelola pengeluaran, membaca pola finansial, dan memproses struk dengan OCR.

Project ini berbentuk full-stack app:

- Frontend React + Vite untuk landing page, autentikasi, dashboard, input transaksi, insight, financial score, dan profile/account.
- Backend Express + PostgreSQL untuk auth, account, transaction, income, OCR history, dan analytics API.
- AI service Flask + Pytesseract untuk membaca gambar struk dan mengekstrak data transaksi.

## Status Terbaru

- Main app SADAR memakai 5 menu utama: Dashboard, Catat Keuangan, Behavior Insight, Financial Score, dan Profile & Account.
- Login dan register sudah memakai halaman auth SADAR dengan validasi form Indonesia.
- Catat Keuangan mendukung dua tipe input: Pengeluaran dan Pemasukan.
- Pengeluaran bisa dicatat manual atau lewat upload OCR.
- Frontend OCR mencoba AI service langsung lewat `VITE_AI_URL`, lalu fallback ke backend `/ocr/upload` jika perlu.
- Dashboard dan halaman insight/score memakai mock data SADAR di `frontend/src/pages/SadarShared/mockData.js` untuk tampilan personal finance.
- Ada dua mode auth yang umum dipakai saat development:

```txt
Fake frontend auth:
Email: aqyla@example.com
Password: 123456
VITE_DEFAULTAUTH=fake
```

```txt
Backend SADAR auth:
Email: demo@sadarfinance.com
Password: Demo@12345
VITE_DEFAULTAUTH=sadar
```

- Demo backend account `demo@sadarfinance.com` dibuat dari seed database.
- Demo fake account `aqyla@example.com` berasal dari `frontend/src/helpers/AuthType/fakeBackend.js`.

## Fitur Utama

### Authentication

- Register pengguna baru.
- Login menggunakan JWT untuk backend mode SADAR.
- Proteksi route frontend dengan session `authUser`.
- Endpoint profil pengguna aktif.

### Dashboard

- Ringkasan saldo, pemasukan, pengeluaran, sisa budget, dan jumlah catatan.
- Cashflow bulanan.
- Tren pengeluaran.
- Distribusi kategori pengeluaran.
- Smart insight, smart alert, riwayat terbaru, dan quick action.

### Catat Keuangan

- Tab Pengeluaran dan Pemasukan.
- Pengeluaran manual.
- Upload gambar struk untuk OCR.
- Preview hasil OCR dan pengisian form otomatis.
- Simpan pengeluaran ke backend `/transactions`.
- Simpan pemasukan ke backend `/incomes`.

### Behavior Insight

- Analisis pola pengeluaran.
- Kategori dominan.
- Weekend vs weekday behavior.
- Rekomendasi ringan dari pola data.

### Financial Score

- Skor finansial 0-100.
- Status kondisi keuangan: Perlu Perhatian, Cukup Sehat, atau Sehat.
- Faktor pembentuk score.
- Insight dan rekomendasi.
- Visual alokasi 50/30/20.

### Profile & Account

- Data profil pengguna.
- Account keuangan seperti Cash, Bank, dan E-wallet.
- Budget.
- Riwayat transaksi.

## Tech Stack

| Komponen | Teknologi |
| --- | --- |
| Frontend | React 18, Vite 6, React Router, Redux Toolkit |
| UI & Styling | Bootstrap 5, Reactstrap, Sass, Tailwind CSS v4, Remix Icon, Lucide React |
| Chart | ApexCharts, Chart.js, ECharts |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | JWT, bcryptjs |
| Validation | Joi, Yup, Formik |
| Upload | Multer |
| Security | Helmet, CORS, Express Rate Limit |
| API Docs | Swagger / OpenAPI |
| AI Service | Flask, Pytesseract, Pillow |

## Prasyarat

Pastikan perangkat sudah memiliki:

- Node.js 18 atau lebih baru.
- npm.
- PostgreSQL.
- Git.
- Python 3.8 atau lebih baru.
- Tesseract OCR untuk fitur upload struk.

### Instalasi Tesseract OCR

Windows:

```powershell
winget install --id UB-Mannheim.TesseractOCR -e
```

Lokasi default Windows biasanya:

```txt
C:\Program Files\Tesseract-OCR\tesseract.exe
```

Jika Tesseract belum terbaca dari PATH, isi `ai/.env`:

```env
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
```

Verifikasi:

```bash
tesseract --version
```

Atau dari folder `ai/`:

```bash
python -c "from inference.ocr import pytesseract; print(pytesseract.get_tesseract_version())"
```

## Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd sadar-finance
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Untuk PowerShell Windows:

```powershell
Copy-Item .env.example .env
```

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sadar_finance
DB_USER=postgres
DB_PASSWORD=

JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

AI_SERVICE_URL=http://localhost:5000
AI_SERVICE_TIMEOUT_MS=10000
AI_MOCK_MODE=false

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

MAX_FILE_SIZE_MB=10
UPLOAD_DIR=uploads
```

Buat database PostgreSQL:

```bash
createdb -U postgres sadar_finance
```

Jalankan migrasi dan seed:

```bash
npm run db:check
npm run db:migrate
npm run db:seed
```

Seed akan membuat demo account:

```txt
demo@sadarfinance.com / Demo@12345
```

Jalankan backend:

```bash
npm run dev
```

Backend:

```txt
http://localhost:3000
```

Swagger:

```txt
http://localhost:3000/api-docs
```

### 3. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Untuk PowerShell Windows:

```powershell
Copy-Item .env.example .env
```

Isi minimal `frontend/.env`:

```env
VITE_DEFAULTAUTH=sadar
VITE_API_URL=http://localhost:3000/api/v1
VITE_AI_URL=http://localhost:5000
```

Jika ingin login memakai fake backend frontend, ubah `VITE_DEFAULTAUTH` menjadi:

```env
VITE_DEFAULTAUTH=fake
```

Credential fake backend:

```txt
aqyla@example.com / 123456
```

Credential backend SADAR dari seed database:

```txt
demo@sadarfinance.com / Demo@12345
```

Frontend biasanya berjalan di:

```txt
http://localhost:5173
```

### 4. Setup AI Service OCR

```bash
cd ai
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py
```

AI service:

```txt
http://localhost:5000
```

Endpoint utama:

```txt
GET  /health
POST /ocr
POST /nlp/receipt
```

Tes health check:

```bash
curl http://localhost:5000/health
```

## Cara Menjalankan Project

Untuk mencoba fitur lengkap, jalankan 3 terminal.

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

Base API:

```txt
http://localhost:3000/api/v1
```

Health check:

```txt
http://localhost:3000/health
```

### Terminal 2 - AI OCR Service

```bash
cd ai
venv\Scripts\activate
python app.py
```

### Terminal 3 - Frontend

```bash
cd frontend
npm run dev
```

Buka:

```txt
http://localhost:5173
```

Route utama:

```txt
Landing:            http://localhost:5173/
Login:              http://localhost:5173/login
Register:           http://localhost:5173/register
Dashboard:          http://localhost:5173/dashboard
Catat Keuangan:     http://localhost:5173/catat-keuangan
Behavior Insight:   http://localhost:5173/behavior-insight
Financial Score:    http://localhost:5173/financial-score
Profile & Account:  http://localhost:5173/profile-account
```

## Ringkasan API

Base path backend:

```txt
/api/v1
```

| Modul | Endpoint Utama | Deskripsi |
| --- | --- | --- |
| Auth | `/auth/register`, `/auth/login`, `/auth/me` | Registrasi, login, dan profil pengguna |
| Accounts | `/accounts` | CRUD account keuangan |
| Transactions | `/transactions`, `/transactions/summary`, `/transactions/trend/monthly` | CRUD transaksi, summary, dan tren bulanan |
| Incomes | `/incomes`, `/incomes/trend/monthly` | CRUD pemasukan dan tren bulanan |
| OCR | `/ocr/upload`, `/ocr`, `/ocr/:id` | Upload struk dan riwayat scan |
| Analytics | `/analytics/*` | Kategorisasi, behavior, overspending, health score, budget, insight, alert |

## Struktur Project

```txt
sadar-finance/
|-- ai/
|   |-- inference/          # Modul OCR dan parser
|   |-- models/             # Model atau aset AI/ML
|   |-- preprocessing/      # Preprocessing data
|   |-- app.py              # Entry point AI service
|   `-- requirements.txt
|-- backend/
|   |-- config/             # Konfigurasi app, database, Swagger
|   |-- controllers/        # Handler request API
|   |-- db/                 # Migrasi dan seed PostgreSQL
|   |-- middlewares/        # Auth, validation, error handler
|   |-- repositories/       # Data access layer
|   |-- routes/             # Route Express
|   |-- services/           # Business logic
|   |-- utils/              # Helper utility
|   |-- validators/         # Schema Joi
|   `-- server.js
|-- data/                   # Dataset dan contoh data
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- assets/
|   |   |-- Components/
|   |   |-- Layouts/
|   |   |-- pages/
|   |   |   |-- Sadar/
|   |   |   |-- SadarDashboard/
|   |   |   |-- SadarBehaviorInsight/
|   |   |   |-- SadarFinancialScore/
|   |   |   |-- SadarProfileAccount/
|   |   |   `-- SadarShared/
|   |   |-- Routes/
|   |   |-- slices/
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   `-- tailwind.css
|   |-- package.json
|   `-- vite.config.js
|-- notebooks/
|-- sadar-finance.md        # Dokumentasi rancangan sistem
`-- README.md
```

## Script yang Tersedia

### Backend

| Script | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan server dengan nodemon |
| `npm start` | Menjalankan server production-style |
| `npm run db:check` | Mengecek koneksi database |
| `npm run db:migrate` | Membuat atau migrasi tabel database |
| `npm run db:seed` | Mengisi data awal |
| `npm run db:reset` | Migrasi ulang dan seed |
| `npm test` | Menjalankan Jest dengan coverage |

### Frontend

| Script | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan Vite dev server |
| `npm run build` | Build frontend untuk production |
| `npm run preview` | Preview hasil build |
| `npm run lint` | Menjalankan ESLint |

## OCR Troubleshooting

Jika tombol `Proses OCR` gagal:

1. Pastikan AI service berjalan di `http://localhost:5000`.
2. Pastikan `frontend/.env` punya `VITE_AI_URL=http://localhost:5000`.
3. Pastikan backend berjalan jika ingin memakai fallback `/api/v1/ocr/upload`.
4. Pastikan user sudah login jika fallback backend OCR dipakai, karena endpoint backend memakai JWT.
5. Pastikan Tesseract OCR terpasang dan terbaca.
6. Jika muncul error Tesseract not found, isi `ai/.env` dengan `TESSERACT_CMD`.
7. Restart AI service setelah mengubah `.env`.

Contoh gambar struk untuk testing:

```txt
data/sadar-ocr-clean-receipt.png
```

## Author

SADAR Finance Team:

1. (CDCC156D6X1244) Diah Ayu Puspasari - Data Scientist
2. (CDCC156D6X028) Marsela - Data Scientist
3. (CACC295D6Y0695) Farrel Al Faqih Ekatama - AI Engineer
4. (CACC349D6Y1657) Dzaky Jaisy Al-Qorney - AI Engineer
5. (CFCC882D6Y0583) Fhazar Raffiful Aqyla - Full Stack Developer
6. (CFCC220D6Y1309) Muhammad Habib Rafi - Full Stack Developer

## Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Swagger Documentation](https://swagger.io/docs/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)

## Additional Information

- Last Updated: May 23, 2026
- Version: 1.0.0
- License: ISC
