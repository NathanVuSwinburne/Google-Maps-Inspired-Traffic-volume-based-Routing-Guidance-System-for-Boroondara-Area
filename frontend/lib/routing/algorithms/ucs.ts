import { SearchGraph } from "../graph";
import { MinHeap } from "../heap";

type Entry = [number, number, number, number[]]; // [cost, insertionOrder, node, path]

export function ucs(graph: SearchGraph, start: number, goal: number): number[] {
  const heap = new MinHeap<Entry>((a, b) => a[0] - b[0] || a[1] - b[1]);
  heap.push([0, 0, start, [start]]);
  const visited = new Set<number>();
  let order = 1;

  while (heap.size > 0) {
    const [cost, , node, path] = heap.pop()!;
    if (visited.has(node)) continue;
    visited.add(node);
    if (node === goal) return path;

    const neighbors = [...(graph.adjacencyList.get(node) ?? [])].sort((a, b) => a[0] - b[0]);
    for (const [neighbor, edgeCost] of neighbors) {
      if (!visited.has(neighbor)) {
        heap.push([cost + edgeCost, order++, neighbor, [...path, neighbor]]);
      }
    }
  }
  return [];
}
