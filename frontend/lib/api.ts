import type {
  NetworkSitesResponse,
  NetworkConnectionsResponse,
  SiteDetailResponse,
  FindRoutesResponse,
  RouteRequest,
  HealthResponse,
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text();
    try {
      const json = JSON.parse(body);
      throw new Error(json.detail ?? body);
    } catch (e) {
      if (e instanceof SyntaxError) throw new Error(body);
      throw e;
    }
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => apiFetch<HealthResponse>("/api/health"),

  getSites: () => apiFetch<NetworkSitesResponse>("/api/network/sites"),

  getConnections: () =>
    apiFetch<NetworkConnectionsResponse>("/api/network/connections"),

  getSite: (siteId: number) =>
    apiFetch<SiteDetailResponse>(`/api/network/sites/${siteId}`),

  findRoutes: (body: RouteRequest) =>
    apiFetch<FindRoutesResponse>("/api/routes/find", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
