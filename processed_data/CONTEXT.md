# processed_data — Context

## Purpose
Stores **all derived artifacts** produced from the raw SCATS data. Nothing here is manually created — every file is the output of a pipeline stage and can be regenerated.

## Sub-directory Map

```
processed_data/
├── preprocessed_data/          # ML-ready tensors, scalers, metadata
├── complete_csv_oct_nov_2006/  # Per-model rolling predictions (Oct+Nov)
│   ├── lstm_model/
│   ├── gru_model/
│   └── bi_lstm_model/
└── eda_insights/               # EDA visualisation images
```

## Data Flow

```
raw_data/modified_scats_data_oct_2006.csv
    │
    ▼ src/data_preprocessing/clean_data.py
preprocessed_data/cleaned_data.csv
    │
    ▼ src/data_preprocessing/feature_engineering.py
preprocessed_data/{X_train, X_test, y_train, y_test}.npz
preprocessed_data/{scaler, feature_cols, location_to_idx}.pkl
preprocessed_data/sites_metadata.json
    │
    ▼ src/inference/rolling_prediction_script.py (per model)
complete_csv_oct_nov_2006/{model}/…_complete_data.csv
```

## Regeneration
- **Step 1 — Clean**: Run `data_preprocessing.ipynb` or `src/data_preprocessing/clean_data.py`
- **Step 2 — Feature engineer**: Run `src/data_preprocessing/feature_engineering.py`
- **Step 3 — Predict**: Run `src/inference/rolling_prediction_script.py` with the desired model checkpoint

## Important Notes
- `.npz` arrays use compression; load with `np.load(path)["data"]`
- `scaler.pkl` must be loaded alongside any model checkpoint for correct normalization
- `sites_metadata.json` is consumed at runtime by `SiteNetwork` (the routing graph)
- EDA images are static artefacts for documentation/reporting only
