# legacy/ — Archive

This folder contains the original Streamlit UI layer, archived when the project
migrated to a FastAPI + Next.js architecture.

## Contents

| Path | Description |
|------|-------------|
| `app.py` | Original Streamlit entry point (`TBRGSApp`) |
| `src/views/network_page.py` | Streamlit Network Map page renderer |
| `src/views/route_page.py` | Streamlit Route Finder page renderer |
| `src/visualizer/base_visualizer.py` | Folium base map builder |
| `src/visualizer/network_visualizer.py` | Folium network map builder |
| `src/visualizer/route_visualizer.py` | Folium route map builder (AntPath) |

## Status

**Do not modify these files.** They are a historical reference only.

The live application is now served by:
- `backend/` — FastAPI REST API (port 8000)
- `frontend/` — Next.js + Mapbox GL (port 3000)

The Python core (`src/core/`, `src/algorithms/`) is unchanged and imported
directly by the FastAPI backend.
