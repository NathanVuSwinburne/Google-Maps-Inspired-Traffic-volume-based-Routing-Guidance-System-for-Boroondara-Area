import { SearchGraph, heuristicTime } from "../graph";
import { MinHeap } from "../heap";

type Entry = [number, number, number, number, number[]]; // [f, g, counter, node, path]

export function fringe(graph: SearchGraph, start: number, goal: number): number[] {
  if (start === goal) return [start];

  let counter = 0;
  const fLimit = heuristicTime(graph, start, goal);
  const openSet = new MinHeap<Entry>((a, b) => a[0] - b[0] || a[2] - b[2]);
  openSet.push([fLimit, 0, counter++, start, [start]]);

  let later: Entry[] = [];
  const bestG = new Map<number, number>([[start, 0]]);

  while (openSet.size > 0 || later.length > 0) {
    if (openSet.size === 0) {
      if (later.length === 0) return [];
      const newLimit = Math.min(...later.map((e) => e[0]));
      const nextOpen = new MinHeap<Entry>((a, b) => a[0] - b[0] || a[2] - b[2]);
      for (const e of later) nextOpen.push(e);
      later = [];
      // re-enter with updated limit — use a fresh iteration
      const remainingOpen = new MinHeap<Entry>((a, b) => a[0] - b[0] || a[2] - b[2]);
      while (nextOpen.size > 0) {
        const entry = nextOpen.pop()!;
        if (entry[0] <= newLimit) remainingOpen.push(entry);
        else later.push(entry);
      }
      while (remainingOpen.size > 0) openSet.push(remainingOpen.pop()!);
      continue;
    }

    const [f, g, , node, path] = openSet.pop()!;
    if (node === goal) return path;

    const neighbors = [...(graph.adjacencyList.get(node) ?? [])].sort((a, b) => a[0] - b[0]);
    for (const [neighbor, cost] of neighbors) {
      const newG = g + cost;
      if (bestG.has(neighbor) && bestG.get(neighbor)! <= newG) continue;
      bestG.set(neighbor, newG);
      const newF = newG + heuristicTime(graph, neighbor, goal);
      const entry: Entry = [newF, newG, counter++, neighbor, [...path, neighbor]];
      if (newF > fLimit) later.push(entry);
      else openSet.push(entry);
    }
  }
  return [];
}
