import json
import math
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

import numpy as np
import pandas as pd
import tensorflow as tf


NUMERIC_FEATURES = [
    "amount",
    "month",
    "day",
    "week",
    "is_weekend",
    "rolling_7d_spending",
    "transaction_count",
]

CATEGORICAL_FEATURES = [
    "merchant",
    "category_detail",
    "category_primary",
    "payment_method",
    "payment_media",
    "day_of_week",
    "time_of_day",
]

TARGET_COLUMN = "spike"
MODEL_VERSION = "behavior-spike-v1"


@dataclass
class DatasetBundle:
    train_ds: tf.data.Dataset
    val_ds: tf.data.Dataset
    test_ds: tf.data.Dataset
    train_df: pd.DataFrame
    val_df: pd.DataFrame
    test_df: pd.DataFrame
    class_weight: float
    vocabularies: Dict[str, List[str]]
    numeric_stats: Dict[str, Dict[str, float]]


@tf.keras.utils.register_keras_serializable(package="SadarFinance")
class CrossFeatureLayer(tf.keras.layers.Layer):
    """Cross layer from Deep & Cross Network for tabular feature interactions."""

    def __init__(self, num_layers: int = 2, **kwargs):
        super().__init__(**kwargs)
        self.num_layers = num_layers
        self.kernels = []
        self.biases = []

    def build(self, input_shape):
        dim = int(input_shape[-1])
        for i in range(self.num_layers):
            self.kernels.append(
                self.add_weight(
                    name=f"cross_kernel_{i}",
                    shape=(dim, 1),
                    initializer="glorot_uniform",
                    trainable=True,
                )
            )
            self.biases.append(
                self.add_weight(
                    name=f"cross_bias_{i}",
                    shape=(dim,),
                    initializer="zeros",
                    trainable=True,
                )
            )
        super().build(input_shape)

    def call(self, inputs):
        x0 = inputs
        x = inputs
        for kernel, bias in zip(self.kernels, self.biases):
            xw = tf.matmul(x, kernel)
            x = x0 * xw + bias + x
        return x

    def get_config(self):
        config = super().get_config()
        config.update({"num_layers": self.num_layers})
        return config


@tf.keras.utils.register_keras_serializable(package="SadarFinance")
class WeightedBinaryFocalLoss(tf.keras.losses.Loss):
    """Focal loss with positive-class weighting for imbalanced spike labels."""

    def __init__(self, alpha: float = 0.75, gamma: float = 2.0, name: str = "weighted_binary_focal_loss"):
        super().__init__(name=name)
        self.alpha = alpha
        self.gamma = gamma

    def call(self, y_true, y_pred):
        y_true = tf.cast(y_true, tf.float32)
        y_pred = tf.clip_by_value(tf.cast(y_pred, tf.float32), 1e-7, 1.0 - 1e-7)
        pt = tf.where(tf.equal(y_true, 1.0), y_pred, 1.0 - y_pred)
        alpha_t = tf.where(tf.equal(y_true, 1.0), self.alpha, 1.0 - self.alpha)
        loss = -alpha_t * tf.pow(1.0 - pt, self.gamma) * tf.math.log(pt)
        return tf.reduce_mean(loss)

    def get_config(self):
        return {"alpha": self.alpha, "gamma": self.gamma, "name": self.name}


@tf.keras.utils.register_keras_serializable(package="SadarFinance")
class WeightedBinaryCrossentropy(tf.keras.losses.Loss):
    """Custom BCE loss with a tunable positive weight for calibrated probabilities."""

    def __init__(self, positive_weight: float = 1.0, name: str = "weighted_binary_crossentropy"):
        super().__init__(name=name)
        self.positive_weight = positive_weight

    def call(self, y_true, y_pred):
        y_true = tf.cast(y_true, tf.float32)
        y_pred = tf.clip_by_value(tf.cast(y_pred, tf.float32), 1e-7, 1.0 - 1e-7)
        positive_loss = -self.positive_weight * y_true * tf.math.log(y_pred)
        negative_loss = -(1.0 - y_true) * tf.math.log(1.0 - y_pred)
        return tf.reduce_mean(positive_loss + negative_loss)

    def get_config(self):
        return {"positive_weight": self.positive_weight, "name": self.name}


class QuestMetricCallback:
    """Custom callback used from the GradientTape loop to track quest thresholds."""

    def __init__(self, min_accuracy: float = 0.85, max_mae: float = 0.02):
        self.min_accuracy = min_accuracy
        self.max_mae = max_mae
        self.best_score = -math.inf
        self.best_weights = None
        self.best_epoch = 0

    def on_epoch_end(self, epoch: int, model: tf.keras.Model, metrics: Dict[str, float]) -> bool:
        quest_passed = metrics["accuracy"] >= self.min_accuracy and metrics["mae"] <= self.max_mae
        score = metrics["accuracy"] - metrics["mae"] + metrics.get("recall", 0.0) * 0.1
        if quest_passed and score > self.best_score:
            self.best_score = score
            self.best_epoch = epoch
            self.best_weights = model.get_weights()
        return quest_passed

    def restore_best(self, model: tf.keras.Model) -> None:
        if self.best_weights is not None:
            model.set_weights(self.best_weights)


