from pathlib import Path
import json
import re
import tempfile
import unicodedata
import zipfile
from typing import Any, Dict, Optional

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers


MODEL_VERSION = "merchant-classifier-v1"


@tf.keras.utils.register_keras_serializable(package="SADAR")
class GatedFeatureFusion(layers.Layer):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.gate_dense = None

    def build(self, input_shape):
        total_dim = int(sum(shape[-1] for shape in input_shape))
        self.gate_dense = layers.Dense(total_dim, activation="sigmoid")
        super().build(input_shape)

    def call(self, inputs):
        x = tf.concat(inputs, axis=-1)
        gate = self.gate_dense(x)
        return x * gate

    def get_config(self):
        return super().get_config()


def normalize_text(text):
    if text is None or (isinstance(text, float) and np.isnan(text)):
        return "unknown"
    text = str(text).lower().strip()
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text if text else "unknown"


def infer_spending_level(amount):
    amount = float(amount or 0)
    if amount < 50000:
        return "low"
    if amount < 300000:
        return "medium"
    return "high"


def infer_time_of_day(hour):
    try:
        hour = int(hour)
    except Exception:
        hour = 0
    if 5 <= hour < 11:
        return "pagi"
    if 11 <= hour < 15:
        return "siang"
    if 15 <= hour < 18:
        return "sore"
    return "malam"


def keyword_matches(merchant_clean, keyword, match_type):
    if not keyword:
        return False
    keyword = normalize_text(keyword)
    if match_type == "exact":
        return merchant_clean == keyword
    if match_type == "starts_with":
        return merchant_clean.startswith(keyword)
    if len(keyword) <= 3:
        return re.search(rf"(?<![a-z0-9]){re.escape(keyword)}(?![a-z0-9])", merchant_clean) is not None
    return keyword in merchant_clean


def _safe_float(value, fallback=0.0):
    try:
        parsed = float(value)
        if np.isnan(parsed):
            return fallback
        return parsed
    except Exception:
        return fallback


