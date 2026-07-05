import { useEffect, useRef, useState } from "react";
import { TerminalSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TerminalWidgetProps } from "./types";

export function TerminalWidget({ sessionWsUrl, context }: TerminalWidgetProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "connecting" | "open" | "closed">(
    "idle",
  );
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!sessionWsUrl) {
      setStatus("idle");
      setMessages([]);
      wsRef.current?.close();
      wsRef.current = null;
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}${sessionWsUrl}`);
    wsRef.current = ws;
    setStatus("connecting");
    setMessages([]);

    ws.onopen = () => setStatus("open");
    ws.onclose = () => setStatus("closed");
    ws.onerror = () => setStatus("closed");
    ws.onmessage = (event) => {
      setMessages((prev) => [...prev.slice(-99), String(event.data)]);
    };

    return () => {
      ws.close();
    };
  }, [sessionWsUrl]);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <TerminalSquare className="h-4 w-4" />
          终端
        </CardTitle>
        <Badge>{status}</Badge>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        {!context.selectedServerId && !sessionWsUrl && (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            选择服务器并点击连接以打开会话。
          </p>
        )}
        <div className="min-h-0 flex-1 overflow-auto rounded-lg border bg-black/40 p-3 font-mono text-xs leading-6">
          {messages.length === 0 ? (
            <span className="text-[var(--color-muted-foreground)]">
              等待终端输出...
            </span>
          ) : (
            messages.map((message, index) => (
              <div key={`${index}-${message.slice(0, 12)}`}>{message}</div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
