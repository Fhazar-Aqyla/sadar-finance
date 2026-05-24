# Railway Deploy Checklist

Backend ini siap dideploy dari folder `backend`.

## Railway Settings

- Root Directory: `backend`
- Build Command: `npm ci`
- Start Command: `npm start`
- Healthcheck Path: `/health`

## Environment Variables

Wajib:

```env
NODE_ENV=production
JWT_SECRET=isi_dengan_random_secret_panjang
JWT_EXPIRES_IN=7d
DATABASE_URL=${{ Postgres.DATABASE_URL }}
CORS_ORIGINS=https://domain-frontend-kamu.com
```

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

Setelah service backend dan Postgres tersambung, jalankan migrasi dari Railway shell atau local terminal yang punya env production:

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
