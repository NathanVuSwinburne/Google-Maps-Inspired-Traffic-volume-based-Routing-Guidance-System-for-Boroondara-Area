# backend/services/ — Business Logic Services

## route_service.py — RouteService

Thin thread-safe wrapper around `RouteFinder`.

### Why it exists
`RouteFinder.find_multiple_routes()` mutates `self.graph` and
`self.traffic_volume_lookup` on every call, making it unsafe to call from
concurrent threads. FastAPI can handle multiple simultaneous requests, so
direct calls to `RouteFinder` from route handlers would cause race conditions.

### How it works
`RouteService.__init__()` receives a `RouteFinder` instance and creates a
`threading.Lock`. Every call to `RouteService.find_routes()` acquires the
lock before calling `RouteFinder.find_multiple_routes()` and releases it
when done, serialising all concurrent route searches.

### Model name mapping
The REST API accepts `"Bi_LSTM"` as the model name (user-facing). Internally,
`RouteFinder._load_dataframes()` stores BiLSTM data under the key `"Custom"`.
`RouteService.find_routes()` remaps `"Bi_LSTM"` → `"Custom"` via `MODEL_NAME_MAP`
before passing to the finder.
