# SADAR Finance — Dokumentasi Sistem

## 1. Gambaran Produk

**SADAR Finance** adalah aplikasi web personal finance yang membantu user mencatat, memahami, dan mengontrol keuangan pribadi secara lebih sadar.

Fungsi utama:
- Mencatat transaksi pengeluaran dan pemasukan
- Melihat ringkasan dan pola keuangan
- Mendapatkan insight, alert, dan financial score

> SADAR Finance membantu user sadar ke mana uang mereka pergi, memahami kebiasaan finansial, dan mengambil keputusan keuangan yang lebih baik.

---

## 2. Scope Sistem

**Mencakup:**
- Auth (login, register, forgot password)
- Dashboard
- Catat Keuangan
- Behavior Insight
- Financial Score
- Profile & Account
- Predictive Spending Alert (background process)
- Logout

**Tidak mencakup:** crypto, investasi, invoice, sales, revenue perusahaan, payroll, CRM, e-commerce, accounting enterprise, dan business analytics.

---

## 3. Prinsip Desain

- Clean, modern, profesional, card-based
- Tidak terlalu AI-heavy — AI cukup muncul sebagai insight, alert, rekomendasi, dan score
- Tidak ada visual robot, chatbot besar, atau tampilan futuristik berlebihan
- Bahasa UI: Indonesia

### Color System

| Peran | Warna | Hex |
|---|---|---|
| Primary | Deep Blue | `#1E3A8A` |
| Accent / Tech | Teal | `#14B8A6` |
| Success / Income | Soft Green | `#22C55E` |
| Warning | Orange | `#F59E0B` |
| Background | White / Light Gray | `#FFFFFF` / `#F3F4F6` |

### Style Card

- Border radius: 12px–20px
- Shadow: soft
- Padding: 20px–24px
- Spacing lega dan konsisten

---

## 4. Struktur Menu & Route

### Sidebar (5 menu utama)

| Menu | Icon | Route |
|---|---|---|
| Dashboard | home / grid | `/dashboard` |
| Catat Keuangan | wallet / receipt | `/catat-keuangan` |
| Behavior Insight | chart / analytics | `/behavior-insight` |
| Financial Score | gauge / score | `/financial-score` |
| Profile & Account | user / settings | `/profile-account` |

> Logout bukan menu utama — letakkan di **Profile Dropdown**.

### Route Auth

```
/auth/login
/auth/register
/auth/forgot-password
```

---

## 5. Layout Global

```
Sidebar | Topbar | Main Content
```

**Topbar** berisi: search input, notification icon, profile dropdown (nama, email, link Profile & Account, Logout).

---

## 6. Alur Setelah Login

```
Login berhasil
   ↓
System load data user (Account, Transaction, Income, Budget, Insight, Alert, Score)
   ↓
Dashboard ditampilkan
   ↓
User memilih menu
```

---

## 7. Halaman Dashboard

Dashboard adalah halaman utama — berfungsi sebagai ringkasan dan navigasi, bukan tempat fitur detail.

### Section & Urutan

| # | Section | Isi |
|---|---|---|
| 1 | Greeting | Sapaan personal + subtext |
| 2 | Summary Cards | 5 metric utama |
| 3 | Cashflow Chart | Income vs Expense bulanan |
| 4 | Expense Trend Chart | Tren pengeluaran harian/mingguan/bulanan |
| 5 | Spending Category | Distribusi kategori pengeluaran |
| 6 | Smart Insight Card | 1–3 insight singkat |
| 7 | Smart Alert Card | Alert overspending |
| 8 | Recent Transactions | Preview 5–10 transaksi terbaru |
| 9 | Quick Action | Shortcut ke fitur utama |

### Greeting

```
Halo, Aqyla
Yuk lihat kondisi keuanganmu hari ini.
```

### Summary Cards

