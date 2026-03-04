# processed_data/preprocessed_data — Context

## Purpose
Contains the **ML-ready artefacts** produced by the feature engineering pipeline. These files are the direct inputs to model training and the rolling inference script.

## Contents

### Numpy Arrays (compressed `.npz`)

| File | Shape | Description |
|------|-------|-------------|
| `X_train.npz` | `(N_train, 24, 13)` | Training sequences — 24 time-steps × 13 features |
| `X_test.npz` | `(N_test, 24, 13)` | Test sequences |
| `y_train.npz` | `(N_train,)` | Training targets (traffic volume at t+1) |
| `y_test.npz` | `(N_test,)` | Test targets |

> Load with: `np.load("X_train.npz")["data"]`

### Pickle Objects

| File | Type | Description |
|------|------|-------------|
| `scaler.pkl` | `sklearn.StandardScaler` | Fitted scaler — **must** be used for inference normalization |
| `feature_cols.pkl` | `list[str]` | Ordered list of 13 feature column names |
| `location_to_idx.pkl` | `dict[str, int]` | Mapping from location string to embedding integer index |

### CSV Metadata

| File | Description |
|------|-------------|
| `cleaned_data.csv` | Long-format cleaned SCATS data (one row per interval per location) |
| `meta_train.csv` | Row-level metadata for training sequences (SCATS#, location, date, interval) |
| `meta_test.csv` | Row-level metadata for test sequences |

### JSON

| File | Description |
|------|-------------|
| `sites_metadata.json` | SCATS site topology: lat/lon, connected roads, approach directions — used by `SiteNetwork` |

## Feature Schema (13 columns in `feature_cols.pkl`)

| # | Feature | Description |
|---|---------|-------------|
| 0 | `traffic_volume` | Raw 15-min vehicle count |
| 1 | `dow_sin` | Sine encoding of day-of-week |
| 2 | `dow_cos` | Cosine encoding of day-of-week |
| 3 | `tod_sin` | Sine encoding of time-of-day (interval_id) |
| 4 | `tod_cos` | Cosine encoding of time-of-day |
| 5 | `is_weekend` | Binary: 1 if Saturday/Sunday |
| 6 | `after_gap` | Binary: 1 if previous observation was >1 day ago |
| 7 | `days_since_prev` | Integer days since previous observation |
| 8 | `location_idx` | Integer index for embedding lookup |
| 9 | `traffic_lag_1` | Traffic 15 min ago |
| 10 | `traffic_lag_4` | Traffic 1 hour ago |
| 11 | `traffic_lag_96` | Traffic same time yesterday |
| 12 | `avg_traffic_this_timeofday` | Historical mean for this location × interval |

## Split Strategy
Temporal split (not random): the last 20% of unique dates form the test set. This prevents data leakage from future observations into training.

## Model Input Preparation
Before passing to a Keras model, `location_idx` (column 8) must be separated:
- **`feature_input`**: all columns except `location_idx` → shape `(batch, 24, 12)`
- **`location_input`**: `location_idx` column only → shape `(batch, 24)` as `int32`

See `src/data_preprocessing/feature_engineering.py::prepare_embedding_inputs()`.
