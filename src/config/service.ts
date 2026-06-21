export type ServiceInfo = {
  service: string;
  version: string;
};

export const SERVICE_NAME: string = "todo-api-e2e";
export const SERVICE_VERSION: string = "0.1.0";

export function getServiceInfo(): ServiceInfo {
  return {
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
  };
}
