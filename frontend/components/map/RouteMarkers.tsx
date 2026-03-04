"use client";

import { Marker } from "react-map-gl";

interface RouteMarkersProps {
  start: [number, number]; // [lng, lat]
  end: [number, number];   // [lng, lat]
}

const PIN_SIZE = 34;

function Pin({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Circle */}
      <div
        style={{
          width: PIN_SIZE,
          height: PIN_SIZE,
          borderRadius: "50%",
          background: color,
          border: "3px solid white",
          boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: 15,
          fontFamily: "sans-serif",
          userSelect: "none",
        }}
      >
        {label}
      </div>
      {/* Triangle pointer */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: `9px solid ${color}`,
          marginTop: -1,
        }}
      />
    </div>
  );
}

export default function RouteMarkers({ start, end }: RouteMarkersProps) {
  return (
    <>
      <Marker longitude={start[0]} latitude={start[1]} anchor="bottom">
        <Pin label="A" color="#16a34a" />
      </Marker>
      <Marker longitude={end[0]} latitude={end[1]} anchor="bottom">
        <Pin label="B" color="#dc2626" />
      </Marker>
    </>
  );
}
