# Spesifikasi & Kontrak REST API v1
# SADAR Finance — Backend RESTful API Specification

| Versi API | Base URL | Format Payload | Standar Header Autentikasi |
|---|---|---|---|
| **v1.0.0** | `http://localhost:5000/api/v1` (Lokal) / `https://<api-domain>/api/v1` (Cloud) | `application/json` | `Authorization: Bearer <jwt_token>` |

---

## 1. Standar Amplop Respons (*Response Envelope Format*)

Seluruh respons dari SADAR Finance API dibungkus dalam format standar yang konsisten untuk memudahkan parsing pada sisi frontend:

### 1.1 Format Respons Berhasil (*Success Response Schema*)
```json
{
  "success": true,
  "message": "Transaksi berhasil dibuat",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalRecords": 45,
    "totalPages": 5
  }
}
```

### 1.2 Format Respons Gagal / Error (*Error Response Schema*)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Format nominal tidak valid",
    "details": [
      {
        "field": "amount",
        "message": "Nominal harus bernilai lebih besar dari 0"
      }
    ]
  }
}
```

---

## 2. Modul Autentikasi (`/api/v1/auth`)

### 2.1 Register Pengguna Baru
- **Endpoint**: `POST /auth/register`
- **Autentikasi**: Publik (Tidak Memerlukan Token)
- **Request Body**:
```json
{
  "first_name": "Aqyla",
  "last_name": "Fhazar",
  "email": "aqyla@example.com",
  "password": "Password123!",
  "confirm_password": "Password123!",
  "phone_number": "081234567890",
  "occupation": "Software Engineer"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Registrasi berhasil. Silakan login.",
  "data": {
    "user": {
      "users_id": "8f2a1b90-1e43-4f9e-8c3b-28f0e5b98a12",
      "first_name": "Aqyla",
      "last_name": "Fhazar",
      "email": "aqyla@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2.2 Login Pengguna
- **Endpoint**: `POST /auth/login`
- **Autentikasi**: Publik
- **Request Body**:
```json
{
  "email": "aqyla@example.com",
  "password": "Password123!"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "users_id": "8f2a1b90-1e43-4f9e-8c3b-28f0e5b98a12",
      "first_name": "Aqyla",
      "last_name": "Fhazar",
      "email": "aqyla@example.com",
      "avatar": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2.3 Ambil Profil Pengguna Aktif
- **Endpoint**: `GET /auth/me`
- **Autentikasi**: Wajib JWT
- **Response `200 OK`**: Mengembalikan seluruh atribut pengguna aktif.

---

## 3. Modul Akun Keuangan (`/api/v1/accounts`)

### 3.1 Ambil Semua Akun Finansial Pengguna
- **Endpoint**: `GET /accounts`
- **Autentikasi**: Wajib JWT
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "account_id": "acc_001",
      "account_name": "Dompet Tunai (Cash)",
      "account_number": "-",
      "balance": 500000.00
    },
    {
      "account_id": "acc_002",
      "account_name": "BCA Rekening Utama",
      "account_number": "5270123456",
      "balance": 4500000.00
    },
    {
      "account_id": "acc_003",
      "account_name": "GoPay",
      "account_number": "081234567890",
      "balance": 250000.00
    }
  ]
}
```

### 3.2 Tambah Akun Baru
- **Endpoint**: `POST /accounts`
- **Request Body**:
```json
{
  "account_name": "OVO Digital",
  "account_number": "081234567890",
  "balance": 350000
}
```

---

## 4. Modul Transaksi Pengeluaran (`/api/v1/transactions`)

### 4.1 Ambil Daftar Transaksi
- **Endpoint**: `GET /transactions`
- **Query Params**: `page=1`, `limit=10`, `startDate=2026-05-01`, `endDate=2026-05-31`, `category=Needs`, `search=kopi`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "transaction_id": "trx_001",
      "account_id": "acc_003",
      "account_name": "GoPay",
      "category_group": "Wants",
      "category_detail": "Makanan & Minuman",
      "transaction_date": "2026-05-12T14:30:00.000Z",
      "description": "Kopi Kenangan Grand Indonesia",
      "source": "ocr_scan",
      "amount": 35000.00
    }
  ],
  "pagination": { "page": 1, "limit": 10, "totalRecords": 1 }
}
```

### 4.2 Catat Transaksi Pengeluaran Baru
- **Endpoint**: `POST /transactions`
- **Request Body**:
```json
{
  "account_id": "acc_003",
  "category_group": "Wants",
  "category_detail": "Makanan & Minuman",
  "transaction_date": "2026-05-12T14:30:00.000Z",
  "description": "Kopi Kenangan",
  "amount": 35000,
  "source": "manual"
}
```

---

## 5. Modul Pemasukan / Income (`/api/v1/incomes`)

### 5.1 Catat Pemasukan Baru
- **Endpoint**: `POST /incomes`
- **Request Body**:
```json
{
  "account_id": "acc_002",
  "amount": 8000000,
  "source": "Gaji Bulanan",
  "income_date": "2026-05-01T09:00:00.000Z"
}
```

---

## 6. Modul Pemindaian Struk OCR (`/api/v1/ocr`)

### 6.1 Unggah & Scan Struk Belanja
- **Endpoint**: `POST /ocr/scan`
- **Content-Type**: `multipart/form-data`
- **Form Data Field**: `receipt` (File gambar: PNG, JPG, JPEG)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "ocr_id": "ocr_001",
    "status": "completed",
    "confidence": 0.92,
    "parsed_data": {
      "merchant": "INDOMARET",
      "total_amount": 54500,
      "date": "2026-05-10",
      "suggested_category_group": "Needs",
      "suggested_category_detail": "Belanja Bulanan",
      "items": [
        { "name": "SUSU ULTRA MILK 1L", "price": 21000 },
        { "name": "ROTI TAWAR SARI ROTI", "price": 16500 },
        { "name": "TELUR AYAM 10 BUTIR", "price": 17000 }
      ]
    }
  }
}
```

