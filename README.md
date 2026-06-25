# Traffic Congestion Prediction & Route Guidance System

A full-stack application that forecasts traffic congestion and computes optimal routes across Melbourne's Boroondara area using real-world SCATS sensor data and a suite of deep learning models.

Built for the COS30049 Computing Technology Innovation Project unit at Swinburne University of Technology.

---

## Problem

Melbourne's road network generates large volumes of sensor data, but static routing tools do not incorporate predicted congestion — they react to current conditions rather than anticipating bottlenecks. This project asks: can we forecast intersection-level congestion 15–60 minutes ahead and use those forecasts to compute better routes before drivers encounter delays?

---

## Solution

A pipeline that:
1. Cleans and preprocesses raw SCATS traffic volume data
2. Engineers temporal features (time-of-day, day-of-week, lag windows) to expose congestion patterns
3. Trains and evaluates five deep learning forecasting architectures
4. Converts predicted traffic volumes into estimated travel times
5. Feeds those travel times into graph-search routing algorithms to compute optimal paths
6. Presents congestion maps and route comparisons in an interactive web interface

---

## Architecture

```
Next.js Frontend (Mapbox GL maps, route UI)
        │
        ▼ HTTP
FastAPI Backend
    ├── Traffic forecasting  — LSTM / GRU / CNN-BiGRU model inference
    ├── Travel time estimator — converts predicted volume → travel time
    └── Route engine          — A*, UCS, GBFS, BFS, DFS, Fringe Search
            │
     Pre-processed SCATS dataset (Boroondara 2006, DataVic)
```

![Architecture diagram](assets/architecture.png)
<!-- TODO: Add architecture diagram -->

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 14, React 18, Mapbox GL JS, TypeScript |
| Backend | FastAPI, Python 3.10+ |
| ML / Forecasting | TensorFlow/Keras, LSTM, GRU, BiLSTM, CNN-BiLSTM, CNN-BiGRU |
| Routing | A\*, Uniform Cost Search, Greedy Best-First, BFS, DFS, Fringe Search |
| Infrastructure | AWS EC2, Nginx, systemd |
| Data | SCATS 2006 traffic volume data (DataVic open data) |

---

## Key Features

- **Multi-model forecasting** — five architectures trained and benchmarked; best model selected for inference
- **Six routing algorithms** — choose between optimal (A\*, UCS) and approximate (GBFS, Fringe Search) strategies and compare results side by side
- **Interactive congestion map** — visualise predicted congestion levels across the Boroondara intersection network
- **Travel time integration** — routing costs derived from forecasted volumes, not static speed limits
- **AWS EC2 deployment** — FastAPI served behind Nginx with systemd process management

---

## Results

| Model | MAE | RMSE | R² |
|---|---|---|---|
| LSTM | — | — | — |
| GRU | — | — | — |
| BiLSTM | — | — | — |
| CNN-BiLSTM | — | — | — |
| **CNN-BiGRU** | **16.83** | **11.23** | **0.962** |

CNN-BiGRU achieved the best performance across all metrics, capturing short-term fluctuations while remaining stable over longer horizons. R² of 0.962 indicates the model explains 96.2% of variance in traffic volume.

<!-- TODO: Add model comparison chart to assets/model-results.png -->

---

## Screenshots

![Congestion map](assets/congestion-map.png)
<!-- TODO: Add congestion map screenshot -->

![Route comparison](assets/route-comparison.png)
<!-- TODO: Add route comparison screenshot showing A* vs GBFS outputs -->

---

## Data

Traffic volume data sourced from [DataVic](https://discover.data.vic.gov.au/) — Victoria's open data portal. The SCATS dataset covers 2006 intersection-level vehicle counts across the City of Boroondara.

**Data processing steps:**
1. Load raw SCATS CSV, parse timestamps, handle missing sensor readings
2. Aggregate to 15-minute intervals per intersection
3. Engineer lag features (t-1, t-2, t-4, t-96 steps), time-of-day sine/cosine encoding, day-of-week flags
4. Train/validation/test split respecting temporal ordering (no leakage)

---

## How to Run Locally

**Requirements:** Python 3.10+, Node.js 18+, Mapbox API token

```bash
git clone https://github.com/NathanVuSwinburne/Google-Maps-Inspired-Traffic-volume-based-Routing-Guidance-System-for-Boroondara-Area.git
cd Google-Maps-Inspired-Traffic-volume-based-Routing-Guidance-System-for-Boroondara-Area

# Backend
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000

# Frontend — create frontend/.env.local and add:
# NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

---

## AWS EC2 Deployment

The production setup runs FastAPI behind Nginx as a reverse proxy with systemd managing both services. Frontend is built and served statically. The backend loads pre-trained model weights and the processed SCATS dataset into memory on startup.

---

## What I Learned

- Real-world traffic data is noisy — sensor dropouts, missing intervals, and inconsistent timestamps required significant preprocessing before any modelling was viable
- Temporal feature engineering matters more than architecture choice for time-series tasks; adding lag features and cyclical time encodings improved all five models
- Heuristic search algorithms (A\*, GBFS) are fast enough for interactive use when edge weights come from ML predictions rather than real-time API calls
- CNN layers as feature extractors before a BiGRU substantially improved both accuracy and training stability compared to a plain LSTM baseline
- Deploying on EC2 with Nginx + systemd is straightforward but requires careful handling of model load time at startup — lazy loading or pre-warming is necessary for acceptable first-response latency

## Limitations and Next Steps

- **2006 data** — the SCATS dataset is historical; the system cannot predict real-time conditions and would need a live data feed for operational use
- **Fixed graph** — intersection topology is static; road closures or new routes require a graph rebuild
- **No retraining pipeline** — models are trained once offline; adding automated retraining on fresher data would be the natural next step
- **Mapbox dependency** — the frontend requires a Mapbox API token; replacing with an open alternative (e.g. OpenLayers + OpenStreetMap) would remove the dependency
