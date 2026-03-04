# src/utils — Context

## Purpose
Shared **utility functions** used across multiple modules. Keeps common logic (plotting, helpers) out of domain-specific files.

## Files

### `utils.py`
| Function | Signature | Description |
|----------|-----------|-------------|
| `plot_traffic_heatmap` | `(df, location, output_dir)` | Creates a seaborn heatmap of traffic volume by hour-of-day × day-of-week for a given location string. Saves PNG to `output_dir/heatmap_{location}.png`. |

## Usage Example
```python
from src.utils.utils import plot_traffic_heatmap

plot_traffic_heatmap(df_clean, "WARRIGAL_RD_N_of_TOORAK_RD", "processed_data/eda_insights")
```

## Adding New Utilities
Any function needed by 2+ modules belongs here. Keep functions pure (no side effects beyond file I/O) and well-documented with docstrings. Avoid importing from `src.core` or `src.algorithms` — utils should have no upward dependencies.
