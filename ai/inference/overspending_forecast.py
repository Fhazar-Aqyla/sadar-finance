import math
from pathlib import Path
from typing import Any, Dict, Iterable, List

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "models" / "overspending_forecast" / "end_month_overspending_multitask_mlp_tf218.keras"
MODEL_VERSION = "end-month-overspending-multitask-mlp-v1"
MODEL_INPUT_SIZE = 61

_MODEL = None


def predict_overspending(payload: Dict[str, Any]) -> Dict[str, Any]:
    feature_vector = _extract_feature_vector(payload)
    if feature_vector is not None:
        probability, model_estimated_amount = _predict_with_model(feature_vector)
        return _build_response(payload, probability, model_estimated_amount, "multitask-mlp")

    probability, estimated_amount = _business_forecast(payload)
    return _build_response(payload, probability, estimated_amount, "business-policy-fallback")


def _extract_feature_vector(payload: Dict[str, Any]) -> List[float] | None:
    candidates = [
        payload.get("featureVector"),
        payload.get("feature_vector"),
        payload.get("featuresVector"),
        payload.get("features_vector"),
        payload.get("features"),
    ]
    vector = next((item for item in candidates if isinstance(item, list)), None)
    if vector is None:
        return None
    if len(vector) != MODEL_INPUT_SIZE:
        raise ValueError(f"featureVector must contain exactly {MODEL_INPUT_SIZE} numeric values")
    return [_safe_float(value) for value in vector]


def _predict_with_model(feature_vector: Iterable[float]) -> tuple[float, float]:
    model = _load_model()
    input_array = np.array([list(feature_vector)], dtype=np.float32)
    probability_output, amount_output = model.predict(input_array, verbose=0)
    probability = float(np.ravel(probability_output)[0])
    amount = max(float(np.expm1(np.ravel(amount_output)[0])), 0.0)
    return max(0.0, min(probability, 1.0)), amount


def _load_model():
    global _MODEL
    if _MODEL is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Overspending model not found at {MODEL_PATH}")

        import tensorflow as tf

        @tf.keras.utils.register_keras_serializable(package="SADAR")
        class ResidualDenseBlock(tf.keras.layers.Layer):
            def __init__(self, units: int, dropout_rate: float = 0.15, **kwargs):
                super().__init__(**kwargs)
                self.units = units
                self.dropout_rate = dropout_rate
                self.dense1 = tf.keras.layers.Dense(
                    units,
                    activation="relu",
                    kernel_regularizer=tf.keras.regularizers.l2(1e-5),
                )
                self.bn1 = tf.keras.layers.BatchNormalization()
                self.dropout1 = tf.keras.layers.Dropout(dropout_rate)
                self.dense2 = tf.keras.layers.Dense(
                    units,
                    activation=None,
                    kernel_regularizer=tf.keras.regularizers.l2(1e-5),
                )
                self.bn2 = tf.keras.layers.BatchNormalization()
                self.activation = tf.keras.layers.Activation("relu")
                self.proj = None

            def build(self, input_shape):
                if int(input_shape[-1]) != self.units:
                    self.proj = tf.keras.layers.Dense(self.units, activation=None)
                super().build(input_shape)

            def call(self, inputs, training=False):
                residual = inputs if self.proj is None else self.proj(inputs)
                x = self.dense1(inputs)
                x = self.bn1(x, training=training)
                x = self.dropout1(x, training=training)
                x = self.dense2(x)
                x = self.bn2(x, training=training)
                return self.activation(x + residual)

            def get_config(self):
                config = super().get_config()
                config.update({"units": self.units, "dropout_rate": self.dropout_rate})
                return config

        _MODEL = tf.keras.models.load_model(
            MODEL_PATH,
            compile=False,
            safe_mode=False,
            custom_objects={
                "ResidualDenseBlock": ResidualDenseBlock,
                "SADAR>ResidualDenseBlock": ResidualDenseBlock,
            },
        )
    return _MODEL


def _business_forecast(payload: Dict[str, Any]) -> tuple[float, float]:
    budget = max(
        _safe_float(payload.get("budgetLimit") or payload.get("budget_limit") or payload.get("effectiveBudget")),
        1.0,
    )
    predicted_amount = _safe_float(payload.get("predictedAmount") or payload.get("predicted_amount"))
    if predicted_amount <= 0:
        trend = payload.get("expenseTrend") or payload.get("trend") or []
        values = [_safe_float(item.get("total") if isinstance(item, dict) else item) for item in trend]
        values = [value for value in values if value > 0]
        predicted_amount = (sum(values) / len(values) * 1.1) if values else 0.0

    current_spending = _safe_float(
        payload.get("spendingToDate") or payload.get("spending_to_date") or payload.get("currentSpending")
    )
    estimate = max(predicted_amount, current_spending)
    ratio = estimate / budget if budget else 0.0
    probability = 1.0 / (1.0 + math.exp(-5.0 * (ratio - 1.0)))
    return probability, max(estimate - budget, 0.0)


def _build_response(
    payload: Dict[str, Any],
    probability: float,
    estimated_overspending_amount: float,
    source: str,
) -> Dict[str, Any]:
    budget = max(
        _safe_float(payload.get("budgetLimit") or payload.get("budget_limit") or payload.get("effectiveBudget")),
        0.0,
    )
    predicted_amount = _safe_float(payload.get("predictedAmount") or payload.get("predicted_amount"))
    if predicted_amount <= 0 and budget > 0:
        predicted_amount = budget + estimated_overspending_amount

    risk_level = _risk_level(probability, estimated_overspending_amount, budget)
    material_over_amount = max(1000.0, budget * 0.01)
    will_overspend = probability >= 0.5 or estimated_overspending_amount >= material_over_amount

    return {
        "willOverspend": will_overspend,
        "will_overspend": will_overspend,
        "overspendingProbability": round(probability, 4),
        "overspending_probability": round(probability, 4),
        "predictedAmount": round(predicted_amount, 2),
        "predicted_amount": round(predicted_amount, 2),
        "estimatedOverspendingAmount": round(estimated_overspending_amount, 2),
        "estimated_overspending_amount": round(estimated_overspending_amount, 2),
        "budgetLimit": budget,
        "budget_limit": budget,
        "riskLevel": risk_level,
        "risk_level": risk_level,
        "recommendation": _recommendation(risk_level, estimated_overspending_amount),
        "modelName": source,
        "model_name": source,
        "modelVersion": MODEL_VERSION,
        "model_version": MODEL_VERSION,
    }


def _risk_level(probability: float, over_amount: float, budget: float) -> str:
    over_ratio = over_amount / budget if budget > 0 else 0.0
    if probability >= 0.85 or over_ratio >= 0.3:
        return "critical"
    if probability >= 0.7 or over_ratio >= 0.1:
        return "high"
    if probability >= 0.45:
        return "medium"
    return "low"


def _recommendation(risk_level: str, over_amount: float) -> str:
    if risk_level in {"critical", "high"}:
        return (
            f"Risiko overspending akhir bulan tinggi. Kurangi pengeluaran fleksibel dan sisihkan sekitar "
            f"Rp{over_amount:,.0f} agar tetap dekat dengan budget."
        )
    if risk_level == "medium":
        return "Budget masih bisa dikendalikan, tapi laju pengeluaran perlu dipantau sampai akhir bulan."
    return "Risiko overspending rendah. Pertahankan pola pengeluaran saat ini dan tetap catat transaksi."


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None or value == "":
            return default
        parsed = float(value)
        if math.isnan(parsed) or math.isinf(parsed):
            return default
        return parsed
    except (TypeError, ValueError):
        return default
