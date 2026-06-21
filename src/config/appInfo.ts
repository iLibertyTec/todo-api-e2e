export const APP_SERVICE_NAME = "ifactory-product" as const;
export const APP_VERSION = "0.1.0" as const;

export interface AppInfo {
  service: typeof APP_SERVICE_NAME;
  version: typeof APP_VERSION;
}

export const appInfo: AppInfo = {
  service: APP_SERVICE_NAME,
  version: APP_VERSION,
};
