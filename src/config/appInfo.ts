export const APP_SERVICE_NAME = "Todo API";
export const APP_VERSION = "0.1.0";

export interface AppInfo {
  service: string;
  version: string;
}

export const appInfo: AppInfo = {
  service: APP_SERVICE_NAME,
  version: APP_VERSION,
};
