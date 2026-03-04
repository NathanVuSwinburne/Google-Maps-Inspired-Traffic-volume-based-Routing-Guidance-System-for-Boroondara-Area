# CLAUDE.md — AI Agent Guide for TBRGS

> This file is the **primary reference for AI coding agents** working on this repository.
> Read this file and all referenced `CONTEXT.md` files **before making any code changes**.

---

## 1. Project Overview

**Traffic-Based Route Guidance System (TBRGS)** is an end-to-end ML + graph-routing system for the **City of Boroondara, Melbourne, Australia**.

It combines:
- **Deep learning traffic forecasting** — predicts 15-minute vehicle counts at SCATS traffic signal intersections
- **Congestion-aware routing** — uses those predictions as edge weights in a directed road graph to find the fastest path between any two intersections

**Data scope**: City of Boroondara, October–November 2006 (15-min SCATS signal volume data from Victorian Government DataVic).

**Live demo**: https://traffic-based-route-guidance-system.streamlit.app/

### Major Features
- Five trained deep learning models: LSTM, GRU, BiLSTM, CNN-BiLSTM, CNN-BiGRU
- Six graph search algorithms: A\*, UCS, BFS, DFS, GBFS, Fringe Search
- Haversine-based admissible heuristic for informed search
- Travel-time edge weights derived from a quadratic speed-flow model (traffic volume → speed → minutes)
- Interactive Streamlit + Folium web app with colour-coded congestion maps
- Multi-route comparison: up to 6 algorithms run simultaneously, ranked by travel time
- Time-progression awareness: each route segment looks up traffic at the time you'd actually reach it

---

## 2. Architecture Overview

### Frontend
**Next.js 14** app (`frontend/`) with two pages rendered via **Mapbox GL** (`react-map-gl`):

| Page | File | Description |
|------|------|-------------|
| Network Map | `frontend/app/network/page.tsx` | Mapbox map of all SCATS sites + connections; site search + detail tables |
| Route Finder | `frontend/app/routes/page.tsx` | Form → ranked routes rendered as animated dasharray lines on Mapbox |

Data fetched via SWR hooks in `frontend/hooks/`; GeoJSON conversion done in hooks before reaching map components.

### Backend
**FastAPI** server (`backend/`) exposes routing and network data as a JSON REST API.

| Module | Location | Responsibility |
|--------|----------|----------------|
| `main.py` | `backend/main.py` | FastAPI app, CORS, lifespan startup (loads SiteNetwork + RouteFinder once) |
| `RouteService` | `backend/services/route_service.py` | Thread-safe `RouteFinder` wrapper (`threading.Lock`) |
| Network router | `backend/routers/network.py` | GET `/api/network/sites`, `/connections`, `/sites/{id}` |
| Routes router | `backend/routers/routes.py` | POST `/api/routes/find` |
| Schemas | `backend/schemas/` | Pydantic request/response models with field validators |
| `SiteNetwork` | `src/core/map_builder.py` | Builds directed graph from SCATS metadata JSON |
| `RouteFinder` | `src/core/route_finder.py` | Loads ML prediction CSVs, builds `SearchGraph`, runs algorithms, computes route details |
| `SearchGraph` | `src/algorithms/search_graph.py` | Adjacency list + coordinate store used by all search algorithms |
| Search algorithms | `src/algorithms/*.py` | Six interchangeable implementations of `SearchAlgorithm.search()` |

### Machine Learning Components

| Stage | Location | Description |
|-------|----------|-------------|
| Data cleaning | `src/data_preprocessing/clean_data.py` | Wide→long reshape, duplicate/sparse location removal, EDA |
| Feature engineering | `src/data_preprocessing/feature_engineering.py` | Lag features, sin/cos encodings, gap flags, sequence generation, train/test split, scaling |
| Model architecture | `src/train_and_evaluate/model_architecture.py` | Registry of 7 Keras model constructors (LSTM, GRU, BiLSTM, BiGRU, CNN-BiLSTM, Transformer, Stacked LSTM) |
| Training | `src/train_and_evaluate/train_and_evaluate.py` | Adam optimizer, MSE loss, EarlyStopping, ReduceLROnPlateau, ModelCheckpoint, TensorBoard |
| Inference | `src/inference/rolling_prediction_script.py` | CLI batch script: autoregressive rolling prediction for Oct gap-fill + full November |

**Best model**: CNN-BiGRU — RMSE 11.23, R² 0.9620.

### Data Flow

