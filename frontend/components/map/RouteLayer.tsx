"use client";

import { useEffect, useRef, useMemo } from "react";
import { Source, Layer, useMap } from "react-map-gl";
import type { LineLayer, SymbolLayer } from "react-map-gl";
import type { FeatureCollection, LineString, Feature, Point } from "geojson";
// ---------- geometry helpers ----------

function haversineM(a: number[], b: number[]): number {
  const R = 6371000;
  const φ1 = (a[1] * Math.PI) / 180;
  const φ2 = (b[1] * Math.PI) / 180;
  const Δφ = ((b[1] - a[1]) * Math.PI) / 180;
  const Δλ = ((b[0] - a[0]) * Math.PI) / 180;
  const s = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function bearingDeg(a: number[], b: number[]): number {
  const φ1 = (a[1] * Math.PI) / 180;
  const φ2 = (b[1] * Math.PI) / 180;
  const Δλ = ((b[0] - a[0]) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/**
 * Returns the position and text-rotate for a ▶ glyph at `dist` meters along `coords`.
 * ▶ faces east (90°), so rotate = bearing − 90 to align with travel direction.
 */
function sampleLine(
  coords: number[][],
  segLengths: number[],
  totalLength: number,
  dist: number
): { lng: number; lat: number; rotate: number } | null {
  const d = ((dist % totalLength) + totalLength) % totalLength;
  let acc = 0;
  for (let i = 0; i < segLengths.length; i++) {
    if (acc + segLengths[i] >= d) {
      const t = segLengths[i] > 0 ? (d - acc) / segLengths[i] : 0;
      return {
        lng: coords[i][0] + t * (coords[i + 1][0] - coords[i][0]),
        lat: coords[i][1] + t * (coords[i + 1][1] - coords[i][1]),
        rotate: bearingDeg(coords[i], coords[i + 1]) - 90,
      };
    }
    acc += segLengths[i];
  }
  return null;
}

// ---------- constants ----------

const ARROW_COUNT = 4;
const LOOP_DURATION_MS = 8000; // one full loop in 8 seconds

// ---------- component ----------

interface RouteLayerProps {
  routeId: string;
  geojson: FeatureCollection<LineString>;
  color: string;
}

type GeoJSONSource = { setData: (data: object) => void };

export default function RouteLayer({ routeId, geojson, color }: RouteLayerProps) {
  const { current: mapRef } = useMap();
  const map = mapRef?.getMap();
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);
  const lineSourceId = `route-source-${routeId}`;
  const arrowSourceId = `route-arrows-${routeId}`;
  const lineLayerId = `route-line-${routeId}`;
  const arrowLayerId = `route-arrow-${routeId}`;

  const coords = useMemo(
    () => geojson.features[0]?.geometry?.coordinates ?? [],
    [geojson]
  );

  const { segLengths, totalLength } = useMemo(() => {
    const segs: number[] = [];
    let total = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const len = haversineM(coords[i], coords[i + 1]);
      segs.push(len);
      total += len;
    }
    return { segLengths: segs, totalLength: total };
  }, [coords]);

  useEffect(() => {
    if (!map || totalLength === 0) return;

    function tick(now: number) {
      const dt = lastTimeRef.current ? now - lastTimeRef.current : 0;
      lastTimeRef.current = now;
      phaseRef.current =
        (phaseRef.current + (dt / LOOP_DURATION_MS) * totalLength) % totalLength;

      const features: Feature<Point>[] = [];
      for (let i = 0; i < ARROW_COUNT; i++) {
        const dist = (phaseRef.current + (i / ARROW_COUNT) * totalLength) % totalLength;
        const pt = sampleLine(coords, segLengths, totalLength, dist);
        if (pt) {
          features.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: [pt.lng, pt.lat] },
            properties: { rotate: pt.rotate },
          });
        }
      }

      (map.getSource(arrowSourceId) as GeoJSONSource | undefined)?.setData({
        type: "FeatureCollection",
        features,
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
    };
  }, [map, coords, segLengths, totalLength, arrowSourceId]);

  const lineLayer: LineLayer = {
    id: lineLayerId,
    type: "line",
    paint: {
      "line-color": color,
      "line-width": 4,
      "line-opacity": 0.9,
    },
  };

  const arrowLayer: SymbolLayer = {
    id: arrowLayerId,
    type: "symbol",
    layout: {
      "text-field": "▶",
      "text-size": 22,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "text-rotate": ["get", "rotate"] as any,
      "text-rotation-alignment": "map",
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      "text-color": "#000000",
      "text-opacity": 1,
    },
  };

  return (
    <>
      <Source id={lineSourceId} type="geojson" data={geojson}>
        <Layer {...lineLayer} />
      </Source>
      {/* Arrow source starts empty; the RAF loop updates it each frame */}
      <Source id={arrowSourceId} type="geojson" data={{ type: "FeatureCollection", features: [] }}>
        <Layer {...arrowLayer} />
      </Source>
    </>
  );
}
