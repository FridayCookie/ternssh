import { newId } from "../lib/id";
import type { ServerPublic, ServerRecord } from "../types";

function toPublic(server: ServerRecord): ServerPublic {
  return {
    id: server.id,
    name: server.name,
    host: server.host,
    port: server.port,
    username: server.username,
    auth_type: server.auth_type,
    created_at: server.created_at,
    updated_at: server.updated_at,
  };
}

export async function listServers(
  db: D1Database,
  userId: string,
): Promise<ServerPublic[]> {
  const { results } = await db
    .prepare(
      `SELECT id, user_id, name, host, port, username, auth_type, credential_ref, created_at, updated_at
       FROM servers WHERE user_id = ? ORDER BY created_at DESC`,
    )
    .bind(userId)
    .all<ServerRecord>();

  return (results ?? []).map(toPublic);
}

export async function getServer(
  db: D1Database,
  userId: string,
  serverId: string,
): Promise<ServerRecord | null> {
  return db
    .prepare(
      `SELECT id, user_id, name, host, port, username, auth_type, credential_ref, created_at, updated_at
       FROM servers WHERE id = ? AND user_id = ?`,
    )
    .bind(serverId, userId)
    .first<ServerRecord>();
}

export async function createServer(
  db: D1Database,
  userId: string,
  input: {
    name: string;
    host: string;
    port: number;
    username: string;
    auth_type: "password" | "private_key";
    credential: string;
  },
): Promise<ServerPublic> {
  const serverId = newId();
  const credentialId = newId();

  await db.batch([
    db
      .prepare(
        "INSERT INTO credentials (id, user_id, value) VALUES (?, ?, ?)",
      )
      .bind(credentialId, userId, input.credential),
    db
      .prepare(
        `INSERT INTO servers (id, user_id, name, host, port, username, auth_type, credential_ref)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        serverId,
        userId,
        input.name,
        input.host,
        input.port,
        input.username,
        input.auth_type,
        credentialId,
      ),
  ]);

  const server = await getServer(db, userId, serverId);
  if (!server) throw new Error("Failed to create server");
  return toPublic(server);
}

export async function updateServer(
  db: D1Database,
  userId: string,
  serverId: string,
  input: {
    name?: string;
    host?: string;
    port?: number;
    username?: string;
    auth_type?: "password" | "private_key";
    credential?: string;
  },
): Promise<ServerPublic | null> {
  const existing = await getServer(db, userId, serverId);
  if (!existing) return null;

  const statements: D1PreparedStatement[] = [];

  if (input.credential !== undefined) {
    statements.push(
      db
        .prepare("UPDATE credentials SET value = ? WHERE id = ? AND user_id = ?")
        .bind(input.credential, existing.credential_ref, userId),
    );
  }

  statements.push(
    db
      .prepare(
        `UPDATE servers SET
          name = ?,
          host = ?,
          port = ?,
          username = ?,
          auth_type = ?,
          updated_at = datetime('now')
         WHERE id = ? AND user_id = ?`,
      )
      .bind(
        input.name ?? existing.name,
        input.host ?? existing.host,
        input.port ?? existing.port,
        input.username ?? existing.username,
        input.auth_type ?? existing.auth_type,
        serverId,
        userId,
      ),
  );

  await db.batch(statements);

  const server = await getServer(db, userId, serverId);
  return server ? toPublic(server) : null;
}

export async function deleteServer(
  db: D1Database,
  userId: string,
  serverId: string,
): Promise<boolean> {
  const existing = await getServer(db, userId, serverId);
  if (!existing) return false;

  await db.batch([
    db
      .prepare("DELETE FROM servers WHERE id = ? AND user_id = ?")
      .bind(serverId, userId),
    db
      .prepare("DELETE FROM credentials WHERE id = ? AND user_id = ?")
      .bind(existing.credential_ref, userId),
  ]);

  return true;
}

export async function getCredentialValue(
  db: D1Database,
  userId: string,
  credentialRef: string,
): Promise<string | null> {
  const row = await db
    .prepare("SELECT value FROM credentials WHERE id = ? AND user_id = ?")
    .bind(credentialRef, userId)
    .first<{ value: string }>();

  return row?.value ?? null;
}