def load_behavior_dataframe(dataset_path: Path) -> pd.DataFrame:
    df = pd.read_csv(dataset_path, parse_dates=["date"])
    df = df.sort_values("date").reset_index(drop=True)
    df["is_weekend"] = df["is_weekend"].astype(float)
    df["rolling_7d_spending"] = df["rolling_7d_spending"].fillna(df["amount"])
    df[TARGET_COLUMN] = df[TARGET_COLUMN].astype(float)
    for column in CATEGORICAL_FEATURES:
        df[column] = df[column].fillna("unknown").astype(str)
    for column in NUMERIC_FEATURES:
        df[column] = pd.to_numeric(df[column], errors="coerce").fillna(0).astype("float32")
    return df


def make_dataset_bundle(dataset_path: Path, batch_size: int = 128) -> DatasetBundle:
    df = load_behavior_dataframe(dataset_path)
    n = len(df)
    train_end = int(n * 0.70)
    val_end = int(n * 0.85)
    train_df = df.iloc[:train_end].copy()
    val_df = df.iloc[train_end:val_end].copy()
    test_df = df.iloc[val_end:].copy()

    positives = float(train_df[TARGET_COLUMN].sum())
    negatives = float(len(train_df) - positives)
    class_weight = negatives / max(positives, 1.0)

    vocabularies = {
        column: sorted(train_df[column].astype(str).unique().tolist())
        for column in CATEGORICAL_FEATURES
    }
    numeric_stats = {
        column: {
            "mean": float(train_df[column].mean()),
            "variance": float(max(train_df[column].var(), 1e-6)),
        }
        for column in NUMERIC_FEATURES
    }

    return DatasetBundle(
        train_ds=_frame_to_dataset(train_df, batch_size, shuffle=True),
        val_ds=_frame_to_dataset(val_df, batch_size, shuffle=False),
        test_ds=_frame_to_dataset(test_df, batch_size, shuffle=False),
        train_df=train_df,
        val_df=val_df,
        test_df=test_df,
        class_weight=class_weight,
        vocabularies=vocabularies,
        numeric_stats=numeric_stats,
    )


def _frame_to_dataset(df: pd.DataFrame, batch_size: int, shuffle: bool) -> tf.data.Dataset:
    features = {}
    for column in NUMERIC_FEATURES:
        features[column] = df[column].astype("float32").to_numpy()
    for column in CATEGORICAL_FEATURES:
        features[column] = df[column].astype(str).to_numpy()
    labels = df[TARGET_COLUMN].astype("float32").to_numpy().reshape(-1, 1)
    ds = tf.data.Dataset.from_tensor_slices((features, labels))
    if shuffle:
        ds = ds.shuffle(buffer_size=len(df), seed=42, reshuffle_each_iteration=True)
    return ds.batch(batch_size).prefetch(tf.data.AUTOTUNE)


def build_behavior_model(
    model_name: str,
    vocabularies: Dict[str, List[str]],
    numeric_stats: Dict[str, Dict[str, float]],
) -> tf.keras.Model:
    inputs = {}
    encoded_features = []

    for column in NUMERIC_FEATURES:
        feature_input = tf.keras.Input(shape=(1,), name=column, dtype=tf.float32)
        normalizer = tf.keras.layers.Normalization(
            mean=[numeric_stats[column]["mean"]],
            variance=[numeric_stats[column]["variance"]],
            name=f"{column}_normalization",
        )
        inputs[column] = feature_input
        encoded_features.append(normalizer(feature_input))

    for column in CATEGORICAL_FEATURES:
        feature_input = tf.keras.Input(shape=(1,), name=column, dtype=tf.string)
        lookup = tf.keras.layers.StringLookup(
            vocabulary=vocabularies[column],
            mask_token=None,
            num_oov_indices=1,
            output_mode="int",
            name=f"{column}_lookup",
        )
        vocab_size = len(vocabularies[column]) + 1
        embedding_dim = min(16, max(3, int(round(math.sqrt(vocab_size)))))
        x = lookup(feature_input)
        x = tf.keras.layers.Embedding(vocab_size + 1, embedding_dim, name=f"{column}_embedding")(x)
        x = tf.keras.layers.Flatten(name=f"{column}_flatten")(x)
        inputs[column] = feature_input
        encoded_features.append(x)

    feature_vector = tf.keras.layers.Concatenate(name="feature_vector")(encoded_features)

    if model_name == "deep_cross":
        cross = CrossFeatureLayer(num_layers=2, name="cross_feature_layer")(feature_vector)
        deep = _dense_stack(feature_vector, [128, 64], "deep_cross_deep")
        x = tf.keras.layers.Concatenate(name="deep_cross_concat")([cross, deep])
        x = tf.keras.layers.Dense(64, activation="relu", name="deep_cross_head")(x)
    elif model_name == "mlp":
        x = _dense_stack(feature_vector, [128, 64, 32], "mlp")
    else:
        raise ValueError(f"Unknown behavior model: {model_name}")

    x = tf.keras.layers.Dropout(0.20, name=f"{model_name}_head_dropout")(x)
    output = tf.keras.layers.Dense(1, activation="sigmoid", name="spike_probability")(x)
    return tf.keras.Model(inputs=inputs, outputs=output, name=f"behavior_{model_name}")