| Card | Contoh |
|---|---|
| Total Saldo | Rp 2.500.000 |
| Pemasukan Bulan Ini | Rp 4.000.000 |
| Pengeluaran Bulan Ini | Rp 1.500.000 |
| Sisa Budget | Rp 800.000 |
| Jumlah Transaksi | 128 transaksi |

### Recent Transactions — Kolom Tabel

```
Nama Transaksi | Kategori | Account | Tanggal | Nominal | Status
```

### Quick Action

```
Tambah Transaksi  |  Tambah Income  |  Lihat Insight  |  Lihat Financial Score
```

---

## 8. Halaman Catat Keuangan

Dua tab: **Transaksi** dan **Income**.

### Tab Transaksi

Field: Pilih Account, Metode Input, Nominal, Kategori, Tanggal, Catatan (opsional), Upload Struk (opsional)

**Flow Manual:**
```
Pilih account → Input data → Validasi → Simpan → Saldo berkurang
```

**Flow Scan/Upload:**
```
Pilih account → Upload struk → System proses → Hasil tampil → User review → Validasi → Simpan → Saldo berkurang
```

> AI cukup disebut sebagai "memproses struk" di UI. Hasil scan bisa diedit sebelum disimpan.

### Tab Income

Field: Pilih Account, Jumlah, Tanggal, Sumber Pemasukan, Catatan (opsional)

**Flow:**
```
Pilih account → Input data → Validasi → Simpan → Saldo bertambah
```

> Income tidak perlu scan struk atau AI.

---

## 9. Halaman Behavior Insight

Halaman analisis pola keuangan — bersifat read-only, tidak ada form input.

**Section yang disarankan:**
- Ringkasan insight perilaku
- Grafik pola pengeluaran
- Kategori dominan
- Weekend vs Weekday
- Kebiasaan finansial
- Rekomendasi ringan

**Flow:**
```
Ambil data Transaction + Income → AI analisis pola → Simpan ke Insight → Tampilkan ke user
```

---

## 10. Halaman Financial Score

**Section yang disarankan:**
- Skor finansial (0–100)
- Status kondisi keuangan
- Faktor pembentuk skor
- Insight dan rekomendasi
- History score

**Status:**

| Range | Label |
|---|---|
| 0–40 | Perlu Perhatian |
| 41–70 | Cukup Sehat |
| 71–100 | Sehat |

**Flow:**
```
Ambil data Transaction + Income + Budget → AI hitung score → Simpan ke Score → Tampilkan ke user
```

---

## 11. Halaman Profile & Account

Empat section:

### Data Profil
Field: Nama, Email, Password, Foto Profil

### Kelola Account
Tipe: Cash, Bank, E-wallet — bisa tambah, edit, hapus

### Atur Budget
Field: Needs, Wants, Savings, Budget per kategori

### Riwayat Transaksi
View-only — tidak ada save, tidak ada konfirmasi tersimpan.

**Flow Riwayat:**
```
Pilih Riwayat Transaksi → System ambil data → Tampilkan → User lihat
```

---

## 12. Logout

Letakkan di **Profile Dropdown**, bukan sidebar.

**Flow:**
```
Klik Logout → Konfirmasi → Hapus session → Redirect ke Login
Batal → Kembali ke Dashboard
```

---

## 13. Predictive Spending Alert (Background Process)

Berjalan otomatis di backend, tidak ada menu untuk ini.

**Flow:**
```
Scheduler backend berjalan otomatis
   ↓
Ambil data Transaction + Budget
   ↓
AI prediksi potensi overspending
   ↓
Terdeteksi? → Simpan Alert → Tampil di Dashboard & Notification
Tidak terdeteksi? → Scheduler lanjut berjalan
```

---

## 14. Data Entity

| Entity | Fungsi |
|---|---|
| Users | Data user dan auth |
| Account | Sumber uang (Cash, Bank, E-wallet) |
| Transaction | Data pengeluaran |
| Income | Data pemasukan |
| Budget | Batas alokasi budget |
| Insight | Hasil analisis perilaku |
| Alert | Notifikasi risiko overspending |
| Score | Financial score user |

