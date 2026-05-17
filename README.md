# 💸 SADAR Finance

> **Smart AI-Driven Automated Receipt & Finance Management** - Platform manajemen keuangan berbasis web untuk mencatat pemasukan, mengelola pengeluaran, memindai struk, dan membaca insight finansial secara lebih praktis.

---

## 🎯 Latar Belakang

Pencatatan keuangan pribadi sering gagal bukan karena pengguna tidak peduli, tetapi karena prosesnya terlalu manual: transaksi tercecer, struk hilang, kategori pengeluaran tidak konsisten, dan evaluasi keuangan baru dilakukan saat masalah sudah terasa.

**SADAR Finance** dibuat untuk membantu pengguna lebih sadar terhadap kondisi finansialnya melalui aplikasi full-stack yang menggabungkan:

- **Pencatatan transaksi** untuk memantau pengeluaran harian.
- **Manajemen pemasukan dan akun** agar arus kas lebih mudah dilihat.
- **Upload struk/OCR** sebagai dasar otomatisasi pencatatan dari bukti transaksi.
- **Analitik finansial** untuk kategorisasi, prediksi overspending, budget, insight, alert, dan health score.
- **Dashboard web** yang responsif untuk eksplorasi data dan pengelolaan aktivitas keuangan.

Project ini berbeda dari dashboard data science standalone. Repository ini berfokus pada aplikasi web lengkap: frontend, backend API, database, dan fondasi integrasi AI service.

---

## ✨ Fitur Utama

### 🧾 Authentication & User Profile

- Register pengguna baru.
- Login menggunakan JWT.
- Endpoint profil pengguna aktif.
- Proteksi route backend dengan middleware autentikasi.

### 💳 Account Management

- Tambah akun keuangan.
- Lihat daftar akun milik pengguna.
- Detail, update, dan hapus akun.
- Cocok untuk memisahkan wallet, rekening, e-wallet, atau sumber dana lain.

### 💸 Transaction Management

- CRUD transaksi pengeluaran.
- Ringkasan transaksi.
- Tren transaksi bulanan.
- Query/filter transaksi melalui endpoint API.

### 💰 Income Management

- CRUD pemasukan.
- Lihat daftar pemasukan.
- Tren pemasukan bulanan.
- Dasar untuk membandingkan income vs spending.

### 📷 OCR Receipt Flow

- Upload gambar struk melalui endpoint backend.
- Simpan riwayat scan.
- Ambil detail hasil scan berdasarkan ID.
- Folder upload dilayani secara statis melalui backend.

### 📊 Analytics & Financial Insight

- Kategorisasi transaksi.
- Analisis perilaku finansial.
- Prediksi risiko overspending.
- Perhitungan health score.
- Riwayat dan skor kesehatan finansial terbaru.
- Budget recommendation/storage.
- Insight dan alert finansial.

### 🖥️ Frontend Dashboard

- Landing page SADAR Finance.
- Halaman login, register, forgot password, logout, dan profile.
- Dashboard analytics/ecommerce/finance-style dari template React.
- Komponen UI lengkap: chart, table, form, calendar, file manager, todo, invoice, dan halaman pendukung lain.
- Integrasi state management dengan Redux Toolkit.

---

## 🛠️ Tech Stack

| Komponen | Teknologi |
| --- | --- |
| **Frontend** | React, Vite, React Router, Redux Toolkit |
| **UI & Styling** | Bootstrap 5, Reactstrap, Sass, Tailwind CSS, Remix Icon, Boxicons |
| **Charts & Visualization** | ApexCharts, Chart.js, ECharts |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **Authentication** | JWT, bcryptjs |
| **Validation** | Joi |
| **Upload File** | Multer |
| **Security** | Helmet, CORS, Express Rate Limit |
| **API Docs** | Swagger / OpenAPI |
| **AI Service** | Flask, Pytesseract, Pillow, NLP regex/heuristic parser |

---

## 📋 Prasyarat

Pastikan perangkat sudah memiliki:

