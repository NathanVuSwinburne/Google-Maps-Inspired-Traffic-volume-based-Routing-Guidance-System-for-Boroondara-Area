# backend/routers/ — Route Handlers

## network.py
GET endpoints for network topology data.

| Endpoint | Response |
|----------|----------|
| `GET /api/network/sites` | All SCATS sites (id, lat, lng, roads, locations) |
| `GET /api/network/connections` | All directed edges with road + distance metadata |
| `GET /api/network/sites/{site_id}` | Single site + its outgoing + incoming connections |

Reads from `request.app.state.network` (a `SiteNetwork` loaded at startup).

## routes.py
POST endpoint for route search.

| Endpoint | Notes |
|----------|-------|
| `POST /api/routes/find` | Validates `RouteRequest`, calls `RouteService.find_routes()`, returns `FindRoutesResponse` |

Returns HTTP 400 if `origin_id == destination_id`.
Returns HTTP 404 if no route is found between the sites.
Delegates all routing logic to `backend/services/route_service.py`.
