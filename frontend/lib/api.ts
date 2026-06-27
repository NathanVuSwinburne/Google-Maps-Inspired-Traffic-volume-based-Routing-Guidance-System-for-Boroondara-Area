import type {
  NetworkSitesResponse,
  NetworkConnectionsResponse,
  SiteDetailResponse,
  FindRoutesResponse,
  RouteRequest,
  HealthResponse,
} from "@/types";
import { loadNetwork, loadTraffic } from "@/lib/routing/data-loader";
import { findRoutes } from "@/lib/routing/route-finder";

export const api = {
  health: async (): Promise<HealthResponse> => {
    const net = await loadNetwork();
    return { status: "ok", sites: net.sites.length, connections: net.connections.length };
  },

  getSites: async (): Promise<NetworkSitesResponse> => {
    const net = await loadNetwork();
    return { sites: net.sites, count: net.sites.length };
  },

  getConnections: async (): Promise<NetworkConnectionsResponse> => {
    const net = await loadNetwork();
    return { connections: net.connections, count: net.connections.length };
  },

  getSite: async (siteId: number): Promise<SiteDetailResponse> => {
    const net = await loadNetwork();
    const site = net.sites.find((s) => s.site_id === siteId);
    if (!site) throw new Error(`Site ${siteId} not found`);
    return {
      site,
      outgoing: net.connections.filter((c) => c.from_id === siteId),
      incoming: net.connections.filter((c) => c.to_id === siteId),
    };
  },

  findRoutes: async (body: RouteRequest): Promise<FindRoutesResponse> => {
    const [net, traffic] = await Promise.all([
      loadNetwork(),
      loadTraffic(body.model),
    ]);
    return findRoutes(body, net, traffic);
  },
};
