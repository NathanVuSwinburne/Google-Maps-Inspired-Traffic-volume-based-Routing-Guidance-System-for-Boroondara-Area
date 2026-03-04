# src/inference — Context

## Purpose
Provides the **batch rolling inference pipeline** that generates complete Oct–Nov 2006 traffic volume predictions for all SCATS locations. This is an offline batch process (not real-time) — its outputs are pre-computed CSVs consumed by the routing app.

## Files

### `rolling_prediction_script.py`
A standalone CLI script designed to run on GPU (e.g., Google Colab).

**CLI Arguments:**
```
--model_path   Path to a .keras model file
--model_name   Name label for output folder
--data_path    Path to preprocessed_data/ directory
--output_path  Base path for output CSVs (default: Google Drive)
--seq_length   Sequence length (default: 24)
--batch_size   Batch size for GPU inference (default: 128)
```

**Example:**
```bash
python src/inference/rolling_prediction_script.py \
  --model_path checkpoints/saved_models/cnn_bigru_20250512_084138/best.keras \
  --model_name cnn_bigru \
  --data_path processed_data/preprocessed_data/ \
  --output_path processed_data/complete_csv_oct_nov_2006/
```

### `predicted_csv/`
Intermediate working directory for in-progress or partial prediction CSVs during a run.

## Algorithm

### `SequenceManager`
Maintains a per-location rolling buffer of the most recent observations. When actual data exists, it is used; when gaps exist or future dates are needed, predicted values are inserted back into the buffer (autoregressive).

```
get_last_sequence(location, target_date, target_interval)
  → returns the 24 rows immediately preceding the target timestamp
update_sequence(location, date, interval_id, predicted_value)
  → appends prediction back into the buffer
```

### Phase 1 — October Gap-Filling
1. Enumerate all expected (location, date, interval) tuples for October 2006
2. Diff against actual data to find missing entries
3. Predict missing intervals chronologically, feeding predictions back as context

### Phase 2 — November Forecasting
- Iterates every day × every interval (96 × 30 = 2,880 time steps)
- For each time step, batches all locations together for GPU-efficient prediction
- All November predictions are autoregressive (no actual data exists)

### Feature Engineering (Inference)
`engineer_features_batch()` mirrors `feature_engineering.engineer_features()` but operates on a rolling sequence slice rather than the full dataset. The same `feature_cols` order and `scaler` are used.

## Output Schema
```
Location | Date       | interval_id | time_of_day | predicted_traffic
---------|------------|-------------|-------------|------------------
WARR...  | 2006-10-03 | 32          | 08:00       | 142.7
```

A `prediction_summary.pkl` is also saved with aggregate statistics.

## Requirements
- TensorFlow >= 2.15 (enforced at import time)
- GPU recommended — batch prediction over all locations simultaneously
- `scaler.pkl`, `feature_cols.pkl`, `location_to_idx.pkl` must match the model's training artefacts exactly
