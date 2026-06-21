import { assertEquals } from "@std/assert";
import { SERVICE_NAME, SERVICE_VERSION, getServiceInfo } from "../config/service.ts";
import { createHealthPayload, handleHealth } from "./health.ts";

Deno.test("getServiceInfo returns service metadata from config", () => {
  assertEquals(getServiceInfo(), {
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
  });
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
  const response = handleHealth(request);

  assertEquals(response.status, 200);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  assertEquals(await response.json(), {
    ok: true,
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
  });
});
