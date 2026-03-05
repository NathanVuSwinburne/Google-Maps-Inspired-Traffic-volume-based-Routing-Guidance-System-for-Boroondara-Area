# PROJECT_CONTEXT — Traffic-Based Route Guidance System (TBRGS)

## What This Project Does
An end-to-end system that predicts traffic volumes at SCATS intersections in the **City of Boroondara, Melbourne** and uses those predictions to find the **fastest route** between any two intersections — styled after Google Maps' congestion-aware routing.

Live demo: https://traffic-based-route-guidance-system.streamlit.app/

---

## System Architecture (High Level)

```
[Browser]
    └── Next.js frontend (port 3000)
          ├── /network  — Network Map (Mapbox GL, all sites + connections)
          └── /routes   — Route Finder (form → ranked routes on Mapbox)
                │  POST /api/routes/find
                │  GET  /api/network/sites
                │  GET  /api/network/connections
                ▼
        FastAPI backend (port 8000)
          ├── Startup: loads SiteNetwork + RouteFinder once (from src/core/)
          ├── RouteService (threading.Lock — RouteFinder is not thread-safe)
          └── Returns clean JSON (route coords, ETA, traffic_level, steps)
                │
                ├── SiteNetwork (src/core/map_builder.py)
                │     └── sites_metadata.json → directed road graph
                └── RouteFinder (src/core/route_finder.py)
                      ├── complete_csv_oct_nov_2006/ → traffic lookup
                      └── SearchGraph + Algorithms (A*, UCS, BFS, DFS, GBFS, Fringe)
```

**Legacy Streamlit app** (`app.py`, `src/views/`, `src/visualizer/`) archived to `legacy/` — not active.

---

## Folder Quick Reference

| Folder | Role | Key Files |
|--------|------|-----------|
| `raw_data/` | Immutable source data | `modified_scats_data_oct_2006.csv` |
| `processed_data/preprocessed_data/` | ML-ready tensors + artefacts | `X_train.npz`, `scaler.pkl`, `sites_metadata.json` |
| `processed_data/complete_csv_oct_nov_2006/` | Runtime traffic predictions | `{model}_model_complete_data.csv` |
| `processed_data/eda_insights/` | EDA visualisations | `*.png` |
| `checkpoints/saved_models/` | Trained Keras models | `best.keras` per run |
| `checkpoints/evaluations/` | Test metrics + plots | `*_scatter.png`, `*_error_hist.png` |
| `checkpoints/logs/` | TensorBoard logs | `events.out.tfevents.*` |
| `checkpoints/training_plots/` | Loss/MAE curve PNGs | `*_loss.png`, `*_mae.png` |
| `src/algorithms/` | Search algorithms | `astar.py`, `ucs.py`, … |
| `src/core/` | Domain logic | `map_builder.py`, `route_finder.py` |
| `src/data_preprocessing/` | ETL pipeline | `clean_data.py`, `feature_engineering.py` |
| `src/inference/` | Batch prediction | `rolling_prediction_script.py` |
| `src/train_and_evaluate/` | Model defs + training | `model_architecture.py`, `train_and_evaluate.py` |
| `src/utils/` | Shared helpers | `utils.py` |
| `backend/` | FastAPI REST API | `main.py`, `routers/`, `schemas/`, `services/` |
| `frontend/` | Next.js 14 web app | `app/`, `components/`, `hooks/`, `lib/`, `types/` |
| `legacy/src/views/` | Archived Streamlit pages | `network_page.py`, `route_page.py` |
| `legacy/src/visualizer/` | Archived Folium renderers | `route_visualizer.py`, `network_visualizer.py` |

> Each folder has its own `CONTEXT.md` with detailed file-level descriptions.

---

## Data Pipeline (Offline — run once)

