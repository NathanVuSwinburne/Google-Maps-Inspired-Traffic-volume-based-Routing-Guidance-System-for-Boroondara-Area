# frontend/lib/ — Shared Utilities

## api.ts
Typed fetch wrappers for all 5 backend endpoints. Base URL read from
`NEXT_PUBLIC_API_BASE_URL` env var (defaults to `http://localhost:8000`).

| Function | Calls |
|----------|-------|
| `api.health()` | GET /api/health |
| `api.getSites()` | GET /api/network/sites |
| `api.getConnections()` | GET /api/network/connections |
| `api.getSite(id)` | GET /api/network/sites/{id} |
| `api.findRoutes(body)` | POST /api/routes/find |

All functions return typed promises. Throws an `Error` on non-2xx responses.

## mapColors.ts
Two lookup objects keyed by `TrafficLevel`:
- `TRAFFIC_LEVEL_COLORS` — hex color strings for Mapbox `line-color` / `circle-color`
- `TRAFFIC_LEVEL_TEXT` — Tailwind CSS text classes for badge rendering

Color values match `legacy/src/visualizer/route_visualizer.py` exactly:
green #22c55e → yellow #eab308 → orange #f97316 → red #ef4444 → darkred #991b1b → black #1f2937
