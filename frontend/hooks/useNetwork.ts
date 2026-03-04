"use client";

import useSWR from "swr";
import { api } from "@/lib/api";
import type { Site, Connection } from "@/types";
import type { FeatureCollection, Point, LineString } from "geojson";

export function useNetworkSites() {
  const { data, error, isLoading } = useSWR("network/sites", api.getSites, {
    revalidateOnFocus: false,
  });

  const sitesGeoJSON: FeatureCollection<Point> | null = data
    ? {
        type: "FeatureCollection",
        features: data.sites.map((s: Site) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [s.longitude, s.latitude] },
          properties: {
            site_id: s.site_id,
            connected_roads: s.connected_roads.join(", "),
            locations: s.locations.join(" | "),
            role: "background",
          },
        })),
      }
    : null;

  return { data, sitesGeoJSON, error, isLoading };
}

export function useNetworkConnections() {
  const { data, error, isLoading } = useSWR(
    "network/connections",
    api.getConnections,
    { revalidateOnFocus: false }
  );

  const connectionsGeoJSON: FeatureCollection<LineString> | null = data
    ? {
        type: "FeatureCollection",
        features: data.connections.map((c: Connection) => ({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [c.from_lng, c.from_lat],
              [c.to_lng, c.to_lat],
            ],
          },
          properties: {
            from_id: c.from_id,
            to_id: c.to_id,
            shared_road: c.shared_road,
            distance: c.distance,
            approach_location: c.approach_location,
          },
        })),
      }
    : null;

  return { data, connectionsGeoJSON, error, isLoading };
}

export function useSiteDetail(siteId: number | null) {
  const { data, error, isLoading } = useSWR(
    siteId != null ? `network/sites/${siteId}` : null,
    () => api.getSite(siteId!),
    { revalidateOnFocus: false }
  );
  return { data, error, isLoading };
}
