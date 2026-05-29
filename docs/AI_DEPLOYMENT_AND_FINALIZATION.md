# SADAR Finance AI to Backend Integration Guide

Dokumen ini adalah handoff dari tim AI ke tim backend. Fokusnya bukan cara membuat Hugging Face Space, tetapi bagaimana hasil kerja di folder `ai/` dipakai oleh backend SADAR Finance.

AI service yang dipakai:

```env
AI_SERVICE_URL=https://sadar-finance-sadar-finance-ai.hf.space
AI_SERVICE_TIMEOUT_MS=30000
AI_MOCK_MODE=false
```

## 1. Arsitektur Integrasi

Frontend tidak memanggil Hugging Face langsung. Semua fitur AI lewat backend.

```txt
Frontend
  -> Backend Express API
    -> AI service Hugging Face
    -> PostgreSQL
```

Alasan backend tetap menjadi pintu utama:

- Token user dan authorization tetap dikontrol backend.
- AI result bisa dinormalisasi sebelum masuk frontend/database.
- Kalau AI service sleep, limit, atau error, backend bisa fallback tanpa membuat frontend rusak.
- API key seperti Gemini tidak pernah masuk frontend.

File backend utama:

```txt
backend/services/aiClient.service.js
backend/services/analytics.service.js
backend/services/ocr.service.js
backend/routes/analytics.routes.js
backend/routes/ocr.routes.js
```

## 2. Endpoint AI Yang Sudah Siap

AI Flask service di folder `ai/` sekarang menyediakan:

```txt
GET  /health
POST /ocr
POST /nlp/receipt
POST /behavior/predict
POST /categorize
```

Status fitur:

| Fitur AI | Endpoint AI | Status | Dipakai Backend Untuk |
|---|---|---|---|
| OCR struk | `POST /ocr` | Siap | Upload struk, ekstrak raw text dan data transaksi |
| NLP receipt | `POST /nlp/receipt` | Siap | Parse raw text struk tanpa upload gambar |
| Behavior spike | `POST /behavior/predict` | Siap | Halaman Behavior Insight / prediksi risiko transaksi |
| Merchant classifier | `POST /categorize` | Siap | Kategori otomatis saat transaksi/OCR masuk |
| Overspending | belum ada endpoint AI final | Backend fallback | Untuk demo masih rule/moving average di backend |
| Insights generatif | belum final | Opsional | Bisa ditambah nanti sebagai `/insights` |

## 3. Environment Backend

Di `.env` backend lokal atau Railway variables:

```env
AI_SERVICE_URL=https://sadar-finance-sadar-finance-ai.hf.space
AI_SERVICE_TIMEOUT_MS=30000
AI_MOCK_MODE=false
```

Catatan penting:

- `AI_SERVICE_URL` jangan ditambah `/api/v1`.
- `AI_MOCK_MODE=false` wajib agar backend tidak memakai mock.
- Timeout 30 detik dipakai karena Hugging Face free bisa cold start.
- Jika response backend masih `mock-category-v1` atau `mock-behavior`, berarti env backend masih mock atau backend production belum redeploy.

## 4. OCR dan NLP Receipt

### Flow Backend

```txt
POST /api/v1/ocr/upload
  -> backend/services/ocr.service.js
  -> backend/services/aiClient.service.js extractReceipt()
  -> AI POST /ocr
  -> backend simpan ke ocr_scans
  -> optional: backend panggil categorization untuk categoryGroup
```

### Request Backend ke AI

Backend mengirim `multipart/form-data`:

```txt
image=<receipt-file>
scanId=<ocr_scan_id>
imagePath=<local_upload_path>
```

AI juga mendukung JSON fallback untuk test:

```json
{
  "rawText": "INDOMARET\nMinyak Goreng 93000\nTOTAL 93000"
}
```

### Response AI

```json
{
  "success": true,
  "data": {
    "rawText": "teks hasil OCR",
    "data": {
      "merchant": "Indomaret",
      "date": "2026-05-29",
      "items": [
        { "name": "Minyak Goreng", "amount": 93000 }
      ],
      "total": 93000,
      "currency": "IDR"
    },
    "confidence": 0.92
  }
}
```

### Yang Harus Dilakukan Backend

- Simpan `rawText`, `parsedData`, dan `confidence` ke `ocr_scans`.
- Jika `parsedData.data.categoryGroup` kosong, panggil `analyticsService.categorize()`.
- Saat user confirm OCR, gunakan kategori hasil AI sebagai `categoryGroup` transaksi.
- Tetap sediakan fallback parsed data kalau AI service error.

