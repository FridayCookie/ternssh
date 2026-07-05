import { Hono } from "hono";
import { getAuthMode } from "../auth/identity";
import type { Variables } from "../types";

export const meRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

meRoutes.get("/", (c) => {
  const user = c.get("user");
  return c.json({
    user,
    authMode: getAuthMode(c.env),
  });
});
