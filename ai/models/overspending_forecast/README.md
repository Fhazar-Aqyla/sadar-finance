# End-Month Overspending Forecast Model

This folder stores the candidate end-month overspending forecasting model exported from:

`ai/notebooks/overspending_end_month_forecasting.ipynb`

## Current Files

- `end_month_overspending_multitask_mlp.keras`
- `end_month_overspending_multitask_mlp_tf218.keras`

## Runtime Notes

The notebook targets an end-month overspending forecast use case:

- Classification: whether the user is likely to overspend by month end.
- Regression: estimated overspending amount.
- Policy layer: calibrated decision score and recommendation output.

The compatible `.keras` file is wired into the Flask AI service for preprocessed 61-value feature vectors.

Required artifacts from the notebook export:

- `feature_schema.json`
- `preprocessor.pkl`
- optionally `evaluation_report.json`
- optionally `saved_model/`

The original `.keras` file was saved with Keras 3.13.2. The `*_tf218.keras` copy removes the unsupported `quantization_config` field so it can load in the current AI service runtime (`tensorflow==2.18.0`).
