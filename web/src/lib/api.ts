export interface User {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  auth_type: "password" | "private_key";
  created_at: string;
  updated_at: string;
}

export interface DashboardWidget {
  id: string;
  dashboard_id: string;
  type: string;
  config_json: string | null;
  grid_x: number;
  grid_y: number;
  grid_w: number;
  grid_h: number;
}

export interface Dashboard {
  dashboard: {
    id: string;
    user_id: string;
    name: string;
    is_default: number;
    layout_json: string | null;
    created_at: string;
    updated_at: string;
  };
  widgets: DashboardWidget[];
}

export interface MeResponse {
  user: User;
  authMode: "open" | "access";
}

export interface CreateServerInput {
  name: string;
  host: string;
  port: number;
  username: string;
  auth_type: "password" | "private_key";
  credential: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getMe: () => request<MeResponse>("/api/v1/me"),
  listServers: () => request<{ servers: Server[] }>("/api/v1/servers"),
  createServer: (input: CreateServerInput) =>
    request<{ server: Server }>("/api/v1/servers", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  deleteServer: (id: string) =>
    request<{ ok: boolean }>(`/api/v1/servers/${id}`, { method: "DELETE" }),
  getDashboard: () => request<Dashboard>("/api/v1/dashboards"),
  updateDashboard: (body: {
    name?: string;
    layout_json?: string;
    widgets?: Array<{
      id?: string;
      type: string;
      config_json?: string | null;
      grid_x: number;
      grid_y: number;
      grid_w: number;
      grid_h: number;
    }>;
  }) =>
    request<Dashboard>("/api/v1/dashboards", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  createSession: (serverId: string) =>
    request<{ sessionId: string; wsUrl: string; status: string }>(
      "/api/v1/sessions",
      {
        method: "POST",
        body: JSON.stringify({ serverId }),
      },
    ),
};
