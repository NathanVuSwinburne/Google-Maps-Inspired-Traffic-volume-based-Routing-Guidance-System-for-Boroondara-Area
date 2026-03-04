# src/core — Context

## Purpose
The **domain logic layer** of the application. Bridges raw data (SCATS metadata + ML predictions) into the runtime objects used by both the routing algorithms and the UI.

## Files

### `map_builder.py` — `SiteNetwork`
Constructs the **directed road graph** from `sites_metadata.json`.

**Key responsibilities:**
- Loads all SCATS site coordinates and applies a fixed coordinate correction (±0.0012°) to align GPS points with actual Melbourne intersections
- Groups sites by shared road name and sorts them by position along the road (using lat/lon variance to determine E-W vs N-S orientation)
- Creates **directed edges** only where the target site's `locations` list confirms an approach from the correct cardinal direction
- Exposes `get_site(id)`, `get_outgoing_connections(id)`, `get_incoming_connections(id)`

**Connection structure:**
```python
{
    'from_id': int,
    'to_id': int,
    'shared_road': str,        # e.g. "WARRIGAL_RD"
    'distance': float,         # km (Haversine)
    'approach_location': str,  # e.g. "WARRIGAL_RD_N_of_TOORAK_RD"
    'from_lat', 'from_lng', 'to_lat', 'to_lng': float
}
```

**Key parameter:** `max_distance=5.0 km` — connections between sites further than this are ignored, preventing spurious cross-suburb links.

---

### `route_finder.py` — `RouteFinder`
Orchestrates the full **route search pipeline**: loading traffic predictions → building weighted graph → running search algorithms → calculating step-level details.

**Key responsibilities:**
1. **`_load_dataframes()`** — at startup, loads all three model CSVs (LSTM, GRU, BiLSTM) from `processed_data/complete_csv_oct_nov_2006/`
2. **`_create_search_graph(model, datetime_str)`** — converts `SiteNetwork` + traffic data into a `SearchGraph` with travel-time weighted edges. Uses closest available date/interval if exact match not found.
3. **`_calculate_travel_time(distance, traffic_volume)`** — quadratic speed-flow model; returns minutes including 30 s intersection delay
4. **`find_multiple_routes(...)`** — runs all selected algorithms, sorts routes by total travel time, assigns green→red colour ranking
5. **`_calculate_route_details(path, model, datetime_str)`** — recomputes step-by-step travel time with **time-progression** (each segment uses the traffic at the time you'd actually arrive there, not the departure time)

**Colour/rank assignment:**
```
Rank 1 → green ("Best route")
Rank 2 → yellow
Rank 3 → orange
Rank 4 → red
Rank 5 → darkred
Rank 6 → black
```

## Interaction with Other Modules

```
SiteNetwork ──────────────────────────────────────────────┐
                                                           │
RouteFinder ──► SearchGraph ──► SearchAlgorithm.search()  │
     │                                                     │
     └──► _load_dataframes() ──► complete_csv_oct_nov_2006/│
                                                           │
RouteVisualizer ◄────────────────────────────────────────-┘
```

## Thread Safety
`RouteFinder` is **not thread-safe** — `self.graph` and `self.traffic_volume_lookup` are mutated per call.

**In the FastAPI backend**, this is handled by `backend/services/route_service.py` (`RouteService`), which wraps every `find_multiple_routes()` call in a `threading.Lock`. This serialises concurrent HTTP requests without modifying `src/core/`. Do not call `RouteFinder.find_multiple_routes()` directly from async FastAPI handlers; always go through `RouteService`.
