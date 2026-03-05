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

const SVG_SIZE = 1;
const CIRCLE_R = 7;
const CENTER = SVG_SIZE / 2;

function SitePin({ highlighted }: { highlighted: boolean }) {
  const color = highlighted ? "#ef4444" : "#6b7280";
  return (
    <svg
      width={SVG_SIZE}
      height={SVG_SIZE}
      style={{ display: "block", overflow: "visible" }}
    >
      {/* transparent hit-area circle */}
      <circle cx={CENTER} cy={CENTER} r={CENTER} fill="transparent" />
      {/* visible marker circle */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={CIRCLE_R}
        fill={color}
        stroke="white"
        strokeWidth={2}
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.35))"
      />
    </svg>
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
          anchor="center"
        >
          <div
            style={{
              cursor: selectable ? "pointer" : "default",
              pointerEvents: "all",
            }}
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
