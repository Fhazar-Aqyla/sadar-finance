import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict

import numpy as np
import tensorflow as tf

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

from behavior_model import (
    CATEGORICAL_FEATURES,
    MODEL_VERSION,
    NUMERIC_FEATURES,
    CrossFeatureLayer,
    WeightedBinaryFocalLoss,
    WeightedBinaryCrossentropy,
)


MODEL_PATH = ROOT / "models" / "behavior_best_model.keras"
METADATA_PATH = ROOT / "models" / "behavior_metadata.json"

_MODEL = None
_METADATA = None


def load_behavior_model():
    global _MODEL
    if _MODEL is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Behavior model not found at {MODEL_PATH}. Run `python train_behavior.py` from the ai folder first."
            )
        _MODEL = tf.keras.models.load_model(
            MODEL_PATH,
            custom_objects={
                "CrossFeatureLayer": CrossFeatureLayer,
                "WeightedBinaryFocalLoss": WeightedBinaryFocalLoss,
                "WeightedBinaryCrossentropy": WeightedBinaryCrossentropy,
            },
        )
    return _MODEL


def load_metadata() -> Dict[str, Any]:
    global _METADATA
    if _METADATA is None:
        if METADATA_PATH.exists():
            _METADATA = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
        else:
            _METADATA = {
                "modelVersion": MODEL_VERSION,
                "riskThresholds": {"low": 0.4, "medium": 0.7},
                "budgetRule": {"Needs": 0.5, "Wants": 0.3, "Investment": 0.2},
            }
    return _METADATA


def predict_behavior(payload: Dict[str, Any]) -> Dict[str, Any]:
    model = load_behavior_model()
    metadata = load_metadata()
    features = build_model_features(payload)
    model_input = {
        key: np.array([value], dtype=np.float32 if key in NUMERIC_FEATURES else object)
        for key, value in features.items()
    }
    probability = float(model(model_input, training=False).numpy().reshape(-1)[0])
    risk_level = risk_from_probability(probability, metadata)
    category_primary = features["category_primary"]
    recommendation, recommendation_source = generate_behavior_recommendation(
        probability,
        risk_level,
        category_primary,
        payload,
    )

    return {
        "spikeProbability": round(probability, 4),
        "predictedSpike": probability >= 0.5,
        "riskLevel": risk_level,
        "categoryPrimary": category_primary,
        "budgetBucket": budget_bucket(category_primary, metadata),
        "modelName": metadata.get("bestModel", "behavior_best_model"),
        "modelVersion": metadata.get("modelVersion", MODEL_VERSION),
        "recommendation": recommendation,
        "recommendationSource": recommendation_source,
    }


def build_model_features(payload: Dict[str, Any]) -> Dict[str, Any]:
    transaction_date = parse_date(payload.get("date") or payload.get("transactionDate"))
    amount = float(payload.get("amount", 0) or 0)
    category_primary = normalize_category_primary(
        payload.get("categoryPrimary") or payload.get("category_primary") or payload.get("categoryGroup")
    )
    rolling = float(payload.get("rolling7dSpending") or payload.get("rolling_7d_spending") or amount)

    features = {
        "amount": amount,
        "month": float(transaction_date.month),
        "day": float(transaction_date.day),
        "week": float(transaction_date.isocalendar().week),
        "is_weekend": 1.0 if transaction_date.weekday() >= 5 else 0.0,
        "rolling_7d_spending": rolling,
        "transaction_count": float(payload.get("transactionCount") or payload.get("transaction_count") or 1),
        "merchant": str(payload.get("merchant") or "unknown"),
        "category_detail": str(payload.get("categoryDetail") or payload.get("category_detail") or "unknown"),
        "category_primary": category_primary,
        "payment_method": str(payload.get("paymentMethod") or payload.get("payment_method") or "unknown"),
        "payment_media": str(payload.get("paymentMedia") or payload.get("payment_media") or "unknown"),
        "day_of_week": transaction_date.strftime("%A"),
        "time_of_day": time_of_day(transaction_date.hour),
    }
    return features


def parse_date(value: Any) -> datetime:
    if not value:
        return datetime.now()
    if isinstance(value, datetime):
        return value
    text = str(value).replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(text)
    except ValueError:
        return datetime.strptime(text[:10], "%Y-%m-%d")


