# Spesifikasi Arsitektur Sistem
# SADAR Finance — Smart AI-Driven Personal Finance Platform

| Versi Dokumen | Status | Terakhir Diperbarui | Target Lingkungan |
|---|---|---|---|
| **v1.0.0 (Production-Ready)** | **Approved** | **Agustus 2026** | **Hybrid / Cloud (Vercel + Railway + PostgreSQL)** |

---

## 1. Gambaran Umum Arsitektur (*Architectural Overview*)

SADAR Finance mengadopsi pola arsitektur **3-Tier Microservices Decoupled** yang memisahkan lapisan presentasi (*Frontend Client*), lapisan logika bisnis & API (*Backend Service*), lapisan komputasi kecerdasan buatan (*AI Microservice*), dan lapisan penyimpanan data (*Relational Database*).

Pemisahan ini memastikan performa tinggi, skalabilitas independen, isolasi error (*fault isolation*), dan fleksibilitas *tech stack*.

```mermaid
graph TB
    subgraph CLIENT_TIER["🖥️ LAPISAN KLIEN / PRESENTASI (FRONTEND)"]
        UI["React 18 + Vite SPA<br>(Velzon Dashboard UI, ApexCharts, Tailwind CSS)"]
        BrowserStore["State Management: Redux Toolkit / React Query"]
        UI <--> BrowserStore
    end

    subgraph API_GATEWAY_TIER["⚙️ LAPISAN BISNIS & API GATEWAY (BACKEND)"]
        ExpressApp["Node.js + Express.js API Server (Port 5000)<br>• JWT Authentication Middleware<br>• Joi Schema Validation<br>• Rate Limiting & Helmet Security<br>• Multipart/Multer Upload Handler"]
        LocalEngine["Local OCR Engine (Tesseract.js)<br>• Local Rule-Based Analytic Fallbacks"]
        ExpressApp <--> LocalEngine
    end

    subgraph AI_TIER["🧠 LAPISAN KECERDASAN BUATAN (AI SERVICE)"]
        FlaskAPI["Python Flask / FastAPI Microservice (Port 8000)<br>• Tesseract OCR & Layout Analysis<br>• Receipt NLP RegEx/Entity Parser<br>• Transaction Categorization Model<br>• Behavior Spike Anomaly Detector<br>• Overspending Forecasting Engine"]
    end

    subgraph DATA_TIER["💾 LAPISAN BASIS DATA (DATABASE)"]
        PostgresDB[("PostgreSQL Database (Port 5432)<br>• Relational Schema (UUID-based)<br>• Connection Pool (pg)<br>• Indexes, Cascades, Triggers")]
    end

    %% Komunikasi Antar Lapisan
    UI -- "HTTPS / REST API (JSON / FormData)" --> ExpressApp
    ExpressApp -- "Internal HTTP JSON API" --> FlaskAPI
    ExpressApp -- "SQL Queries (Connection Pool)" --> PostgresDB
```

---

## 2. Rincian Teknologi (*Technology Stack Breakdown*)

### 2.1 Frontend Tier
- **Framework & Build Tool**: React 18.3+, Vite 6.x (Fast HMR & Optimized Bundler).
- **UI System & Styling**: Velzon Theme System, Bootstrap 5.3 + Tailwind CSS 4.x utility classes, SASS/SCSS.
- **Visualisasi & Grafik**: ApexCharts (`react-apexcharts`), Chart.js, ECharts untuk speedometer & visualisasi tren.
- **State & Data Fetching**: Redux Toolkit, Context API, Axios dengan interceptor token JWT otomatis.
- **Ikonografi & Animasi**: Lucide React, Feather Icons, Remix Icons, Framer Motion.
- **Hosting / Deployment**: Vercel Serverless Edge Network.

### 2.2 Backend API Tier
- **Runtime & Framework**: Node.js (>= v18 LTS), Express.js v4.21+.
- **Autentikasi & Keamanan**: JSON Web Token (`jsonwebtoken`), `bcryptjs` (hashing password), `helmet` (security headers), `express-rate-limit`, `cors`.
- **Validasi Data**: `joi` v17+ untuk validasi skema payload permintaan secara ketat.
- **Penanganan File Struk**: `multer` untuk upload multipart/form-data sementara.
- **Database Driver**: `pg` (Node-Postgres Connection Pool).
- **Dokumentasi API Terpasang**: Swagger UI Express (`/api/docs`).
- **Hosting / Deployment**: Railway / Render Web Service.

