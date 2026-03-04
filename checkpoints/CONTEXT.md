# checkpoints — Context

## Purpose
Stores all **model training artefacts** — saved weights, TensorBoard logs, training curve plots, and evaluation outputs. Each sub-directory is namespaced by `{model_type}_{YYYYMMDD_HHMMSS}` to track separate training runs.

## Structure

```
checkpoints/
├── saved_models/           # Keras model files (.keras) + weights
├── evaluations/            # Test-set metrics, scatter plots, prediction examples
├── logs/                   # TensorBoard event files
└── training_plots/         # Loss / MAE curves saved as PNG
```

## Trained Model Runs

| Run ID | Model Type | Timestamp |
|--------|-----------|-----------|
| `bilstm_20250512_080220` | BiLSTM | 2025-05-12 08:02 |
| `enhanced_bigru_20250512_073351` | CNN-BiGRU (enhanced) | 2025-05-12 07:33 |
| `cnn_bigru_20250512_084138` | CNN-BiGRU | 2025-05-12 08:41 |
| `cnn_bilstm_20250512_092345` | CNN-BiLSTM | 2025-05-12 09:23 |
| `gru_20250512_095057` | GRU | 2025-05-12 09:50 |
| `lstm_20250512_101404` | LSTM | 2025-05-12 10:14 |

## Model Performance Summary (test set)

| Run | MAE | RMSE | R² |
|-----|-----|------|-----|
| LSTM | 13.16 | 18.88 | 0.9521 |
| GRU | 13.51 | 18.63 | 0.9534 |
| BiLSTM | 12.64 | 18.42 | 0.9544 |
| CNN-BiLSTM | 16.87 | 11.25 | 0.9617 |
| **CNN-BiGRU** | **16.83** | **11.23** | **0.9620** |

## Sub-directory Details
See `CONTEXT.md` within each sub-directory for file-level descriptions.

## How to View TensorBoard
```bash
tensorboard --logdir checkpoints/logs
```
Then open `http://localhost:6006` in a browser.

## Reloading a Model
```python
import tensorflow as tf
model = tf.keras.models.load_model(
    "checkpoints/saved_models/cnn_bigru_20250512_084138/best.keras"
)
```
Always pair with the matching `processed_data/preprocessed_data/scaler.pkl` for correct feature normalization.
