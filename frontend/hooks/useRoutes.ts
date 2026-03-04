"use client";

import useSWRMutation from "swr/mutation";
import { api } from "@/lib/api";
import type { RouteRequest, Route } from "@/types";
import type { FeatureCollection, LineString } from "geojson";
import { TRAFFIC_LEVEL_COLORS } from "@/lib/mapColors";

async function findRoutes(_key: string, { arg }: { arg: RouteRequest }) {
  return api.findRoutes(arg);
}

export function useRoutes() {
  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    "routes/find",
    findRoutes
  );

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
