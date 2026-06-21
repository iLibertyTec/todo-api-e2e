import { assert } from "@std/assert";
import { SERVICE_NAME, SERVICE_VERSION } from "./service.ts";

Deno.test("service metadata exports non-empty strings", () => {
  assert(typeof SERVICE_NAME === "string");
  assert(SERVICE_NAME.length > 0);
  assert(typeof SERVICE_VERSION === "string");
  assert(SERVICE_VERSION.length > 0);
});
