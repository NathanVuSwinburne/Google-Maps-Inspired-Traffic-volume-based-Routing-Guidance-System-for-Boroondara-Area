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
**Streamlit** web app (`app.py`) with two pages:

| Page | File | Description |
|------|------|-------------|
| Network Map | `src/views/network_page.py` | Interactive Folium map of all SCATS sites and road connections |
| Route Finder | `src/views/route_page.py` | User selects origin/dest/algorithm/model/datetime → returns ranked routes |

Maps are rendered via **Folium + AntPath** and embedded using `streamlit_folium`.

### Backend
All Python. No separate API server — Streamlit runs the backend inline.

| Module | Location | Responsibility |
|--------|----------|----------------|
| `SiteNetwork` | `src/core/map_builder.py` | Builds directed graph from SCATS metadata JSON |
| `RouteFinder` | `src/core/route_finder.py` | Loads ML prediction CSVs, builds `SearchGraph`, runs algorithms, computes route details |
| `SearchGraph` | `src/algorithms/search_graph.py` | Adjacency list + coordinate store used by all search algorithms |
| Search algorithms | `src/algorithms/*.py` | Six interchangeable implementations of `SearchAlgorithm.search()` |
| Visualizers | `src/visualizer/*.py` | Folium map builders for network and route views |

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

[Runtime — Streamlit]
sites_metadata.json → SiteNetwork → directed road graph
complete_csv_oct_nov_2006/*.csv → RouteFinder → travel-time edges
User input → SearchGraph + Algorithm → ranked routes → Folium map
```

---

## 3. Repository Structure

```
project-root/
├── CLAUDE.md                          ← YOU ARE HERE
├── PROJECT_CONTEXT.md                 ← Master human-readable overview
├── README.md                          ← Public-facing project description
├── app.py                             ← Streamlit entry point
├── requirements.txt                   ← Python dependencies
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
├── src/                               ← All application source code
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
│   ├── views/                         ← Streamlit page renderers
│   │   └── CONTEXT.md
│   └── visualizer/                    ← Folium map builders
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

There is no REST API. The application layer is **Streamlit** with inline Python calls:

```
app.py (TBRGSApp)
├── SiteNetwork     → graph topology
├── RouteFinder     → routing logic
├── NetworkPage     → renders Network Map
└── RoutePage       → renders Route Finder
     ├── collects user input (widgets)
     ├── calls RouteFinder.find_multiple_routes()
     └── calls RouteVisualizer.create_multi_route_map()
```

If a REST API is ever added, the `src/core/` layer should be the backend — it has no Streamlit dependencies.

---

### 4.4 Frontend Map Visualisation

**Library**: Folium + AntPath plugin, embedded via `streamlit_folium.folium_static()`

| Visualizer class | File | Output |
|-----------------|------|--------|
| `NetworkVisualizer` | `src/visualizer/network_visualizer.py` | Full SCATS network map with all sites |
| `RouteVisualizer` | `src/visualizer/route_visualizer.py` | Single-route or multi-route coloured path maps |
| `BaseVisualizer` | `src/visualizer/base_visualizer.py` | Shared base: `_create_base_map()`, `_add_background_sites()` |

**Colour semantics:**
- Green marker = origin, Red marker = destination, Blue marker = intermediate site
- Route path colours: green (best) → yellow → orange → red → darkred → black (worst)

---

## 5. Development Workflow

### Running the App
```bash
pip install -r requirements.txt
streamlit run app.py
```
The app uses pre-computed prediction CSVs — no GPU, no model loading at startup.

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
- Streamlit widget code lives exclusively in `src/views/`
- Domain logic (`SiteNetwork`, `RouteFinder`) in `src/core/` must not import from `streamlit`
- Visualisation (Folium maps) in `src/visualizer/` must not contain routing logic
- The `src/algorithms/` classes must not import from any other `src` subpackage

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
| App entry point | `app.py` |
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
