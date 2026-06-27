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

deno.test("POST /todos trims title before creating the todo", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "  Estudar Deno  " }),
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

deno.test("POST /todos accepts application/json with parameters and case variations", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: {
        "content-type": "Application/Json; Charset=UTF-8",
      },
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

deno.test("POST /todos accepts +json media types", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/problem+json" },
      body: JSON.stringify({ title: "Planejar sprint" }),
    }),
  );

  assertEquals(response.status, 201);

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    id: 4,
    title: "Planejar sprint",
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

deno.test("POST /todos rejects whitespace-only payload with standardized JSON 400", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "   \n\t  ",
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

deno.test("POST /todos rejects invalid json payload with standardized JSON 400", async (): Promise<void> => {
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

deno.test("POST /todos rejects title absent with standardized JSON 400", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
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
});

deno.test("POST /todos rejects title as empty string", async (): Promise<void> => {
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

deno.test("POST /todos rejects title with only spaces", async (): Promise<void> => {
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

deno.test("POST /todos rejects title with 200 spaces", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: " ".repeat(200) }),
    }),
  );

  assertEquals(response.status, 400);

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "invalid_title",
    message: "Title is required",
  });
});

deno.test("POST /todos rejects title null", async (): Promise<void> => {
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

deno.test("POST /todos rejects title number", async (): Promise<void> => {
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

deno.test("POST /todos rejects title boolean", async (): Promise<void> => {
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

deno.test("POST /todos rejects title object", async (): Promise<void> => {
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

deno.test("POST /todos rejects title array", async (): Promise<void> => {
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

deno.test("POST /todos rejects non-object payload", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(["Comprar leite"]),
    }),
  );

  assertEquals(response.status, 400);

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "invalid_title",
    message: "Title is required",
  });
});

deno.test("POST /todos rejects title longer than 200 unicode code points", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "á".repeat(201) }),
    }),
  );

  assertEquals(response.status, 400);

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "invalid_title",
    message: "Title is too long",
  });
});

deno.test("POST /todos accepts title with 200 unicode code points even when utf-16 length is greater", async (): Promise<void> => {
  const title = "e\u0301".repeat(200);
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title }),
    }),
  );

  assertEquals(response.status, 201);

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    id: 5,
    title,
    completed: false,
  });
});

deno.test("POST /todos rejects payload too large from content-length", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": `${1024 * 1024 + 1}`,
      },
      body: JSON.stringify({ title: "Comprar leite" }),
    }),
  );

  assertEquals(response.status, 413);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );

  const body = await response.json() as JsonObject;
  assertEquals(body, {
    error: "payload_too_large",
    message: "Payload too large",
  });
});
