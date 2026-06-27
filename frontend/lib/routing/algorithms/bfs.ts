import { SearchGraph } from "../graph";

export function bfs(graph: SearchGraph, start: number, goal: number): number[] {
  const queue: Array<[number, number[]]> = [[start, [start]]];
  const visited = new Set<number>();

  while (queue.length > 0) {
    const [node, path] = queue.shift()!;
    if (visited.has(node)) continue;
    visited.add(node);
    if (node === goal) return path;

    const neighbors = [...(graph.adjacencyList.get(node) ?? [])].sort((a, b) => a[0] - b[0]);
    for (const [neighbor] of neighbors) {
      queue.push([neighbor, [...path, neighbor]]);
    }
  }
  return [];
}