def time_of_day(hour: int) -> str:
    if 5 <= hour < 11:
        return "Pagi"
    if 11 <= hour < 15:
        return "Siang"
    if 15 <= hour < 18:
        return "Sore"
    return "Malam"


def normalize_category_primary(value: Any) -> str:
    if not value:
        return "Wants"
    text = str(value).strip().lower()
    mapping = {
        "need": "Needs",
        "needs": "Needs",
        "wants": "Wants",
        "want": "Wants",
        "investment": "Investment",
        "investasi": "Investment",
        "saving": "Investment",
        "savings": "Investment",
    }
    return mapping.get(text, str(value).strip())


def risk_from_probability(probability: float, metadata: Dict[str, Any]) -> str:
    thresholds = metadata.get("riskThresholds", {"low": 0.4, "medium": 0.7})
    if probability >= float(thresholds.get("medium", 0.7)):
        return "high"
    if probability >= float(thresholds.get("low", 0.4)):
        return "medium"
    return "low"


def budget_bucket(category_primary: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
    rule = metadata.get("budgetRule", {"Needs": 0.5, "Wants": 0.3, "Investment": 0.2})
    ratio = float(rule.get(category_primary, rule.get("Wants", 0.3)))
    return {"name": category_primary, "recommendedAllocation": ratio}


def generate_behavior_recommendation(
    probability: float,
    risk_level: str,
    category_primary: str,
    payload: Dict[str, Any],
) -> tuple[str, str]:
    prompt = (
        "Buat rekomendasi finansial singkat dalam Bahasa Indonesia untuk aplikasi SADAR Finance. "
        "Maksimal 2 kalimat, tanpa markdown, tanpa daftar bernomor, dan fokus pada kontrol budget pribadi. "
        f"Risiko transaksi: {risk_level}, probabilitas spike: {probability:.2f}, "
        f"kategori 50/30/20: {category_primary}, nominal: Rp{float(payload.get('amount', 0) or 0):,.0f}."
    )
    generated = _try_generate_ai_text(prompt)
    if generated:
        return generated, "generative-ai"

    if risk_level == "high":
        if category_primary == "Wants":
            return (
                "Transaksi ini berisiko tinggi dan masuk kategori Wants. Coba cek ulang apakah masih sesuai dengan batas 30% budget.",
                "rule-based-fallback",
            )
        return (
            "Transaksi ini terlihat tidak biasa dibanding pola pengeluaran. Pastikan nominal dan prioritasnya sudah sesuai rencana.",
            "rule-based-fallback",
        )
    if risk_level == "medium":
        return (
            "Transaksi ini masih perlu diperhatikan. Pantau sisa budget agar pola pengeluaran tetap sehat.",
            "rule-based-fallback",
        )
    return (
        "Risiko transaksi rendah. Tetap catat transaksi secara konsisten agar insight finansial makin akurat.",
        "rule-based-fallback",
    )


def _try_generate_ai_text(prompt: str) -> str:
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        return ""
    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(os.getenv("GENERATIVE_AI_MODEL", "gemini-3.1-flash-lite"))
        response = model.generate_content(
            prompt,
            generation_config={"temperature": 0.3},
        )
        return _normalize_generated_recommendation(getattr(response, "text", "") or "")
    except Exception:
        return ""


def _normalize_generated_recommendation(text: str) -> str:
    cleaned = re.sub(r"[*_`#>-]", "", text or "")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    if len(cleaned) < 40:
        return ""

    sentences = re.split(r"(?<=[.!?])\s+", cleaned)
    shortened = " ".join(sentence for sentence in sentences[:2] if sentence).strip()
    if len(shortened) < 40 or not re.search(r"[.!?]$", shortened):
        return ""
    return shortened[:320].rstrip()


if __name__ == "__main__":
    sample = {
        "amount": 1500000,
        "date": "2024-12-29T20:00:00",
        "merchant": "Tokopedia",
        "categoryDetail": "shopping",
        "categoryPrimary": "Wants",
        "paymentMethod": "QRIS",
        "paymentMedia": "Gopay",
    }
    print(json.dumps(predict_behavior(sample), indent=2, ensure_ascii=False))
