# backend/schemas/ — Pydantic Models

## network.py
Response models for network endpoints:
- `SiteResponse` — single SCATS site
- `ConnectionResponse` — single directed edge
- `NetworkSitesResponse` — list of sites + count
- `NetworkConnectionsResponse` — list of connections + count
- `SiteDetailResponse` — site + outgoing + incoming connections

## routes.py
Request and response models for route search:

- `RouteRequest` — validated request body for `POST /api/routes/find`
  - `minute` must be in {0, 15, 30, 45}
  - `hour` must be 0–23
  - `date` must be 2006-10-01 to 2006-11-30 (YYYY-MM-DD)
  - `algorithms` must be subset of {"A*", "DFS", "BFS", "GBFS", "UCS", "Fringe", "All"}
  - `model` must be one of {"LSTM", "GRU", "Bi_LSTM"}
- `RouteStepResponse` — single route segment (from/to/road/distance/time/volume/ETA)
- `RouteResponse` — single algorithm's route result
- `RouteQueryInfo` — echo of origin/destination/datetime
- `FindRoutesResponse` — list of routes + query info