```
[Offline — run once]
raw_data/modified_scats_data_oct_2006.csv
    ↓ clean_data.py
processed_data/preprocessed_data/cleaned_data.csv
    ↓ feature_engineering.py
preprocessed_data/{X,y}_{train,test}.npz + scaler.pkl + feature_cols.pkl + location_to_idx.pkl
    ↓ train_and_evaluate.ipynb (GPU)
checkpoints/saved_models/{run_id}/best.keras
    ↓ rolling_prediction_script.py (GPU, per model)
processed_data/complete_csv_oct_nov_2006/{model}/*_complete_data.csv

[Runtime — FastAPI + Next.js]
sites_metadata.json → SiteNetwork → directed road graph   ┐
complete_csv_oct_nov_2006/*.csv → RouteFinder             ├─ loaded once at backend startup
                                                           ┘
Browser → Next.js (port 3000)
  └── POST /api/routes/find → FastAPI (port 8000)
        └── RouteService (thread-safe) → RouteFinder.find_multiple_routes()
              └── SearchGraph + Algorithm → ranked routes JSON → Mapbox map
```

---

## 3. Repository Structure

```
project-root/
├── CLAUDE.md                          ← YOU ARE HERE
├── PROJECT_CONTEXT.md                 ← Master human-readable overview
├── README.md                          ← Public-facing project description
├── app.py                             ← DEPRECATED Streamlit entry point (kept for reference)
├── requirements.txt                   ← Python dependencies (ML + legacy Streamlit)
│
├── backend/                           ← FastAPI REST API (NEW)
│   ├── CONTEXT.md
│   ├── main.py                        ← FastAPI app entry point (uvicorn backend.main:app)
│   ├── requirements.txt               ← fastapi, uvicorn, pydantic
│   ├── routers/                       ← Route handlers
│   │   ├── network.py                 ← GET /api/network/*
│   │   └── routes.py                  ← POST /api/routes/find
│   ├── schemas/                       ← Pydantic request/response models
│   │   ├── network.py
│   │   └── routes.py
│   └── services/
│       └── route_service.py           ← Thread-safe RouteFinder wrapper
│
├── frontend/                          ← Next.js 14 web app (NEW)
│   ├── CONTEXT.md
│   ├── package.json
│   ├── app/
│   │   ├── layout.tsx                 ← Root layout (Sidebar nav)
│   │   ├── network/page.tsx           ← Network Map page
│   │   └── routes/page.tsx            ← Route Finder page
│   ├── components/
│   │   ├── layout/Sidebar.tsx
│   │   ├── map/                       ← BaseMap, NetworkLayer, RouteLayer, SitePopup
│   │   ├── network/                   ← NetworkControls, ConnectionsTable, SiteConnectionsPanel
│   │   └── routes/                    ← RouteForm, RouteSummaryTable, RouteDetailPanel, RouteResultsPanel
│   ├── hooks/                         ← SWR hooks (useNetwork, useRoutes) + GeoJSON conversion
│   ├── lib/                           ← api.ts (fetch wrappers), mapColors.ts
│   └── types/index.ts                 ← All TypeScript interfaces
│
├── legacy/                            ← Archived Streamlit UI (read-only reference)
│   ├── CONTEXT.md
│   ├── app.py
│   └── src/
│       ├── views/                     ← Archived Streamlit page renderers
│       └── visualizer/                ← Archived Folium map builders
│
├── raw_data/                          ← Immutable source data (do not modify)
│   └── CONTEXT.md
│
├── processed_data/                    ← All derived data artefacts
│   ├── CONTEXT.md
│   ├── preprocessed_data/             ← ML tensors, scalers, metadata
│   │   └── CONTEXT.md
│   ├── complete_csv_oct_nov_2006/     ← Per-model prediction CSVs (runtime input)
│   │   └── CONTEXT.md
│   └── eda_insights/                  ← EDA visualisation PNGs
│       └── CONTEXT.md
│
├── checkpoints/                       ← Training artefacts
│   ├── CONTEXT.md
│   ├── saved_models/                  ← Keras .keras files
│   │   └── CONTEXT.md
│   ├── evaluations/                   ← Test metrics + evaluation plots
│   │   └── CONTEXT.md
│   ├── logs/                          ← TensorBoard event files
│   │   └── CONTEXT.md
│   └── training_plots/                ← Loss/MAE curve PNGs
│       └── CONTEXT.md
│
├── src/                               ← All application source code (UNCHANGED)
│   ├── CONTEXT.md
│   ├── algorithms/                    ← Graph search implementations
│   │   └── CONTEXT.md
│   ├── core/                          ← Domain logic (network + routing)
│   │   └── CONTEXT.md
│   ├── data_preprocessing/            ← ETL pipeline
│   │   └── CONTEXT.md
│   ├── inference/                     ← Batch rolling prediction
│   │   └── CONTEXT.md
│   ├── train_and_evaluate/            ← Model defs + training harness
│   │   └── CONTEXT.md
│   ├── utils/                         ← Shared helpers
│   │   └── CONTEXT.md
│   ├── views/                         ← Legacy Streamlit pages (still present, not active)
│   │   └── CONTEXT.md
│   └── visualizer/                    ← Legacy Folium map builders (still present, not active)
│       └── CONTEXT.md
│
├── data_preprocessing.ipynb           ← Interactive ETL notebook
├── train_and_evaluate.ipynb           ← Interactive training notebook
└── predict_missing_dates.ipynb        ← Interactive prediction notebook
```

