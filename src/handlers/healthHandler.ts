import { appInfo } from "../config/appInfo.ts";

export interface HealthResponseBody {
  ok: true;
  service: typeof appInfo.service;
  version: typeof appInfo.version;
}

export interface MethodNotAllowedBody {
  error: "method not allowed";
  allowed: string[];
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

export function methodNotAllowed(allowed: string[]): Response {
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
