import { assertEquals } from "@std/assert";
import { createTodoHandler } from "./http.ts";
import { InMemoryTodoStore } from "./store.ts";

Deno.test("GET /health returns healthy status", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const response = await handler(new Request("http://localhost/health"));

  assertEquals(response.status, 200);
  assertEquals(await response.json(), {
    ok: true,
    service: "ifactory-product",
    version: "0.1.0",
  });
});

Deno.test("GET / returns html landing page", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const response = await handler(new Request("http://localhost/"));

  assertEquals(response.status, 200);
  assertEquals(
    response.headers.get("content-type"),
    "text/html; charset=utf-8",
  );
});

Deno.test("POST /api/todos creates a todo", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const response = await handler(
    new Request("http://localhost/api/todos", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ title: "Write tests" }),
    }),
  );

  assertEquals(response.status, 201);

  const body = await response.json();
  assertEquals(body.title, "Write tests");
  assertEquals(body.completed, false);
  assertEquals(typeof body.id, "string");
});

Deno.test("POST /api/todos returns 400 for missing payload", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const response = await handler(
    new Request("http://localhost/api/todos", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(await response.json(), { error: "missing todo payload" });
});

Deno.test("POST /api/todos returns 415 for unsupported media type", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const response = await handler(
    new Request("http://localhost/api/todos", {
      method: "POST",
      headers: {
        "content-type": "text/plain",
      },
      body: "hello",
    }),
  );

  assertEquals(response.status, 415);
  assertEquals(await response.json(), { error: "unsupported media type" });
});

Deno.test("CRUD flow works for todos", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const createResponse = await handler(
    new Request("http://localhost/api/todos", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ title: "Initial todo" }),
    }),
  );
  const created = await createResponse.json();

  const listResponse = await handler(new Request("http://localhost/api/todos"));
  const listed = await listResponse.json();
  assertEquals(listResponse.status, 200);
  assertEquals(listed.length, 1);

  const getResponse = await handler(
    new Request(`http://localhost/api/todos/${created.id}`),
  );
  assertEquals(getResponse.status, 200);

  const patchResponse = await handler(
    new Request(`http://localhost/api/todos/${created.id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ completed: true }),
    }),
  );
  assertEquals(patchResponse.status, 200);
  assertEquals((await patchResponse.json()).completed, true);

  const putResponse = await handler(
    new Request(`http://localhost/api/todos/${created.id}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ title: "Replaced todo", completed: false }),
    }),
  );
  assertEquals(putResponse.status, 200);
  assertEquals((await putResponse.json()).title, "Replaced todo");

  const deleteResponse = await handler(
    new Request(`http://localhost/api/todos/${created.id}`, {
      method: "DELETE",
    }),
  );
  assertEquals(deleteResponse.status, 204);

  const missingResponse = await handler(
    new Request(`http://localhost/api/todos/${created.id}`),
  );
  assertEquals(missingResponse.status, 404);
  assertEquals(await missingResponse.json(), { error: "not found" });
});

Deno.test("PATCH /api/todos/:id returns 400 for invalid payload", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const createResponse = await handler(
    new Request("http://localhost/api/todos", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ title: "Todo" }),
    }),
  );
  const created = await createResponse.json();

  const response = await handler(
    new Request(`http://localhost/api/todos/${created.id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ title: "   " }),
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(await response.json(), { error: "invalid todo payload" });
});

Deno.test("legacy /api/visits is not implemented", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const response = await handler(new Request("http://localhost/api/visits"));

  assertEquals(response.status, 404);
  assertEquals(await response.json(), { error: "not found" });
});
