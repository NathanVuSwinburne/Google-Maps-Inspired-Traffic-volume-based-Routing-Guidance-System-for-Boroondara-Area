import { haversine } from "./haversine";

export interface SearchGraph {
  adjacencyList: Map<number, Array<[number, number]>>; // node → [(neighbor, cost)]
  nodeCoordinates: Map<number, [number, number]>;       // node → [lat, lng]
}

export function heuristicTime(graph: SearchGraph, n1: number, n2: number): number {
  const c1 = graph.nodeCoordinates.get(n1);
  const c2 = graph.nodeCoordinates.get(n2);
  if (!c1 || !c2) return Infinity;
  return (haversine(c1[0], c1[1], c2[0], c2[1]) / 60) * 60; // minutes at 60 km/h
}