### 2.3 AI & Machine Learning Tier
- **Bahasa & Runtime**: Python 3.10+ / 3.11.
- **Framework Web AI**: Flask / FastAPI dengan ekstensi CORS.
- **OCR & Computer Vision**: Tesseract OCR (dengan data latih `ind.traineddata` & `eng.traineddata`).
- **Pemrosesan Teks & ML**: Scikit-Learn, Pandas, NumPy, RegEx NLP Parser untuk struk kasir Indonesia.
- **Hosting / Deployment**: Railway Docker Containerized Service.

### 2.4 Database Tier
- **DBMS**: PostgreSQL v15+ / v16+.
- **Fitur Utama**: Ekstensi `uuid-ossp` untuk kunci primer UUID v4, ENUM types (`user_status`, `alert_type`, `ocr_status`), transactional query support (`BEGIN ... COMMIT / ROLLBACK`), dan indeks performa komposit.

---

## 3. Alur Data Utama (*Core Data Flow Pipelines*)

### 3.1 Alur Autentikasi Pengguna (*User Authentication Flow*)

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna
    participant Frontend as React Client
    participant Backend as Express.js API
    participant DB as PostgreSQL

    User->>Frontend: Masukkan Email & Password
    Frontend->>Backend: POST /api/v1/auth/login
    Backend->>DB: SELECT * FROM users WHERE email = :email
    DB-->>Backend: Data User Record
    Backend->>Backend: Verifikasi Password via bcrypt.compare()
    alt Password Cocok
        Backend->>Backend: Generate JWT Access Token (Masa Aktif 24 Jam)
        Backend-->>Frontend: 200 OK (Token, Data User, Akun Finansial)
        Frontend->>Frontend: Simpan Token di LocalStorage/State
        Frontend->>Frontend: Redirect ke /dashboard
    else Password Salah
        Backend-->>Frontend: 401 Unauthorized ("Email atau password salah")
        Frontend->>User: Tampilkan Pesan Error
    end
```

---

### 3.2 Alur Pemrosesan Scan Struk OCR (*AI Receipt OCR Processing Flow*)

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna
    participant Frontend as React Client
    participant Backend as Express API
    participant AI as AI Microservice (Python)
    participant DB as PostgreSQL

    User->>Frontend: Unggah Foto Struk Belanja (JPEG/PNG)
    Frontend->>Backend: POST /api/v1/ocr/scan (Multipart Form-Data)
    Backend->>DB: INSERT INTO ocr_scans (status: 'processing')
    
    alt AI Microservice Aktif
        Backend->>AI: POST /ocr (Kirim File Gambar/Path)
        AI->>AI: Ekstraksi Teks (Tesseract) + NLP Entity Parsing
        AI-->>Backend: JSON (Merchant, Nominal, Tanggal, Prediksi Kategori)
    else AI Microservice Down / Timeout
        Backend->>Backend: Fallback Local Tesseract.js & Regex Parsing
    end

    Backend->>DB: UPDATE ocr_scans SET status = 'completed', parsed_data = ...
    Backend-->>Frontend: 200 OK (Hasil Parsing Struk)
    Frontend->>User: Tampilkan Form Catat Keuangan Terisi Otomatis
    User->>Frontend: Verifikasi Data & Klik "Simpan Transaksi"
    Frontend->>Backend: POST /api/v1/transactions
    Backend->>DB: INSERT INTO transactions & UPDATE accounts.balance -= amount
    DB-->>Backend: Sukses
    Backend-->>Frontend: 201 Created (Transaksi Tersimpan)
```

---

### 3.3 Alur Kalkulasi Skor Kesehatan Keuangan (*Financial Health Score Flow*)

```mermaid
sequenceDiagram
    autonumber
    participant Frontend as React Client
    participant Backend as Express API (Analytics Service)
    participant DB as PostgreSQL

    Frontend->>Backend: GET /api/v1/analytics/health-score?period=3m
    Backend->>DB: Kueri Total Pengeluaran, Total Pemasukan, Tren Bulanan, Budget Terakhir
    DB-->>Backend: Dataset Finansial Periode Terpilih
    Backend->>Backend: Hitung 4 Metrik Pilar:<br>1. Savings Score (35%)<br>2. Expense Score (30%)<br>3. Budget Discipline Score (20%)<br>4. Consistency Score (15%)
    Backend->>Backend: Hitung Nilai Akhir (0-100) & Tentukan Status (Sehat/Cukup/Perlu Perhatian)
    Backend->>DB: INSERT INTO scores (user_id, score, created_at)
    Backend-->>Frontend: 200 OK (Score, Status, Breakdown Pilar, Rekomendasi)
    Frontend->>Frontend: Render Speedometer Gauge & Insight Cards
```

