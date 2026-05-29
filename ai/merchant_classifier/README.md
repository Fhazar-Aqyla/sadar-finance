# SADAR Merchant Classifier API

Model Deep Learning untuk klasifikasi `category_detail` transaksi merchant. `category_primary` ditentukan secara rule-based melalui `category_primary_map.json` agar konsisten dengan aturan bisnis.

Untuk database SADAR:
- `category_group` = primary category (`Needs`, `Wants`, `Investment`)
- `category_detail` = detail category (`food`, `groceries`, `transport`, dst.)

Response API tetap menyertakan `category_primary` dan juga alias `category_group` agar mudah diintegrasikan dengan tabel `transactions`.

## Decision Policy

1. Jika rule cocok, aman, tidak ambigu, dan confidence >= 0.9, gunakan dictionary guardrail.
2. Jika rule tidak cukup kuat, gunakan prediksi Deep Learning.
3. Jika confidence model < 0.6, output menjadi `unknown_need_review`.

## Run Local

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Buka:

```text
http://localhost:8000/docs
```

## Render/Railway

Build command:

```bash
pip install -r requirements.txt
```

Start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

## Example Request

```json
{
  "merchant": "Kopi Senja",
  "amount": 35000,
  "date": "2026-05-29 12:30:00",
  "payment_method": "QRIS",
  "payment_media": "mobile_banking",
  "source": "manual"
}
```
