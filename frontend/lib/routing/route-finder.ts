import type { Connection, FindRoutesResponse, Route, RouteRequest, RouteStep, TrafficLevel } from "@/types";
import { SearchGraph } from "./graph";
import { calcTravelTime } from "./travel-time";
import { lookupTrafficVolume, NetworkData, TrafficLookup } from "./data-loader";
import { astar } from "./algorithms/astar";
import { bfs } from "./algorithms/bfs";
import { dfs } from "./algorithms/dfs";
import { gbfs } from "./algorithms/gbfs";
import { ucs } from "./algorithms/ucs";
import { fringe } from "./algorithms/fringe";

const ALL_ALGORITHMS = ["A*", "DFS", "BFS", "GBFS", "UCS", "Fringe"] as const;
const RANK_LABELS = ["Best route", "Second best", "Third best", "Fourth best", "Fifth best", "Sixth best"];
const RANK_COLORS: TrafficLevel[] = ["green", "yellow", "orange", "red", "darkred", "black"];

function runAlgorithm(name: string, graph: SearchGraph, origin: number, dest: number): number[] {
  switch (name) {
    case "A*":     return astar(graph, origin, dest);
    case "BFS":    return bfs(graph, origin, dest);
    case "DFS":    return dfs(graph, origin, dest);
    case "GBFS":   return gbfs(graph, origin, dest);
    case "UCS":    return ucs(graph, origin, dest);
    case "Fringe": return fringe(graph, origin, dest);
    default:       return [];
  }
}

function roundTo15Minutes(totalMinutes: number): number {
  return Math.floor(totalMinutes / 15) * 15;
}

function formatTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function buildSearchGraph(network: NetworkData, traffic: TrafficLookup, date: string, intervalId: number): SearchGraph {
  const adjacencyList = new Map<number, Array<[number, number]>>();
  const nodeCoordinates = new Map<number, [number, number]>();

  for (const site of network.sites) {
    nodeCoordinates.set(site.site_id, [site.latitude, site.longitude]);
    if (!adjacencyList.has(site.site_id)) adjacencyList.set(site.site_id, []);
  }

  for (const conn of network.connections) {
    const vol = lookupTrafficVolume(traffic, conn.approach_location.toUpperCase(), date, intervalId);
    const travelTime = calcTravelTime(conn.distance, vol);
    const list = adjacencyList.get(conn.from_id) ?? [];
    list.push([conn.to_id, travelTime]);
    adjacencyList.set(conn.from_id, list);
  }

  return { adjacencyList, nodeCoordinates };
}

function calcRouteDetails(
  path: number[],
  network: NetworkData,
  traffic: TrafficLookup,
  startMinutes: number,
  date: string
): { steps: RouteStep[]; totalCost: number } {
  const connMap = new Map<string, Connection>();
  for (const c of network.connections) {
    connMap.set(`${c.from_id}_${c.to_id}`, c);
  }

  const sortedDates = Object.keys(traffic).sort();
  let currentMinutes = startMinutes;
  let currentDate = date;
  let totalCost = 0;
  const steps: RouteStep[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const conn = connMap.get(`${path[i]}_${path[i + 1]}`);
    if (!conn) continue;

    const roundedIv = roundTo15Minutes(currentMinutes) / 15;
    const vol = lookupTrafficVolume(traffic, conn.approach_location.toUpperCase(), currentDate, roundedIv) ??
      (() => {
        const fallbackDate = sortedDates[sortedDates.length - 1];
        return lookupTrafficVolume(traffic, conn.approach_location.toUpperCase(), fallbackDate, roundedIv);
      })();

    const travelTime = calcTravelTime(conn.distance, vol);
    totalCost += travelTime;
    currentMinutes += travelTime;

    // Advance date if we cross midnight
    if (currentMinutes >= 1440) {
      currentMinutes -= 1440;
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      const next = d.toISOString().slice(0, 10);
      currentDate = traffic[next] ? next : (sortedDates[sortedDates.length - 1] ?? currentDate);
    }

    steps.push({
      from_id: conn.from_id,
      to_id: conn.to_id,
      road: conn.shared_road,
      distance: conn.distance,
      travel_time: travelTime,
      from_lat: conn.from_lat,
      from_lng: conn.from_lng,
      to_lat: conn.to_lat,
      to_lng: conn.to_lng,
      traffic_volume: vol ?? 100,
      arrival_time: formatTime(Math.floor(currentMinutes)),
    });
  }

  return { steps, totalCost };
}

export function findRoutes(req: RouteRequest, network: NetworkData, traffic: TrafficLookup): FindRoutesResponse {
  const intervalId = req.hour * 4 + Math.floor(req.minute / 15);
  const startMinutes = req.hour * 60 + req.minute;

  const graph = buildSearchGraph(network, traffic, req.date, intervalId);

  const algorithms =
    req.algorithms.includes("All") ? [...ALL_ALGORITHMS] : req.algorithms.filter((a) => a !== "All");

  const rawRoutes: Array<{ algorithm: string; path: number[]; totalCost: number; steps: RouteStep[] }> = [];

  for (const alg of algorithms) {
    const path = runAlgorithm(alg, graph, req.origin_id, req.destination_id);
    if (path.length < 2) continue;
    const { steps, totalCost } = calcRouteDetails(path, network, traffic, startMinutes, req.date);
    rawRoutes.push({ algorithm: alg, path, totalCost, steps });
  }

  rawRoutes.sort((a, b) => a.totalCost - b.totalCost);

  const routes: Route[] = rawRoutes.slice(0, 6).map((r, i) => ({
    algorithm: r.algorithm,
    path: r.path,
    total_cost: r.totalCost,
    traffic_level: RANK_COLORS[i],
    route_rank: RANK_LABELS[i],
    route_info: r.steps,
  }));

  return {
    routes,
    query: {
      origin_id: req.origin_id,
      destination_id: req.destination_id,
      datetime_str: `${req.date} ${String(req.hour).padStart(2, "0")}:${String(req.minute).padStart(2, "0")}`,
    },
  };
}
