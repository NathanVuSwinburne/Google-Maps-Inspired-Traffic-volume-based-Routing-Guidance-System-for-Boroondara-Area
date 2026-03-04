"use client";

import { useState } from "react";
import type { FindRoutesResponse } from "@/types";
import RouteSummaryTable from "./RouteSummaryTable";
import RouteDetailPanel from "./RouteDetailPanel";

interface RouteResultsPanelProps {
  data: FindRoutesResponse;
}

export default function RouteResultsPanel({ data }: RouteResultsPanelProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-500 mb-1">
          {data.query.origin_id} → {data.query.destination_id} &middot;{" "}
          {data.query.datetime_str}
        </p>
        <p className="text-xs text-gray-400">
          {data.routes.length} route{data.routes.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <RouteSummaryTable
        routes={data.routes}
        selectedIndex={selectedIndex}
        onSelect={(i) => setSelectedIndex(i === selectedIndex ? null : i)}
      />

      <div className="space-y-2">
        {data.routes.map((route, i) => (
          <RouteDetailPanel key={i} route={route} />
        ))}
      </div>
    </div>
  );
}
