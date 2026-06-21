import {
  assertEquals,
  assertExists,
} from "@std/assert";
import { createTodoHandler } from "./http.ts";
import { InMemoryTodoStore } from "./store.ts";

Deno.test("GET /health returns healthy response", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const response = await handler(new Request("http://localhost/health"));

  assertEquals(response.status, 200);
  assertEquals(await response.json(), {
    ok: true,
    service: "ifactory-product",
    version: "0.1.0",
  });
});

Deno.test("GET / returns API metadata", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const response = await handler(new Request("http://localhost/"));

  assertEquals(response.status, 200);
  assertEquals(await response.json(), {
    ok: true,
    service: "ifactory-product",
    resources: {
      health: "/health",
      todos: "/api/todos",
    },
  });
});

Deno.test("POST /api/todos creates a todo", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const response = await handler(
    new Request("http://localhost/api/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Buy milk" }),
    }),
  );

  assertEquals(response.status, 201);

  const body = await response.json();
  assertEquals(body.title, "Buy milk");
  assertEquals(body.completed, false);
  assertExists(body.id);
  assertExists(body.createdAt);
  assertExists(body.updatedAt);
});

Deno.test("POST /api/todos accepts json without content-type header", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const response = await handler(
    new Request("http://localhost/api/todos", {
      method: "POST",
      body: JSON.stringify({ title: "Buy milk" }),
    }),
  );

  assertEquals(response.status, 201);
});

Deno.test("POST /api/todos rejects invalid media type", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const response = await handler(
    new Request("http://localhost/api/todos", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: JSON.stringify({ title: "Buy milk" }),
    }),
  );

  assertEquals(response.status, 415);
  assertEquals(await response.json(), { error: "unsupported media type" });
});

Deno.test("GET /api/todos lists todos", async () => {
  const store = new InMemoryTodoStore();
  store.create({ title: "Buy milk" });
  store.create({ title: "Walk dog" });
  const handler = createTodoHandler(store);

  const response = await handler(new Request("http://localhost/api/todos"));

  assertEquals(response.status, 200);
  const body = await response.json();
  assertEquals(body.length, 2);
});

Deno.test("GET /api/todos/:id returns a todo", async () => {
  const store = new InMemoryTodoStore();
  const todo = store.create({ title: "Buy milk" });
  const handler = createTodoHandler(store);

  const response = await handler(
    new Request(`http://localhost/api/todos/${todo.id}`),
  );

  assertEquals(response.status, 200);
  assertEquals((await response.json()).id, todo.id);
});

Deno.test("GET /api/todos/:id returns 404 for missing todo", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const response = await handler(
    new Request("http://localhost/api/todos/missing"),
  );

  assertEquals(response.status, 404);
  assertEquals(await response.json(), { error: "not found" });
});

Deno.test("PATCH /api/todos/:id updates a todo partially", async () => {
  const store = new InMemoryTodoStore();
  const todo = store.create({ title: "Buy milk" });
  const handler = createTodoHandler(store);

  const response = await handler(
    new Request(`http://localhost/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ completed: true }),
    }),
  );

  assertEquals(response.status, 200);
  const body = await response.json();
  assertEquals(body.id, todo.id);
  assertEquals(body.title, "Buy milk");
  assertEquals(body.completed, true);
});

Deno.test("PUT /api/todos/:id replaces a todo", async () => {
  const store = new InMemoryTodoStore();
  const todo = store.create({ title: "Buy milk" });
  const handler = createTodoHandler(store);

  const response = await handler(
    new Request(`http://localhost/api/todos/${todo.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Walk dog", completed: true }),
    }),
  );

  assertEquals(response.status, 200);
  const body = await response.json();
  assertEquals(body.id, todo.id);
  assertEquals(body.title, "Walk dog");
  assertEquals(body.completed, true);
});

Deno.test("PATCH /api/todos/:id rejects unknown fields", async () => {
  const store = new InMemoryTodoStore();
  const todo = store.create({ title: "Buy milk" });
  const handler = createTodoHandler(store);

  const response = await handler(
    new Request(`http://localhost/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ completed: true, extra: "invalid" }),
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(await response.json(), { error: "invalid todo payload" });
});

Deno.test("DELETE /api/todos/:id removes a todo", async () => {
  const store = new InMemoryTodoStore();
  const todo = store.create({ title: "Buy milk" });
  const handler = createTodoHandler(store);

  const response = await handler(
    new Request(`http://localhost/api/todos/${todo.id}`, {
      method: "DELETE",
    }),
  );

  assertEquals(response.status, 204);
  assertEquals(store.getById(todo.id), undefined);
});

Deno.test("legacy /api/visits is not implemented", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const response = await handler(new Request("http://localhost/api/visits"));

  assertEquals(response.status, 404);
  assertEquals(await response.json(), { error: "not found" });
});
