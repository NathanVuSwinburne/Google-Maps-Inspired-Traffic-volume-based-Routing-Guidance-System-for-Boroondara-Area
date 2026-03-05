"use client";

import { Marker } from "react-map-gl";
import type { Site } from "@/types";

interface SiteMarkersProps {
  sites: Site[];
  highlightedId: number | null;
  onHover: (site: Site | null) => void;
  onSelect: (siteId: number) => void;
  selectable: boolean;
}

const PIN_SIZE = 18;

function SitePin({ highlighted }: { highlighted: boolean }) {
  const color = highlighted ? "#ef4444" : "#6b7280";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          width: PIN_SIZE,
          height: PIN_SIZE,
          borderRadius: "50%",
          background: color,
          border: "2px solid white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
        }}
      />
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: `7px solid ${color}`,
          marginTop: -1,
        }}
      />
    </div>
  );
}

export default function SiteMarkers({
  sites,
  highlightedId,
  onHover,
  onSelect,
  selectable,
}: SiteMarkersProps) {
  return (
    <>
      {sites.map((site) => (
        <Marker
          key={site.site_id}
          longitude={site.longitude}
          latitude={site.latitude}
          anchor="bottom"
        >
          <div
            style={{ cursor: selectable ? "pointer" : "default" }}
            onMouseEnter={() => onHover(site)}
            onMouseLeave={() => onHover(null)}
            onClick={() => { if (selectable) onSelect(site.site_id); }}
          >
            <SitePin highlighted={site.site_id === highlightedId} />
          </div>
        </Marker>
      ))}
    </>
  );
}
