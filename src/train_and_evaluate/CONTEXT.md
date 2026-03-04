# src/train_and_evaluate — Context

## Purpose
Provides the **model architecture registry** and the **training / evaluation harness**. All deep learning model definitions live here; this is the only module that directly imports TensorFlow/Keras.

## Files

### `model_architecture.py`
Defines Keras functional-API models. All models share a **dual-input design**:

```
feature_input (batch, seq=24, n_features=12)  ──┐
                                                  ├── Concatenate ──► recurrent layers ──► Dense(1)
location_input (batch, seq=24) int32            ──┘
    └──► Embedding(n_locations, dim=16)
```

| Function | Model | Notes |
|----------|-------|-------|
| `create_lstm_model()` | LSTM | Optional self-attention |
| `create_bidirectional_lstm_model()` | BiLSTM | + BatchNorm + Dense(32) |
| `create_gru_model()` | GRU | Optional self-attention |
| `create_bidirectional_gru_model()` | BiGRU | + BatchNorm + Dense(32) |
| `create_cnn_lstm_model()` | CNN-BiLSTM | Conv1D(64,3) → MaxPool → Conv1D(128,3) → LSTM |
| `create_transformer_model()` | Transformer | Multi-head attention + FFN blocks |
| `create_stacked_lstm_model()` | Stacked LSTM | Configurable depth with BatchNorm between layers |

**Model Registry** (used by `create_model(model_type, **kwargs)`):
```python
MODEL_REGISTRY = {
    "lstm", "bilstm", "gru", "bigru",
    "cnn_lstm", "transformer", "stacked_lstm"
}
```

---

### `train_and_evaluate.py`

#### `train_model(model, X_train_inputs, y_train, X_val_inputs, y_val, ...)`
Compiles and trains a model with:
- **Optimiser**: Adam (`lr=0.001`, `clipnorm=1.0`)
- **Loss**: MSE
- **Callbacks**:
  - `EarlyStopping(patience=10, restore_best_weights=True)`
  - `ModelCheckpoint(monitor="val_loss")` → `checkpoints/saved_models/{name}/best.keras`
  - `ReduceLROnPlateau(factor=0.5, patience=3, min_lr=1e-6)`
  - `TensorBoard` → `checkpoints/logs/{name}/`

Saves:
- `best.keras` — best validation loss checkpoint
- `final_{name}.keras` — final epoch weights
- `final_{name}.json` — architecture JSON
- `final_{name}_weights.npz` — raw weight arrays

#### `evaluate_model(model, X_test_inputs, y_test, meta_test, ...)`
Computes MSE, RMSE, MAE, R² on the test set and generates:
- Actual vs Predicted scatter plot
- Error distribution histogram
- Per-location time-series prediction examples

---

### `load_data.py`
Thin wrapper around `feature_engineering.load_processed_data()` for use inside the training notebook.

## Hyperparameter Defaults

| Parameter | Default | Notes |
|-----------|---------|-------|
| `seq_length` | 24 | 6 hours of history |
| `embedding_dim` | 16 | Location embedding size |
| `lstm_units` / `gru_units` | 64 | Recurrent layer width |
| `filters` (CNN) | 64 | CNN-BiLSTM/BiGRU first conv filters |
| `kernel_size` (CNN) | 3 | Temporal convolution kernel |
| `dropout_rate` | 0.2 | Applied to recurrent and dense layers |
| `epochs` | 50 | Effective epochs typically 20–35 (early stopping) |
| `batch_size` | 128 | |

## Extending with a New Architecture
1. Add a `create_my_model(**kwargs)` function in `model_architecture.py`
2. Register it in `MODEL_REGISTRY`
3. Instantiate in `train_and_evaluate.ipynb` with `create_model("my_model", **params)`
