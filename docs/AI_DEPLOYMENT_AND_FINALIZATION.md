# SADAR Finance AI Deployment and Finalization Guide

Dokumen ini menjelaskan cara menyiapkan satu AI service untuk OCR, behavior spike, insight/categorization, dan rencana overspending model. Target deploy paling hemat adalah Hugging Face Spaces Docker.

## 1. Posisi AI Service Di Arsitektur

Frontend tidak memanggil AI langsung. Flow yang dipakai:

```txt
Frontend Vite
  -> Backend Express
    -> PostgreSQL
    -> AI Flask service
```

Backend tetap menjadi pintu utama aplikasi. AI service hanya dipanggil oleh backend lewat `AI_SERVICE_URL`.

Endpoint backend yang terkait AI:

```txt
POST /api/v1/ocr/upload
POST /api/v1/analytics/categorize
POST /api/v1/analytics/behavior
POST /api/v1/analytics/behavior/predict
POST /api/v1/analytics/overspending
```

Endpoint AI Flask yang sudah ada:

```txt
GET  /health
POST /ocr
POST /nlp/receipt
POST /behavior/predict
```

Endpoint AI yang perlu ditambahkan agar backend tidak selalu fallback:

```txt
POST /categorize
POST /insights
```

Catatan: `POST /api/v1/analytics/overspending` saat ini masih dihitung di backend dengan moving average, jadi belum wajib memakai AI service.

## 2. File Yang Ditaruh Di Hugging Face Spaces

Yang dideploy ke Hugging Face adalah isi folder `ai/`.

Minimal isi folder:

```txt
ai/
  app.py
  Dockerfile
  requirements.txt
  inference/
  preprocessing/
  behavior_model.py
  train_behavior.py
  models/
    behavior_best_model.keras
    behavior_metadata.json
```

Jangan deploy `.env`, `.venv`, `logs`, `tmp_uploads`, dan notebook. File tersebut sudah dikecualikan lewat `ai/.dockerignore`.

## 3. Cara Membuat Hugging Face Space

1. Buka Hugging Face, login dengan satu akun yang akan dipakai untuk service AI.
2. Buat Space baru.
3. Pilih SDK: `Docker`.
4. Upload/push isi folder `ai/` ke repository Space.
5. Pastikan Docker app listen di port `7860`.
6. Setelah build sukses, test:

```txt
https://username-space-name.hf.space/health
```

Hugging Face Docker Spaces memakai port app, default-nya `7860`, dan bisa dikonfigurasi lewat metadata Space. Secrets/variables sebaiknya diatur dari halaman Settings Space, bukan ditulis di kode. Referensi resmi:

