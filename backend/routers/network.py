from fastapi import APIRouter, HTTPException, Request
from backend.schemas.network import (
    NetworkSitesResponse,
    NetworkConnectionsResponse,
    SiteDetailResponse,
    SiteResponse,
    ConnectionResponse,
)

router = APIRouter(prefix="/api/network", tags=["network"])


def _site_response(site_id: int, site: dict) -> SiteResponse:
    return SiteResponse(
        site_id=site_id,
        latitude=site["latitude"],
        longitude=site["longitude"],
        connected_roads=site["connected_roads"],
        locations=site["locations"],
    )


def _conn_response(conn: dict) -> ConnectionResponse:
    return ConnectionResponse(
        from_id=conn["from_id"],
        to_id=conn["to_id"],
        shared_road=conn["shared_road"],
        distance=conn["distance"],
        approach_location=conn["approach_location"],
        from_lat=conn["from_lat"],
        from_lng=conn["from_lng"],
        to_lat=conn["to_lat"],
        to_lng=conn["to_lng"],
    )


@router.get("/sites", response_model=NetworkSitesResponse)
def get_sites(request: Request):
    network = request.app.state.network
    sites = [
        _site_response(int(sid), data)
        for sid, data in network.sites_data.items()
    ]
    return NetworkSitesResponse(sites=sites, count=len(sites))


@router.get("/connections", response_model=NetworkConnectionsResponse)
def get_connections(request: Request):
    network = request.app.state.network
    connections = [_conn_response(c) for c in network.connections]
    return NetworkConnectionsResponse(connections=connections, count=len(connections))


@router.get("/sites/{site_id}", response_model=SiteDetailResponse)
def get_site(site_id: int, request: Request):
    network = request.app.state.network
    site = network.get_site(site_id)
    if site is None:
        raise HTTPException(status_code=404, detail=f"Site {site_id} not found")

    outgoing = [_conn_response(c) for c in network.get_outgoing_connections(site_id)]
    incoming = [_conn_response(c) for c in network.get_incoming_connections(site_id)]

    return SiteDetailResponse(
        site=_site_response(site_id, site),
        outgoing=outgoing,
        incoming=incoming,
    )
