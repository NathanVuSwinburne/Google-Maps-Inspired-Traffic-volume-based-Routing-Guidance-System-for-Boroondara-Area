"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useNetworkSites } from "@/hooks/useNetwork";
import { useRoutes } from "@/hooks/useRoutes";
import RouteForm from "@/components/routes/RouteForm";
import RouteResultsPanel from "@/components/routes/RouteResultsPanel";
import type { RouteRequest } from "@/types";
import { RANK_COLORS } from "@/lib/mapColors";

const BaseMap = dynamic(() => import("@/components/map/BaseMap"), { ssr: false });
const RouteLayer = dynamic(() => import("@/components/map/RouteLayer"), { ssr: false });
const RouteMarkers = dynamic(() => import("@/components/map/RouteMarkers"), { ssr: false });

export default function RoutesPage() {
  const { data: sitesData, isLoading: sitesLoading } = useNetworkSites();
  const { trigger, data, routeGeoJSONs, error, isMutating } = useRoutes();
  const [panelOpen, setPanelOpen] = useState(true);

  async function handleSubmit(req: RouteRequest) {
    await trigger(req);
  }

  return (
    <div className="flex h-screen">
      {/* Collapsible middle panel */}
      <div className="relative shrink-0 flex">
        {/* Sliding drawer — overflow-hidden clips content while width animates */}
        <div
          className={`bg-white border-r border-gray-200 overflow-hidden transition-[width] duration-300 ease-in-out ${
            panelOpen ? "w-80" : "w-0"
          }`}
          onTransitionEnd={() => window.dispatchEvent(new Event("resize"))}
        >
          {/* Inner div keeps fixed width so content doesn't reflow during animation */}
          <div className="w-80 overflow-y-auto h-full p-4 space-y-6">
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
        </div>

        {/* Toggle tab — always visible, sits on right edge of drawer */}
        <button
          onClick={() => setPanelOpen((o) => !o)}
          title={panelOpen ? "Collapse panel" : "Expand panel"}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full z-10
                     bg-white border border-l-0 border-gray-200 rounded-r-lg
                     px-1.5 py-5 shadow-md hover:bg-gray-50 transition-colors
                     flex items-center justify-center"
        >
          <span className="text-gray-500 text-base leading-none select-none">
            {panelOpen ? "‹" : "›"}
          </span>
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <BaseMap>
          {/* Sort fastest first, assign rank colors, then reverse render order so
              fastest (green) is drawn last and appears on top in Mapbox GL. */}
          {[...routeGeoJSONs]
            .sort((a, b) => a.route.total_cost - b.route.total_cost)
            .map(({ route, geojson }, i) => ({
              route,
              geojson,
              color: RANK_COLORS[i] ?? "#1f2937",
            }))
            .reverse()
            .map(({ route, geojson, color }) => (
              <RouteLayer
                key={route.algorithm}
                routeId={route.algorithm}
                geojson={geojson}
                color={color}
              />
            ))}
          {/* Start (A) and end (B) pins — derived from first route's coordinates */}
          {routeGeoJSONs[0] && (() => {
            const coords = routeGeoJSONs[0].geojson.features[0]?.geometry.coordinates;
            if (!coords || coords.length < 2) return null;
            const originSite = data?.query.origin_id != null
              ? sitesData?.sites.find((s) => s.site_id === data.query.origin_id)
              : undefined;
            const destSite = data?.query.destination_id != null
              ? sitesData?.sites.find((s) => s.site_id === data.query.destination_id)
              : undefined;
            return (
              <RouteMarkers
                start={coords[0] as [number, number]}
                end={coords[coords.length - 1] as [number, number]}
                startName={originSite ? `Site ${originSite.site_id} – ${originSite.connected_roads[0] ?? ""}` : undefined}
                endName={destSite ? `Site ${destSite.site_id} – ${destSite.connected_roads[0] ?? ""}` : undefined}
              />
            );
          })()}
        </BaseMap>
      </div>
    </div>
  );
}
