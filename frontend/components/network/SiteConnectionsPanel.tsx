"use client";

import { useSiteDetail } from "@/hooks/useNetwork";
import ConnectionsTable from "./ConnectionsTable";

interface SiteConnectionsPanelProps {
  siteId: number;
}

export default function SiteConnectionsPanel({ siteId }: SiteConnectionsPanelProps) {
  const { data, isLoading, error } = useSiteDetail(siteId);

  if (isLoading) return <p className="text-sm text-gray-400">Loading site {siteId}…</p>;
  if (error) return <p className="text-sm text-red-500">Failed to load site.</p>;
  if (!data) return null;

  const { site, outgoing, incoming } = data;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold mb-1">Site {site.site_id}</h2>
        <p className="text-xs text-gray-500">
          {site.connected_roads.join(", ")}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {site.latitude.toFixed(6)}, {site.longitude.toFixed(6)}
        </p>
      </div>

      <ConnectionsTable connections={outgoing} title={`Outgoing (${outgoing.length})`} />
      <ConnectionsTable connections={incoming} title={`Incoming (${incoming.length})`} />
    </div>
  );
}