## 5. Merchant Categorization

Merchant classifier sudah dipindahkan dan dirapihkan ke struktur runtime:

```txt
ai/inference/merchant_classifier.py
ai/models/merchant_classifier/artifacts/
ai/models/merchant_classifier/model/
ai/docs/merchant_classifier.md
```

Endpoint AI:

```txt
POST /categorize
```

### Flow Backend

```txt
Manual transaction / OCR parsed transaction
  -> backend analyticsService.categorize()
  -> aiClient.categorize()
  -> AI POST /categorize
  -> backend pakai predictedCategory/categoryGroup
```

### Request Backend ke AI

```json
{
  "text": "Indomaret minyak goreng",
  "merchant": "Indomaret",
  "amount": 93000,
  "transactionId": "optional",
  "items": []
}
```

Field minimal:

- `text` wajib dari sisi backend route saat ini.
- `merchant` opsional, tapi disarankan diisi kalau ada.
- `amount` opsional, tapi disarankan diisi karena model memakai spending level.
- `items` opsional dari OCR.

### Response AI

```json
{
  "success": true,
  "data": {
    "inputText": "Indomaret minyak goreng",
    "merchant": "Indomaret",
    "predictedCategory": "Needs",
    "categoryGroup": "Needs",
    "category_group": "Needs",
    "categoryDetail": "groceries",
    "category_detail": "groceries",
    "confidence": 0.99,
    "needsReview": false,
    "decisionSource": "trusted_dictionary_guardrail",
    "modelVersion": "merchant-classifier-v1",
    "transactionId": "optional"
  }
}
```

### Mapping ke Backend

Untuk MVP:

- `predictedCategory` / `categoryGroup` dipakai sebagai `transactions.category_group`.
- `categoryDetail` belum wajib disimpan jika schema backend belum punya kolom detail.
- `confidence`, `decisionSource`, dan `needsReview` boleh dikirim ke frontend atau log untuk audit.

Backend normalizer yang disarankan:

```js
{
  predictedCategory: payload.predictedCategory || payload.categoryGroup || payload.category_group || 'Other',
  categoryGroup: payload.categoryGroup || payload.category_group || payload.predictedCategory || null,
  categoryDetail: payload.categoryDetail || payload.category_detail || null,
  decisionSource: payload.decisionSource || payload.decision_source || null,
  needsReview: Boolean(payload.needsReview ?? payload.needs_review ?? false),
  confidence: payload.confidence,
  modelVersion: payload.modelVersion || payload.model_version
}
```

### Fallback Backend

Jika AI `/categorize` error:

- backend tetap pakai keyword fallback di `analytics.service.js`;
- response backend harus memberi `source: "rule-based-fallback"`;
- jika AI berhasil, response backend harus memberi `source: "ai-service"`.

## 6. Behavior Spike Prediction

Model behavior sudah siap:

```txt
ai/inference/behavior.py
ai/models/behavior_best_model.keras
ai/models/behavior_metadata.json
```

Endpoint AI:

```txt
POST /behavior/predict
```

Endpoint backend:

```txt
POST /api/v1/analytics/behavior/predict
```

### Request Backend ke AI

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

Field minimal:

- `amount` wajib.
- `categoryPrimary` atau `categoryGroup` disarankan.
- Field lain memperkaya prediksi tapi bisa fallback default.

### Response AI

```json
{
  "success": true,
  "data": {
    "spikeProbability": 0.9978,
    "predictedSpike": true,
    "riskLevel": "high",
    "categoryPrimary": "Wants",
    "budgetBucket": {
      "name": "Wants",
      "recommendedAllocation": 0.3
    },
    "modelName": "mlp",
    "modelVersion": "behavior-spike-v1",
    "recommendation": "Transaksi ini berisiko tinggi...",
    "recommendationSource": "generative-ai"
  }
}
```

### Yang Harus Dilakukan Backend

- Route backend `/api/v1/analytics/behavior/predict` harus memanggil `aiClient.predictBehavior()`.
- Response backend ke frontend harus mempertahankan:
  - `spikeProbability`
  - `predictedSpike`
  - `riskLevel`
  - `categoryPrimary`
  - `budgetBucket`
  - `modelName`
  - `modelVersion`
  - `recommendation`
- Tambahkan `source: "ai-service"` jika AI berhasil.
- Jika AI error, pakai fallback backend dan kirim `source: "rule-based-fallback"`.

## 7. Gemini di Behavior Recommendation