**Every folder has a `CONTEXT.md` — read it before touching that folder's code.**

---

## 4. Core Components

### 4.1 Traffic Prediction Model

**Architecture (dual-input Keras functional API):**
```
feature_input (batch, seq=24, n_features=12)  ─┐
                                                ├─ Concatenate → recurrent/conv → Dense(1)
location_input (batch, seq=24) int32           ─┘
    └─ Embedding(n_locations, dim=16)
```

**13 input features** (see `preprocessed_data/CONTEXT.md` for full schema):
- Traffic volume + 3 lag features (15 min, 1 h, 1 day ago)
- Sin/cos encodings of time-of-day and day-of-week
- Weekend flag, gap flag, days-since-previous
- Historical average for this location × time-of-day slot
- Location embedding index

**Key files:**
- Architectures: `src/train_and_evaluate/model_architecture.py`
- Training: `src/train_and_evaluate/train_and_evaluate.py`
- Inference: `src/inference/rolling_prediction_script.py`
- Saved weights: `checkpoints/saved_models/{run_id}/best.keras`

**Critical**: always use `processed_data/preprocessed_data/scaler.pkl` when normalizing input features. The scaler is fit on training data only.

---

### 4.2 Routing Algorithms

**Location**: `src/algorithms/`

All algorithms implement the same interface:
```python
def search(self, start: int, goals: list[int]) -> tuple[int, int, list[int]]:
    # returns: (goal_node, nodes_expanded, path_as_list_of_site_ids)
```

| Algorithm | Class | Optimal? | Notes |
|-----------|-------|----------|-------|
| A\* | `AStar` | Yes | Haversine heuristic; preferred for production |
| UCS | `UCS` | Yes | No heuristic; slower than A\* |
| BFS | `BFS` | By hops | Ignores edge weights |
| DFS | `DFS` | No | For educational comparison only |
| GBFS | `GBFS` | No | Fast, near-optimal |
| Fringe | `Fringe` | Yes | Memory-efficient A\* variant |

**Edge weights** = travel time in minutes, computed by `RouteFinder._calculate_travel_time(distance_km, traffic_volume)` using a quadratic speed-flow model + 30-second intersection delay.

---

### 4.3 API / Application Layer

**FastAPI** REST API (`backend/`), started with:
```bash
uvicorn backend.main:app --reload --port 8000
```

```
backend/main.py (FastAPI)
├── lifespan startup:
│     SiteNetwork → app.state.network
│     RouteFinder → RouteService → app.state.route_service
├── GET  /api/health
├── GET  /api/network/sites
├── GET  /api/network/connections
├── GET  /api/network/sites/{site_id}
└── POST /api/routes/find
      ├── validates RouteRequest (Pydantic)
      ├── RouteService.find_routes() — acquires threading.Lock
      └── returns FindRoutesResponse JSON
```

**Thread safety**: `RouteFinder` mutates `self.graph` per call (documented in `src/core/CONTEXT.md`). `RouteService` serialises concurrent requests with a `threading.Lock`.

**Model name mapping**: UI exposes `"Bi_LSTM"` but `RouteFinder._load_dataframes()` uses `"Custom"` as the dict key for BiLSTM data. `RouteService` remaps before calling the finder.

**Swagger UI**: `http://localhost:8000/docs` (auto-generated).

---

### 4.4 Frontend Map Visualisation

**Library**: Mapbox GL via `react-map-gl` (Next.js 14, `frontend/`)

