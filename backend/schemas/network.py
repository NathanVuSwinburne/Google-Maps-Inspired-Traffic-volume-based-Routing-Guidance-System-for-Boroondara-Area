from pydantic import BaseModel
from typing import List, Optional


class SiteResponse(BaseModel):
    site_id: int
    latitude: float
    longitude: float
    connected_roads: List[str]
    locations: List[str]


class ConnectionResponse(BaseModel):
    from_id: int
    to_id: int
    shared_road: str
    distance: float
    approach_location: str
    from_lat: float
    from_lng: float
    to_lat: float
    to_lng: float


class NetworkSitesResponse(BaseModel):
    sites: List[SiteResponse]
    count: int


class NetworkConnectionsResponse(BaseModel):
    connections: List[ConnectionResponse]
    count: int


class SiteDetailResponse(BaseModel):
    site: SiteResponse
    outgoing: List[ConnectionResponse]
    incoming: List[ConnectionResponse]
