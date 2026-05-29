# SADAR Merchant Classifier

Merchant classifier dipakai untuk mengisi kategori transaksi saat data baru dibuat dari input manual atau hasil OCR/NLP struk.

## Runtime Location

```text
ai/inference/merchant_classifier.py
ai/models/merchant_classifier/artifacts/
ai/models/merchant_classifier/model/
```

Notebook training disimpan terpisah di:

```text
ai/notebooks/merchant_classifier.ipynb
```

Notebook tidak dibutuhkan oleh runtime Hugging Face dan sudah di-exclude dari Docker upload.

## Endpoint

```http
POST /categorize
```

Contoh request:

```json
{
  "text": "Indomaret minyak goreng",
  "merchant": "Indomaret",
  "amount": 93000,
  "transactionId": "optional",
  "items": []
}
```

Jika `merchant` kosong, service memakai `text` sebagai fallback merchant. Jika `amount` kosong, service memakai `0`.

Contoh response:

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

## Backend Integration

Backend sudah memiliki flow `aiClient.categorize()` yang memanggil endpoint AI `/categorize`.

Untuk MVP, field yang dipakai backend adalah:

- `predictedCategory` atau `categoryGroup` sebagai kategori utama transaksi.
- `confidence` untuk tingkat keyakinan.
- `modelVersion` untuk penanda model.

Field `categoryDetail`, `decisionSource`, dan `needsReview` disediakan untuk pengembangan berikutnya jika backend/frontend ingin menampilkan detail kategori yang lebih spesifik.

## Local Test

```powershell
cd Z:\Dicoding\sadar-finance\ai
.\.venv\Scripts\python.exe app.py
```

```powershell
Invoke-RestMethod `
  -Uri http://localhost:5000/categorize `
  -Method Post `
  -ContentType 'application/json' `
  -Body '{"merchant":"Indomaret","text":"Indomaret minyak goreng","amount":93000}'
```
