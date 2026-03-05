# frontend/types/ — TypeScript Interfaces

## index.ts

Single source of truth for all TypeScript types in the frontend.

### Network types
- `Site` — SCATS intersection site (id, lat, lng, roads, locations)
- `Connection` — directed road edge between two sites
- `NetworkSitesResponse` / `NetworkConnectionsResponse` / `SiteDetailResponse` — API response shapes

### Route types
- `RouteStep` — single segment (from/to/road/distance/time/volume/ETA)
- `TrafficLevel` — union of "green" | "yellow" | "orange" | "red" | "darkred" | "black"
- `Route` — single algorithm result (path, total_cost, traffic_level, route_rank, steps)
- `FindRoutesResponse` — list of routes + query echo
- `RouteRequest` — POST body for `/api/routes/find`

These interfaces mirror the Pydantic schemas in `backend/schemas/` exactly.
If the backend schema changes, update this file to match.
