import { assertEquals } from "@std/assert";
import { createHealthResponse } from "./health.ts";
import { SERVICE_NAME, SERVICE_VERSION } from "../config/service.ts";

Deno.test("createHealthResponse returns status, content-type and payload", async () => {
  const response = createHealthResponse();

  assertEquals(response.status, 200);
  assertEquals(response.headers.get("content-type"), "application/json");
  assertEquals(await response.json(), {
    ok: true,
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
  });
});
