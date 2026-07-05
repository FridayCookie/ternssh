export interface User {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServerRecord {
  id: string;
  user_id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  auth_type: "password" | "private_key";
  credential_ref: string;
  created_at: string;
  updated_at: string;
}

export interface ServerPublic {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  auth_type: "password" | "private_key";
  created_at: string;
  updated_at: string;
}

export interface DashboardRecord {
  id: string;
  user_id: string;
  name: string;
  is_default: number;
  layout_json: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardWidgetRecord {
  id: string;
  dashboard_id: string;
  type: string;
  config_json: string | null;
  grid_x: number;
  grid_y: number;
  grid_w: number;
  grid_h: number;
}

export type Variables = {
  user: User;
};
