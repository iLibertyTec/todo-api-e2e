import { appInfo } from "../config/appInfo.ts";

export interface HealthResponseBody {
  ok: true;
  service: string;
  version: string;
}

export function healthHandler(): Response {
  const body: HealthResponseBody = {
    ok: true,
    service: appInfo.service,
    version: appInfo.version,
  };

  return Response.json(body);
}
