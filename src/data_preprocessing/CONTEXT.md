# src/data_preprocessing — Context

## Purpose
Implements the **two-stage ETL pipeline** that transforms raw SCATS Excel/CSV data into ML-ready numpy tensors and pickled artefacts.

## Files

### Stage 1 — `clean_data.py`
**Input**: `raw_data/modified_scats_data_oct_2006.csv`
**Output**: `processed_data/preprocessed_data/cleaned_data.csv`

| Function | Description |
|----------|-------------|
| `load_and_prepare_data()` | Reads CSV, parses dates, identifies V00–V95 columns |
| `reshape_data()` | Pivots wide format (96 V-columns per row) → long format (one row per 15-min interval) |
| `analyze_scats_to_location_relationship()` | EDA: counts approaches per SCATS site, saves histogram |
| `clean_problematic_locations()` | Removes locations with >96 intervals/day (duplicates) or <5 days of data |
| `analyze_data_patterns()` | Computes hourly/daily/weekend traffic statistics and missing-date map |
| `visualize_data_patterns()` | Saves EDA plots to `processed_data/eda_insights/` |
| `process_data()` | Orchestrates full Stage 1 pipeline |

---

### Stage 2 — `feature_engineering.py`
**Input**: `cleaned_data.csv`
**Output**: `X_train/test.npz`, `y_train/test.npz`, `meta_train/test.csv`, `scaler.pkl`, `feature_cols.pkl`, `location_to_idx.pkl`

| Function | Description |
|----------|-------------|
| `engineer_features(df)` | Adds temporal encodings, lag features, gap flags, location index |
| `create_sequences(df, seq_length=24)` | Sliding window over continuous segments → `(N, 24, 13)` arrays |
| `sequence_based_split()` | Temporal train/test split (last 20% of dates → test) |
| `normalize_data()` | Fits `StandardScaler` on train, applies to both splits |
| `prepare_embedding_inputs()` | Splits out `location_idx` for the Embedding layer |
| `save_processed_data()` / `load_processed_data()` | Persist/reload all artefacts |
| `run_feature_engineering()` | Orchestrates full Stage 2 pipeline |

---

### `compress_numpy_file.py`
Utility to re-compress existing `.npy` files into `.npz` format with zlib compression. Run standalone if storage is a concern.

## Feature Engineering Details

### Lag features
```
traffic_lag_1  = t-1  (15 min ago)
traffic_lag_4  = t-4  (1 hour ago)
traffic_lag_96 = t-96 (same time yesterday)
```
Missing lags are filled with the historical mean for that location × interval combination.

### Gap awareness
`after_gap = 1` flags the first observation after a missing-day boundary, preventing the model from learning spurious lag relationships across gaps. Segments shorter than `seq_length+1` are skipped entirely.

### Sequence length
`seq_length=24` = 6 hours of history (24 × 15 min). Chosen to capture a full commute peak.

## Running the Pipeline
```bash
# Stage 1
python src/data_preprocessing/clean_data.py

# Stage 2
python src/data_preprocessing/feature_engineering.py

# Or use the notebooks:
jupyter notebook data_preprocessing.ipynb
```
