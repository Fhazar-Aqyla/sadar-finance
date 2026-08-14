# SADAR Finance — Product Requirements Document (PRD)

> Dokumen kebutuhan produk SADAR Finance. Referensi bersama untuk tim Data Science, AI Engineer, dan Full Stack Developer.

---

## 1. Ringkasan Produk

**SADAR Finance** adalah aplikasi *personal finance* berbasis AI yang membantu pengguna mencatat, memahami, dan mengontrol keuangan pribadi secara sadar (*mindful*). Pengguna bisa mencatat pengeluaran/pemasukan, memindai struk belanja (OCR), melihat pola perilaku belanja, mendapat financial score, serta peringatan dini potensi pembengkakan anggaran.

**Motto:** *Membantu user sadar ke mana uang mereka pergi.*

### Tidak Mencakup (Out of Scope)
- Crypto, investasi aktif, invoice, sales, revenue perusahaan, payroll, CRM, e-commerce, accounting enterprise, dan business analytics.

---

## 2. Persona & Target Pengguna

| Karakteristik | Deskripsi |
|---|---|
| Jenis | Individu (bukan bisnis/perusahaan) |
| Tujuan | Mengontrol pengeluaran, menabung, memahami kebiasaan belanja |
| Kebutuhan | Simpel, visual, insight jelas, minim input manual |

---

## 3. Fitur & Kebutuhan Fungsional

### 3.1 Autentikasi (Auth)
- Register akun baru.
- Login dengan email + password.
- Lupa kata sandi (forgot password).
- Ganti kata sandi.
- Update profil & foto profil.
- Hapus akun.
- **Kredensial demo**: `demo@sadarfinance.com` / `Demo@12345`.

### 3.2 Dashboard (`/dashboard`)
- Greeting personal.
- 5 summary card: total saldo, pemasukan bulan ini, pengeluaran bulan ini, sisa budget, jumlah transaksi.
- Cashflow chart (income vs expense).
- Expense trend chart.
- Spending category donut chart.
- Smart insight & predictive spending alert.
- Recent transactions (5–10 terbaru).
- Quick action (tambah transaksi / income / lihat insight / lihat score).

### 3.3 Catat Keuangan (`/catat-keuangan`)
Dua tab:
- **Transaksi (pengeluaran)**:
  - Input manual (akun, nominal, kategori, tanggal, catatan).
  - Upload struk (OCR): unggah gambar → AI ekstrak merchant/tanggal/nominal/item → pratinjau → autofill form → user edit → simpan.
- **Income (pemasukan)**: input manual (akun, jumlah, tanggal, sumber pemasukan, catatan).

### 3.4 Behavior Insight (`/behavior-insight`)
- Read-only, tanpa form input.
- Weekend vs weekday behavior.
- Kategori dominan.
- Rekomendasi kebiasaan.

### 3.5 Financial Score (`/financial-score`)
- Skor 0–100:
  - `71–100`: Sehat (hijau)
  - `41–70`: Cukup Sehat (jingga)
  - `0–40`: Perlu Perhatian (merah)
- Faktor: rasio tabungan, laju belanja, kepatuhan budget, konsistensi pencatatan, deviasi alokasi.
- Analisis budget 50/30/20.

### 3.6 Profile & Account (`/profile-account` & `/profile-account/edit`)
- Data profil (nama, email, password, foto).
- Kelola akun keuangan: Cash, Bank, E-wallet (CRUD).
- Atur budget bulanan (Needs, Wants, Savings/Investment).
- Riwayat transaksi lengkap (view-only).

### 3.7 Predictive Spending Alert (Background)
- Berjalan otomatis di backend (scheduler), tanpa menu khusus.
- Prediksi overspending → simpan alert → tampil di dashboard & notifikasi.

---

## 4. Kebutuhan Non-Fungsional

