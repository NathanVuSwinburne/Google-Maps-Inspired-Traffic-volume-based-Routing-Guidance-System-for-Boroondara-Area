"use client";

import { useEffect, useRef } from "react";
import { Source, Layer, useMap } from "react-map-gl";
import type { LineLayer } from "react-map-gl";
import type { FeatureCollection, LineString } from "geojson";
import { TRAFFIC_LEVEL_COLORS } from "@/lib/mapColors";
import type { TrafficLevel } from "@/types";

interface RouteLayerProps {
  routeId: string;
  geojson: FeatureCollection<LineString>;
  trafficLevel: TrafficLevel;
  animate?: boolean;
}

export default function RouteLayer({
  routeId,
  geojson,
  trafficLevel,
  animate = true,
}: RouteLayerProps) {
  const { current: map } = useMap();
  const rafRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const layerId = `route-line-${routeId}`;

  const lineLayer: LineLayer = {
    id: layerId,
    type: "line",
    paint: {
      "line-color": TRAFFIC_LEVEL_COLORS[trafficLevel],
      "line-width": 4,
      "line-opacity": 0.85,
      "line-dasharray": [2, 2],
    },
  };

  // Animate the dasharray offset to create a moving-ant effect
  useEffect(() => {
    if (!animate || !map) return;

    const DASH_SEQUENCE = [
      [2, 2],
      [0.5, 3.5],
      [0, 4],
      [0.5, 3.5],
    ];

    let lastTime = 0;
    const INTERVAL_MS = 120;

    function tick(now: number) {
      if (now - lastTime >= INTERVAL_MS) {
        lastTime = now;
        stepRef.current = (stepRef.current + 1) % DASH_SEQUENCE.length;
        if (map.getLayer(layerId)) {
          map.setPaintProperty(layerId, "line-dasharray", DASH_SEQUENCE[stepRef.current]);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [animate, map, layerId]);

  return (
    <Source id={`route-source-${routeId}`} type="geojson" data={geojson}>
      <Layer {...lineLayer} />
    </Source>
  );
}
