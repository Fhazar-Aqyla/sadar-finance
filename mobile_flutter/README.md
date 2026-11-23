# SADAR Finance — Mobile App (Flutter iOS & Android)

Versi aplikasi mobile native (iOS & Android) dari **SADAR Finance** yang terhubung langsung ke backend REST API (`backend/`) dan AI Microservice (`ai/`).

## Arsitektur & Stack
- **Framework**: Flutter (Dart) — Android & iOS
- **State Management**: `flutter_riverpod`
- **Routing**: `go_router` (Auth Guard + Bottom Navigation Shell)
- **Networking**: `dio` (Bearer JWT Interceptor + Error Mapping)
- **Secure Storage**: `flutter_secure_storage` (iOS Keychain & Android EncryptedSharedPreferences)
- **Visualisasi Chart**: `fl_chart` (Cashflow Bar Chart, Expense Trend Line Chart, Category Donut Chart)
- **Kamera & Scan Struk**: `image_picker` (Upload multipart ke `/api/v1/ocr/upload`)

## Fitur Lengkap
1. **Autentikasi**: Splash, Login, Register, Lupa Kata Sandi, Mode Demo (Offline), dan pengaturan URL Server API.
2. **Dashboard**: Total saldo gabungan, pemasukan & pengeluaran bulan ini, sisa budget, skor finansial, Smart Insight, Peringatan Prediktif, grafik Arus Kas 6 bulan, Tren Pengeluaran 7 hari, Distribusi Kategori 50/30/20, dan Transaksi Terbaru.
3. **Catat Keuangan**: Tab Pengeluaran (Input Manual + **Scan Struk Kamera/Galeri OCR**) dan Tab Pemasukan.
4. **Insight Perilaku**: Prediksi risiko lonjakan belanja (DCN + Gemini), perbandingan Hari Kerja vs Akhir Pekan, grafik pengeluaran per hari, kategori dominan, dan proyeksi overspending akhir bulan.
5. **Skor Finansial**: Gauge skor 0–100, filter periode (`2w`, `1m`, `3m`, `6m`, `1y`, `all`), evaluasi formula 50/30/20, breakdown faktor, rekomendasi, dan riwayat skor.
6. **Riwayat Keuangan**: Daftar terpadu pengeluaran & pemasukan, pencarian teks, filter jenis & kategori, serta hapus transaksi.
7. **Profil & Akun**: Edit profil, unggah foto profil, ubah kata sandi, CRUD akun keuangan (Bank, E-Wallet, Tunai), atur target budget 50/30/20, Kebijakan Privasi, Syarat & Ketentuan, dan Logout.

## Cara Menjalankan

```bash
cd mobile_flutter
flutter pub get

# Jalankan dengan backend production (default: https://sadar-finance.web.id/api/v1)
flutter run

# Jalankan dengan backend lokal (Android Emulator)
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api/v1

# Jalankan dengan backend lokal (iOS Simulator)
flutter run --dart-define=API_BASE_URL=http://localhost:3000/api/v1
```

> **Tip**: Kamu juga bisa mengubah URL Server API langsung dari tombol **Server API** di halaman Login, atau klik **Coba Mode Demo (Offline)** untuk langsung mencoba seluruh fitur tanpa perlu menyalakan backend lokal.

## Build Release
```bash
# Android APK / App Bundle
flutter build apk --release
flutter build appbundle --release

# iOS (membutuhkan macOS + Xcode)
flutter build ipa --release
```
