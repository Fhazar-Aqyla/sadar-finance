import os
from pathlib import Path

from flask import Flask, jsonify, render_template_string, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()
from inference.ocr import extract_ocr_result
from inference.behavior import predict_behavior
from inference.merchant_classifier import categorize_transaction
from inference.overspending_forecast import predict_overspending
from preprocessing.receipt_nlp import parse_receipt_text


app = Flask(__name__)
CORS(app)


@app.get("/")
def index():
    return render_template_string(
        r"""
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#07131f">
  <title>SADAR Finance AI</title>
  <style>
    :root{--bg:#07131f;--panel:#0d1d2b;--line:#1e3547;--text:#eef8f5;--muted:#91a8b6;--mint:#39e6ad;--blue:#43a6ff}
    *{box-sizing:border-box} body{margin:0;min-height:100vh;color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;background:radial-gradient(circle at 90% 0,#123e52 0,transparent 35%),radial-gradient(circle at 0 100%,#10382f 0,transparent 28%),var(--bg)}
    main{width:min(1040px,calc(100% - 32px));margin:auto;padding:56px 0 48px}.top{display:flex;justify-content:space-between;gap:24px;align-items:flex-start}.eyebrow{color:var(--mint);font-weight:800;letter-spacing:.16em;font-size:.75rem}.logo{font-size:clamp(2.2rem,6vw,4.7rem);line-height:1;margin:14px 0}.logo span{color:var(--mint)}.lead{max-width:640px;color:var(--muted);font-size:1.05rem;line-height:1.7}.status{display:flex;align-items:center;gap:10px;padding:11px 16px;border:1px solid #28745d;border-radius:999px;background:#0e2a25;color:#b9ffe7;font-weight:700;white-space:nowrap}.dot{width:9px;height:9px;border-radius:50%;background:var(--mint);box-shadow:0 0 16px var(--mint);animation:pulse 1.8s infinite}@keyframes pulse{50%{opacity:.45}}
    .flow{margin:36px 0;padding:20px 24px;border:1px solid var(--line);border-radius:18px;background:#0a1824cc;color:#b9cbd5}.flow b{color:var(--text)}.arrow{color:var(--mint);padding:0 9px}.section-title{margin:34px 0 14px;font-size:1.15rem}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:13px}.card{padding:20px;border:1px solid var(--line);border-radius:16px;background:linear-gradient(145deg,#102331dd,#0a1824dd);transition:.2s}.card:hover{transform:translateY(-2px);border-color:#39708b}.method{display:inline-block;min-width:52px;padding:5px 8px;border-radius:7px;background:#16364b;color:#80c9ff;font-size:.7rem;font-weight:900;text-align:center}.method.post{background:#123b31;color:#70f0c1}.path{margin-left:10px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-weight:700}.desc{margin:12px 0 0;color:var(--muted);font-size:.88rem;line-height:1.5}.foot{display:flex;justify-content:space-between;margin-top:34px;padding-top:20px;border-top:1px solid var(--line);color:#708a99;font-size:.82rem}.bad{background:#391b22;border-color:#803544;color:#ffc5cf}.bad .dot{background:#ff627d;box-shadow:0 0 16px #ff627d}
    @media(max-width:700px){main{padding-top:32px}.top,.foot{flex-direction:column}.grid{grid-template-columns:1fr}.status{align-self:flex-start}.flow{line-height:2}.arrow{padding:0 4px}}
  </style>
</head>
<body><main>
  <div class="top"><div><div class="eyebrow">INTELLIGENT FINANCE SERVICE</div><h1 class="logo">SADAR<span>.</span>AI</h1><p class="lead">Mesin analitik untuk membaca bukti transaksi, mengekstrak teks, mengelompokkan pengeluaran, dan membantu keputusan finansial yang lebih sadar.</p></div><div class="status" id="status"><i class="dot"></i><span>Memeriksa server…</span></div></div>
  <div class="flow"><b>Receipt image</b><span class="arrow">→</span>OCR extraction<span class="arrow">→</span>Structured data<span class="arrow">→</span><b>Finance insight</b></div>
  <h2 class="section-title">Endpoint tersedia</h2>
  <div class="grid">
    <article class="card"><span class="method">GET</span><span class="path">/health</span><p class="desc">Status layanan dan fitur aktif.</p></article>
    <article class="card"><span class="method post">POST</span><span class="path">/ocr</span><p class="desc">Ekstraksi teks dan baris OCR dari gambar struk.</p></article>
    <article class="card"><span class="method post">POST</span><span class="path">/nlp/receipt</span><p class="desc">Mengubah teks struk menjadi kandidat data transaksi.</p></article>
    <article class="card"><span class="method post">POST</span><span class="path">/categorize</span><p class="desc">Klasifikasi merchant dan kategori pengeluaran.</p></article>
    <article class="card"><span class="method post">POST</span><span class="path">/behavior/predict</span><p class="desc">Prediksi anomali atau lonjakan perilaku belanja.</p></article>
    <article class="card"><span class="method post">POST</span><span class="path">/overspending/forecast</span><p class="desc">Perkiraan risiko pengeluaran berlebih akhir bulan.</p></article>
  </div>
  <footer class="foot"><span>SADAR Finance AI Service</span><span>API v1 · Docker Space</span></footer>
</main><script>
fetch('/health').then(r=>{if(!r.ok)throw Error();return r.json()}).then(()=>{document.querySelector('#status span').textContent='Server online'}).catch(()=>{const e=document.querySelector('#status');e.classList.add('bad');e.querySelector('span').textContent='Server bermasalah'})
</script></body></html>
        """
    )


