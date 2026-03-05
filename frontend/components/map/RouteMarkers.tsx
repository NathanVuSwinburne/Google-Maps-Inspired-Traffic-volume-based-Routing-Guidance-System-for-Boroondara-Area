"use client";

import { useState } from "react";
import { Marker } from "react-map-gl";

interface RouteMarkersProps {
  start: [number, number]; // [lng, lat]
  end: [number, number];   // [lng, lat]
  startName?: string;
  endName?: string;
}

const PIN_SIZE = 34;

function Pin({ label, color, tooltip }: { label: string; color: string; tooltip?: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tooltip */}
      {hovered && tooltip && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: 8,
            background: "#1f2937",
            color: "white",
            padding: "4px 10px",
            borderRadius: 5,
            fontSize: 12,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 10,
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
        >
          {tooltip}
        </div>
      )}
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

export default function RouteMarkers({ start, end, startName, endName }: RouteMarkersProps) {
  return (
    <>
      <Marker longitude={start[0]} latitude={start[1]} anchor="bottom">
        <Pin label="A" color="#16a34a" tooltip={startName} />
      </Marker>
      <Marker longitude={end[0]} latitude={end[1]} anchor="bottom">
        <Pin label="B" color="#dc2626" tooltip={endName} />
      </Marker>
    </>
  );
}
