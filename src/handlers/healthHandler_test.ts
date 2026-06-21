import {
  assertEquals,
  assertMatch,
} from "@std/assert";
import {
  healthHandler,
  methodNotAllowed,
} from "./healthHandler.ts";

type HealthContractBody = {
  ok: boolean;
  service: string;
  version: string;
};

deno.test("healthHandler returns 200 with expected JSON contract for GET", async () => {
  const response = healthHandler("GET");

  assertEquals(response.status, 200);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );

  const body = await response.json() as HealthContractBody;

  assertEquals(body.ok, true);
  assertEquals(body.service, "ifactory-product");
  assertMatch(body.version, /\S/);
});

deno.test("healthHandler returns 200 without body for HEAD", async () => {
  const response = healthHandler("HEAD");

  assertEquals(response.status, 200);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  assertEquals(await response.text(), "");
});

deno.test("methodNotAllowed returns 405 with allow header", async () => {
  const response = methodNotAllowed(["GET", "HEAD"]);

  assertEquals(response.status, 405);
  assertEquals(response.headers.get("allow"), "GET, HEAD");
  assertEquals(await response.json(), {
    error: "method not allowed",
    allowed: ["GET", "HEAD"],
  });
});
