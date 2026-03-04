# src — Context

## Purpose
The `src/` package contains **all Python application source code**, organized by functional domain. It is cleanly separated from data, notebooks, and configuration files at the project root.

## Module Map

```
src/
├── algorithms/          # Graph search algorithm implementations (A*, BFS, DFS, UCS, GBFS, Fringe)
├── core/                # Domain logic: network graph builder + route finder
├── data_preprocessing/  # ETL pipeline: raw CSV → cleaned long-format → ML sequences
├── inference/           # Rolling prediction script for gap-fill + November forecasting
├── train_and_evaluate/  # Model architecture registry + training/evaluation harness
├── utils/               # Shared plotting helpers
├── views/               # Streamlit page renderers (Network Map, Route Finder)
└── visualizer/          # Folium map builders (network view, single/multi-route views)
```

## Dependency Graph

```
app.py
  ├── src.core.map_builder.SiteNetwork
  │     └── processed_data/preprocessed_data/sites_metadata.json
  ├── src.core.route_finder.RouteFinder
  │     ├── src.algorithms.*
  │     └── processed_data/complete_csv_oct_nov_2006/**/*.csv
  ├── src.visualizer.NetworkVisualizer
  ├── src.visualizer.RouteVisualizer
  ├── src.views.NetworkPage
  └── src.views.RoutePage
```

## Design Principles
- **No circular imports**: algorithms ← core ← views/visualizer ← app
- **Separation of concerns**: UI (views), domain logic (core), rendering (visualizer), search (algorithms)
- **Stateless algorithms**: each search class receives a `SearchGraph` and returns a path; no side effects
- **Data-driven routing**: edge weights are ML-predicted travel times, not fixed distances

## Entry Points
| Script / Notebook | Purpose |
|-------------------|---------|
| `app.py` (root) | Streamlit web application |
| `src/data_preprocessing/clean_data.py` | Step 1 of pipeline |
| `src/data_preprocessing/feature_engineering.py` | Step 2 of pipeline |
| `src/train_and_evaluate/train_and_evaluate.py` | Model training |
| `src/inference/rolling_prediction_script.py` | Inference for Oct+Nov |