---

## 4. Keamanan & Kebijakan Sistem (*Security Architecture*)

```mermaid
graph LR
    subgraph SECURITY_LAYERS["🛡️ Lapisan Keamanan Berlapis"]
        L1["1. Network & Transport<br>Enkripsi HTTPS / TLS 1.3"]
        L2["2. HTTP Headers & CORS<br>Helmet (CSP, XSS Protection)<br>Strict Whitelist CORS"]
        L3["3. Traffic Control<br>Express Rate Limiting<br>(Mencegah Brute Force Auth)"]
        L4["4. Autentikasi Stateless<br>JWT Bearer Authorization<br>Bcrypt Password Hashing"]
        L5["5. Validasi & Sanitasi<br>Joi Schema Validator<br>Parameterized SQL Queries"]
    end
```

1. **Autentikasi Stateless Berbasis JWT**:
   - Header permintaan: `Authorization: Bearer <jwt_token>`.
   - Token ditandatangani menggunakan `JWT_SECRET` yang aman dan memiliki masa kedaluwarsa terukur.
2. **Perlindungan Terhadap Serangan Siber**:
   - **SQL Injection**: Seluruh interaksi database menggunakan kueri berparameter (*parameterized queries* `$1, $2, ...`), tidak pernah melakukan *string concatenation*.
   - **Cross-Site Scripting (XSS)**: Header `Helmet` mengaktifkan `X-XSS-Protection`, `X-Content-Type-Options: nosniff`, dan pembatasan `Content-Security-Policy`.
   - **Brute Force Protection**: Rate limiting membatasi percobaan login/register maksimal 10 kali per 15 menit per alamat IP.
3. **Isolasi Multi-Tenancy**:
   - Setiap operasi modifikasi dan pembacaan data wajib diverifikasi kepemilikannya terhadap `req.user.userId`. Pengguna tidak dapat mengakses data pengguna lain.

---

## 5. Strategi Deployment & Infrastruktur (*Deployment Architecture*)

```mermaid
graph TD
    subgraph VERCEL["☁️ VERCEL (Frontend Hosting)"]
        V1["Vite Production Bundle (HTML/JS/CSS/Assets)"]
        V2["Global Edge CDN & SSL Otomatis"]
        V3["Environment: VITE_API_URL -> Railway Backend"]
    end

    subgraph RAILWAY_BACKEND["☁️ RAILWAY (Backend API Web Service)"]
        R1["Node.js Container Runtime"]
        R2["Port: 5000 / Process.env.PORT"]
        R3["Automatic CI/CD on Git Push to Main"]
    end

    subgraph RAILWAY_AI["☁️ RAILWAY (AI Microservice Container)"]
        A1["Python 3.11 Docker Container"]
        A2["Tesseract OCR Binary + Language Packs"]
        A3["Port: 8000 / Internal Service Mesh"]
    end

    subgraph POSTGRES_CLOUD["🐘 POSTGRESQL DATABASE CLUSTER"]
        P1["PostgreSQL Instance with Connection Pooling"]
        P2["Automated Daily Backups & SSL Encryption"]
    end

    V1 -- "REST API (Public HTTPS)" --> R1
    R1 -- "Internal Network HTTP" --> A1
    R1 -- "Database Connection (SSL)" --> P1
```

- **Frontend (Vercel)**:
  - Konfigurasi rewrite SPA via `vercel.json` agar seluruh rute diarahkan ke `index.html`.
  - Kompilasi aset teroptimasi dengan *Gzip/Brotli compression*.
- **Backend & AI (Railway)**:
  - Backend berjalan di container Node.js dengan zero-downtime deployment.
  - AI Service berjalan dalam container Docker terpisah dengan binary Tesseract terpasang.
- **Database (PostgreSQL)**:
  - Database terisolasi dengan koneksi aman via SSL/TLS.
