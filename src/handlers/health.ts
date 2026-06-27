import { SERVICE_NAME, SERVICE_VERSION } from "../config/service.ts";

export function handleHealth(): Response {
  return Response.json({
    ok: true,
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
  });
}
