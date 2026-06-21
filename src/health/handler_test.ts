import { assertEquals } from "@std/assert";
import { healthHandler } from "./handler.ts";

type HealthResponseBody = {
  ok: boolean;
  service: string;
  version: string;
};

Deno.test("healthHandler retorna status 200 com contrato esperado", async () => {
  const response: Response = healthHandler();
  const body: HealthResponseBody = await response.json();

  assertEquals(response.status, 200);
  assertEquals(body, {
    ok: true,
    service: "ifactory-product",
    version: "0.1.0",
  });
});
