import { assertEquals } from "@std/assert";
import { APP_SERVICE_NAME, APP_VERSION } from "../config/appInfo.ts";
import {
  healthHandler,
  type HealthResponseBody,
  methodNotAllowed,
  type MethodNotAllowedBody,
} from "./healthHandler.ts";

deno.test("healthHandler returns 200 with formalized contract", async (): Promise<void> => {
  const response = healthHandler();
  const body = await response.json() as HealthResponseBody;

  assertEquals(response.status, 200);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  assertEquals(body, {
    ok: true,
    service: APP_SERVICE_NAME,
    version: APP_VERSION,
  });
});

deno.test("methodNotAllowed returns 405 with allow header", async (): Promise<void> => {
  const response = methodNotAllowed(["GET"]);
  const body = await response.json() as MethodNotAllowedBody;

  assertEquals(response.status, 405);
  assertEquals(response.headers.get("allow"), "GET");
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  assertEquals(body, {
    error: "method not allowed",
    allowed: ["GET"],
  });
});
