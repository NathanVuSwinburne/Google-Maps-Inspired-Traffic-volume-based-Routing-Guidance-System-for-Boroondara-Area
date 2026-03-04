"use client";

import { Popup } from "react-map-gl";

interface SitePopupProps {
  longitude: number;
  latitude: number;
  siteId: number;
  roads: string;
  locations: string;
  onClose: () => void;
}

export default function SitePopup({
  longitude,
  latitude,
  siteId,
  roads,
  locations,
  onClose,
}: SitePopupProps) {
  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      anchor="bottom"
      onClose={onClose}
      closeOnClick={false}
      className="text-sm"
    >
      <div className="p-1 min-w-[160px]">
        <p className="font-semibold mb-1">Site {siteId}</p>
        <p className="text-gray-600 text-xs">{roads}</p>
        <p className="text-gray-500 text-xs mt-1 whitespace-pre-wrap">{locations.replace(" | ", "\n")}</p>
      </div>
    </Popup>
  );
}
