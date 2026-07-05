import { DurableObject } from "cloudflare:workers";

export class SshSession extends DurableObject<Env> {
  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader?.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.ctx.acceptWebSocket(server);

    server.send(
      JSON.stringify({
        type: "status",
        message: "SSH session placeholder — connection wiring comes in Phase 2",
      }),
    );

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    if (typeof message === "string") {
      ws.send(JSON.stringify({ type: "echo", data: message }));
      return;
    }

    ws.send(JSON.stringify({ type: "echo", bytes: message.byteLength }));
  }

  async webSocketClose(
    ws: WebSocket,
    _code: number,
    _reason: string,
    _wasClean: boolean,
  ) {
    ws.close();
  }
}