```
raw_data/modified_scats_data_oct_2006.csv
    │
    ▼ src/data_preprocessing/clean_data.py
processed_data/preprocessed_data/cleaned_data.csv
    │
    ▼ src/data_preprocessing/feature_engineering.py
processed_data/preprocessed_data/{X,y}_{train,test}.npz + pickles
    │
    ▼ train_and_evaluate.ipynb  (Colab/GPU)
checkpoints/saved_models/{run_id}/best.keras
    │
    ▼ src/inference/rolling_prediction_script.py  (Colab/GPU)
processed_data/complete_csv_oct_nov_2006/{model}/…_complete_data.csv
```

## Runtime (FastAPI + Next.js)

```
# Terminal 1
uvicorn backend.main:app --reload --port 8000
    │
    ├── SiteNetwork loads sites_metadata.json → directed road graph
    └── RouteFinder loads 3 model CSVs → traffic lookup table (once at startup)

# Terminal 2
cd frontend && npm run dev    # http://localhost:3000
    │
    └── User selects origin/dest/algorithm/model/datetime
          │
          └── POST /api/routes/find → RouteService → RouteFinder
                │
                └── Algorithm.search() → path → step details → JSON
                      │
                      └── Mapbox GL animated route lines
```

---

## ML Models Benchmarked

| Model | MAE | RMSE | R² | Notes |
|-------|-----|------|----|-------|
| LSTM | 13.16 | 18.88 | 0.9521 | Baseline |
| GRU | 13.51 | 18.63 | 0.9534 | Faster to train |
| BiLSTM | 12.64 | 18.42 | 0.9544 | Best MAE |
| CNN-BiLSTM | 16.87 | 11.25 | 0.9617 | |
| **CNN-BiGRU** | **16.83** | **11.23** | **0.9620** | **Best RMSE + R²** |

Training data: Oct 2006 (80%); Test: last 20% of dates.
Metric units: vehicles per 15-min interval.

---

## Tech Stack

| Layer | Libraries |
|-------|-----------|
| ML | TensorFlow >= 2.15, Keras, scikit-learn |
| Data | pandas, NumPy, openpyxl |
| Routing | haversine, custom graph search |
| **API** | **FastAPI, uvicorn, Pydantic** |
| **Web UI** | **Next.js 14, React, Mapbox GL (react-map-gl), SWR, Tailwind CSS** |
| Viz (offline) | Matplotlib, Seaborn |
| Infra | Python 3.10+, Node.js 18+, Git |

---

## Key Design Decisions

1. **Location-level granularity** — models predict per approach-direction (e.g., `WARRIGAL_RD_N_of_TOORAK_RD`), not per intersection, capturing directional asymmetry
2. **Location embeddings** — categorical location identity is encoded as a learned embedding rather than one-hot, enabling generalisation across sites
3. **Temporal split** — train/test split by date (not random) to prevent future data leakage
4. **Autoregressive inference** — predictions for future intervals feed back as lag features for subsequent predictions
5. **Directed graph** — connections are validated against SCATS approach metadata (cardinal direction matching) to avoid phantom routes
6. **Travel-time weighting** — quadratic speed-flow model converts predicted vehicle counts to minutes, including 30 s intersection delay

---

## Running Locally

```bash
git clone https://github.com/NathanVuSwinburne/Traffic-volume-based-Routing-Guidance-System-for-Boroondara-Area.git

# Backend (Terminal 1)
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000

# Frontend (Terminal 2)
cd frontend
# Add your Mapbox token to .env.local:
# NEXT_PUBLIC_MAPBOX_TOKEN=pk.ey...
npm install
npm run dev
# Open http://localhost:3000
```

The app loads pre-computed prediction CSVs — no GPU required at runtime.

---

## For New Contributors

- Start with `src/CONTEXT.md` for the module map
- Read `src/core/CONTEXT.md` to understand how routing works
- Read `src/data_preprocessing/CONTEXT.md` before touching the ETL pipeline
- Read `src/algorithms/CONTEXT.md` before adding a new search algorithm
- Never modify files in `raw_data/` — treat them as immutable
