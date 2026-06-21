import { assertEquals } from "@std/assert";
import { handler } from "../../main.ts";
import { SERVICE_NAME, SERVICE_VERSION, getServiceInfo } from "../config/service.ts";
import { createHealthPayload, handleHealth } from "./health.ts";

Deno.test("getServiceInfo returns service metadata from config", () => {
  assertEquals(getServiceInfo(), {
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
  });
});

Deno.test("service config invariants remain non-empty", () => {
  assertEquals(SERVICE_NAME.length > 0, true);
  assertEquals(SERVICE_VERSION.length > 0, true);
});

Deno.test("createHealthPayload builds the health contract from service info", () => {
  assertEquals(
    createHealthPayload({ service: "test-service", version: "1.2.3" }),
    {
      ok: true,
      service: "test-service",
      version: "1.2.3",
    },
  );
});

Deno.test("handleHealth returns status, content-type and payload", async () => {
  const request = new Request("http://localhost/health", { method: "GET" });
  const response = handleHealth(request, {
    service: "test-service",
    version: "1.2.3",
  });

  assertEquals(response.status, 200);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  assertEquals(await response.json(), {
    ok: true,
    service: "test-service",
    version: "1.2.3",
  });
});

Deno.test("main handler keeps /health compatible for non-GET methods", async () => {
  const response = await handler(
    new Request("http://localhost/health", { method: "HEAD" }),
  );

  assertEquals(response.status, 200);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
});
