import {
  assertEquals,
  assertMatch,
  assertObjectMatch,
} from "@std/assert";
import { handler } from "../../main.ts";
import { handleCreateTodo, handleListTodos } from "./todos.ts";
import { MemoryTodoStore } from "../storage/memoryTodoStore.ts";

Deno.test("handleListTodos returns 200 with all todos", async () => {
  const store = new MemoryTodoStore();
  const request = new Request("http://localhost/api/todos", {
    method: "GET",
  });

  const response = handleListTodos(request, store);

  assertEquals(response.status, 200);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  assertEquals(await response.json(), { items: [] });
});

Deno.test("handleListTodos returns 405 when method is invalid", async () => {
  const store = new MemoryTodoStore();
  const request = new Request("http://localhost/api/todos", {
    method: "POST",
  });

  const response = handleListTodos(request, store);

  assertEquals(response.status, 405);
  assertEquals(response.headers.get("allow"), "GET");
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  assertEquals(await response.json(), {
    error: {
      code: "METHOD_NOT_ALLOWED",
      message: "method not allowed",
    },
  });
});

Deno.test("handleCreateTodo returns 201 when payload is valid", async () => {
  const store = new MemoryTodoStore();
  const request = new Request("http://localhost/api/todos", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ title: "Comprar leite" }),
  });

  const response = await handleCreateTodo(request, store);
  const body = await response.json();

  assertEquals(response.status, 201);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  assertObjectMatch(body, {
    title: "Comprar leite",
    completed: false,
  });
  assertMatch(body.createdAt, /^\d{4}-\d{2}-\d{2}T/);
  assertMatch(body.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
  assertEquals(store.list().length, 1);
});

Deno.test("handleCreateTodo accepts +json content-types", async () => {
  const store = new MemoryTodoStore();
  const request = new Request("http://localhost/api/todos", {
    method: "POST",
    headers: {
      "content-type": "application/vnd.api+json; charset=utf-8",
    },
    body: JSON.stringify({ title: "Comprar pão" }),
  });

  const response = await handleCreateTodo(request, store);

  assertEquals(response.status, 201);
  assertEquals(store.list().length, 1);
});

Deno.test("handleCreateTodo returns 400 when payload is invalid", async () => {
  const store = new MemoryTodoStore();
  const request = new Request("http://localhost/api/todos", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ title: "   " }),
  });

  const response = await handleCreateTodo(request, store);

  assertEquals(response.status, 400);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  assertEquals(await response.json(), {
    error: {
      code: "INVALID_PAYLOAD",
      message: "invalid payload",
    },
  });
  assertEquals(store.list(), []);
});

Deno.test("handleCreateTodo returns 400 when content-type is not json", async () => {
  const store = new MemoryTodoStore();
  const request = new Request("http://localhost/api/todos", {
    method: "POST",
    headers: {
      "content-type": "text/plain",
    },
    body: JSON.stringify({ title: "Comprar leite" }),
  });

  const response = await handleCreateTodo(request, store);

  assertEquals(response.status, 400);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  assertEquals(await response.json(), {
    error: {
      code: "INVALID_PAYLOAD",
      message: "invalid payload",
    },
  });
  assertEquals(store.list(), []);
});

Deno.test("handleCreateTodo returns 400 when json body is malformed", async () => {
  const store = new MemoryTodoStore();
  const request = new Request("http://localhost/api/todos", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: "{",
  });

  const response = await handleCreateTodo(request, store);

  assertEquals(response.status, 400);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  assertEquals(await response.json(), {
    error: {
      code: "INVALID_PAYLOAD",
      message: "invalid payload",
    },
  });
  assertEquals(store.list(), []);
});

Deno.test("handleCreateTodo returns 405 when method is invalid", async () => {
  const store = new MemoryTodoStore();
  const request = new Request("http://localhost/api/todos", {
    method: "GET",
  });

  const response = await handleCreateTodo(request, store);

  assertEquals(response.status, 405);
  assertEquals(response.headers.get("allow"), "POST");
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  assertEquals(await response.json(), {
    error: {
      code: "METHOD_NOT_ALLOWED",
      message: "method not allowed",
    },
  });
  assertEquals(store.list(), []);
});

Deno.test("handler exposes GET /api/todos", async () => {
  const response = await handler(
    new Request("http://localhost/api/todos", {
      method: "GET",
    }),
  );

  assertEquals(response.status, 200);
  assertEquals(await response.json(), { items: [] });
});

Deno.test("handler exposes POST /api/todos with shared in-memory store", async () => {
  const createResponse = await handler(
    new Request("http://localhost/api/todos", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ title: "Tarefa via HTTP" }),
    }),
  );

  assertEquals(createResponse.status, 201);

  const listResponse = await handler(
    new Request("http://localhost/api/todos", {
      method: "GET",
    }),
  );
  const listBody = await listResponse.json();

  assertEquals(listResponse.status, 200);
  assertEquals(Array.isArray(listBody.items), true);
  assertEquals(listBody.items.length >= 1, true);
  assertObjectMatch(listBody.items.at(-1), {
    title: "Tarefa via HTTP",
    completed: false,
  });
});
