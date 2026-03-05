# frontend/ — Next.js 14 Frontend

## Purpose
Serves the TBRGS web UI: a Network Map page and a Route Finder page. Replaces
the legacy Streamlit + Folium layer. Communicates exclusively with the FastAPI
backend via REST.

## Running

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

Set `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local` before running.

## Directory Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout (Sidebar nav)
│   ├── page.tsx            # Redirect → /network
│   ├── network/page.tsx    # Network Map page
│   └── routes/page.tsx     # Route Finder page
├── components/
│   ├── layout/Sidebar.tsx
│   ├── map/
│   │   ├── BaseMap.tsx           # react-map-gl <Map> wrapper
│   │   ├── NetworkLayer.tsx      # circle + line + arrow layers
│   │   ├── RouteLayer.tsx        # animated dasharray line per route
│   │   └── SitePopup.tsx         # click popup
│   ├── network/
│   │   ├── NetworkControls.tsx
│   │   ├── ConnectionsTable.tsx
│   │   └── SiteConnectionsPanel.tsx
│   └── routes/
│       ├── RouteForm.tsx
│       ├── RouteSummaryTable.tsx
│       ├── RouteDetailPanel.tsx
│       └── RouteResultsPanel.tsx
├── hooks/
│   ├── useNetwork.ts       # SWR hooks + GeoJSON conversion for network data
│   └── useRoutes.ts        # useSWRMutation + GeoJSON conversion for routes
├── lib/
│   ├── api.ts              # Typed fetch wrappers for all 5 endpoints
│   └── mapColors.ts        # traffic_level → hex color (matches route_visualizer.py)
└── types/
    └── index.ts            # All TypeScript interfaces
```

## Key Packages
- `react-map-gl` + `mapbox-gl` — map rendering
- `swr` — data fetching and caching
- `tailwindcss` — styling

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox public token (required for map tiles) |
| `NEXT_PUBLIC_API_BASE_URL` | FastAPI backend URL (default: http://localhost:8000) |

## Color Semantics
Matches `legacy/src/visualizer/route_visualizer.py`:
- green → best route, yellow → 2nd, orange → 3rd, red → 4th, darkred → 5th, black → 6th
- Routes drawn in reverse order so best route renders on top