- [Docker Spaces](https://huggingface.co/docs/hub/main/spaces-sdks-docker)
- [Spaces Overview](https://huggingface.co/docs/hub/main/spaces-overview)
- [Spaces Configuration Reference](https://huggingface.co/docs/hub/main/spaces-config-reference)

## 4. Environment Variable

Di Hugging Face Space:

```env
PORT=7860
GOOGLE_API_KEY=optional_jika_pakai_gemini
GEMINI_API_KEY=optional_jika_pakai_gemini
GENERATIVE_AI_MODEL=gemini-1.5-flash
```

Di backend production:

```env
AI_SERVICE_URL=https://username-space-name.hf.space
AI_SERVICE_TIMEOUT_MS=30000
AI_MOCK_MODE=false
```

Timeout sebaiknya dinaikkan karena Hugging Face free tier bisa cold start.

## 5. OCR Finalisasi

Status sekarang:

- `POST /ocr` sudah menerima `multipart/form-data` dari backend.
- OCR memakai Tesseract lewat `inference/ocr.py`.
- Hasil OCR diparse oleh `preprocessing/receipt_nlp.py`.
- Dockerfile sudah install `tesseract-ocr`, `tesseract-ocr-eng`, dan `tesseract-ocr-ind`.

Checklist final OCR:

1. Test lokal:

```bash
cd ai
pip install -r requirements.txt
python app.py
```

2. Test health:

```bash
curl http://localhost:5000/health
```

3. Test upload image lewat backend:

```txt
POST /api/v1/ocr/upload
Authorization: Bearer <token>
form-data:
  image=<receipt-file>
```

4. Pastikan response OCR tersimpan di tabel `ocr_scans`.
5. Confirm transaksi:

```txt
POST /api/v1/ocr/:id/confirm-transaction
```

## 6. Behavior Model Finalisasi

Status sekarang:

- Model sudah ada di `ai/models/behavior_best_model.keras`.
- Metadata sudah ada di `ai/models/behavior_metadata.json`.
- Inference sudah ada di `ai/inference/behavior.py`.
- Endpoint Flask sudah ada di `POST /behavior/predict`.
- Backend sudah punya proxy di `POST /api/v1/analytics/behavior/predict`.

Payload contoh ke backend:

```json
{
  "amount": 1500000,
  "transactionDate": "2026-05-26T20:00:00",
  "merchant": "Tokopedia",
  "categoryPrimary": "Wants",
  "categoryDetail": "shopping",
  "paymentMethod": "QRIS",
  "paymentMedia": "Gopay",
  "rolling7dSpending": 2200000,
  "transactionCount": 8
}
```

Output yang diharapkan:

```json
{
  "spikeProbability": 0.82,
  "predictedSpike": true,
  "riskLevel": "high",
  "categoryPrimary": "Wants",
  "budgetBucket": {
    "name": "Wants",
    "recommendedAllocation": 0.3
  },
  "modelVersion": "behavior-spike-v1",
  "recommendation": "..."
}
```

Checklist final behavior:

1. Pastikan model dan metadata ikut ter-push ke Hugging Face Space.
2. Test AI langsung:

```bash
curl -X POST https://username-space-name.hf.space/behavior/predict \
  -H "Content-Type: application/json" \
  -d "{\"amount\":1500000,\"categoryPrimary\":\"Wants\"}"
```

3. Test dari backend:

```txt
POST /api/v1/analytics/behavior/predict
```

## 7. Overspending Finalisasi

Status sekarang:

- Backend sudah punya `POST /api/v1/analytics/overspending`.
- Logika backend memakai moving average 3 bulan, budget limit, dan category risk.
- Notebook training AI ada di `ai/overspending_modeling.ipynb`.
- Belum ada module inference final seperti `ai/inference/overspending.py`.
- Belum ada endpoint AI final seperti `POST /overspending/predict`.

Pilihan implementasi paling aman:

1. Untuk demo awal, pakai backend overspending yang sekarang.
2. Setelah model notebook sudah stabil, ekstrak fungsi inference ke:

```txt
ai/inference/overspending.py
```

3. Simpan model ke:

```txt
ai/models/overspending_best_model.keras
ai/models/overspending_metadata.json
```

4. Tambahkan route Flask:

```python
@app.post("/overspending/predict")
def predict_overspending_route():
    payload = request.get_json(silent=True) or {}
    result = predict_overspending(payload)
    return jsonify({"success": True, "data": result})
```

5. Baru setelah itu ubah backend `predictOverspending` agar mencoba AI dulu, lalu fallback ke moving average.

Target output overspending:

```json
{
  "overspendingProbability": 0.81,
  "predictedOverspending": true,
  "riskLevel": "high",
  "categoryPrimary": "Wants",
  "budgetUsageRatio": 1.2,
  "modelVersion": "overspending-v1",
  "recommendation": "Risiko overspending tinggi..."
}
```

## 8. Categorize dan Insights Finalisasi

Backend sudah memanggil:

```txt
POST /categorize
POST /insights
```

Tapi AI Flask belum punya route itu. Agar backend tidak fallback terus, tambahkan route sederhana di `ai/app.py`.

Minimal `/categorize`:

```python
@app.post("/categorize")
def categorize_route():
    payload = request.get_json(silent=True) or {}
    text = payload.get("text", "")
    parsed = parse_receipt_text(text)
    category = parsed.get("data", {}).get("category") or "other"
    confidence = parsed.get("data", {}).get("categoryConfidence") or 0.55
    return jsonify({
        "success": True,
        "data": {
            "inputText": text,
            "predictedCategory": category,
            "confidence": confidence,
            "modelVersion": "receipt-keyword-v1",
            "transactionId": payload.get("transactionId")
        }
    })
```

Minimal `/insights`:

```python
@app.post("/insights")
def insights_route():
    payload = request.get_json(silent=True) or {}
    spending_trend = payload.get("spendingTrend", "stable")
    savings_rate = payload.get("savingsRate", 0)
    return jsonify({
        "success": True,
        "data": {
            "insights": [
                {
                    "title": f"Spending Trend: {spending_trend}",
                    "description": f"Savings rate kamu berada di {savings_rate}% pada periode ini."
                }
            ],
            "alerts": [],
            "recommendations": [],
            "modelVersion": "insight-rule-v1"
        }
    })
```

Untuk final product, endpoint `/insights` boleh memakai Gemini jika `GOOGLE_API_KEY` tersedia, lalu fallback ke rule-based kalau key tidak ada.

## 9. Backend Integration

Setelah AI Space online, isi env backend:

```env
AI_SERVICE_URL=https://username-space-name.hf.space
AI_SERVICE_TIMEOUT_MS=30000
AI_MOCK_MODE=false
```

Restart backend, lalu test:

```bash
curl https://username-space-name.hf.space/health
```

Jika `health` sukses tapi backend masih fallback, cek:

- URL `AI_SERVICE_URL` tidak boleh diakhiri path `/api`.
- AI route harus cocok: `/ocr`, `/categorize`, `/insights`, `/behavior/predict`.
- Timeout backend cukup panjang.
- Hugging Face Space tidak sedang sleep/cold start.

## 10. Status Integrasi Railway

Status saat ini untuk halaman frontend `http://localhost:5173/behavior-insight`:

- Hugging Face AI service sudah hidup.
- Endpoint Hugging Face `POST /behavior/predict` sudah bisa dipanggil.
- Backend lokal sudah berhasil memanggil model behavior di Hugging Face.
- Frontend sudah diarahkan agar memanggil backend lewat `POST /api/v1/analytics/behavior/predict`.

Yang belum:

Backend Railway belum ter-update dengan kode route ini:

```txt
/api/v1/analytics/behavior/predict
```

Env Railway juga perlu:

```env
AI_SERVICE_URL=https://sadar-finance-sadar-finance-ai.hf.space
AI_SERVICE_TIMEOUT_MS=30000
AI_MOCK_MODE=false
```

Selama backend Railway belum punya route tersebut, halaman `behavior-insight` yang memakai `VITE_API_URL=https://sadar-finance.up.railway.app/api/v1` belum bisa membaca model behavior dari Hugging Face.

## 11. Railway Test

Gunakan bagian ini sebagai checklist test setelah backend terbaru dideploy ke Railway.

### 11.1 Variable Railway Yang Wajib Ada

Di Railway project backend, buka service backend lalu masuk ke `Variables`. Tambahkan atau update:

```env
AI_SERVICE_URL=https://sadar-finance-sadar-finance-ai.hf.space
AI_SERVICE_TIMEOUT_MS=30000
AI_MOCK_MODE=false
```

Setelah variable disimpan, redeploy/restart backend Railway.

### 11.2 Test Health Hugging Face

Pastikan AI Space masih hidup:

```powershell
Invoke-RestMethod `
  -Uri "https://sadar-finance-sadar-finance-ai.hf.space/health" `
  -Method GET
```

Expected:

```json
{
  "success": true,
  "message": "SADAR Finance AI service is running"
}
```

### 11.3 Test Route Behavior Di Backend Railway

Login ke backend Railway untuk mengambil token:

```powershell
$loginBody = @{
  email = "demo@sadarfinance.com"
  password = "Demo@12345"
} | ConvertTo-Json

$login = Invoke-RestMethod `
  -Uri "https://sadar-finance.up.railway.app/api/v1/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $loginBody

$token = $login.data.token
```

Panggil behavior predict lewat backend Railway:

```powershell
$behaviorBody = @{
  amount = 1500000
  transactionDate = "2026-05-26T20:00:00"
  merchant = "Tokopedia"
  categoryPrimary = "Wants"
  categoryDetail = "shopping"
  paymentMethod = "QRIS"
  paymentMedia = "Gopay"
  rolling7dSpending = 2200000
  transactionCount = 8
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "https://sadar-finance.up.railway.app/api/v1/analytics/behavior/predict" `
  -Method POST `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $behaviorBody
```

Expected response harus mengandung:

```json
{
  "success": true,
  "data": {
    "modelName": "mlp",
    "modelVersion": "behavior-spike-v1",
    "source": "ai-service"
  }
}
```

Jika response masih `NOT_FOUND`, berarti kode backend Railway belum terdeploy dengan route `/api/v1/analytics/behavior/predict`.

Jika response `source` menjadi `rule-based-fallback`, berarti route backend sudah ada tetapi backend Railway belum berhasil memanggil Hugging Face. Cek variable `AI_SERVICE_URL`, timeout, dan log Railway.

### 11.4 Test Dari Frontend

Pastikan frontend memakai backend Railway:

```env
VITE_DEFAULTAUTH=sadar
VITE_API_URL=https://sadar-finance.up.railway.app/api/v1
```

Restart dev server frontend, lalu buka:

```txt
http://localhost:5173/behavior-insight
```

Di log Hugging Face container, harus muncul request:

```txt
POST /behavior/predict 200
```

Kalau log Hugging Face belum menunjukkan `POST /behavior/predict`, berarti request frontend belum sampai ke backend Railway terbaru atau backend Railway belum memanggil AI service.

## 12. Urutan Kerja Yang Disarankan

1. Deploy AI OCR + behavior dulu.
2. Sambungkan backend ke AI Space.
3. Test OCR upload dari frontend sampai masuk database.
4. Test behavior predict dari frontend/backend.
5. Tambahkan `/categorize` dan `/insights` di AI Flask.
6. Biarkan overspending tetap backend rule/moving average untuk demo.
7. Setelah demo aman, ekstrak `overspending_modeling.ipynb` menjadi `inference/overspending.py`.
8. Baru integrasikan overspending AI ke backend dengan fallback.

## 13. Catatan Budget

Hugging Face Spaces free cocok untuk demo karena bisa menjalankan Docker + Tesseract + TensorFlow, tapi cold start bisa lambat saat service idle. Untuk production yang harus selalu cepat, pindahkan AI service ke VPS kecil atau paid runtime.
