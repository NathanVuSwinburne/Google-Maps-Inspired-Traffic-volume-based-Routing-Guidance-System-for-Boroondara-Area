"use client";

import { Source, Layer } from "react-map-gl";
import type { CircleLayer, LineLayer, SymbolLayer } from "react-map-gl";
import type { FeatureCollection, Point, LineString } from "geojson";

interface NetworkLayerProps {
  sitesGeoJSON: FeatureCollection<Point>;
  connectionsGeoJSON: FeatureCollection<LineString>;
  highlightedId?: number | null;
}

const connectionLineLayer: LineLayer = {
  id: "connections-line",
  type: "line",
  paint: {
    "line-color": "#ef4444",
    "line-width": 1.5,
    "line-opacity": 0.7,
  },
};

const arrowLayer: SymbolLayer = {
  id: "connections-arrow",
  type: "symbol",
  layout: {
    "symbol-placement": "line-center",
    "text-field": "▶",
    "text-size": 10,
    "text-allow-overlap": false,
    "text-ignore-placement": false,
    "text-keep-upright": false,
  },
  paint: {
    "text-color": "#ef4444",
    "text-opacity": 0.8,
  },
};

const sitesCircleLayer: CircleLayer = {
  id: "sites-circle",
  type: "circle",
  paint: {
    "circle-radius": [
      "case",
      ["==", ["get", "role"], "highlighted"],
      8,
      5,
    ],
    "circle-color": [
      "case",
      ["==", ["get", "role"], "highlighted"],
      "#ef4444",
      "#6b7280",
    ],
    "circle-opacity": 0.85,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#1f2937",
  },
};

export default function NetworkLayer({
  sitesGeoJSON,
  connectionsGeoJSON,
  highlightedId,
}: NetworkLayerProps) {
  // Patch highlighted site role
  const patchedSites: FeatureCollection<Point> = {
    ...sitesGeoJSON,
    features: sitesGeoJSON.features.map((f) => ({
      ...f,
      properties: {
        ...f.properties,
        role:
          f.properties?.site_id === highlightedId ? "highlighted" : "background",
      },
    })),
  };

  return (
    <>
      <Source id="connections" type="geojson" data={connectionsGeoJSON}>
        <Layer {...connectionLineLayer} />
        <Layer {...arrowLayer} />
      </Source>
      <Source id="sites" type="geojson" data={patchedSites}>
        <Layer {...sitesCircleLayer} />
      </Source>
    </>
  );
}
