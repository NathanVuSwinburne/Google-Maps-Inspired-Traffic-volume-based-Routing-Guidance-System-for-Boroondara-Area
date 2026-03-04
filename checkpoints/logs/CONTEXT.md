# checkpoints/logs — Context

## Purpose
Stores **TensorBoard event files** for each training run, enabling interactive visualization of training dynamics.

## File Layout (per run)

```
logs/{run_id}/
└── events.out.tfevents.*    # TensorBoard binary event log
```

## What Is Logged
| Signal | Description |
|--------|-------------|
| `loss` | Training MSE per epoch |
| `val_loss` | Validation MSE per epoch |
| `mae` | Training MAE per epoch |
| `val_mae` | Validation MAE per epoch |
| `histogram_freq=1` | Weight/bias histograms per epoch |
| `write_graph=True` | Computation graph structure |

## How to Launch TensorBoard
```bash
# From the project root
tensorboard --logdir checkpoints/logs

# Filter to a single run
tensorboard --logdir checkpoints/logs/cnn_bigru_20250512_084138
```
Then open `http://localhost:6006`.

## Useful Checks
- **Overfitting**: training loss continues decreasing while val_loss plateaus or rises
- **Learning rate reduction**: sudden drops in loss indicate `ReduceLROnPlateau` triggered
- **Early stopping**: training terminates before `epochs=50` if val_loss hasn't improved for 10 epochs
