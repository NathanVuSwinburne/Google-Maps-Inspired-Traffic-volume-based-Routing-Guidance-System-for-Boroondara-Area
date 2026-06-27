import type { Site, Connection } from "@/types";

export interface NetworkData {
  sites: Site[];
  connections: Connection[];
}

// { date → { intervalId → { LOCATION_UPPER → volume } } }
export type TrafficLookup = Record<string, Record<string, Record<string, number>>>;

let networkCache: NetworkData | null = null;
const trafficCache = new Map<string, TrafficLookup>();

export async function loadNetwork(): Promise<NetworkData> {
  if (networkCache) return networkCache;
  const res = await fetch("/data/network.json");
  if (!res.ok) throw new Error("Failed to load network data");
  networkCache = await res.json();
  return networkCache!;
}

export async function loadTraffic(model: string): Promise<TrafficLookup> {
  if (trafficCache.has(model)) return trafficCache.get(model)!;
  const res = await fetch(`/data/traffic_${model}.json`);
  if (!res.ok) throw new Error(`Failed to load traffic data for model ${model}`);
  const data: TrafficLookup = await res.json();
  trafficCache.set(model, data);
  return data;
}

export function lookupTrafficVolume(
  lookup: TrafficLookup,
  locationUpper: string,
  date: string,
  intervalId: number
): number | null {
  const dates = Object.keys(lookup).sort();
  let d = lookup[date] ? date : dates[dates.length - 1];
  if (!d) return null;

  const intervals = lookup[d];
  const ivStr = String(intervalId);
  if (!intervals[ivStr]) {
    const closest = Object.keys(intervals).reduce((a, b) =>
      Math.abs(Number(a) - intervalId) <= Math.abs(Number(b) - intervalId) ? a : b
    );
    d = date in lookup ? date : d;
    return intervals[closest]?.[locationUpper] ?? null;
  }
  return intervals[ivStr][locationUpper] ?? null;
}
