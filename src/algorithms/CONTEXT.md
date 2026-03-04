# src/algorithms — Context

## Purpose
Implements **six graph search algorithms** used to find optimal routes between SCATS intersections. All algorithms share a common abstract base class and operate on a `SearchGraph` object whose edge weights represent ML-predicted travel times in minutes.

## Files

| File | Class | Algorithm |
|------|-------|-----------|
| `search_algorithm.py` | `SearchAlgorithm` | Abstract base class; defines `search(start, goals)` interface |
| `search_graph.py` | `SearchGraph` | Graph data structure with adjacency list, node coordinates, origin/destinations |
| `astar.py` | `AStar` | A* with Haversine heuristic (admissible: assumes free-flow speed of 60 km/h) |
| `bfs.py` | `BFS` | Breadth-First Search — finds shortest path by hop count |
| `dfs.py` | `DFS` | Depth-First Search — not optimal, included for comparison |
| `gbfs.py` | `GBFS` | Greedy Best-First Search — fast but not optimal |
| `ucs.py` | `UCS` | Uniform Cost Search — optimal with uniform edge costs |
| `fringe.py` | `Fringe` | Fringe Search — memory-efficient alternative to A* |

## Common Interface

```python
class SearchAlgorithm:
    def search(self, start: int, goals: list[int]) -> tuple[int, int, list[int]]:
        """
        Returns: (goal_node, nodes_expanded, path)
        path is a list of site IDs from start to goal (inclusive)
        Returns (None, n, []) if no path found
        """
```

## SearchGraph Structure

```python
class SearchGraph:
    adjacency_list: dict[int, list[tuple[int, float]]]  # {node: [(neighbor, travel_time_min)]}
    node_coordinates: dict[int, tuple[float, float]]    # {node: (lat, lon)}
    origin: int
    destinations: set[int]
    speed_limit: int  # 60 km/h — used for heuristic only
```

## Heuristic (A*, GBFS, Fringe)
`SearchGraph.get_heuristic_time(node1, node2)` computes:
```
travel_time = haversine(node1, node2) [km] / 60 [km/h] × 60 [min/h]
```
This is **admissible** (never overestimates) because actual travel includes intersection delays and traffic congestion.

## Travel Time Edge Weight Model
Edge costs are set by `RouteFinder._calculate_travel_time(distance, traffic_volume)`:
- Uses a quadratic speed–flow relationship: `speed = f(traffic_volume)`
- Speed is capped: min 5 km/h, max 60 km/h
- A fixed 30-second intersection delay is added per segment
- If traffic data is unavailable, defaults to 100 veh/15 min (medium flow)

## Algorithm Selection Guide

| Scenario | Recommended |
|----------|-------------|
| Optimal travel-time route | A* or UCS |
| Fastest computation, near-optimal | GBFS |
| Exhaustive comparison demo | "All" (runs all 6) |
| Understanding graph topology | BFS |

## Adding a New Algorithm
1. Create `src/algorithms/my_alg.py` with a class extending `SearchAlgorithm`
2. Implement `search(self, start, goals)` returning `(goal, nodes_expanded, path)`
3. Register the name in `RouteFinder._get_algorithm()` in `src/core/route_finder.py`
4. Add it to `algorithm_options` in `src/views/route_page.py`
