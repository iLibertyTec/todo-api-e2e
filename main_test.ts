import {
  assert,
  assertEquals,
  assertInstanceOf,
} from "@std/assert";
import { handler } from "./main.ts";
import { listTodos } from "./src/todos.ts";

Deno.test("GET /todos returns 200 with a JSON array body", async () => {
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
    persistence: "in-memory",
  });
});

Deno.test("POST /todos rejects invalid json body with explicit error", async () => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(await response.json(), {
    error: "invalid json body",
    persistence: "in-memory",
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
