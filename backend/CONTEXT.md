# backend/ — FastAPI REST API

## Purpose
Exposes the TBRGS routing and network data as a JSON REST API. Replaces the
Streamlit UI layer without touching the Python core (`src/core/`, `src/algorithms/`).

## Running

```bash
# From project root
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Swagger UI: http://localhost:8000/docs

## Directory Structure

```
backend/
├── main.py                   # FastAPI app, CORS, lifespan startup
├── requirements.txt          # fastapi, uvicorn, pydantic
├── CONTEXT.md                # this file
├── routers/
│   ├── network.py            # GET /api/network/sites, /connections, /sites/{id}
│   └── routes.py             # POST /api/routes/find
├── schemas/
│   ├── network.py            # Pydantic response models for network endpoints
│   └── routes.py             # RouteRequest + response models
└── services/
    └── route_service.py      # Thread-safe RouteFinder wrapper
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Startup status, site/connection counts |
| GET | `/api/network/sites` | All SCATS sites (id, lat, lng, roads, locations) |
| GET | `/api/network/connections` | All directed edges |
| GET | `/api/network/sites/{site_id}` | Site + outgoing/incoming connections |
| POST | `/api/routes/find` | Run route search → ranked routes JSON |

## Key Design Decisions

### Thread safety
`RouteFinder` is not thread-safe (mutates `self.graph` per call). `RouteService`
wraps it with a `threading.Lock` to serialise concurrent HTTP requests.

### Model name mapping
The UI exposes `"LSTM"`, `"GRU"`, `"Bi_LSTM"`. Internally, BiLSTM data is loaded
under the key `"Custom"` in `RouteFinder._load_dataframes()`. `RouteService.find_routes()`
remaps `"Bi_LSTM"` → `"Custom"` before calling the finder.

### sys.path injection
`backend/main.py` inserts the project root into `sys.path` at startup so that
`src/` is importable without restructuring the package layout.

### CORS
Allows requests from `http://localhost:3000` (the Next.js dev server). Update
`allow_origins` in `main.py` for production deployment.
