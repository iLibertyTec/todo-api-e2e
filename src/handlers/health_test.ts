import { assertEquals } from "@std/assert";
import { createHealthPayload, handleHealth } from "./health.ts";

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
  const response = handleHealth({
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
