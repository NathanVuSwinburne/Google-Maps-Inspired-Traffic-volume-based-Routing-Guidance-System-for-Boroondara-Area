"use client";

import dynamic from "next/dynamic";
import { useNetworkSites } from "@/hooks/useNetwork";
import { useRoutes } from "@/hooks/useRoutes";
import RouteForm from "@/components/routes/RouteForm";
import RouteResultsPanel from "@/components/routes/RouteResultsPanel";
import type { RouteRequest } from "@/types";

const BaseMap = dynamic(() => import("@/components/map/BaseMap"), { ssr: false });
const RouteLayer = dynamic(() => import("@/components/map/RouteLayer"), { ssr: false });

export default function RoutesPage() {
  const { data: sitesData, isLoading: sitesLoading } = useNetworkSites();
  const { trigger, data, routeGeoJSONs, error, isMutating } = useRoutes();

  async function handleSubmit(req: RouteRequest) {
    await trigger(req);
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 shrink-0 bg-white border-r border-gray-200 overflow-y-auto p-4 space-y-6">
        <h1 className="text-lg font-bold">Route Finder</h1>

        {sitesLoading ? (
          <p className="text-sm text-gray-400">Loading sites…</p>
        ) : (
          <RouteForm
            sites={sitesData?.sites ?? []}
            onSubmit={handleSubmit}
            isLoading={isMutating}
          />
        )}

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
            {error instanceof Error ? error.message : "Request failed"}
          </p>
        )}

        {data && !isMutating && <RouteResultsPanel data={data} />}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <BaseMap>
          {/* Draw routes in reverse so best route (rank 1) renders on top */}
          {[...routeGeoJSONs].reverse().map(({ route, geojson }) => (
            <RouteLayer
              key={route.algorithm}
              routeId={route.algorithm}
              geojson={geojson}
              trafficLevel={route.traffic_level}
              animate={true}
            />
          ))}
        </BaseMap>
      </div>
    </div>
  );
}
