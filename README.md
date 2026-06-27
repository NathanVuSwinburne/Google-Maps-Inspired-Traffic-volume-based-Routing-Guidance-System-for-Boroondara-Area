# 🚦 Traffic Congestion Prediction & Route Optimisation System (Boroondara 2006)

An **end-to-end traffic prediction & routing** project that fuses **deep learning time-series forecasting** with **heuristic graph search** to deliver **congestion-aware routes**.
Built on **real-world SCATS traffic signal volume data (City of Boroondara, 2006)** from the Victorian Government DataVic portal.

<p align="left">
  <img alt="Python" src="https://img.shields.io/badge/Python-3.10+-blue">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-routing-blue">
  <img alt="TensorFlow" src="https://img.shields.io/badge/TensorFlow-Deep%20Learning-orange">
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-Deployed-black">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green">
  <img alt="Live" src="https://img.shields.io/badge/Live-Demo-brightgreen">
</p>

> ⭐ **Live Demo**: [https://google-maps-inspired-traffic-volume.vercel.app/routes](https://google-maps-inspired-traffic-volume.vercel.app/routes)

---

## ✨ Key Features

- **Time-Series ML**: LSTM, GRU, BiLSTM, CNN-BiLSTM, CNN-BiGRU (TensorFlow/Keras).
- **Feature Engineering**: Lag features (15m/1h/1d), sin/cos encodings (DoW/ToD), weekend & gap flags, location embeddings, baseline averages.
- **Heuristic Routing**: A*, UCS, BFS, DFS, GBFS, Fringe Search; **Haversine** heuristic; **travel-time weighted edges** from ML predictions.
- **Interactive App**: Next.js + Mapbox GL with **color-coded congestion maps**, multi-model/multi-algorithm comparisons, animated route overlays.
- **Fully Static**: All routing algorithms ported to TypeScript and run **entirely in the browser** — no backend server required.
- **Robustness**: 10+ structured system tests (isolated nodes, long routes, rush hour vs off-peak, date bounds).

**Page 1.1: Network Map**

<img width="1915" height="865" alt="image" src="https://github.com/user-attachments/assets/82eb5f11-3c5f-4676-977d-beffa31649fc" />

**Page 1.1: Search for Site Information**

<img width="1914" height="866" alt="image" src="https://github.com/user-attachments/assets/fbeb478f-71e2-4247-a880-38ab611bbe16" />

**Page 2.1: Route Finder**

<img width="1914" height="870" alt="image" src="https://github.com/user-attachments/assets/af9179c2-98fd-4273-8d22-58790c05744a" />

**Page 2.2: Algorithms Ranking**

<img width="1910" height="867" alt="image" src="https://github.com/user-attachments/assets/19ae5ab3-c272-4db7-bdb6-9f137e1f2dfd" />

---

## 📊 Results (Boroondara 2006)

| Model        | MAE    | RMSE   | R²     |
|--------------|--------|--------|--------|
| LSTM         | 13.16  | 18.88  | 0.9521 |
| GRU          | 13.51  | 18.63  | 0.9534 |
| BiLSTM       | 12.64  | 18.42  | 0.9544 |
| CNN-BiLSTM   | 16.87  | 11.25  | 0.9617 |
| **CNN-BiGRU**| **16.83** | **11.23** | **0.9620** |

> **Takeaway:** Hybrid CNN-BiGRU delivers **lowest RMSE** & **highest R²**, capturing peaks and fluctuations more reliably while remaining efficient.

---

## 📦 Pre-computed Traffic Dataset

ML predictions are pre-processed offline and committed to the repository as static JSON files loaded in the browser:

| File | Size | Contents |
|------|------|----------|
| `public/data/traffic_LSTM.json` | ~16.5 MB (~1.7 MB gzipped) | LSTM predictions |
| `public/data/traffic_GRU.json` | ~16.4 MB (~1.7 MB gzipped) | GRU predictions |
| `public/data/traffic_Bi_LSTM.json` | ~16.5 MB (~1.7 MB gzipped) | BiLSTM predictions |
| `public/data/network.json` | <1 MB | 39 sites, 84 road connections |

- **Coverage**: 61 dates × 96 intervals × 83 routing locations = **802,272 predictions per model** (2,406,816 total across 3 models)
- **Structure**: `{ date → { interval_id → { LOCATION → volume } } }` — O(1) lookup at route-find time

---

## 🗺️ Data

- **Source**: Victorian Government **DataVic** — Traffic Signal Volume Data
  https://discover.data.vic.gov.au/dataset/traffic-signal-volume-data
- **Scope**: **City of Boroondara**, **Oct–Nov 2006**, **15-minute intervals** (SCATS sites).
- **Note**: Historical, geographically bounded dataset → realistic **missingness**, **seasonality**, **domain constraints**.

---

## 🧰 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Mapbox GL (`react-map-gl`), SWR, Tailwind CSS
- **Routing (in-browser)**: A\*, UCS, BFS, DFS, GBFS, Fringe Search — all implemented in TypeScript with a MinHeap and Haversine heuristic
- **ML**: TensorFlow/Keras — LSTM, GRU, BiLSTM, CNN-BiLSTM, CNN-BiGRU (trained offline in Python)
- **Deployment**: Vercel (static export, zero backend)

---

## 🚀 Running the App Locally

### Prerequisites

| Tool | Minimum version | How to check |
|------|----------------|--------------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Mapbox token | — | Free at [mapbox.com](https://www.mapbox.com) (starts with `pk.`) |

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/NathanVuSwinburne/Traffic-volume-based-Routing-Guidance-System-for-Boroondara-Area.git
cd Google-Maps-Inspired-Traffic-volume-based-Routing-Guidance-System-for-Boroondara-Area
```

---

### Step 2 — Configure your Mapbox token

```bash
cd frontend
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
```

> `frontend/.env.local` is git-ignored — your token is never committed to the repository.

---

### Step 3 — Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Page | Path | What it does |
|------|------|--------------|
| Network Map | `/network` | Interactive map of all SCATS intersections and road connections |
| Route Finder | `/routes` | Pick origin, destination, date/time, ML model and algorithms — get ranked routes drawn on the map |

> No backend required. All routing runs in the browser using pre-computed traffic data.

---

### Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Map is blank or shows a token error | Mapbox token missing/invalid | Check `NEXT_PUBLIC_MAPBOX_TOKEN` in `frontend/.env.local` |
| `npm: command not found` | Node.js not installed | Download LTS from [nodejs.org](https://nodejs.org) |

---

## ☁️ Production Deployment (Vercel)

The app is deployed as a **fully static Next.js site** on Vercel — no backend server, no EC2.

**[https://google-maps-inspired-traffic-volume.vercel.app/routes](https://google-maps-inspired-traffic-volume.vercel.app/routes)**

### Architecture

```
User Browser
     │
     ▼
Vercel CDN (global edge)
     │
     ├── Next.js static pages (HTML/JS/CSS)
     │
     └── /public/data/*.json  ← pre-computed ML predictions served as static files
              │
              ▼
     In-browser routing engine (TypeScript)
     A*, UCS, BFS, DFS, GBFS, Fringe Search
```

### How it works

1. **User selects** origin, destination, date/time, ML model, and algorithms
2. **Browser fetches** `traffic_<model>.json` once and caches it for the session
3. **Routing engine** builds a weighted graph from traffic volumes and runs the selected algorithms
4. **Results** are ranked by travel time and drawn as animated overlays on the Mapbox map

### Deploy your own

1. Fork the repo and push to GitHub
2. Sign up at [vercel.com](https://vercel.com) with GitHub
3. Import the repo → set **Root Directory** to `frontend`
4. Add environment variable: `NEXT_PUBLIC_MAPBOX_TOKEN` = your Mapbox token
5. Deploy — every push to `main` auto-redeploys

---

## 💡 What I Learned

- Real-world traffic data is noisy — sensor dropouts, missing intervals, and inconsistent timestamps required significant preprocessing before any modelling was viable
- Temporal feature engineering (lag windows, sin/cos time encodings, weekend flags) improved all five models more than switching architectures did
- CNN layers as feature extractors before a BiGRU captured both local patterns and long-range dependencies better than a plain LSTM baseline
- Heuristic search algorithms (A\*, GBFS) are fast enough for interactive use when edge weights come from pre-computed ML predictions rather than real-time API calls
- Porting the routing engine from Python to TypeScript and pre-computing traffic lookups eliminated the need for a backend server entirely, reducing hosting cost to zero

## ⚠️ Limitations & Next Steps

- **2006 data** — the SCATS dataset is historical; the system cannot predict real-time conditions and would need a live data feed for operational use
- **Fixed graph** — intersection topology is static; road closures or new routes require a graph rebuild
- **No retraining pipeline** — models are trained once offline; adding automated retraining on fresher data would be the natural next step
- **Mapbox dependency** — the frontend requires a Mapbox API token; replacing with an open alternative (e.g. OpenLayers + OpenStreetMap) would remove the dependency