Gemini dipakai hanya untuk membuat teks rekomendasi di behavior model. Prediksi risiko tetap dari TensorFlow.

```txt
TensorFlow behavior model
  -> spikeProbability/riskLevel
  -> Gemini membuat recommendation jika key tersedia
  -> rule-based fallback jika Gemini error/limit/key kosong
```

Secret di Hugging Face AI service:

```env
GEMINI_API_KEY=<secret>
GENERATIVE_AI_MODEL=gemini-2.5-flash
```

Backend tidak perlu menyimpan Gemini key. Backend cukup menerima `recommendation` dan `recommendationSource` dari AI.

Kemungkinan `recommendationSource`:

```txt
generative-ai
rule-based-fallback
```

Catatan backend:

- Jangan jadikan Gemini sebagai syarat sukses request.
- Kalau `recommendationSource=rule-based-fallback`, endpoint tetap dianggap berhasil selama data prediksi ada.
- Jangan expose API key ke frontend.

## 8. Overspending

Status saat ini:

- Backend sudah punya `POST /api/v1/analytics/overspending`.
- Logika masih di backend memakai moving average/budget rule.
- Notebook AI ada di `ai/overspending_modeling.ipynb`.
- Belum ada endpoint AI final.

Untuk MVP, backend tetap memakai implementasi yang ada. Jika nanti model overspending sudah final, kontrak endpoint AI yang disarankan:

```txt
POST /overspending/predict
```

Response target:

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

Saat endpoint ini sudah ada, backend sebaiknya mencoba AI dulu lalu fallback ke logic moving average.

## 9. Backend Acceptance Checklist

### Health AI

```powershell
Invoke-RestMethod `
  -Uri "https://sadar-finance-sadar-finance-ai.hf.space/health" `
  -Method GET
```

Expected:

```json
{
  "success": true,
  "features": [
    "ocr",
    "nlp_receipt_extraction",
    "behavior_spike_prediction",
    "merchant_categorization"
  ]
}
```

### Test Categorize Lewat AI Langsung

```powershell
$body = @{
  text = "Indomaret minyak goreng"
  merchant = "Indomaret"
  amount = 93000
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "https://sadar-finance-sadar-finance-ai.hf.space/categorize" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

Expected:

```json
{
  "success": true,
  "data": {
    "categoryGroup": "Needs",
    "categoryDetail": "groceries",
    "modelVersion": "merchant-classifier-v1"
  }
}
```

### Test Categorize Lewat Backend

```powershell
Invoke-RestMethod `
  -Uri "https://sadar-finance.up.railway.app/api/v1/analytics/categorize" `
  -Method POST `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $body
```

Expected backend:

```json
{
  "success": true,
  "data": {
    "predictedCategory": "Needs",
    "categoryDetail": "groceries",
    "modelVersion": "merchant-classifier-v1",
    "source": "ai-service"
  }
}
```

Jika masih `mock-category-v1`, cek `AI_MOCK_MODE=false` dan redeploy backend.

### Test Behavior Lewat Backend

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

Expected backend:

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

## 10. Current Integration Status

Yang sudah selesai dari sisi AI:

- OCR/NLP service tersedia di Hugging Face.
- Behavior TensorFlow model tersedia di Hugging Face.
- Behavior recommendation sudah bisa memakai Gemini dan fallback rule-based.
- Merchant classifier sudah dirapihkan ke folder `ai/` dan tersedia sebagai `/categorize`.
- AI `/health` sudah menampilkan `merchant_categorization`.

Yang perlu dipastikan tim backend:

- Railway backend memakai kode terbaru yang punya route:
  - `/api/v1/analytics/categorize`
  - `/api/v1/analytics/behavior/predict`
- Railway variables:
  - `AI_SERVICE_URL=https://sadar-finance-sadar-finance-ai.hf.space`
  - `AI_SERVICE_TIMEOUT_MS=30000`
  - `AI_MOCK_MODE=false`
- Response backend untuk categorize bukan lagi `mock-category-v1`.
- Response backend untuk behavior punya `source: "ai-service"`.

## 11. Frontend Impact

Frontend cukup memanggil backend:

```env
VITE_API_URL=https://sadar-finance.up.railway.app/api/v1
```

Halaman yang terdampak:

- `/transactions/input`: OCR/manual transaction bisa memakai kategori dari backend.
- `/behavior-insight`: behavior prediction harus lewat backend `/analytics/behavior/predict`.

Frontend tidak perlu tahu URL Hugging Face dan tidak perlu menyimpan Gemini key.
