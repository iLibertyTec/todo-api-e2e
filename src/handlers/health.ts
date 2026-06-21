import {
  SERVICE_NAME,
  SERVICE_VERSION,
  type ServiceInfo,
} from "../config/service.ts";

export type HealthPayload = ServiceInfo & {
  ok: true;
};

export function getServiceInfo(): ServiceInfo {
  return {
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
  };
}

export function createHealthPayload(serviceInfo: ServiceInfo): HealthPayload {
  return {
    ok: true,
    service: serviceInfo.service,
    version: serviceInfo.version,
  };
}

export function createHealthResponse(): Response {
  return Response.json(createHealthPayload(getServiceInfo()));
}
