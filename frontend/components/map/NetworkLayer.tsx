"use client";

import { Source, Layer } from "react-map-gl";
import type { LineLayer } from "react-map-gl";
import type { FeatureCollection, LineString } from "geojson";

interface NetworkLayerProps {
  connectionsGeoJSON: FeatureCollection<LineString>;
}

const connectionLineLayer: LineLayer = {
  id: "connections-line",
  type: "line",
  paint: {
    "line-color": "#22c55e",
    "line-width": 3,
    "line-opacity": 0.7,
  },
};

export default function NetworkLayer({ connectionsGeoJSON }: NetworkLayerProps) {
  return (
    <Source id="connections" type="geojson" data={connectionsGeoJSON}>
      <Layer {...connectionLineLayer} />
    </Source>
  );
}
