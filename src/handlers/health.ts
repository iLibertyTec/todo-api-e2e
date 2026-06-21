import { getServiceInfo, type ServiceInfo } from "../config/service.ts";

export type HealthPayload = ServiceInfo & {
  ok: true;
};

export function createHealthPayload(serviceInfo: ServiceInfo): HealthPayload {
  return {
    ok: true,
    service: serviceInfo.service,
    version: serviceInfo.version,
  };
}

export function handleHealth(
  serviceInfo: ServiceInfo = getServiceInfo(),
): Response {
  return Response.json(createHealthPayload(serviceInfo), {
    status: 200,
  });
}
