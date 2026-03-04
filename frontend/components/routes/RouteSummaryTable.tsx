"use client";

import type { Route } from "@/types";
import { TRAFFIC_LEVEL_COLORS } from "@/lib/mapColors";

interface RouteSummaryTableProps {
  routes: Route[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export default function RouteSummaryTable({
  routes,
  selectedIndex,
  onSelect,
}: RouteSummaryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs border border-gray-200 rounded">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-1.5 text-left text-gray-600 font-medium">Rank</th>
            <th className="px-2 py-1.5 text-left text-gray-600 font-medium">Algorithm</th>
            <th className="px-2 py-1.5 text-right text-gray-600 font-medium">Time (min)</th>
            <th className="px-2 py-1.5 text-left text-gray-600 font-medium">Level</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((r, i) => (
            <tr
              key={i}
              onClick={() => onSelect(i)}
              className={`border-t border-gray-100 cursor-pointer hover:bg-blue-50 ${
                selectedIndex === i ? "bg-blue-100" : ""
              }`}
            >
              <td className="px-2 py-1.5 font-medium">{r.route_rank}</td>
              <td className="px-2 py-1.5">{r.algorithm}</td>
              <td className="px-2 py-1.5 text-right">{r.total_cost.toFixed(2)}</td>
              <td className="px-2 py-1.5">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: TRAFFIC_LEVEL_COLORS[r.traffic_level] }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
