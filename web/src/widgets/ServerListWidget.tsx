import { Plus, Server as ServerIcon, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ServerListWidgetProps } from "./types";

export function ServerListWidget({
  servers,
  loading,
  context,
  onAddServer,
  onDeleteServer,
}: ServerListWidgetProps) {
  return (
    <Card className="widget-no-drag h-full overflow-hidden">
      <CardHeader className="widget-no-drag flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <ServerIcon className="h-4 w-4" />
          服务器
        </CardTitle>
        <Button className="widget-no-drag" size="sm" onClick={onAddServer}>
          <Plus className="mr-1 h-3 w-3" />
          添加
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 overflow-auto">
        {loading && (
          <p className="text-sm text-[var(--color-muted-foreground)]">加载中...</p>
        )}
        {!loading && servers.length === 0 && (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            还没有服务器，点击添加开始。
          </p>
        )}
        {servers.map((server) => {
          const selected = context.selectedServerId === server.id;
          return (
            <div
              key={server.id}
              className={cn(
                "rounded-lg border p-3 transition-colors",
                selected && "border-[var(--color-primary)] bg-[var(--color-secondary)]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  className="widget-no-drag min-w-0 flex-1 text-left"
                  onClick={() => context.onSelectServer(server.id)}
                >
                  <div className="truncate font-medium">{server.name}</div>
                  <div className="truncate text-xs text-[var(--color-muted-foreground)]">
                    {server.username}@{server.host}:{server.port}
                  </div>
                </button>
                <Button
                  className="widget-no-drag"
                  size="icon"
                  variant="ghost"
                  onClick={() => onDeleteServer(server.id)}
                  aria-label={`删除 ${server.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge>{server.auth_type}</Badge>
                <Button
                  className="widget-no-drag"
                  size="sm"
                  variant="secondary"
                  onClick={() => context.onConnectServer(server.id)}
                >
                  连接
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