class SADARMerchantClassifier:
    def __init__(self, base_dir: Optional[str] = None):
        default_base = Path(__file__).resolve().parents[1] / "models" / "merchant_classifier"
        self.base_dir = Path(base_dir) if base_dir else default_base
        self.metadata_path = self.base_dir / "artifacts" / "metadata.json"
        self.rules_path = self.base_dir / "artifacts" / "dictionary_rules.json"
        self.label_path = self.base_dir / "artifacts" / "label_classes.json"
        self.primary_map_path = self.base_dir / "artifacts" / "category_primary_map.json"

        self._load_artifacts()

    def _load_json(self, path):
        if not path.exists():
            raise FileNotFoundError(f"Required artifact not found: {path}")
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _load_artifacts(self):
        self.metadata = self._load_json(self.metadata_path)
        self.rules_payload = self._load_json(self.rules_path)
        self.dictionary_rules = self.rules_payload.get("rules", [])
        self.label_classes = self._load_json(self.label_path)
        self.category_primary_map = self._load_json(self.primary_map_path)

        self.trusted_rule_threshold = float(self.metadata.get("trusted_rule_threshold", 0.90))
        self.model_review_threshold = float(self.metadata.get("model_review_threshold", 0.60))
        self.numeric_features = self.metadata["numeric_features"]
        self.categorical_features = self.metadata["categorical_features"]
        self.numeric_mean = self.metadata["numeric_mean"]
        self.numeric_std = self.metadata["numeric_std"]

        model_path = self.base_dir / self.metadata["model_keras_file"]
        if not model_path.exists():
            raise FileNotFoundError(f"Model .keras not found: {model_path}")
        self.model = self._load_keras_model(model_path)

    def _load_keras_model(self, model_path):
        try:
            return keras.models.load_model(
                model_path,
                custom_objects={"GatedFeatureFusion": GatedFeatureFusion},
                compile=False,
            )
        except TypeError as exc:
            if "quantization_config" not in str(exc):
                raise
            return self._load_sanitized_keras_model(model_path)

    def _load_sanitized_keras_model(self, model_path):
        with tempfile.NamedTemporaryFile(suffix=".keras", delete=False) as tmp:
            tmp_path = Path(tmp.name)

        try:
            with zipfile.ZipFile(model_path, "r") as source, zipfile.ZipFile(tmp_path, "w") as target:
                for item in source.infolist():
                    content = source.read(item.filename)
                    if item.filename == "config.json":
                        config = json.loads(content.decode("utf-8"))
                        content = json.dumps(self._strip_unsupported_config(config)).encode("utf-8")
                    target.writestr(item, content)

            return keras.models.load_model(
                tmp_path,
                custom_objects={"GatedFeatureFusion": GatedFeatureFusion},
                compile=False,
            )
        finally:
            try:
                tmp_path.unlink(missing_ok=True)
            except Exception:
                pass

    def _strip_unsupported_config(self, value):
        if isinstance(value, dict):
            cleaned = {}
            for key, item in value.items():
                if key == "quantization_config" and item is None:
                    continue
                cleaned[key] = self._strip_unsupported_config(item)
            return cleaned
        if isinstance(value, list):
            return [self._strip_unsupported_config(item) for item in value]
        return value

    def _amount_allowed(self, rule, amount):
        amount = float(amount or 0)
        amin = rule.get("amount_min")
        amax = rule.get("amount_max")
        if amin is not None and amount < float(amin):
            return False
        if amax is not None and amount > float(amax):
            return False
        return True

    def apply_dictionary_rules(self, merchant, amount=0):
        merchant_clean = normalize_text(merchant)
        for rule in self.dictionary_rules:
            if not rule.get("active", True):
                continue
            if any(keyword_matches(merchant_clean, neg, "contains") for neg in rule.get("negative_keywords", [])):
                continue
            if not self._amount_allowed(rule, amount):
                continue
            match_type = rule.get("match_type", "contains")
            matched_keyword = None
            for kw in rule.get("alias_keywords", []):
                if keyword_matches(merchant_clean, kw, match_type):
                    matched_keyword = kw
                    break
            if matched_keyword:
                return {
                    "rule_category": rule["category_detail"],
                    "rule_primary": rule.get(
                        "category_primary",
                        self.category_primary_map.get(rule["category_detail"], "unknown"),
                    ),
                    "rule_confidence": float(rule.get("rule_confidence", 0.0)),
                    "matched_rule": rule.get("rule_id"),
                    "matched_keyword": matched_keyword,
                    "is_trusted_guardrail": bool(rule.get("is_trusted_guardrail", False)),
                    "rule_ambiguity_level": rule.get("ambiguity_level"),
                    "rule_strength": rule.get("rule_strength"),
                }
        return {
            "rule_category": None,
            "rule_primary": None,
            "rule_confidence": 0.0,
            "matched_rule": None,
            "matched_keyword": None,
            "is_trusted_guardrail": False,
            "rule_ambiguity_level": None,
            "rule_strength": None,
        }

    def _prepare_one(self, merchant, amount, date=None, payment_method="unknown", payment_media="unknown", source="manual"):
        amount = float(amount or 0)
        merchant_clean = normalize_text(merchant)
        dt = pd.to_datetime(date, errors="coerce") if date else pd.NaT
        if pd.isna(dt):
            month = 0
            day = 0
            week = 0
            day_of_week = "unknown"
            is_weekend = "false"
            time_of_day = "unknown"
        else:
            month = int(dt.month)
            day = int(dt.day)
            week = int(dt.isocalendar().week)
            day_of_week = str(dt.day_name()).lower()
            is_weekend = str(dt.dayofweek >= 5).lower()
            time_of_day = infer_time_of_day(dt.hour)

        return {
            "merchant_clean": merchant_clean,
            "amount": amount,
            "log_amount": float(np.log1p(max(amount, 0))),
            "month": month,
            "day": day,
            "week": week,
            "rolling_7d_spending": 0.0,
            "rolling_30d_spending": 0.0,
            "transaction_count_to_date": 1.0,
            "payment_method": normalize_text(payment_method),
            "payment_media": normalize_text(payment_media),
            "source": normalize_text(source),
            "day_of_week": day_of_week,
            "time_of_day": time_of_day,
            "spending_level": infer_spending_level(amount),
            "is_weekend": is_weekend,
        }

    def _model_inputs_from_row(self, row):
        numeric_values = []
        for col in self.numeric_features:
            value = float(row.get(col, 0.0))
            mean = float(self.numeric_mean.get(col, 0.0))
            std = float(self.numeric_std.get(col, 1.0)) or 1.0
            numeric_values.append((value - mean) / std)

        inputs = {
            "merchant_text": np.array([row["merchant_clean"]], dtype=object),
            "numeric_input": np.array([numeric_values], dtype="float32"),
        }
        for col in self.categorical_features:
            inputs[f"{col}_input"] = np.array([str(row.get(col, "unknown"))], dtype=object)
        return inputs

    def predict_one(self, merchant, amount, date=None, payment_method="unknown", payment_media="unknown", source="manual") -> Dict[str, Any]:
        row = self._prepare_one(merchant, amount, date, payment_method, payment_media, source)
        rule = self.apply_dictionary_rules(merchant, amount)

        inputs = self._model_inputs_from_row(row)
        proba = self.model.predict(inputs, verbose=0)[0]
        order = np.argsort(proba)[::-1]
        top_idx = int(order[0])
        second_idx = int(order[1]) if len(order) > 1 else top_idx
        ai_detail = self.label_classes[top_idx]
        ai_confidence = float(proba[top_idx])
        confidence_margin = float(proba[top_idx] - proba[second_idx])

        use_rule = (
            rule["is_trusted_guardrail"]
            and rule["rule_confidence"] >= self.trusted_rule_threshold
            and rule["rule_category"] is not None
        )

        if use_rule:
            final_detail = rule["rule_category"]
            final_primary = self.category_primary_map.get(final_detail, rule.get("rule_primary") or "unknown")
            decision_source = "trusted_dictionary_guardrail"
            confidence = float(rule["rule_confidence"])
            needs_review = False
        elif ai_confidence < self.model_review_threshold:
            final_detail = "unknown_need_review"
            final_primary = "unknown"
            decision_source = "model_low_confidence_review"
            confidence = ai_confidence
            needs_review = True
        else:
            final_detail = ai_detail
            final_primary = self.category_primary_map.get(final_detail, "unknown")
            decision_source = "deep_learning_model"
            confidence = ai_confidence
            needs_review = False

        return {
            "merchant": merchant,
            "category_group": final_primary,
            "category_detail": final_detail,
            "category_primary": final_primary,
            "confidence": round(float(confidence), 6),
            "needs_review": bool(needs_review),
            "decision_source": decision_source,
            "ai_detail": ai_detail,
            "ai_confidence": round(ai_confidence, 6),
            "confidence_margin": round(confidence_margin, 6),
            "rule_category": rule["rule_category"],
            "rule_confidence": round(float(rule["rule_confidence"]), 6),
            "matched_rule": rule["matched_rule"],
            "matched_keyword": rule["matched_keyword"],
            "threshold_used": self.model_review_threshold,
            "trusted_rule_threshold_used": self.trusted_rule_threshold,
        }


