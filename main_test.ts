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

deno.test("POST /todos accepts application/json with parameters and case variations", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: {
        "content-type": "Application/Json; Charset=UTF-8",
      },
      body: JSON.stringify({ title: "Estudar Deno" }),
    }),
  );

  assertEquals(response.status, 201);

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    id: 2,
    title: "Estudar Deno",
    completed: false,
  });
});

deno.test("POST /todos accepts +json media types", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/problem+json" },
      body: JSON.stringify({ title: "Revisar API" }),
    }),
  );

  assertEquals(response.status, 201);

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    id: 3,
    title: "Revisar API",
    completed: false,
  });
});

deno.test("POST /todos rejects missing payload with standardized JSON 400", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "missing_payload",
    message: "Request body is required",
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
    error: "invalid_content_type",
    message: "Content-Type must be application/json",
  });
});

deno.test("POST /todos rejects invalid application/json substring media type", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "text/application/json" },
      body: JSON.stringify({ title: "Comprar leite" }),
    }),
  );

  assertEquals(response.status, 400);

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "invalid_content_type",
    message: "Content-Type must be application/json",
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

deno.test("POST /todos rejects missing title", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    }),
  );

  assertEquals(response.status, 400);

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "invalid_title",
    message: "Title is required",
  });
});

deno.test("POST /todos rejects empty title", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "" }),
    }),
  );

  assertEquals(response.status, 400);

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "invalid_title",
    message: "Title is required",
  });
});

deno.test("POST /todos rejects blank title", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "   " }),
    }),
  );

  assertEquals(response.status, 400);

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "invalid_title",
    message: "Title is required",
  });
});

deno.test("POST /todos rejects null title", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: null }),
    }),
  );

  assertEquals(response.status, 400);

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "invalid_title",
    message: "Title is required",
  });
});

deno.test("POST /todos rejects numeric title", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: 123 }),
    }),
  );

  assertEquals(response.status, 400);

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "invalid_title",
    message: "Title is required",
  });
});

deno.test("POST /todos rejects boolean title", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: true }),
    }),
  );

  assertEquals(response.status, 400);

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "invalid_title",
    message: "Title is required",
  });
});

deno.test("POST /todos rejects object title", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: { text: "Comprar leite" } }),
    }),
  );

  assertEquals(response.status, 400);

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "invalid_title",
    message: "Title is required",
  });
});

deno.test("POST /todos rejects array title", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: ["Comprar leite"] }),
    }),
  );

  assertEquals(response.status, 400);

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "invalid_title",
    message: "Title is required",
  });
});

deno.test("POST /todos rejects non-object JSON payload", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify([]),
    }),
  );

  assertEquals(response.status, 400);

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "invalid_title",
    message: "Title is required",
  });
});
