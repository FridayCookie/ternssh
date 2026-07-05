import { Hono } from "hono";
import {
  ensureDefaultDashboard,
  getDefaultDashboard,
  updateDashboard,
} from "../db/dashboards";
import type { Variables } from "../types";

export const dashboardRoutes = new Hono<{
  Bindings: Env;
  Variables: Variables;
}>();

dashboardRoutes.get("/", async (c) => {
  const user = c.get("user");
  const dashboard = await ensureDefaultDashboard(c.env.DB, user.id);
  return c.json(dashboard);
});

dashboardRoutes.put("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{
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
  }>();

  const dashboard = await updateDashboard(c.env.DB, user.id, body);
  return c.json(dashboard);
});

dashboardRoutes.get("/default", async (c) => {
  const user = c.get("user");
  const dashboard =
    (await getDefaultDashboard(c.env.DB, user.id)) ??
    (await ensureDefaultDashboard(c.env.DB, user.id));
  return c.json(dashboard);
});
