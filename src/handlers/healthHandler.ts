import { appInfo } from "../config/appInfo.ts";

export type HttpMethod = "GET" | "POST";

export interface HealthResponseBody {
  ok: true;
  service: string;
  version: string;
}

export interface MethodNotAllowedBody {
  error: "method not allowed";
  allowed: HttpMethod[];
}

export function healthHandler(): Response {
  const body: HealthResponseBody = {
    ok: true,
    service: appInfo.service,
    version: appInfo.version,
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

export function methodNotAllowed(allowed: HttpMethod[]): Response {
  const body: MethodNotAllowedBody = {
    error: "method not allowed",
    allowed,
  };

  return new Response(JSON.stringify(body), {
    status: 405,
    headers: {
      allow: allowed.join(", "),
      "content-type": "application/json; charset=utf-8",
    },
  });
}
