import { Hono } from "hono";
import {
  createServer,
  deleteServer,
  listServers,
  updateServer,
} from "../db/servers";
import { jsonError } from "../lib/http";
import type { Variables } from "../types";

export const serverRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

serverRoutes.get("/", async (c) => {
  const user = c.get("user");
  const servers = await listServers(c.env.DB, user.id);
  return c.json({ servers });
});

serverRoutes.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{
    name?: string;
    host?: string;
    port?: number;
    username?: string;
    auth_type?: "password" | "private_key";
    credential?: string;
  }>();

  if (!body.name?.trim()) return jsonError(c, 400, "name is required");
  if (!body.host?.trim()) return jsonError(c, 400, "host is required");
  if (!body.username?.trim()) return jsonError(c, 400, "username is required");
  if (!body.credential?.trim()) {
    return jsonError(c, 400, "credential is required");
  }
  if (body.auth_type !== "password" && body.auth_type !== "private_key") {
    return jsonError(c, 400, "auth_type must be password or private_key");
  }

  const port = body.port ?? 22;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return jsonError(c, 400, "port must be between 1 and 65535");
  }

  const server = await createServer(c.env.DB, user.id, {
    name: body.name.trim(),
    host: body.host.trim(),
    port,
    username: body.username.trim(),
    auth_type: body.auth_type,
    credential: body.credential,
  });

  return c.json({ server }, 201);
});

serverRoutes.put("/:id", async (c) => {
  const user = c.get("user");
  const serverId = c.req.param("id");
  const body = await c.req.json<{
    name?: string;
    host?: string;
    port?: number;
    username?: string;
    auth_type?: "password" | "private_key";
    credential?: string;
  }>();

  if (
    body.auth_type !== undefined &&
    body.auth_type !== "password" &&
    body.auth_type !== "private_key"
  ) {
    return jsonError(c, 400, "auth_type must be password or private_key");
  }

  if (body.port !== undefined) {
    if (!Number.isInteger(body.port) || body.port < 1 || body.port > 65535) {
      return jsonError(c, 400, "port must be between 1 and 65535");
    }
  }

  const server = await updateServer(c.env.DB, user.id, serverId, {
    name: body.name?.trim(),
    host: body.host?.trim(),
    username: body.username?.trim(),
    port: body.port,
    auth_type: body.auth_type,
    credential: body.credential,
  });

  if (!server) return jsonError(c, 404, "server not found");
  return c.json({ server });
});

serverRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  const serverId = c.req.param("id");
  const deleted = await deleteServer(c.env.DB, user.id, serverId);
  if (!deleted) return jsonError(c, 404, "server not found");
  return c.json({ ok: true });
});
