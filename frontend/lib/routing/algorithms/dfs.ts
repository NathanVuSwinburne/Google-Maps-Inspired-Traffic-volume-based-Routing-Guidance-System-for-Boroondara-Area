import { SearchGraph } from "../graph";

export function dfs(graph: SearchGraph, start: number, goal: number): number[] {
  const stack: Array<[number, number[]]> = [[start, [start]]];
  const visited = new Set<number>();

  while (stack.length > 0) {
    const [node, path] = stack.pop()!;
    if (visited.has(node)) continue;
    visited.add(node);
    if (node === goal) return path;

    const neighbors = [...(graph.adjacencyList.get(node) ?? [])].sort((a, b) => b[0] - a[0]);
    for (const [neighbor] of neighbors) {
      stack.push([neighbor, [...path, neighbor]]);
    }
  }
  return [];
}
