import os
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()
from inference.ocr import extract_text_from_image
from inference.behavior import predict_behavior
from inference.merchant_classifier import categorize_transaction
from inference.overspending_forecast import predict_overspending
from preprocessing.receipt_nlp import parse_receipt_text


app = Flask(__name__)
CORS(app)


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

    if not image_path and "image" in request.files:
        image_file = request.files["image"]
        upload_dir = Path("tmp_uploads")
        upload_dir.mkdir(exist_ok=True)
        image_path = upload_dir / image_file.filename
        image_file.save(image_path)

    try:
        if not raw_text:
            if not image_path:
                return jsonify({"success": False, "error": "imagePath, rawText, or image file is required"}), 400
            raw_text = extract_text_from_image(str(image_path), payload.get("lang"))

        result = parse_receipt_text(raw_text)
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
