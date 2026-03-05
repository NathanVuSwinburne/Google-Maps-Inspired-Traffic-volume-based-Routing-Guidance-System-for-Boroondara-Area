# frontend/hooks/ — SWR Data Hooks

## useNetwork.ts
Three SWR hooks for network data. All convert API responses to GeoJSON in the hook,
keeping map components free of data-fetching concerns.

| Hook | Fetches | Returns |
|------|---------|---------|
| `useNetworkSites()` | GET /api/network/sites | `data`, `sitesGeoJSON` (FeatureCollection\<Point\>) |
| `useNetworkConnections()` | GET /api/network/connections | `data`, `connectionsGeoJSON` (FeatureCollection\<LineString\>) |
| `useSiteDetail(id)` | GET /api/network/sites/{id} | `data` (SiteDetailResponse) |

GeoJSON features include all relevant properties for Mapbox layer expressions
(e.g., `role`, `site_id`, `connected_roads`, `shared_road`, `distance`).

## useRoutes.ts
`useSWRMutation` hook for route search (POST). Triggered manually on form submit.

| Export | Description |
|--------|-------------|
| `trigger(req)` | Calls POST /api/routes/find with `RouteRequest` |
| `data` | Raw `FindRoutesResponse` from backend |
| `routeGeoJSONs` | Array of `{ route, geojson }` — one GeoJSON per route, ready for `RouteLayer` |
| `isMutating` | Loading state |
| `error` | Error if request failed |
| `reset` | Clear results |

`routeGeoJSONs` includes the `color` property (from `mapColors.ts`) on each feature,
so `RouteLayer` can read it directly without re-importing color constants.