- **Node.js** versi 18 atau lebih baru.
- **npm** sebagai package manager.
- **PostgreSQL** untuk database backend.
- **Git** untuk clone repository.
- **Python 3.8+** untuk menjalankan service AI di folder `ai/`.
- **Tesseract OCR** untuk fitur upload struk/OCR gambar.

### Instalasi Tesseract OCR

Fitur OCR membutuhkan aplikasi Tesseract OCR yang terpasang di sistem, bukan hanya package Python `pytesseract`.

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

---

## ⚙️ Instalasi

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

Edit file `backend/.env` sesuai konfigurasi lokal:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sadar_finance
DB_USER=postgres
DB_PASSWORD=your_password_here

JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

AI_SERVICE_URL=http://localhost:5000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
MAX_FILE_SIZE_MB=10
UPLOAD_DIR=uploads
```

Jalankan migrasi dan seed database:

```bash
npm run db:migrate
npm run db:seed
```

Jalankan backend:

```bash
npm run dev
```

Backend berjalan di:

```txt
http://localhost:3000
```

Dokumentasi Swagger tersedia di:

```txt
http://localhost:3000/api-docs
```

### 3. Setup Frontend

Buka terminal baru dari root project:

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di alamat yang ditampilkan Vite, biasanya:

```txt
http://localhost:5173
```

### 4. Setup AI Service OCR + NLP (Wajib untuk Fitur Upload OCR)

Folder `ai/` berisi service Python untuk:

- OCR image preprocessing dan ekstraksi teks dari struk menggunakan Pytesseract.
- NLP processing untuk mengekstraksi merchant, tanggal, item, total transaksi, mata uang, dan kategori transaksi dari teks OCR.
- Endpoint REST agar backend dapat mengirim file hasil upload ke AI service.

```bash
cd ai
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py
```

AI service berjalan di:

```txt
http://localhost:5000
```

Endpoint AI utama:

```txt
GET  /health
POST /ocr
POST /nlp/receipt
```

Tes health check:

```bash
curl http://localhost:5000/health
```

> Catatan: frontend halaman `Catat Keuangan` akan langsung memanggil AI service di `http://localhost:5000/ocr`. Jadi terminal `python app.py` harus tetap berjalan saat mencoba tombol **Proses OCR**.

---

## 🚀 Cara Menjalankan Project

Untuk menjalankan fitur lengkap dashboard + input transaksi + OCR, gunakan 3 terminal:

### Backend API

```bash
cd backend
npm run dev
```

Endpoint utama:

```txt
http://localhost:3000/api/v1
```

Health check:

```txt
http://localhost:3000/health
```

### Frontend Web App

```bash
cd frontend
npm run dev
```

Buka:

```txt
http://localhost:5173
```

Halaman utama:

```txt
Dashboard:        http://localhost:5173/dashboard
Input Transaksi:  http://localhost:5173/transactions/input
```

### AI OCR Service

```bash
cd ai
venv\Scripts\activate
python app.py
```

AI service harus menampilkan:

```txt
Running on http://127.0.0.1:5000
```

### Build Frontend

```bash
cd frontend
npm run build
```

### Preview Build

```bash
cd frontend
npm run preview
```

---

## 🔌 Ringkasan API

Base path backend:

```txt
/api/v1
```

| Modul | Endpoint Utama | Deskripsi |
| --- | --- | --- |
| **Auth** | `/auth/register`, `/auth/login`, `/auth/me` | Registrasi, login, dan profil pengguna |
| **Accounts** | `/accounts` | CRUD akun keuangan |
| **Transactions** | `/transactions`, `/transactions/summary`, `/transactions/trend/monthly` | CRUD transaksi, summary, dan tren bulanan |
| **Incomes** | `/incomes`, `/incomes/trend/monthly` | CRUD pemasukan dan tren bulanan |
| **OCR** | `/ocr/upload`, `/ocr`, `/ocr/:id` | Upload struk dan riwayat scan |
| **Analytics** | `/analytics/*` | Kategorisasi, behavior, overspending, health score, budget, insight, alert |

