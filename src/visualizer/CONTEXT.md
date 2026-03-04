# src/visualizer — Context

## Purpose
Provides **Folium map builders** that convert routing results into interactive, colour-coded maps rendered inside the Streamlit app via `streamlit_folium`.

## Files

### `base_visualizer.py` — `BaseVisualizer`
Abstract base class holding a reference to `SiteNetwork` and providing shared map helpers:
- `_create_base_map(center, zoom_start)` — initialises a Folium map with OpenStreetMap tiles
- `_add_background_sites(m)` — overlays all SCATS sites as small grey markers for geographic context

### `network_visualizer.py` — `NetworkVisualizer`
Renders the **full SCATS road network** map for the "Network Map" page.
- Draws all sites as circle markers (colour/size may reflect degree of connectivity)
- Optionally draws edges between connected sites as polylines

### `route_visualizer.py` — `RouteVisualizer`
Renders **route maps** for the "Route Finder" page.

| Method | Description |
|--------|-------------|
| `create_route_map(route_info, traffic_level)` | Single-route map: green origin, red destination, blue intermediate markers; animated `AntPath` in the route colour |
| `create_multi_route_map(routes)` | Overlay of all algorithms' routes; each route drawn in its rank colour (green → black); drawn in reverse-rank order so the best route renders on top |

## Colour Coding

| Colour | Meaning |
|--------|---------|
| Green marker | Origin site |
| Red marker | Destination site |
| Blue marker | Intermediate site |
| Green path | Best route (rank 1) |
| Yellow path | 2nd best |
| Orange path | 3rd best |
| Red path | 4th best |
| Darkred path | 5th best |
| Black path | 6th best (worst) |

## Map Library
Uses **Folium** + **AntPath** plugin for animated dashed-line route arrows. Maps are rendered in Streamlit using:
```python
from streamlit_folium import folium_static
folium_static(m)
```

## Performance Notes
- Maps are regenerated on every "Find Routes" click — no caching
- For complex routes with many intermediate sites, Folium serializes to HTML; response time is typically < 2 s for up to 6 concurrent routes
- If Streamlit Cloud cold-start is an issue, the map rendering is the heaviest UI operation
