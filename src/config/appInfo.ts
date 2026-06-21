export interface AppInfo {
  service: string;
  version: string;
}

const DEFAULT_SERVICE = "ifactory-product";
const DEFAULT_VERSION = "0.1.0";

export const appInfo: AppInfo = {
  service: Deno.env.get("SERVICE_NAME") ?? DEFAULT_SERVICE,
  version: Deno.env.get("APP_VERSION") ?? DEFAULT_VERSION,
};