| Component | File | Description |
|-----------|------|-------------|
| `BaseMap` | `frontend/components/map/BaseMap.tsx` | `react-map-gl <Map>` wrapper, centred on Boroondara, dark-v11 style |
| `NetworkLayer` | `frontend/components/map/NetworkLayer.tsx` | Circle layer (sites) + line + arrow layers (connections) |
| `RouteLayer` | `frontend/components/map/RouteLayer.tsx` | Animated `line-dasharray` per route (AntPath equivalent) |
| `SitePopup` | `frontend/components/map/SitePopup.tsx` | Click popup with site ID, roads, locations |

**Colour semantics** (matches `legacy/src/visualizer/route_visualizer.py` exactly — see `frontend/lib/mapColors.ts`):
- Circle layers: gray (background site), red (highlighted/selected)
- Route path colours: green (best) → yellow → orange → red → darkred → black (worst)
- Routes drawn in **reverse order** so best route renders on top

**Animation**: `RouteLayer` uses `requestAnimationFrame` + `map.setPaintProperty` to cycle `line-dasharray` values, producing a moving-ant effect equivalent to Folium AntPath.

**SSR**: All Mapbox components are loaded via `next/dynamic` with `{ ssr: false }` to prevent server-side rendering errors.

---

## 5. Development Workflow

### Running the App (FastAPI + Next.js)

**Terminal 1 — Backend:**
```bash
# From project root
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
# Swagger UI: http://localhost:8000/docs
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
# Set NEXT_PUBLIC_MAPBOX_TOKEN in frontend/.env.local first
npm run dev
# App: http://localhost:3000
```

The app uses pre-computed prediction CSVs — no GPU, no model loading at startup.

### Running the Legacy Streamlit App (deprecated)
```bash
pip install -r requirements.txt
streamlit run app.py
```

### Running the ETL Pipeline (offline)
```bash
# Stage 1 — clean raw data
python src/data_preprocessing/clean_data.py

# Stage 2 — engineer features and create ML tensors
python src/data_preprocessing/feature_engineering.py

# Or via notebook:
jupyter notebook data_preprocessing.ipynb
```

### Training a Model (requires GPU)
```bash
# Via notebook (recommended for Colab):
jupyter notebook train_and_evaluate.ipynb

# Or directly:
python src/train_and_evaluate/train_and_evaluate.py
```
Checkpoints saved automatically to `checkpoints/saved_models/{model_type}_{timestamp}/`.

### Running Rolling Inference (requires GPU, TF >= 2.15)
```bash
python src/inference/rolling_prediction_script.py \
  --model_path checkpoints/saved_models/cnn_bigru_20250512_084138/best.keras \
  --model_name cnn_bigru \
  --data_path processed_data/preprocessed_data/ \
  --output_path processed_data/complete_csv_oct_nov_2006/
```

### Viewing TensorBoard
```bash
tensorboard --logdir checkpoints/logs
# Open http://localhost:6006
```

### How Models Are Loaded at Runtime
`RouteFinder.__init__()` calls `_load_dataframes()` which reads the three prediction CSVs into pandas DataFrames. There is **no Keras model loaded at app runtime** — the Streamlit app only uses the precomputed CSV outputs, not the `.keras` checkpoint files.

---

## 6. Rules for AI Agents Working in This Repository

### 6.1 Documentation First
- **Always read `CLAUDE.md` and the relevant `CONTEXT.md` files before modifying any code.**
- If touching `src/core/` → read `src/core/CONTEXT.md`
- If touching `src/algorithms/` → read `src/algorithms/CONTEXT.md`
- If touching data pipeline → read `src/data_preprocessing/CONTEXT.md` and `processed_data/CONTEXT.md`
- If touching model architecture → read `src/train_and_evaluate/CONTEXT.md`

### 6.2 Protect Inference Logic
- Do not modify `RouteFinder._calculate_travel_time()` without understanding its quadratic speed-flow model — it directly affects all route costs.
- Do not change feature engineering (feature order, lag windows, scaler) without regenerating the prediction CSVs. The CSV schema must match what `RouteFinder._load_dataframes()` expects.
- The `scaler.pkl` is coupled to the model checkpoint. Never swap one without the other.
- TensorFlow >= 2.15 is required for `.keras` format loading — do not downgrade.

### 6.3 Separate UI from ML Logic
- UI code lives exclusively in `frontend/` (React/Next.js) — no Python in frontend
- Domain logic (`SiteNetwork`, `RouteFinder`) in `src/core/` must not import from `streamlit` or any web framework
- API layer (`backend/`) must not contain routing/ML logic — it delegates to `src/core/` only
- The `src/algorithms/` classes must not import from any other `src` subpackage
- Legacy Streamlit code in `legacy/` and `src/views/` must not be modified or re-activated