### Mapping ke Fitur

| Fitur | Entity yang digunakan |
|---|---|
| Dashboard | Users, Account, Transaction, Income, Budget, Insight, Alert, Score |
| Catat Keuangan | Account, Transaction, Income |
| Behavior Insight | Transaction, Income, Insight |
| Financial Score | Transaction, Income, Budget, Score |
| Profile & Account | Users, Account, Budget, Transaction |
| Smart Alert | Transaction, Budget, Alert |

---

## 15. Sample Data Shape

```json
// User
{ "id": "user_001", "name": "Aqyla", "email": "aqyla@example.com", "avatar": "/images/avatar.png" }

// Account
{ "id": "acc_001", "user_id": "user_001", "name": "GoPay", "type": "E-wallet", "balance": 1250000 }

// Transaction
{ "id": "trx_001", "user_id": "user_001", "account_id": "acc_001", "name": "Kopi Kenangan",
  "category": "Makanan", "amount": 35000, "date": "2026-05-12", "status": "Selesai" }

// Income
{ "id": "inc_001", "user_id": "user_001", "account_id": "acc_001",
  "source": "Gaji", "amount": 4000000, "date": "2026-05-01" }

// Budget
{ "id": "bdg_001", "user_id": "user_001", "category": "Makanan", "limit": 1000000, "used": 800000 }

// Insight
{ "id": "ins_001", "user_id": "user_001", "title": "Pengeluaran makanan meningkat",
  "description": "Pengeluaran makanan kamu meningkat dibanding minggu lalu.", "type": "behavior" }

// Alert
{ "id": "alt_001", "user_id": "user_001", "title": "Budget hampir habis",
  "message": "Budget makanan sudah mencapai 80%.", "level": "warning" }

// Score
{ "id": "scr_001", "user_id": "user_001", "score": 72, "status": "Cukup Sehat",
  "recommendation": "Kurangi pengeluaran makanan di akhir pekan." }
```

---

## 16. Mapping Komponen Velzon

| Kebutuhan SADAR | Komponen Velzon |
|---|---|
| Sidebar | Vertical sidebar |
| Topbar | Header / topbar |
| Summary cards | Dashboard statistic cards |
| Cashflow chart | ApexCharts bar / area |
| Expense trend | ApexCharts line / area |
| Category distribution | Donut / pie chart |
| Smart Insight | Info card / alert card |
| Smart Alert | Warning alert card |
| Recent Transactions | Data table |
| Catat Keuangan | Tabs + form card |
| Profile | Profile / settings card |
| Notification | Notification dropdown |

> Velzon = template UI. SADAR Finance = isi, alur, fitur, dan konteks. Jangan gunakan konten bawaan Velzon yang konteksnya sales, invoice, crypto, CRM, atau business admin.

---

## 17. Acceptance Criteria

```
[ ] Setelah login → masuk ke Dashboard
[ ] Dashboard menampilkan data personal finance (bukan bisnis)
[ ] Sidebar hanya berisi 5 menu utama
[ ] Logout ada di profile dropdown
[ ] Dashboard: greeting, summary cards, cashflow, tren, kategori, insight, alert, recent tx, quick action
[ ] Catat Keuangan: tab Transaksi + tab Income
[ ] Behavior Insight: analisis saja, tidak ada form input
[ ] Financial Score: skor, insight, dan rekomendasi saja
[ ] Profile & Account: Data Profil, Account, Budget, Riwayat
[ ] Riwayat Transaksi: view-only, tidak ada save/konfirmasi
[ ] Tidak ada fitur crypto, sales, invoice, revenue, CRM, atau business dashboard
[ ] Desain clean, modern, tidak AI-heavy
[ ] Seluruh label UI menggunakan bahasa Indonesia
```
