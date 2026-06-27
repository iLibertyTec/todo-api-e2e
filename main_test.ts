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

deno.test("POST / creates standardized JSON 405 with Allow", async (): Promise<void> => {
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

deno.test("POST /todos creates a todo with id title and completed false", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Comprar leite" }),
    }),
  );

  assertEquals(response.status, 201);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    id: 1,
    title: "Comprar leite",
    completed: false,
  });
});

deno.test("POST /todos rejects missing payload with standardized JSON 400", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "invalid_payload",
    message: "Invalid JSON payload",
  });
});

deno.test("POST /todos rejects non-json content-type with standardized JSON 400", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: JSON.stringify({ title: "Comprar leite" }),
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "invalid_payload",
    message: "Invalid JSON payload",
  });
});

deno.test("POST /todos rejects invalid JSON with standardized JSON 400", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "invalid_payload",
    message: "Invalid JSON payload",
  });
});

deno.test("POST /todos rejects invalid title variants with standardized JSON 400", async (): Promise<void> => {
  const invalidBodies: JsonValue[] = [
    {},
    { title: "" },
    { title: "   " },
    { title: null },
    { title: 123 },
    { title: true },
    { title: {} },
    { title: [] },
    [],
    null,
  ];

  for (const invalidBody of invalidBodies) {
    const response = await handler(
      new Request("http://localhost/todos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(invalidBody),
      }),
    );

    assertEquals(response.status, 400);
    assertEquals(
      response.headers.get("content-type"),
      "application/json; charset=utf-8",
    );

    const body = await response.json() as JsonObject;
    assertEquals(body, {
      error: "invalid_title",
      message: "Title is required",
    });
  }
});

deno.test("POST /todos rejects title longer than maximum limit", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "a".repeat(201) }),
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "invalid_title",
    message: "Title is too long",
  });
});

deno.test("GET /todos returns standardized JSON 405 with Allow", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", { method: "GET" }),
  );

  assertEquals(response.status, 405);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  assertEquals(response.headers.get("allow"), "POST");

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "method_not_allowed",
    message: "Method not allowed",
  });
});
