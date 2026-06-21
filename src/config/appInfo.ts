export const APP_SERVICE_NAME = "ifactory-product";
export const APP_DISPLAY_NAME = "Todo API";
export const APP_VERSION = "0.1.0";

export interface AppInfo {
  service: string;
  displayName: string;
  version: string;
}

export const appInfo: AppInfo = {
  service: APP_SERVICE_NAME,
  displayName: APP_DISPLAY_NAME,
  version: APP_VERSION,
};
