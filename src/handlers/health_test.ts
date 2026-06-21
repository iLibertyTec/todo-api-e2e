import { assertEquals } from "@std/assert";
import {
  createHealthPayload,
  createHealthResponse,
  getServiceInfo,
} from "./health.ts";
import { SERVICE_NAME, SERVICE_VERSION } from "../config/service.ts";

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

Deno.test("createHealthResponse returns status, content-type and payload", async () => {
  const response = createHealthResponse();

  assertEquals(response.status, 200);
  assertEquals(
    response.headers.get("content-type")?.includes("application/json"),
    true,
  );
  assertEquals(await response.json(), createHealthPayload(getServiceInfo()));
});