---

## 📁 Struktur Project

```txt
sadar-finance/
├── ai/
│   ├── inference/          # Modul inference AI
│   ├── models/             # Model AI/ML
│   ├── preprocessing/      # Preprocessing data
│   ├── app.py              # Entry point AI service
│   └── requirements.txt    # Dependency Python
├── backend/
│   ├── config/             # Konfigurasi app, database, Swagger
│   ├── controllers/        # Handler request API
│   ├── db/                 # Migrasi dan seed PostgreSQL
│   ├── middlewares/        # Auth, validation, error handler
│   ├── repositories/       # Query/data access layer
│   ├── routes/             # Definisi route Express
│   ├── services/           # Business logic
│   ├── utils/              # Helper utility
│   ├── validators/         # Schema Joi
│   ├── .env.example        # Template environment backend
│   ├── package.json        # Dependency backend
│   └── server.js           # Entry point Express API
├── data/                   # Dataset dan data pendukung
├── frontend/
│   ├── public/             # Static public assets
│   ├── src/
│   │   ├── assets/         # Gambar, font, SCSS
│   │   ├── Components/     # Komponen reusable
│   │   ├── Layouts/        # Layout aplikasi
│   │   ├── pages/          # Halaman frontend
│   │   ├── Routes/         # Routing React
│   │   ├── slices/         # Redux slices dan thunk
│   │   ├── config.js       # Konfigurasi API/frontend
│   │   ├── App.jsx         # Root component
│   │   ├── main.jsx        # Entry point React
│   │   └── tailwind.css    # Tailwind CSS entry
│   ├── package.json        # Dependency frontend
│   └── vite.config.js      # Konfigurasi Vite
├── notebooks/              # Notebook eksperimen data/ML
└── README.md
```

---

## 🧪 Script yang Tersedia

### Backend

| Script | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan server dengan nodemon |
| `npm start` | Menjalankan server production-style |
| `npm run db:migrate` | Membuat/migrasi tabel database |
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

---

## OCR Troubleshooting

Jika tombol **Proses OCR** gagal:

1. Pastikan AI service sedang berjalan.

```bash
cd ai
python app.py
```

2. Pastikan health check AI sukses.

```bash
curl http://localhost:5000/health
```

3. Pastikan Tesseract terpasang dan terbaca.

```bash
python -c "from inference.ocr import pytesseract; print(pytesseract.get_tesseract_version())"
```

4. Jika muncul error Tesseract not found, isi `ai/.env`.

```env
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
```

5. Restart AI service setelah mengubah `.env`.

6. Pastikan backend `.env` mengarah ke AI service.

```env
AI_SERVICE_URL=http://localhost:5000
AI_MOCK_MODE=false
```

7. Jika menggunakan fallback backend OCR, pastikan user sudah login karena endpoint backend `/api/v1/ocr/upload` memakai JWT.

Contoh gambar struk untuk testing OCR:

```txt
data/sadar-ocr-clean-receipt.png
```

---

## 👨‍💻 Author

### SADAR Finance Team

1. **(CDCC156D6X1244)** — Diah Ayu Puspasari *(Data Scientist)*
2. **(CDCC156D6X028)** — Marsela *(Data Scientist)*
3. **(CACC295D6Y0695)** — Farrel Al Faqih Ekatama *(AI Engineer)*
4. **(CACC349D6Y1657)** — Dzaky Jaisy Al-Qorney *(AI Engineer)*
5. **(CFCC882D6Y0583)** — Fhazar Raffiful Aqyla *(Full Stack Developer)*
6. **(CFCC220D6Y1309)** — Muhammad Habib Rafi *(Full Stack Developer)*

---

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Swagger Documentation](https://swagger.io/docs/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)

---

## 📝 Additional Information

- **Last Updated**: May 17, 2026
- **Version**: 1.0.0
- **License**: ISC
