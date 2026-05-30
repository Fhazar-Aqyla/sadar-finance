# Railway Deploy Checklist

Backend ini siap dideploy dari folder `backend`.

## Railway Settings

- Root Directory: `backend`
- Build Command: `npm ci`
- Pre-deploy Command: `npm run db:migrate`
- Start Command: `npm start`
- Healthcheck Path: `/health`

Repo ini juga punya `railway.json` di root dan di `backend/`, jadi setting build/deploy akan ikut terbaca otomatis kalau Railway memakai config-as-code.

## Environment Variables

Wajib:

```env
NODE_ENV=production
JWT_SECRET=isi_dengan_random_secret_panjang
JWT_EXPIRES_IN=7d
DATABASE_URL=${{ Postgres.DATABASE_URL }}
CORS_ORIGINS=https://domain-frontend-kamu.vercel.app,https://*.vercel.app
```

Backend otomatis mengizinkan `https://*.vercel.app` saat `NODE_ENV=production`.
Kalau ingin membatasi hanya ke domain final, set `CORS_ALLOW_VERCEL=false` dan isi `CORS_ORIGINS` dengan domain Vercel production saja.

Opsional:

```env
DB_SSL=true
AI_SERVICE_URL=https://domain-ai-service-kamu.com
AI_SERVICE_TIMEOUT_MS=10000
AI_MOCK_MODE=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
MAX_FILE_SIZE_MB=10
UPLOAD_DIR=uploads
```

## Database

Migration sudah dijalankan otomatis lewat pre-deploy command. Kalau perlu menjalankan manual dari Railway shell atau terminal lokal yang punya env production:

```bash
npm run db:migrate
npm run db:seed
```

Seed hanya untuk demo account. Untuk production asli, cukup migration.

## API untuk Frontend

Berikan URL ini ke frontend:

```txt
https://nama-service.up.railway.app/api/v1
```

Frontend mengisinya sebagai:

```env
VITE_API_URL=https://nama-service.up.railway.app/api/v1
```
