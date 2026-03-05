import threading
from typing import List, Optional


# Model name mapping: UI-facing name → RouteFinder internal key
MODEL_NAME_MAP = {
    "LSTM": "LSTM",
    "GRU": "GRU",
    "Bi_LSTM": "Custom",  # BiLSTM is loaded under the key "Custom" in RouteFinder
}


class RouteService:
    """
    Thread-safe wrapper around RouteFinder.

    RouteFinder mutates self.graph and self.traffic_volume_lookup on every call,
    making it unsafe for concurrent use. This class serialises requests with a
    threading.Lock so the FastAPI server (which may handle concurrent requests)
    never calls RouteFinder from two threads simultaneously.
    """

    def __init__(self, finder):
        self._finder = finder
        self._lock = threading.Lock()

    def find_routes(
        self,
        origin_id: int,
        destination_id: int,
        algorithms: List[str],
        model: str,
        datetime_str: str,
    ) -> List[dict]:
        """
        Run route search and return the list of route dicts produced by
        RouteFinder.find_multiple_routes().

        Maps the UI-facing model name to the internal RouteFinder key before
        calling. Acquires the lock for the duration of the search.
        """
        internal_model = MODEL_NAME_MAP.get(model, model)

        with self._lock:
            routes = self._finder.find_multiple_routes(
                origin_id=origin_id,
                destination_id=destination_id,
                selected_algorithms=algorithms,
                prediction_model=internal_model,
                datetime_str=datetime_str,
            )

        return routes
