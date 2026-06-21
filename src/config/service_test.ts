import { assertEquals } from "@std/assert";
import {
  getServiceInfo,
  SERVICE_NAME,
  SERVICE_VERSION,
} from "./service.ts";

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
