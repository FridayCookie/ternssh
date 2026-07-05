import type { Server } from "@/lib/api";

export interface WidgetContext {
  selectedServerId: string | null;
  onSelectServer: (serverId: string) => void;
  onConnectServer: (serverId: string) => void;
}

export interface WidgetProps {
  context: WidgetContext;
}

export interface ServerListWidgetProps extends WidgetProps {
  servers: Server[];
  loading: boolean;
  onAddServer: () => void;
  onDeleteServer: (serverId: string) => void;
}

export interface TerminalWidgetProps extends WidgetProps {
  sessionWsUrl: string | null;
}
