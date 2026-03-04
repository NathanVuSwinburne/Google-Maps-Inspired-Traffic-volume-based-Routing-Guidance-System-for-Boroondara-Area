# src/views — Context

## Purpose
Contains **Streamlit page renderers** — the UI layer of the application. Each page class is responsible for rendering a complete Streamlit page and wiring user inputs to domain logic.

## Files

### `base_page.py` — `BasePage`
Abstract base class providing shared utilities available to all pages:
- `display_site_info(site_id)` — renders a site's metadata (lat/lon, connected roads, approach locations) in the Streamlit sidebar/main area

### `network_page.py` — `NetworkPage`
**"Network Map" page** — visualises the full SCATS road network as a Folium map.

- Renders all SCATS sites as clickable circle markers
- Colour-codes sites by connectivity (e.g., number of connections)
- Uses `NetworkVisualizer.create_network_map()` for the map object
- No routing logic — purely observational

### `route_page.py` — `RoutePage`
**"Route Finder" page** — the core interactive feature.

**User inputs collected:**
| Control | Options | Default |
|---------|---------|---------|
| Origin site | Dropdown of all site IDs | First site |
| Destination site | Dropdown of all site IDs | First site |
| Algorithm(s) | A\*, DFS, BFS, GBFS, UCS, Fringe, All | All |
| Prediction model | LSTM, GRU, Bi_LSTM | LSTM |
| Date | Date picker Oct 1 – Nov 30, 2006 | Oct 1, 2006 |
| Hour | 0–23 | 8 |
| Minute | 0–59 | 0 |

**On "Find Routes" click:**
1. Rounds selected time down to nearest 15-min interval
2. Calls `RouteFinder.find_multiple_routes(origin, dest, algorithms, model, datetime_str)`
3. Displays results:
   - Summary table (algorithm, travel time, # intermediate sites)
   - Combined multi-route Folium map
   - Per-route expandable detail (step table + individual map)

**Validation guards:**
- At least one algorithm must be selected
- Origin ≠ Destination

## Navigation Structure
```
app.py
  └── st.sidebar.radio("Select a page", ["Network Map", "Route Finder"])
        ├── Network Map → NetworkPage.render()
        └── Route Finder → RoutePage.render()
```

## Streamlit State
Pages are stateless between reruns — all computation is triggered by the "Find Routes" button click. Streamlit's session state is not used, so results are not cached across interactions.
