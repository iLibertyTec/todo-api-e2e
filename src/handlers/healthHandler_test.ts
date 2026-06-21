import {
  assertEquals,
  assertMatch,
} from "@std/assert";
import { healthHandler } from "./healthHandler.ts";

deno.test("healthHandler returns 200 with minimum contract", async (): Promise<void> => {
  const response = healthHandler();
  const body = await response.json() as {
    ok: boolean;
    service: string;
    version: string;
  };

  assertEquals(response.status, 200);
  assertEquals(body.ok, true);
  assertEquals(body.service, "Todo API");
  assertMatch(body.version, /\S+/);
});
