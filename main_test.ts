import { assertEquals } from "@std/assert";
import { handler } from "./main.ts";

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
interface JsonObject {
  [key: string]: JsonValue;
}

deno.test("GET /health returns service metadata", async (): Promise<void> => {
  const response = await handler(new Request("http://localhost/health"));

  assertEquals(response.status, 200);
  assertEquals(await response.json(), {
    ok: true,
    service: "ifactory-product",
    version: "0.1.0",
  });
});

deno.test("POST /health returns standardized JSON 405 with Allow", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/health", { method: "POST" }),
  );

  assertEquals(response.status, 405);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  assertEquals(response.headers.get("allow"), "GET");

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "method_not_allowed",
    message: "Method not allowed",
  });
});

deno.test("DELETE /api/visits returns standardized JSON 405 with Allow", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/api/visits", { method: "DELETE" }),
  );

  assertEquals(response.status, 405);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  assertEquals(response.headers.get("allow"), "GET, POST");

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "method_not_allowed",
    message: "Method not allowed",
  });
});

deno.test("POST / returns standardized JSON 405 with Allow", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/", { method: "POST" }),
  );

  assertEquals(response.status, 405);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  assertEquals(response.headers.get("allow"), "GET");

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "method_not_allowed",
    message: "Method not allowed",
  });
});

deno.test("GET /missing returns standardized JSON 404", async (): Promise<void> => {
  const response = await handler(new Request("http://localhost/missing"));

  assertEquals(response.status, 404);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "not_found",
    message: "Route not found",
  });
});
