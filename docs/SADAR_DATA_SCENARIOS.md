# SADAR Data Scenarios

Frontend SADAR sekarang punya satu saklar untuk memilih sumber data finansial tanpa mengubah mode login.
Login tetap memakai backend selama `VITE_DEFAULTAUTH=sadar`.

## 1. Mock data + login backend

Gunakan skenario ini untuk demo UI, presentasi, atau testing tampilan ketika data backend user masih kosong.
User tetap login memakai backend, tetapi halaman finansial memakai data mock dari frontend.

```env
VITE_DEFAULTAUTH=sadar
VITE_API_URL=http://localhost:5000/api/v1
VITE_SADAR_DATA_SCENARIO=mock-with-backend-auth
```

Yang memakai mock:
- Dashboard SADAR
- Profil & Akun
- Catat pemasukan/pengeluaran
- Insight perilaku
- Skor finansial

Catatan: perubahan data di mode ini hanya simulasi di frontend dan tidak menjadi data permanen backend.

## 2. Data backend + login backend

Gunakan skenario ini untuk development normal dengan akun backend asli.
Login memakai backend dan semua data finansial dibaca dari backend user yang sedang login.

```env
VITE_DEFAULTAUTH=sadar
VITE_API_URL=http://localhost:5000/api/v1
VITE_SADAR_DATA_SCENARIO=backend-with-backend-auth
```

Mode ini cocok untuk menguji alur login, akun, pemasukan, transaksi, anggaran, dan skor memakai data development.

## 3. Pure backend

Gunakan skenario ini untuk staging atau production.
Tidak ada mock data; auth dan semua data finansial wajib berasal dari backend.

```env
VITE_DEFAULTAUTH=sadar
VITE_API_URL=https://sadar-finance.up.railway.app/api/v1
VITE_SADAR_DATA_SCENARIO=backend-only
```

Ini adalah default jika `VITE_SADAR_DATA_SCENARIO` tidak diisi.

## Cara menjalankan

1. Buat atau ubah file `frontend/.env`.
2. Isi variabel sesuai salah satu skenario di atas.
3. Jalankan ulang dev server karena Vite membaca env saat startup.

```bash
cd frontend
npm run dev
```

Untuk build production:

```bash
cd frontend
npm run build
```