def _dense_stack(inputs, units: Iterable[int], prefix: str):
    x = inputs
    for i, unit_count in enumerate(units):
        x = tf.keras.layers.Dense(unit_count, activation="relu", name=f"{prefix}_dense_{i}")(x)
        x = tf.keras.layers.BatchNormalization(name=f"{prefix}_bn_{i}")(x)
        x = tf.keras.layers.Dropout(0.15, name=f"{prefix}_dropout_{i}")(x)
    return x


def train_with_gradient_tape(
    model: tf.keras.Model,
    bundle: DatasetBundle,
    model_name: str,
    log_dir: Path,
    epochs: int = 20,
    learning_rate: float = 0.001,
) -> Tuple[tf.keras.Model, Dict[str, float]]:
    optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate)
    loss_fn = WeightedBinaryCrossentropy(positive_weight=1.0)
    callback = QuestMetricCallback()
    writer = tf.summary.create_file_writer(str(log_dir / model_name))

    for epoch in range(1, epochs + 1):
        train_losses = []
        for features, labels in bundle.train_ds:
            with tf.GradientTape() as tape:
                predictions = model(features, training=True)
                loss = loss_fn(labels, predictions)
                loss += sum(model.losses)
            gradients = tape.gradient(loss, model.trainable_variables)
            optimizer.apply_gradients(zip(gradients, model.trainable_variables))
            train_losses.append(float(loss.numpy()))

        val_metrics = evaluate_model(model, bundle.val_ds)
        with writer.as_default():
            tf.summary.scalar("loss/train", np.mean(train_losses), step=epoch)
            for key, value in val_metrics.items():
                tf.summary.scalar(f"validation/{key}", value, step=epoch)
        callback.on_epoch_end(epoch, model, val_metrics)

    writer.close()
    callback.restore_best(model)
    test_metrics = evaluate_model(model, bundle.test_ds)
    return model, test_metrics


def evaluate_model(model: tf.keras.Model, dataset: tf.data.Dataset, threshold: float = 0.5) -> Dict[str, float]:
    y_true, y_prob = collect_predictions(model, dataset)
    y_pred = (y_prob >= threshold).astype("int32")
    tp = int(((y_true == 1) & (y_pred == 1)).sum())
    tn = int(((y_true == 0) & (y_pred == 0)).sum())
    fp = int(((y_true == 0) & (y_pred == 1)).sum())
    fn = int(((y_true == 1) & (y_pred == 0)).sum())
    total = max(len(y_true), 1)
    accuracy = (tp + tn) / total
    precision = tp / max(tp + fp, 1)
    recall = tp / max(tp + fn, 1)
    f1 = 2 * precision * recall / max(precision + recall, 1e-7)
    mae = float(np.mean(np.abs(y_true.astype("float32") - y_prob.astype("float32"))))
    return {
        "accuracy": float(accuracy),
        "mae": mae,
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1),
        "tp": float(tp),
        "tn": float(tn),
        "fp": float(fp),
        "fn": float(fn),
    }


def collect_predictions(model: tf.keras.Model, dataset: tf.data.Dataset) -> Tuple[np.ndarray, np.ndarray]:
    labels = []
    probabilities = []
    for features, batch_labels in dataset:
        probabilities.append(model(features, training=False).numpy().reshape(-1))
        labels.append(batch_labels.numpy().reshape(-1).astype("int32"))
    return np.concatenate(labels), np.concatenate(probabilities)


def save_metadata(path: Path, metadata: Dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")


def export_saved_model(model: tf.keras.Model, export_dir: Path) -> None:
    export_dir.parent.mkdir(parents=True, exist_ok=True)
    if export_dir.exists():
        shutil.rmtree(export_dir)
    if hasattr(model, "export"):
        model.export(str(export_dir))
    else:
        tf.saved_model.save(model, str(export_dir))
