"use client";

import { useState } from "react";
import type { Route } from "@/types";

interface RouteDetailPanelProps {
  route: Route;
  color: string;
}

export default function RouteDetailPanel({ route, color }: RouteDetailPanelProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-gray-200 rounded overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 text-sm font-semibold"
      >
        <span className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          {route.route_rank} — {route.algorithm}
        </span>
        <span className="text-gray-400 text-xs">
          {route.total_cost.toFixed(2)} min {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="px-3 py-2 space-y-3">
          {/* Path */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Path ({route.path.length} sites)</p>
            <p className="text-xs font-mono text-gray-700 break-all">
              {route.path.join(" → ")}
            </p>
          </div>

          {/* Steps table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border border-gray-100 rounded">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-gray-500">From→To</th>
                  <th className="px-2 py-1 text-left text-gray-500">Road</th>
                  <th className="px-2 py-1 text-right text-gray-500">Dist</th>
                  <th className="px-2 py-1 text-right text-gray-500">Time</th>
                  <th className="px-2 py-1 text-right text-gray-500">Vol</th>
                  <th className="px-2 py-1 text-right text-gray-500">ETA</th>
                </tr>
              </thead>
              <tbody>
                {route.route_info.map((step, i) => (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-2 py-1">
                      {step.from_id}→{step.to_id}
                    </td>
                    <td className="px-2 py-1">{step.road}</td>
                    <td className="px-2 py-1 text-right">{step.distance.toFixed(3)}</td>
                    <td className="px-2 py-1 text-right">{step.travel_time.toFixed(2)}</td>
                    <td className="px-2 py-1 text-right">{step.traffic_volume.toFixed(0)}</td>
                    <td className="px-2 py-1 text-right">{step.arrival_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
