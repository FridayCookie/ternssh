import { createRemoteJWKSet, jwtVerify } from "jose";
import { ensureDefaultUser, upsertUserFromEmail } from "../db/users";
import type { User } from "../types";

const DEFAULT_USER: User = {
  id: "default",
  email: null,
  display_name: "Default",
  created_at: "",
  updated_at: "",
};

function isAccessEnabled(env: Env): boolean {
  return String(env.ACCESS_ENABLED).toLowerCase() === "true";
}

async function verifyAccessJwt(
  token: string,
  env: Env,
): Promise<{ email: string }> {
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) {
    throw new Error("ACCESS_TEAM_DOMAIN and ACCESS_AUD must be configured");
  }

  const issuer = `https://${env.ACCESS_TEAM_DOMAIN}`;
  const jwks = createRemoteJWKSet(
    new URL(`${issuer}/cdn-cgi/access/certs`),
  );

  const { payload } = await jwtVerify(token, jwks, {
    issuer,
    audience: env.ACCESS_AUD,
  });

  const email = typeof payload.email === "string" ? payload.email : null;
  if (!email) {
    throw new Error("Access JWT missing email claim");
  }

  return { email };
}

export async function resolveUser(request: Request, env: Env): Promise<User> {
  if (!isAccessEnabled(env)) {
    return ensureDefaultUser(env.DB);
  }

  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) {
    throw new IdentityError("Missing Cf-Access-Jwt-Assertion header", 401);
  }

  const { email } = await verifyAccessJwt(token, env);
  return upsertUserFromEmail(env.DB, email);
}

export class IdentityError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "IdentityError";
  }
}

export function getAuthMode(env: Env): "open" | "access" {
  return isAccessEnabled(env) ? "access" : "open";
}

export async function getDefaultUserSnapshot(env: Env): Promise<User> {
  if (isAccessEnabled(env)) {
    return DEFAULT_USER;
  }
  return ensureDefaultUser(env.DB);
}
