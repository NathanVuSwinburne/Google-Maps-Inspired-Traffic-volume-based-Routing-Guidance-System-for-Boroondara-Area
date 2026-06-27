import { SearchGraph, heuristicTime } from "../graph";
import { MinHeap } from "../heap";

type Entry = [number, number, number, number[]]; // [fScore, entryId, node, path]

export function astar(graph: SearchGraph, start: number, goal: number): number[] {
  const gScores = new Map<number, number>([[start, 0]]);
  const heap = new MinHeap<Entry>((a, b) => a[0] - b[0] || a[1] - b[1]);
  const h0 = heuristicTime(graph, start, goal);
  heap.push([h0, 0, start, [start]]);
  const visited = new Set<number>();
  let entryId = 1;

  while (heap.size > 0) {
    const [, , node, path] = heap.pop()!;
    if (visited.has(node)) continue;
    visited.add(node);
    if (node === goal) return path;

    const neighbors = [...(graph.adjacencyList.get(node) ?? [])].sort((a, b) => a[0] - b[0]);
    for (const [neighbor, cost] of neighbors) {
      const newG = gScores.get(node)! + cost;
      if (!gScores.has(neighbor) || newG < gScores.get(neighbor)!) {
        gScores.set(neighbor, newG);
        const f = newG + heuristicTime(graph, neighbor, goal);
        heap.push([f, entryId++, neighbor, [...path, neighbor]]);
      }
    }
  }
  return [];
}