### 6.4 Keep Modules Modular
- Search algorithms must extend `SearchAlgorithm` and implement `search(start, goals) → (goal, n_expanded, path)`
- New model architectures must be added to `MODEL_REGISTRY` in `model_architecture.py`
- New UI pages must extend `BasePage` and be registered in `app.py`
- New visualizers must extend `BaseVisualizer`

### 6.5 Maintain the Feature Contract
The 13-feature vector and its column order (defined in `feature_cols.pkl`) must stay consistent across:
- `src/data_preprocessing/feature_engineering.py`
- `src/inference/rolling_prediction_script.py`
- Any future inference code

If you add or reorder features, you must retrain all models and regenerate all prediction CSVs.

### 6.6 Preserve Raw Data
- Never modify files in `raw_data/` — they are immutable upstream sources.
- If source data must be corrected, create a new versioned file and document the change.

### 6.7 Do Not Delete Documentation
- Never delete `CLAUDE.md` or any `CONTEXT.md` file.
- After significant refactoring, update the relevant `CONTEXT.md` files and this `CLAUDE.md` to reflect the new architecture.
- When adding a new folder, create a `CONTEXT.md` for it.

### 6.8 Update Documentation After Changes
After any significant architectural change, update:
1. This `CLAUDE.md` (Sections 2, 3, 4, 5 as appropriate)
2. The `CONTEXT.md` in every affected folder
3. `PROJECT_CONTEXT.md` if the high-level system design changes

---

## 7. Quick Reference

### Key File Locations

| What | Where |
|------|-------|
| **Backend entry point** | `backend/main.py` (`uvicorn backend.main:app`) |
| **Frontend entry point** | `frontend/app/layout.tsx` (`npm run dev` in `frontend/`) |
| Thread-safe route wrapper | `backend/services/route_service.py` — `RouteService` |
| API schemas (Pydantic) | `backend/schemas/` |
| Typed API client | `frontend/lib/api.ts` |
| Map colour constants | `frontend/lib/mapColors.ts` |
| SWR data hooks | `frontend/hooks/useNetwork.ts`, `frontend/hooks/useRoutes.ts` |
| Road graph builder | `src/core/map_builder.py` — `SiteNetwork` |
| Route search orchestrator | `src/core/route_finder.py` — `RouteFinder` |
| All search algorithms | `src/algorithms/` |
| Model architecture registry | `src/train_and_evaluate/model_architecture.py` — `MODEL_REGISTRY` |
| ETL Stage 1 | `src/data_preprocessing/clean_data.py` |
| ETL Stage 2 | `src/data_preprocessing/feature_engineering.py` |
| Batch inference | `src/inference/rolling_prediction_script.py` |
| Runtime prediction data | `processed_data/complete_csv_oct_nov_2006/` |
| Best trained model | `checkpoints/saved_models/cnn_bigru_20250512_084138/best.keras` |
| Feature scaler | `processed_data/preprocessed_data/scaler.pkl` |
| Site topology | `processed_data/preprocessed_data/sites_metadata.json` |
| Legacy Streamlit UI | `legacy/` (archive — do not modify) |

### Module Import Hierarchy (no circular imports)
```
src.algorithms  ←  src.core  ←  src.views / src.visualizer  ←  app.py
src.utils       ←  src.data_preprocessing / src.train_and_evaluate / src.core
```

### Adding a New Search Algorithm (checklist)
1. Create `src/algorithms/my_alg.py` extending `SearchAlgorithm`
2. Implement `search(self, start, goals) → (goal, nodes_expanded, path)`
3. Register in `RouteFinder._get_algorithm()` in `src/core/route_finder.py`
4. Add name to `algorithm_options` in `src/views/route_page.py`
5. Update `src/algorithms/CONTEXT.md`

### Adding a New ML Model (checklist)
1. Add `create_my_model(**kwargs)` to `src/train_and_evaluate/model_architecture.py`
2. Register in `MODEL_REGISTRY`
3. Train via `train_and_evaluate.ipynb` → checkpoint saved to `checkpoints/saved_models/`
4. Run `rolling_prediction_script.py` → generate prediction CSV
5. Register CSV in `RouteFinder._load_dataframes()` in `src/core/route_finder.py`
6. Add to `model_options` in `src/views/route_page.py`
7. Update `src/train_and_evaluate/CONTEXT.md` and `processed_data/complete_csv_oct_nov_2006/CONTEXT.md`
