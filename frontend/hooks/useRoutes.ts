"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { RouteRequest, FindRoutesResponse, Route } from "@/types";
import type { FeatureCollection, LineString } from "geojson";
import { TRAFFIC_LEVEL_COLORS } from "@/lib/mapColors";

export function useRoutes() {
  const [data, setData] = useState<FindRoutesResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const trigger = useCallback(async (req: RouteRequest) => {
    setIsMutating(true);
    setError(null);
    try {
      const result = await api.findRoutes(req);
      setData(result);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Request failed"));
      return null;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  /** Convert routes to per-route GeoJSON LineString feature collections. */
  const routeGeoJSONs: Array<{ route: Route; geojson: FeatureCollection<LineString> }> =
    data
      ? data.routes.map((route) => ({
          route,
          geojson: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: [
                    ...route.route_info.map((s) => [s.from_lng, s.from_lat]),
                    [
                      route.route_info[route.route_info.length - 1].to_lng,
                      route.route_info[route.route_info.length - 1].to_lat,
                    ],
                  ],
                },
                properties: {
                  algorithm: route.algorithm,
                  traffic_level: route.traffic_level,
                  color: TRAFFIC_LEVEL_COLORS[route.traffic_level],
                  total_cost: route.total_cost,
                  route_rank: route.route_rank,
                },
              },
            ],
          },
        }))
      : [];

  return {
    trigger,
    data,
    routeGeoJSONs,
    error,
    isMutating,
    reset,
  };
}
