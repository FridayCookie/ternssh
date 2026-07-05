import { useCallback, useEffect, useRef, useState } from "react";
import { api, type Dashboard, type Server } from "@/lib/api";
import { ServerListWidget } from "@/widgets/ServerListWidget";
import { TerminalWidget } from "@/widgets/TerminalWidget";
import type { WidgetContext } from "@/widgets/types";
import { AddServerDialog } from "./AddServerDialog";
import { GridDashboard } from "./GridDashboard";
import { layoutsEqual, type GridItem } from "./grid-utils";

function widgetsToLayout(widgets: Dashboard["widgets"]): GridItem[] {
  return widgets.map((widget) => ({
    i: widget.id,
    x: widget.grid_x,
    y: widget.grid_y,
    w: widget.grid_w,
    h: widget.grid_h,
    minW: 2,
    minH: 3,
    maxW: 12,
  }));
}

function layoutToWidgets(
  dashboard: Dashboard,
  layout: GridItem[],
): Dashboard["widgets"] {
  const byId = new Map(dashboard.widgets.map((widget) => [widget.id, widget]));

  return layout
    .map((item) => {
      const widget = byId.get(item.i);
      if (!widget) return null;
      return {
        ...widget,
        grid_x: item.x,
        grid_y: item.y,
        grid_w: item.w,
        grid_h: item.h,
      };
    })
    .filter((widget): widget is Dashboard["widgets"][number] => widget !== null);
}

export function DashboardView() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [layout, setLayout] = useState<GridItem[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [sessionWsUrl, setSessionWsUrl] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const dashboardRef = useRef<Dashboard | null>(null);
  const persistTimerRef = useRef<number | null>(null);
  const isEditingRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardResponse, serversResponse] = await Promise.all([
        api.getDashboard(),
        api.listServers(),
      ]);
      dashboardRef.current = dashboardResponse;
      setDashboard(dashboardResponse);
      setServers(serversResponse.servers);

      if (!isEditingRef.current) {
        setLayout(widgetsToLayout(dashboardResponse.widgets));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (persistTimerRef.current !== null) {
        window.clearTimeout(persistTimerRef.current);
      }
    };
  }, []);

  const widgetContext: WidgetContext = {
    selectedServerId,
    onSelectServer: setSelectedServerId,
    onConnectServer: async (serverId) => {
      setSelectedServerId(serverId);
      try {
        const session = await api.createSession(serverId);
        setSessionWsUrl(session.wsUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "创建会话失败");
      }
    },
  };

  const handleLayoutChange = useCallback((nextLayout: GridItem[]) => {
    isEditingRef.current = true;
    setLayout((current) =>
      layoutsEqual(current, nextLayout) ? current : nextLayout,
    );

    const dashboardSnapshot = dashboardRef.current;
    if (!dashboardSnapshot) return;

    if (persistTimerRef.current !== null) {
      window.clearTimeout(persistTimerRef.current);
    }

    persistTimerRef.current = window.setTimeout(() => {
      void (async () => {
        const widgets = layoutToWidgets(dashboardSnapshot, nextLayout);
        try {
          const updated = await api.updateDashboard({ widgets });
          dashboardRef.current = updated;
          setDashboard(updated);
        } catch (err) {
          setError(err instanceof Error ? err.message : "保存布局失败");
        } finally {
          isEditingRef.current = false;
        }
      })();
    }, 400);
  }, []);

  const handleDeleteServer = async (serverId: string) => {
    await api.deleteServer(serverId);
    if (selectedServerId === serverId) {
      setSelectedServerId(null);
      setSessionWsUrl(null);
    }
    await load();
  };

  if (loading && !dashboard) {
    return (
      <div className="workspace flex items-center justify-center text-sm text-[var(--color-muted-foreground)]">
        正在加载工作区...
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="workspace flex items-center justify-center text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (!dashboard || layout.length === 0) return null;

  const widgetById = new Map(dashboard.widgets.map((widget) => [widget.id, widget]));

  return (
    <div className="workspace">
      {error && (
        <div className="workspace-toast text-red-400">{error}</div>
      )}

      <GridDashboard
        layout={layout}
        onLayoutChange={handleLayoutChange}
        renderItem={(item) => {
          const widget = widgetById.get(item.i);
          if (!widget) return null;

          if (widget.type === "server_list") {
            return (
              <ServerListWidget
                servers={servers}
                loading={loading}
                context={widgetContext}
                onAddServer={() => setAddOpen(true)}
                onDeleteServer={(serverId) => void handleDeleteServer(serverId)}
              />
            );
          }

          if (widget.type === "terminal") {
            return (
              <TerminalWidget
                context={widgetContext}
                sessionWsUrl={sessionWsUrl}
              />
            );
          }

          return (
            <div className="flex h-full items-center justify-center rounded-xl border text-sm text-[var(--color-muted-foreground)]">
              {widget.type} 即将推出
            </div>
          );
        }}
      />

      <AddServerDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={async () => {
          setAddOpen(false);
          await load();
        }}
      />
    </div>
  );
}
