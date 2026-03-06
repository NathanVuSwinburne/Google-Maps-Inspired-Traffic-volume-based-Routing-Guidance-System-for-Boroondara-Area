# 🚦 AI-Powered Traffic Route Guidance System (Boroondara 2006)

An **end-to-end traffic prediction & routing** project that fuses **deep learning time-series forecasting** with **heuristic graph search** to deliver **congestion-aware routes**.
Built on **real-world SCATS traffic signal volume data (City of Boroondara, 2006)** from the Victorian Government DataVic portal.

<p align="left">
  <img alt="Python" src="https://img.shields.io/badge/Python-3.10+-blue">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-backend-green">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black">
  <img alt="TensorFlow" src="https://img.shields.io/badge/TensorFlow-Deep%20Learning-orange">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green">
  <img alt="AWS" src="https://img.shields.io/badge/AWS-EC2-orange">
  <img alt="Live" src="https://img.shields.io/badge/Live-Demo-brightgreen">
</p>

> ⭐ **Live Demo**: [http://3.25.163.65](http://3.25.163.65) — deployed on AWS EC2 with Nginx + systemd

---

## ✨ Key Features

- **Time-Series ML**: LSTM, GRU, BiLSTM, CNN-BiLSTM, CNN-BiGRU (TensorFlow/Keras).
- **Feature Engineering**: Lag features (15m/1h/1d), sin/cos encodings (DoW/ToD), weekend & gap flags, location embeddings, baseline averages.
- **Heuristic Routing**: A*, UCS, BFS, DFS, GBFS, Fringe Search; **Haversine** heuristic; **travel-time weighted edges** from ML predictions.
- **Interactive App**: Next.js + Mapbox GL with **color-coded congestion maps**, multi-model/multi-algorithm comparisons, animated route overlays.
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

## 🗺️ Data

- **Source**: Victorian Government **DataVic** — Traffic Signal Volume Data
  https://discover.data.vic.gov.au/dataset/traffic-signal-volume-data
- **Scope**: **City of Boroondara**, **Oct–Nov 2006**, **15-minute intervals** (SCATS sites).
- **Note**: Historical, geographically bounded dataset → realistic **missingness**, **seasonality**, **domain constraints**.

---

## 🧰 Tech Stack

- **Backend**: Python 3.10, FastAPI, uvicorn, Pydantic, pandas, haversine
- **Frontend**: Next.js 14, React 18, TypeScript, Mapbox GL (`react-map-gl`), SWR, Tailwind CSS
- **ML**: TensorFlow/Keras — LSTM, GRU, BiLSTM, CNN-BiLSTM, CNN-BiGRU
- **Algorithms**: A\*, UCS, BFS, DFS, GBFS, Fringe Search

---


## 🚀 Running the App Locally (FastAPI + Next.js)

> **You need two terminals open at the same time** — one for the backend, one for the frontend.

---

### Prerequisites

| Tool | Minimum version | How to check |
|------|----------------|--------------|
| Python | 3.10+ | `python --version` |
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

### Step 2 — Start the backend (Terminal 1)

Run from the **project root** (not inside `backend/`).

```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Start the FastAPI server with hot-reload
uvicorn backend.main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process ...
INFO:     Application startup complete.
```

| URL | Purpose |
|-----|---------|
| `http://localhost:8000` | API base URL |
| `http://localhost:8000/docs` | Swagger UI — interactive API explorer |

> Keep this terminal running. The backend loads all pre-computed ML prediction CSVs at startup — **no GPU required**.

---

### Step 3 — Configure your Mapbox token (one-time setup)

The map requires a free Mapbox public token.

1. Sign up or log in at [mapbox.com](https://www.mapbox.com)
2. Go to your account page and copy the **default public token** (begins with `pk.`)
3. Open `frontend/.env.local` and fill in:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

> `frontend/.env.local` is git-ignored — your token is never committed to the repository.

---

### Step 4 — Start the frontend (Terminal 2)

```bash
# Navigate into the frontend directory
cd frontend

# Install Node.js dependencies (first time only — may take a minute)
npm install

# Start the Next.js development server
npm run dev
```

**Expected output:**
```
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   - Ready in Xs
```

> If port 3000 is busy, Next.js will automatically use 3001, 3002, etc.

---

### Step 5 — Open the app

With **both servers running**, visit:

```
http://localhost:3000
```

| Page | Path | What it does |
|------|------|--------------|
| Network Map | `/network` | Interactive map of all SCATS intersections and road connections |
| Route Finder | `/routes` | Pick origin, destination, date/time, ML model and algorithms — get ranked routes drawn on the map |

---

### Stopping the servers

Press `Ctrl + C` in each terminal to shut down the backend and frontend.

---

### Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `ModuleNotFoundError` on backend start | Missing Python packages | `pip install -r backend/requirements.txt` from project root |
| `npm: command not found` | Node.js not installed | Download LTS from [nodejs.org](https://nodejs.org) |
| Map is blank or shows a token error | Mapbox token missing/invalid | Check `NEXT_PUBLIC_MAPBOX_TOKEN` in `frontend/.env.local` |
| CORS error in browser console | API URL mismatch | Ensure backend is on port 8000 and `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` |
| "Connection refused" when searching routes | Backend not running | Start the backend in Terminal 1 first |
| Port 8000 already in use | Another process on that port | Change to `--port 8001` and update `.env.local` accordingly |

---

## ☁️ Production Deployment (AWS)

The application is deployed as a live full-stack system on an EC2 instance and publicly accessible at:

**[http://3.25.163.65](http://3.25.163.65)**

---

### Architecture Overview

```
Internet (User Browser)
        │
        ▼
Nginx Reverse Proxy (Port 80)
        │
        ├── "/"      → Next.js Frontend (Port 3000)
        │
        └── "/api/*" → FastAPI Backend (Port 8000)
                           │
                           ▼
              Routing Engine + Traffic Dataset
```

---

### Infrastructure

| Component | Technology | Role |
|-----------|-----------|------|
| Cloud Hosting | AWS EC2 (Ubuntu) | Runs the entire application stack |
| Reverse Proxy | Nginx | Routes public traffic to frontend/backend |
| Frontend Service | Next.js 14 | Serves the interactive UI |
| Backend API | FastAPI + Uvicorn | Handles routing queries |
| Process Manager | systemd | Starts services automatically; restarts on failure |
| Map Rendering | Mapbox GL | Interactive traffic map rendered in the browser |

---

### Request Flow

1. **User interaction** — selects origin/destination on the map UI
2. **Frontend request** — Next.js sends a request to `/api/routes`
3. **Reverse proxy** — Nginx forwards the request internally to `localhost:8000`
4. **Backend processing** — FastAPI receives the request; routing engine computes the optimal path using predicted traffic volumes and graph search algorithms (A*, UCS, etc.)
5. **Response** — FastAPI returns route data as JSON
6. **Visualisation** — frontend draws the route overlay on the Mapbox map

---

### Service Management

Both services are managed by systemd, ensuring reliability:

```bash
systemctl status tbrgs-backend
systemctl status tbrgs-frontend
```

| Service | Role |
|---------|------|
| `tbrgs-backend.service` | FastAPI API |
| `tbrgs-frontend.service` | Next.js server |

Features: automatic restart on crash, auto-start on server reboot, centralised logging via `journalctl`.

---

### Backend Runtime

At startup the backend loads into memory:
- Site network metadata
- Pre-computed traffic volume predictions
- Graph representation of road connections

This allows route queries to execute quickly without reloading datasets on each request.

---

### Map Rendering

The interactive map runs entirely in the user's browser via Mapbox GL. The EC2 server handles only routing computation — Mapbox streams map tiles directly from its CDN. This keeps infrastructure lightweight.

---

### Security & Configuration

Sensitive configuration is managed via environment variables:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox public token |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL |

The Mapbox token is stored in `frontend/.env.production` and is never committed to the repository.
