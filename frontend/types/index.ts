// ── Network types ─────────────────────────────────────────────────────────────

export interface Site {
  site_id: number;
  latitude: number;
  longitude: number;
  connected_roads: string[];
  locations: string[];
}

export interface Connection {
  from_id: number;
  to_id: number;
  shared_road: string;
  distance: number;
  approach_location: string;
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
}

export interface NetworkSitesResponse {
  sites: Site[];
  count: number;
}

export interface NetworkConnectionsResponse {
  connections: Connection[];
  count: number;
}

export interface SiteDetailResponse {
  site: Site;
  outgoing: Connection[];
  incoming: Connection[];
}

// ── Route types ────────────────────────────────────────────────────────────────

export interface RouteStep {
  from_id: number;
  to_id: number;
  road: string;
  distance: number;
  travel_time: number;
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
  traffic_volume: number;
  arrival_time: string;
}

export type TrafficLevel = "green" | "yellow" | "orange" | "red" | "darkred" | "black";

export interface Route {
  algorithm: string;
  path: number[];
  total_cost: number;
  traffic_level: TrafficLevel;
  route_rank: string;
  route_info: RouteStep[];
}

export interface RouteQueryInfo {
  origin_id: number;
  destination_id: number;
  datetime_str: string;
}

export interface FindRoutesResponse {
  routes: Route[];
  query: RouteQueryInfo;
}

// ── Request types ──────────────────────────────────────────────────────────────

export interface RouteRequest {
  origin_id: number;
  destination_id: number;
  algorithms: string[];
  model: string;
  date: string;
  hour: number;
  minute: number;
}

// ── Health ─────────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string;
  sites: number;
  connections: number;
}
