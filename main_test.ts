import { assertEquals } from "@std/assert";
import { handler } from "./main.ts";
import { APP_SERVICE_NAME, APP_VERSION } from "./src/config/appInfo.ts";
import type {
  HealthResponseBody,
  MethodNotAllowedBody,
} from "./src/handlers/healthHandler.ts";

deno.test("handler delegates GET /health to healthHandler", async (): Promise<void> => {
  const request = new Request("http://localhost/health", { method: "GET" });
  const response = await handler(request);
  const body = await response.json() as HealthResponseBody;

  assertEquals(response.status, 200);
  assertEquals(body, {
    ok: true,
    service: APP_SERVICE_NAME,
    version: APP_VERSION,
  });
});

deno.test("handler returns 405 for POST /health", async (): Promise<void> => {
  const request = new Request("http://localhost/health", { method: "POST" });
  const response = await handler(request);
  const body = await response.json() as MethodNotAllowedBody;

  assertEquals(response.status, 405);
  assertEquals(response.headers.get("allow"), "GET");
  assertEquals(body, {
    error: "method not allowed",
    allowed: ["GET"],
  });
});

deno.test("handler returns 405 for HEAD /health", async (): Promise<void> => {
  const request = new Request("http://localhost/health", { method: "HEAD" });
  const response = await handler(request);
  const body = await response.json() as MethodNotAllowedBody;

  assertEquals(response.status, 405);
  assertEquals(response.headers.get("allow"), "GET");
  assertEquals(body, {
    error: "method not allowed",
    allowed: ["GET"],
  });
});
