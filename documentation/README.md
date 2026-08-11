# SADAR Finance — Hub Dokumentasi Proyek

Selamat datang di repositori dokumentasi resmi **SADAR Finance** (*Smart AI-Driven Automated Receipt & Personal Finance Management*). Folder ini memuat seluruh dokumen teknis, spesifikasi produk, panduan desain, arsitektur sistem, skema database, kontrak API, spesifikasi AI/ML, dan alur kerja (workflow) pengembangan.

---

## 📚 Daftar Dokumen & Navigasi

| Dokumen | Kategori | Deskripsi Singkat | File Link |
|---|---|---|---|
| **PRD (Product Requirements Document)** | Produk & Bisnis | Visi produk, cakupan sistem (*in/out-of-scope*), persona pengguna, spesifikasi fitur detail, aturan bisnis, dan kriteria penerimaan. | [prd.md](file:///c:/laragon/www/sadar-finance/documentation/prd.md) |
| **Spesifikasi Desain & UI/UX** | Desain & Frontend | Prinsip desain, sistem warna, tipografi, komponen UI, struktur tata letak (5 menu utama), wireframe/tata letak halaman, dan panduan state/interaksi. | [desain.md](file:///c:/laragon/www/sadar-finance/documentation/desain.md) |
| **Arsitektur Sistem** | Teknis & Infrastruktur | Arsitektur 3-tier (React + Express + Python AI), diagram alur data antar layanan, keamanan (JWT, rate limiting, CORS), dan konfigurasi deployment (Vercel + Railway). | [arsitektur.md](file:///c:/laragon/www/sadar-finance/documentation/arsitektur.md) |
| **Skema Database & ERD** | Database | Diagram ERD Mermaid lengkap, kamus data (*data dictionary*) tabel PostgreSQL, indeks performa, relasi foreign key, migrasi, dan data seeding. | [database.md](file:///c:/laragon/www/sadar-finance/documentation/database.md) |
| **Spesifikasi & Kontrak API** | Integrasi API | Dokumentasi REST API v1 lengkap: endpoint Auth, Account, Transaction, Income, Category, OCR Scan, dan Analytics beserta contoh payload request/response. | [api_spec.md](file:///c:/laragon/www/sadar-finance/documentation/api_spec.md) |
| **Spesifikasi AI & Machine Learning** | AI / Data Science | Arsitektur model AI: OCR parsing, smart categorization, deteksi spike perilaku transaksi, prediksi overspending, algoritma financial health score, dan fallback rules. | [ai_specs.md](file:///c:/laragon/www/sadar-finance/documentation/ai_specs.md) |
| **Panduan Workflow & Kontribusi** | DevOps & Tim | Standar Git branching, setup lingkungan lokal (Laragon/Node/Python), konvensi kode, panduan pengujian, migrasi DB, dan troubleshooting. | [workflow_guide.md](file:///c:/laragon/www/sadar-finance/documentation/workflow_guide.md) |

---

## 🎯 Ringkasan Eksekutif Proyek

**SADAR Finance** adalah platform web manajemen keuangan pribadi (*personal finance*) cerdas yang berfokus pada:
1. **Kesadaran Finansial (*Financial Awareness*)**: Membantu pengguna mengetahui dengan transparan ke mana uang mereka mengalir melalui klasifikasi cerdas dan visualisasi arus kas.
2. **Kemudahan Pencatatan (*Effortless Logging*)**: Mendukung pencatatan manual cepat serta otomatisasi ekstraksi data struk belanja berbasis OCR & NLP.
3. **Analitik Perilaku & Skor Kesehatan Keuangan**: Menghitung skor kesehatan keuangan (*Financial Health Score 0–100*) secara objektif dan memberikan insight perilaku belanja (*behavior insight*) tanpa visual AI yang berlebihan.
4. **Pencegahan Dini (*Predictive Alerts*)**: Algoritma cerdas yang mendeteksi risiko *overspending* sebelum akhir bulan tiba.

### Prinsip Utama Sistem
- **Konteks Personal Finance Murni**: Aplikasi tidak mencakup fitur bisnis/perusahaan seperti crypto, sales CRM, invoice klien, payroll, atau akuntansi enterprise.
- **Clean & Non-Intrusive AI**: AI hadir sebagai *enhancer* (insight, alert, rekomendasi, score, scanner struk), bukan bot interaktif besar atau antarmuka futuristik yang mengganggu.
- **Bahasa Indonesia Baku & Bersahabat**: Seluruh label UI, notifikasi, dan pesan rekomendasi menggunakan Bahasa Indonesia yang mudah dipahami.

---

## 🚀 Panduan Memulai Cepat untuk Pengembang

Untuk memulai pengembangan lokal secara lengkap:

```bash
# 1. Clone repositori & pastikan PostgreSQL berjalan (misal via Laragon)
git clone <repository_url>
cd sadar-finance

# 2. Setup Backend (Node.js/Express)
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev

# 3. Setup Frontend (React + Vite) di terminal terpisah
cd ../frontend
npm install
npm run dev

# 4. Setup AI Microservice (Python) di terminal terpisah
cd ../ai
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py
```

Silakan baca dokumen [workflow_guide.md](file:///c:/laragon/www/sadar-finance/documentation/workflow_guide.md) untuk petunjuk lengkap dan panduan kontribusi.
