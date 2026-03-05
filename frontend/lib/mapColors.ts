import type { TrafficLevel } from "@/types";

/** Matches route_visualizer.py colour semantics exactly. */
export const TRAFFIC_LEVEL_COLORS: Record<TrafficLevel, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  red: "#ef4444",
  darkred: "#991b1b",
  black: "#1f2937",
};

/** Colors assigned by route rank (index 0 = best/fastest). */
export const RANK_COLORS = [
  "#22c55e", // rank 1 — green
  "#eab308", // rank 2 — yellow
  "#f97316", // rank 3 — orange
  "#ef4444", // rank 4 — red
  "#991b1b", // rank 5 — darkred
  "#1f2937", // rank 6 — black
];

/** Tailwind-friendly text classes for traffic level badges. */
export const TRAFFIC_LEVEL_TEXT: Record<TrafficLevel, string> = {
  green: "text-green-600",
  yellow: "text-yellow-600",
  orange: "text-orange-500",
  red: "text-red-500",
  darkred: "text-red-800",
  black: "text-gray-800",
};
