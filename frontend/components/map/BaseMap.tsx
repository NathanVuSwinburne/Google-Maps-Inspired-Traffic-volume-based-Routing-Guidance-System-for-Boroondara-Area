"use client";

import { useRef } from "react";
import Map, { MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Boroondara area center
const BOROONDARA_CENTER = { longitude: 145.073, latitude: -37.831 };
const DEFAULT_ZOOM = 12;

interface BaseMapProps {
  children?: React.ReactNode;
  onClick?: (e: mapboxgl.MapLayerMouseEvent) => void;
  onMouseMove?: (e: mapboxgl.MapLayerMouseEvent) => void;
  interactiveLayerIds?: string[];
}

export default function BaseMap({
  children,
  onClick,
  onMouseMove,
  interactiveLayerIds,
}: BaseMapProps) {
  const mapRef = useRef<MapRef>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={token}
      initialViewState={{
        longitude: BOROONDARA_CENTER.longitude,
        latitude: BOROONDARA_CENTER.latitude,
        zoom: DEFAULT_ZOOM,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      onClick={onClick}
      onMouseMove={onMouseMove}
      interactiveLayerIds={interactiveLayerIds}
      cursor="auto"
    >
      {children}
    </Map>
  );
}
