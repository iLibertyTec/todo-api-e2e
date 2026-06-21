import {
  assert,
  assertEquals,
  assertInstanceOf,
} from "@std/assert";
import { handler } from "./main.ts";
import { listTodos, resetTodos } from "./src/todos.ts";

Deno.test("GET /todos returns 200 with a JSON array body", async () => {
  resetTodos();

  const response = await handler(new Request("http://localhost/todos"));

  assertEquals(response.status, 200);
  assert(
    response.headers.get("content-type")?.includes("application/json") ??
      false,
  );

  const body: unknown = await response.json();
  assertInstanceOf(body, Array);
  assertEquals(body, listTodos());
});

Deno.test("POST /todos creates a todo and GET /todos includes it", async () => {
  resetTodos();
  const title = `Nova tarefa ${crypto.randomUUID()}`;

  const createResponse = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ title }),
    }),
  );

  assertEquals(createResponse.status, 201);
  assert(
    createResponse.headers.get("content-type")?.includes("application/json") ??
      false,
  );

  const createdTodo: unknown = await createResponse.json();
  assertEquals(typeof createdTodo, "object");
  assert(createdTodo !== null);

  const todoRecord = createdTodo as Record<string, unknown>;
  assertEquals(typeof todoRecord.id, "string");
  assertEquals(todoRecord.title, title);
  assertEquals(todoRecord.completed, false);
  assertEquals(typeof todoRecord.createdAt, "string");

  const listResponse = await handler(new Request("http://localhost/todos"));
  assertEquals(listResponse.status, 200);

  const todos: unknown = await listResponse.json();
  assertInstanceOf(todos, Array);
  assert(
    todos.some((todo: unknown) => {
      if (typeof todo !== "object" || todo === null) {
        return false;
      }

      const todoItem = todo as Record<string, unknown>;
      return todoItem.id === todoRecord.id && todoItem.title === title;
    }),
  );
});

Deno.test("POST /todos rejects non-json content-type with explicit error", async () => {
  resetTodos();

  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ title: "Teste" }),
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(await response.json(), {
    error: "content-type must be application/json",
  });
});

Deno.test("POST /todos rejects empty json body with explicit error", async () => {
  resetTodos();

  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(await response.json(), {
    error: "request body is required",
  });
});

Deno.test("POST /todos rejects title longer than supported limit", async () => {
  resetTodos();

  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "a".repeat(257) }),
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(await response.json(), {
    error: "title is too long",
  });
});

Deno.test("/todos returns 405 with Allow for unsupported methods", async () => {
  resetTodos();

  const response = await handler(
    new Request("http://localhost/todos", {
      method: "DELETE",
    }),
  );

  assertEquals(response.status, 405);
  assertEquals(response.headers.get("allow"), "GET, POST");
  assertEquals(await response.json(), {
    error: "method not allowed",
  });
});

Deno.test("GET /health continues working", async () => {
  const response = await handler(new Request("http://localhost/health"));

  assertEquals(response.status, 200);
});

Deno.test("GET /api/visits continues working", async () => {
  const response = await handler(new Request("http://localhost/api/visits"));

  assertEquals(response.status, 200);
});