| Aspek | Kebutuhan |
|---|---|
| Bahasa UI | Bahasa Indonesia |
| Desain | Clean, modern, profesional, card-based, tidak terlalu AI-heavy |
| Keamanan | JWT, bcrypt (12 rounds), Helmet, CORS, rate limiting |
| Responsif | Mobile & desktop |
| Persistensi login | `localStorage` (refresh tidak logout) |
| Performa | Bundle production di bawah batas wajar, code-splitting saat perlu |

### Color System
| Peran | Warna | Hex |
|---|---|---|
| Primary | Deep Blue | `#1E3A8A` |
| Accent / Tech | Teal | `#14B8A6` |
| Success / Income | Soft Green | `#22C55E` |
| Warning | Orange | `#F59E0B` |
| Background | White / Light Gray | `#FFFFFF` / `#F3F4F6` |

---

## 5. Alur & Acceptance Criteria

### Alur Setelah Login
```
Login berhasil → load data user → Dashboard ditampilkan → user pilih menu
```

### Acceptance Criteria
```
[ ] Setelah login → masuk ke Dashboard
[ ] Dashboard menampilkan data personal finance (bukan bisnis)
[ ] Sidebar hanya berisi 5 menu utama
[ ] Logout ada di profile dropdown (sidenav bawah)
[ ] Dashboard: greeting, summary cards, cashflow, tren, kategori, insight, alert, recent tx, quick action
[ ] Catat Keuangan: tab Transaksi + tab Income
[ ] Upload struk bisa diedit sebelum disimpan
[ ] Behavior Insight: analisis saja, tidak ada form input
[ ] Financial Score: skor, insight, dan rekomendasi saja
[ ] Profile & Account: Data Profil, Account, Budget, Riwayat
[ ] Riwayat Transaksi: view-only
[ ] Tidak ada fitur crypto, sales, invoice, revenue, CRM, atau business dashboard
[ ] Seluruh label UI menggunakan bahasa Indonesia
```

---

## 6. Kategori Transaksi

Sebagai dasar sistem budget **50/30/20**, transaksi dikelompokkan ke dalam 3 bucket utama:

| Bucket | Alokasi Budget | Sisi Sistem (frontend/backend/budget) | Sisi AI (classifier & behavior) |
|---|---|---|---|
| Kebutuhan (Needs) | 50% | `Needs` | `Needs` |
| Keinginan (Wants) | 30% | `Wants` | `Wants` |
| Tabungan (Savings/Investment) | 20% | `Savings` | `Investment` |

> **Catatan penting (mismatch label):** Sistem frontend/backend/budget menggunakan `Savings`, sedangkan model AI (classifier & behavior) menggunakan `Investment` untuk bucket ke-3. Sisi frontend sudah menormalisasi melalui fungsi `toCategoryPrimary`. Sinkronisasi penuh dari sisi AI masih menjadi pekerjaan tim AI/DS.

---

## 7. Struktur Menu & Route

| Menu | Route | Keterangan |
|---|---|---|
| Dashboard | `/dashboard` | Ringkasan & navigasi |
| Catat Keuangan | `/catat-keuangan` | Transaksi + Income |
| Behavior Insight | `/behavior-insight` | Read-only |
| Financial Score | `/financial-score` | Skor kesehatan |
| Profile & Account | `/profile-account` | Profil, akun, budget, riwayat |

Route publik (guest only): `/`, `/login`, `/register`, `/landing`.

---

## 8. Entitas Data

| Entity | Fungsi |
|---|---|
| Users | Data user & auth |
| Account | Sumber uang (Cash, Bank, E-wallet) |
| Transaction | Data pengeluaran |
| Income | Data pemasukan |
| Budget | Batas alokasi budget |
| Insight | Hasil analisis perilaku |
| Alert | Notifikasi risiko overspending |
| Score | Financial score user |
| OcrScan | Audit pemrosesan struk OCR |

---

## 9. Deliverable

1. Frontend Web SPA (React + Vite).
2. Backend REST API (Express + PostgreSQL).
3. AI Microservice (Flask + OCR + ML models).
4. Gateway (nginx) untuk routing.
5. Dokumentasi teknis (README, API reference, design).
