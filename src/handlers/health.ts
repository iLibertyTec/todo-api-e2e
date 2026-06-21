import {
  SERVICE_NAME,
  SERVICE_VERSION,
  type ServiceInfo,
} from "../config/service.ts";

export function getServiceInfo(): ServiceInfo {
  return {
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
  };
}

export function createHealthResponse(): Response {
  const serviceInfo = getServiceInfo();

  return Response.json({
    ok: true,
    service: serviceInfo.service,
    version: serviceInfo.version,
  });
}
