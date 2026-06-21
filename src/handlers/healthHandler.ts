import { appInfo } from "../config/appInfo.ts";

export interface HealthResponseBody {
  ok: true;
  service: string;
  version: string;
}

export function healthHandler(method: string = "GET"): Response {
  const body: HealthResponseBody = {
    ok: true,
    service: appInfo.service,
    version: appInfo.version,
  };

  if (method === "HEAD") {
    return new Response(null, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });
  }

  return Response.json(body);
}