_classifier = None


def get_classifier():
    global _classifier
    if _classifier is None:
        _classifier = SADARMerchantClassifier()
    return _classifier


def categorize_transaction(payload: Dict[str, Any]) -> Dict[str, Any]:
    text = payload.get("text") or payload.get("inputText") or payload.get("input_text") or ""
    items = payload.get("items") if isinstance(payload.get("items"), list) else []
    item_text = " ".join(str(item.get("name") or "") for item in items if isinstance(item, dict))
    merchant = payload.get("merchant") or text or item_text or "unknown"
    amount = _safe_float(payload.get("amount") or payload.get("total"), 0.0)
    date = payload.get("date") or payload.get("transactionDate") or payload.get("transaction_date")
    payment_method = payload.get("paymentMethod") or payload.get("payment_method") or "unknown"
    payment_media = payload.get("paymentMedia") or payload.get("payment_media") or "unknown"
    source = payload.get("source") or "manual"
    transaction_id = payload.get("transactionId") or payload.get("transaction_id")

    prediction = get_classifier().predict_one(
        merchant=merchant,
        amount=amount,
        date=date,
        payment_method=payment_method,
        payment_media=payment_media,
        source=source,
    )

    category_group = prediction["category_group"]
    category_detail = prediction["category_detail"]

    return {
        "inputText": text or merchant,
        "input_text": text or merchant,
        "merchant": prediction["merchant"],
        "predictedCategory": category_group,
        "predicted_category": category_group,
        "categoryGroup": category_group,
        "category_group": category_group,
        "categoryPrimary": prediction["category_primary"],
        "category_primary": prediction["category_primary"],
        "categoryDetail": category_detail,
        "category_detail": category_detail,
        "confidence": prediction["confidence"],
        "needsReview": prediction["needs_review"],
        "needs_review": prediction["needs_review"],
        "decisionSource": prediction["decision_source"],
        "decision_source": prediction["decision_source"],
        "modelVersion": MODEL_VERSION,
        "model_version": MODEL_VERSION,
        "transactionId": transaction_id,
        "transaction_id": transaction_id,
        "debug": {
            "aiDetail": prediction["ai_detail"],
            "aiConfidence": prediction["ai_confidence"],
            "confidenceMargin": prediction["confidence_margin"],
            "ruleCategory": prediction["rule_category"],
            "ruleConfidence": prediction["rule_confidence"],
            "matchedRule": prediction["matched_rule"],
            "matchedKeyword": prediction["matched_keyword"],
        },
    }
