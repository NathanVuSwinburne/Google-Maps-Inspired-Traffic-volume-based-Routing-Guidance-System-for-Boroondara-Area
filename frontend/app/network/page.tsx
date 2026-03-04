"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import NetworkControls, {
  DisplayMode,
} from "@/components/network/NetworkControls";
import ConnectionsTable from "@/components/network/ConnectionsTable";
import SiteConnectionsPanel from "@/components/network/SiteConnectionsPanel";
import { useNetworkSites, useNetworkConnections } from "@/hooks/useNetwork";
import type { Site } from "@/types";

// Dynamically import map (SSR disabled — Mapbox GL requires browser)
const BaseMap = dynamic(() => import("@/components/map/BaseMap"), { ssr: false });
const NetworkLayer = dynamic(() => import("@/components/map/NetworkLayer"), { ssr: false });
const SitePopup = dynamic(() => import("@/components/map/SitePopup"), { ssr: false });

export default function NetworkPage() {
  const { data: sitesData, sitesGeoJSON, isLoading: sitesLoading } = useNetworkSites();
  const {
    data: connsData,
    connectionsGeoJSON,
    isLoading: connsLoading,
  } = useNetworkConnections();

  const [panelOpen, setPanelOpen] = useState(true);
  const [mode, setMode] = useState<DisplayMode>("all-sites");
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [popup, setPopup] = useState<{
    longitude: number;
    latitude: number;
    siteId: number;
    roads: string;
    locations: string;
  } | null>(null);

  const handleMapClick = useCallback(
    (e: mapboxgl.MapLayerMouseEvent) => {
      const features = e.features;
      if (!features || features.length === 0) {
        setPopup(null);
        return;
      }
      const props = features[0].properties;
      if (!props) return;
      const geom = features[0].geometry as GeoJSON.Point;
      setPopup({
        longitude: geom.coordinates[0],
        latitude: geom.coordinates[1],
        siteId: props.site_id,
        roads: props.connected_roads,
        locations: props.locations,
      });
      if (mode === "site-detail") {
        setSelectedSiteId(props.site_id);
      }
    },
    [mode]
  );

  const isLoading = sitesLoading || connsLoading;

  return (
    <div className="flex h-screen">
      {/* Collapsible middle panel */}
      <div className="relative shrink-0 flex">
        <div
          className={`bg-white border-r border-gray-200 overflow-hidden transition-[width] duration-300 ease-in-out ${
            panelOpen ? "w-72" : "w-0"
          }`}
        >
          <div className="w-72 overflow-y-auto h-full p-4 space-y-6">
            <h1 className="text-lg font-bold">Network Map</h1>

            {isLoading ? (
              <p className="text-sm text-gray-400">Loading network…</p>
            ) : (
              <>
                <p className="text-xs text-gray-500">
                  {sitesData?.count ?? 0} sites &middot; {connsData?.count ?? 0} connections
                </p>

                <NetworkControls
                  sites={sitesData?.sites ?? []}
                  mode={mode}
                  selectedSiteId={selectedSiteId}
                  onModeChange={(m) => {
                    setMode(m);
                    setSelectedSiteId(null);
                  }}
                  onSiteSelect={setSelectedSiteId}
                />

                {mode === "all-connections" && connsData && (
                  <ConnectionsTable
                    connections={connsData.connections}
                    title={`All Connections (${connsData.count})`}
                  />
                )}

                {mode === "site-detail" && selectedSiteId != null && (
                  <SiteConnectionsPanel siteId={selectedSiteId} />
                )}
              </>
            )}
          </div>
        </div>

        {/* Toggle tab */}
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
        <BaseMap
          onClick={handleMapClick}
          interactiveLayerIds={["sites-circle"]}
        >
          {sitesGeoJSON && connectionsGeoJSON && (
            <NetworkLayer
              sitesGeoJSON={sitesGeoJSON}
              connectionsGeoJSON={connectionsGeoJSON}
              highlightedId={selectedSiteId}
            />
          )}
          {popup && (
            <SitePopup
              {...popup}
              onClose={() => setPopup(null)}
            />
          )}
        </BaseMap>
      </div>
    </div>
  );
}
