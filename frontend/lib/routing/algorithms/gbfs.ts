import { SearchGraph, heuristicTime } from "../graph";
import { MinHeap } from "../heap";

type Entry = [number, number, number, number[]]; // [hScore, insertionOrder, node, path]

export function gbfs(graph: SearchGraph, start: number, goal: number): number[] {
  const h0 = heuristicTime(graph, start, goal);
  const heap = new MinHeap<Entry>((a, b) => a[0] - b[0] || a[1] - b[1]);
  heap.push([h0, 0, start, [start]]);
  const visited = new Set<number>();
  let order = 1;

  while (heap.size > 0) {
    const [, , node, path] = heap.pop()!;
    if (visited.has(node)) continue;
    visited.add(node);
    if (node === goal) return path;

    const neighbors = [...(graph.adjacencyList.get(node) ?? [])].sort((a, b) => a[0] - b[0]);
    for (const [neighbor] of neighbors) {
      if (!visited.has(neighbor)) {
        heap.push([heuristicTime(graph, neighbor, goal), order++, neighbor, [...path, neighbor]]);
      }
    }
  }
  return [];
}