@app.get("/health")
def health():
    return jsonify(
        {
            "success": True,
            "message": "SADAR Finance AI service is running",
            "features": [
                "ocr",
                "nlp_receipt_extraction",
                "behavior_spike_prediction",
                "merchant_categorization",
                "end_month_overspending_forecast",
            ],
        }
    )


@app.post("/ocr")
def process_ocr():
    payload = request.get_json(silent=True) or {}
    image_path = payload.get("imagePath") or payload.get("image_path")
    raw_text = payload.get("rawText") or payload.get("raw_text")

    image_file = request.files.get("file") or request.files.get("image")
    if not image_path and image_file:
        upload_dir = Path("tmp_uploads")
        upload_dir.mkdir(exist_ok=True)
        image_path = upload_dir / image_file.filename
        image_file.save(image_path)

    try:
        if not raw_text:
            if not image_path:
                return jsonify({"success": False, "error": "imagePath, rawText, or image file is required"}), 400
            result = extract_ocr_result(str(image_path), payload.get("lang"))
        else:
            result = {
                "rawText": raw_text,
                "ocrConfidence": None,
                "lines": [{"text": line, "confidence": None} for line in raw_text.splitlines() if line.strip()],
                "ocrSource": "provided_text",
                "modelVersion": "provided-text-v1",
            }
        return jsonify({"success": True, "data": result})
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@app.post("/nlp/receipt")
def process_receipt_text():
    payload = request.get_json(silent=True) or {}
    raw_text = payload.get("rawText") or payload.get("raw_text")
    if not raw_text:
        return jsonify({"success": False, "error": "rawText is required"}), 400

    return jsonify({"success": True, "data": parse_receipt_text(raw_text)})


@app.post("/categorize")
def categorize_transaction_route():
    payload = request.get_json(silent=True) or {}
    text = payload.get("text") or payload.get("inputText") or payload.get("input_text")
    merchant = payload.get("merchant")

    if not text and not merchant:
        return jsonify({"success": False, "error": "text or merchant is required"}), 400

    try:
        result = categorize_transaction(payload)
        return jsonify({"success": True, "data": result})
    except FileNotFoundError as exc:
        return jsonify({"success": False, "error": str(exc)}), 503
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@app.post("/behavior/predict")
def predict_behavior_route():
    payload = request.get_json(silent=True) or {}
    if "amount" not in payload:
        return jsonify({"success": False, "error": "amount is required"}), 400

    try:
        result = predict_behavior(payload)
        return jsonify({"success": True, "data": result})
    except FileNotFoundError as exc:
        return jsonify({"success": False, "error": str(exc)}), 503
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@app.post("/overspending")
@app.post("/overspending/forecast")
def predict_overspending_route():
    payload = request.get_json(silent=True) or {}
    try:
        result = predict_overspending(payload)
        return jsonify({"success": True, "data": result})
    except FileNotFoundError as exc:
        return jsonify({"success": False, "error": str(exc)}), 503
    except ValueError as exc:
        return jsonify({"success": False, "error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=False, use_reloader=False)
