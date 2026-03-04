from pydantic import BaseModel, field_validator, model_validator
from typing import List, Optional
from datetime import date


VALID_ALGORITHMS = {"A*", "DFS", "BFS", "GBFS", "UCS", "Fringe", "All"}
VALID_MODELS = {"LSTM", "GRU", "Bi_LSTM"}
DATE_MIN = date(2006, 10, 1)
DATE_MAX = date(2006, 11, 30)


class RouteRequest(BaseModel):
    origin_id: int
    destination_id: int
    algorithms: List[str] = ["A*"]
    model: str = "LSTM"
    date: str  # YYYY-MM-DD
    hour: int
    minute: int

    @field_validator("hour")
    @classmethod
    def validate_hour(cls, v: int) -> int:
        if not (0 <= v <= 23):
            raise ValueError("hour must be 0–23")
        return v

    @field_validator("minute")
    @classmethod
    def validate_minute(cls, v: int) -> int:
        if v not in {0, 15, 30, 45}:
            raise ValueError("minute must be one of 0, 15, 30, 45")
        return v

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        try:
            d = date.fromisoformat(v)
        except ValueError:
            raise ValueError("date must be in YYYY-MM-DD format")
        if not (DATE_MIN <= d <= DATE_MAX):
            raise ValueError("date must be between 2006-10-01 and 2006-11-30")
        return v

    @field_validator("algorithms")
    @classmethod
    def validate_algorithms(cls, v: List[str]) -> List[str]:
        invalid = set(v) - VALID_ALGORITHMS
        if invalid:
            raise ValueError(f"Unknown algorithms: {invalid}. Valid: {VALID_ALGORITHMS}")
        return v

    @field_validator("model")
    @classmethod
    def validate_model(cls, v: str) -> str:
        if v not in VALID_MODELS:
            raise ValueError(f"model must be one of {VALID_MODELS}")
        return v


class RouteStepResponse(BaseModel):
    from_id: int
    to_id: int
    road: str
    distance: float
    travel_time: float
    from_lat: float
    from_lng: float
    to_lat: float
    to_lng: float
    traffic_volume: float
    arrival_time: str


class RouteResponse(BaseModel):
    algorithm: str
    path: List[int]
    total_cost: float
    traffic_level: str
    route_rank: str
    route_info: List[RouteStepResponse]


class RouteQueryInfo(BaseModel):
    origin_id: int
    destination_id: int
    datetime_str: str


class FindRoutesResponse(BaseModel):
    routes: List[RouteResponse]
    query: RouteQueryInfo
