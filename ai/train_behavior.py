from pathlib import Path

from behavior_model import (
    MODEL_VERSION,
    build_behavior_model,
    export_saved_model,
    make_dataset_bundle,
    save_metadata,
    train_with_gradient_tape,
)


ROOT = Path(__file__).resolve().parent
DATASET_PATH = ROOT / "dataset" / "data_modelling.csv"
MODELS_DIR = ROOT / "models"
LOG_DIR = ROOT / "logs" / "behavior_spike"


def main():
    bundle = make_dataset_bundle(DATASET_PATH)
    results = {}
    trained_models = {}

    for model_name in ("mlp", "deep_cross"):
        print(f"\nTraining {model_name}...")
        model = build_behavior_model(model_name, bundle.vocabularies, bundle.numeric_stats)
        model, metrics = train_with_gradient_tape(
            model=model,
            bundle=bundle,
            model_name=model_name,
            log_dir=LOG_DIR,
            epochs=20,
            learning_rate=0.001,
        )
        results[model_name] = metrics
        trained_models[model_name] = model
        print(f"{model_name} metrics: {metrics}")

    best_name = max(
        results,
        key=lambda name: (
            results[name]["mae"] <= 0.02,
            -results[name]["mae"],
            results[name]["f1"],
            results[name]["accuracy"],
            results[name]["recall"],
        ),
    )
    best_model = trained_models[best_name]
    best_metrics = results[best_name]

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    keras_path = MODELS_DIR / "behavior_best_model.keras"
    saved_model_path = MODELS_DIR / "behavior_saved_model"
    metadata_path = MODELS_DIR / "behavior_metadata.json"

    best_model.save(keras_path)
    export_saved_model(best_model, saved_model_path)

    metadata = {
        "modelVersion": MODEL_VERSION,
        "bestModel": best_name,
        "target": "spike",
        "dataset": str(DATASET_PATH.relative_to(ROOT)),
        "split": {
            "strategy": "time_based_70_15_15",
            "trainRows": len(bundle.train_df),
            "validationRows": len(bundle.val_df),
            "testRows": len(bundle.test_df),
        },
        "metrics": results,
        "questThresholds": {
            "minimumAccuracy": 0.85,
            "maximumMae": 0.02,
            "reportingAccuracyRange": "90-95% preferred; disclose if actual is higher on simulated data",
        },
        "riskThresholds": {
            "low": 0.4,
            "medium": 0.7,
        },
        "budgetRule": {
            "Needs": 0.5,
            "Wants": 0.3,
            "Investment": 0.2,
        },
        "notes": [
            "Dataset is simulated and spike labels have strong amount/category patterns.",
            "spending_level and log_amount are intentionally excluded from the main model to reduce leakage.",
        ],
    }
    save_metadata(metadata_path, metadata)

    print("\nBest behavior model:", best_name)
    print("Best metrics:", best_metrics)
    print("Saved:", keras_path)
    print("Exported:", saved_model_path)
    print("Metadata:", metadata_path)


if __name__ == "__main__":
    main()
