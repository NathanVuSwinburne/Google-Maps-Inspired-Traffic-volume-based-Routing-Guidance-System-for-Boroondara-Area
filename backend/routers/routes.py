from fastapi import APIRouter, HTTPException, Request
from backend.schemas.routes import (
    RouteRequest,
    FindRoutesResponse,
    RouteResponse,
    RouteStepResponse,
    RouteQueryInfo,
)

router = APIRouter(prefix="/api/routes", tags=["routes"])


def _step_response(step: dict) -> RouteStepResponse:
    return RouteStepResponse(
        from_id=step["from_id"],
        to_id=step["to_id"],
        road=step["road"],
        distance=step["distance"],
        travel_time=step["travel_time"],
        from_lat=step["from_lat"],
        from_lng=step["from_lng"],
        to_lat=step["to_lat"],
        to_lng=step["to_lng"],
        traffic_volume=float(step["traffic_volume"]),
        arrival_time=step["arrival_time"],
    )


@router.post("/find", response_model=FindRoutesResponse)
def find_routes(body: RouteRequest, request: Request):
    if body.origin_id == body.destination_id:
        raise HTTPException(
            status_code=400,
            detail="origin_id and destination_id must be different",
        )

    datetime_str = f"{body.date} {body.hour:02d}:{body.minute:02d}"

    route_service = request.app.state.route_service
    raw_routes = route_service.find_routes(
        origin_id=body.origin_id,
        destination_id=body.destination_id,
        algorithms=body.algorithms,
        model=body.model,
        datetime_str=datetime_str,
    )

    if not raw_routes:
        raise HTTPException(
            status_code=404,
            detail="No route found between the specified sites",
        )

    routes = [
        RouteResponse(
            algorithm=r["algorithm"],
            path=r["path"],
            total_cost=r["total_cost"],
            traffic_level=r["traffic_level"],
            route_rank=r["route_rank"],
            route_info=[_step_response(s) for s in r["route_info"]],
        )
        for r in raw_routes
    ]

    return FindRoutesResponse(
        routes=routes,
        query=RouteQueryInfo(
            origin_id=body.origin_id,
            destination_id=body.destination_id,
            datetime_str=datetime_str,
        ),
    )
