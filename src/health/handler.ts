import { APP_INFO } from "../app_info.ts";

export function healthHandler(): Response {
  return Response.json({
    ok: true,
    service: APP_INFO.service,
    version: APP_INFO.version,
  });
}