---

## 7. Modul Analitik & AI Insights (`/api/v1/analytics`)

### 7.1 Ringkasan Data Dashboard Finansial
- **Endpoint**: `GET /analytics/dashboard`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_balance": 5250000.00,
      "total_income_month": 8000000.00,
      "total_expense_month": 2750000.00,
      "remaining_budget": 2250000.00,
      "transaction_count": 42
    },
    "cashflow_monthly": [
      { "month": "2026-03", "income": 7500000, "expense": 3100000 },
      { "month": "2026-04", "income": 8000000, "expense": 3400000 },
      { "month": "2026-05", "income": 8000000, "expense": 2750000 }
    ],
    "category_distribution": [
      { "category_group": "Needs", "amount": 1650000, "percentage": 60.0 },
      { "category_group": "Wants", "amount": 825000, "percentage": 30.0 },
      { "category_group": "Savings", "amount": 275000, "percentage": 10.0 }
    ],
    "recent_transactions": [ ... ],
    "active_insights": [
      {
        "insight_id": "ins_001",
        "title": "Pengeluaran Kategori Makanan Terkendali",
        "description": "Pengeluaran makan minggu ini 15% lebih hemat dibanding minggu sebelumnya."
      }
    ],
    "active_alerts": [
      {
        "alert_id": "alt_001",
        "message": "Budget Kategori Wants telah terpakai 82%. Perhatikan sisa kuota belanja.",
        "alert_type": "budget_exceeded"
      }
    ]
  }
}
```

### 7.2 Hitung Skor Kesehatan Finansial
- **Endpoint**: `GET /analytics/health-score?period=3m`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "score": 78,
    "status": "Sehat",
    "breakdown": {
      "savings_score": { "score": 85, "weight": "35%", "savings_rate": 28.5 },
      "expense_score": { "score": 75, "weight": "30%", "expense_ratio": 62.0 },
      "budget_score": { "score": 80, "weight": "20%", "budget_usage": 74.0 },
      "consistency_score": { "score": 70, "weight": "15%", "active_months": 3 }
    },
    "recommendations": [
      "Pertahankan rasio tabungan di atas 20% setiap bulan.",
      "Tingkatkan alokasi dana darurat sebelum menambah pos hiburan."
    ]
  }
}
```

### 7.3 Analisis Pola Perilaku Keuangan
- **Endpoint**: `GET /analytics/behavior-insights?startDate=2026-05-01&endDate=2026-05-31`
- **Response `200 OK`**: Mengembalikan perbandingan Weekend vs Weekday, Top 5 Kategori dominan, tren gaya hidup finansial (*frugal/balanced/moderate/overspending*).

---

## 8. Tabel Kode Status & Galat (*Status Code Matrix*)

| Kode HTTP | Error Code | Deskripsi | Solusi Frontend |
|---|---|---|---|
| `200 OK` | - | Permintaan berhasil diproses | Render data ke UI |
| `201 Created` | - | Entitas baru berhasil dibuat | Tutup modal form & perbarui tabel |
| `400 Bad Request` | `VALIDATION_ERROR` | Parameter atau body permintaan salah | Tampilkan feedback inline di form |
| `401 Unauthorized` | `UNAUTHORIZED` | Token hilang, salah, atau kedaluwarsa | Redirect ke halaman `/auth/login` |
| `403 Forbidden` | `FORBIDDEN` | Pengguna tidak memiliki hak akses data | Tampilkan alert akses ditolak |
| `404 Not Found` | `NOT_FOUND` | Data transaksi/akun tidak ditemukan | Tampilkan empty state |
| `429 Too Many Requests` | `TOO_MANY_REQUESTS` | Melewati batas rate limiting | Tampilkan pesan jeda waktu coba lagi |
| `500 Internal Error` | `SERVER_ERROR` | Kegagalan internal server | Tampilkan pesan fallback ramah pengguna |
