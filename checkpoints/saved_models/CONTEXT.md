# checkpoints/saved_models — Context

## Purpose
Persists the **trained Keras model files** for each training run. The `best.keras` checkpoint is the primary artefact used for inference.

## File Layout (per run)

```
saved_models/{run_id}/
├── best.keras                    # Best weights by val_loss (ModelCheckpoint)
├── final_{run_id}.keras          # Weights at final epoch
├── final_{run_id}.json           # Model architecture as JSON
└── final_{run_id}_weights.npz    # Raw weight arrays (numpy)
```

## Loading for Inference
```python
import tensorflow as tf
import pickle, numpy as np

model = tf.keras.models.load_model("saved_models/{run_id}/best.keras")

with open("../../preprocessed_data/scaler.pkl", "rb") as f:
    scaler = pickle.load(f)
with open("../../preprocessed_data/feature_cols.pkl", "rb") as f:
    feature_cols = pickle.load(f)
```

## Requirements
- TensorFlow >= 2.15 is required to load `.keras` format files (enforced in the inference script)
- The `best.keras` checkpoint restores weights at the epoch with lowest validation loss (early stopping with `restore_best_weights=True`)

## Architecture Notes
All models share the same two-input pattern:
- `feature_input`: `(batch, seq_length=24, n_features=12)` float32
- `location_input`: `(batch, seq_length=24)` int32 → feeds into `Embedding(n_locations, 16)`

See `src/train_and_evaluate/model_architecture.py` for full architecture definitions.

## Preferred Model for Deployment
`cnn_bigru_20250512_084138/best.keras` — best RMSE (11.23) and R² (0.9620) on the test set.
