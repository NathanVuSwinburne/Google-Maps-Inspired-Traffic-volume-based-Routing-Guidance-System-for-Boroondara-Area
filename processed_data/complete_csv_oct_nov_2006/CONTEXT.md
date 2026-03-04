# processed_data/complete_csv_oct_nov_2006 — Context

## Purpose
Stores **model-generated traffic volume predictions** for the full Oct–Nov 2006 period (gap-filling for October + full November forecasts). These CSVs are the **live data source consumed by the routing app at runtime**.

## Structure

```
complete_csv_oct_nov_2006/
├── lstm_model/
│   └── lstm_model_complete_data.csv
├── gru_model/
│   └── gru_model_complete_data.csv
└── bi_lstm_model/
    └── bi_lstm_model_complete_data.csv
```

## CSV Schema

| Column | Type | Description |
|--------|------|-------------|
| `Location` | str | Approach-level location string (matches `location_to_idx` keys) |
| `Date` | date | `YYYY-MM-DD` format |
| `interval_id` | int | 0–95 (15-min interval index within the day) |
| `traffic_volume` | float | Predicted (or actual) vehicle count |
| `data_source` | str | `"actual"` or `"predicted"` — indicates origin of the value |

## Generation
Produced by `src/inference/rolling_prediction_script.py` in two phases:
1. **Phase 1** — Gap-filling: predicts any missing October intervals using rolling windows on the actual data
2. **Phase 2** — November forecast: predicts all 96 intervals × 30 days × N locations for November

Each phase updates a `SequenceManager` so predictions feed back as context for subsequent intervals (autoregressive rolling window).

## Runtime Usage in `RouteFinder`
`src/core/route_finder.py::_load_dataframes()` loads all three CSVs at startup. When a user selects a model and datetime:
1. The matching `Date` row is found (closest available date used as fallback)
2. The closest `interval_id` to the requested time is used
3. `traffic_volume` per `Location` is looked up to set edge weights on the routing graph

## Model Mapping (in `RouteFinder`)

| User-facing name | CSV folder |
|------------------|-----------|
| `"LSTM"` | `lstm_model/` |
| `"GRU"` | `gru_model/` |
| `"Custom"` (BiLSTM) | `bi_lstm_model/` |

## Important Notes
- All three files should cover the same date/location combinations for consistent UI behaviour
- `data_source = "predicted"` rows in November are entirely synthetic — suitable for demonstration, not operational deployment
- If a location is missing from a CSV, the routing engine falls back to a default traffic volume of 100 veh/15 min
