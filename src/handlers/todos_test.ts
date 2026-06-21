import {
  assertEquals,
  assertObjectMatch,
} from "@std/assert";
import { handleCreateTodo, handleListTodos } from "./todos.ts";
import { MemoryTodoStore } from "../storage/memoryTodoStore.ts";

Deno.test("handleListTodos returns 200 with all todos", async () => {
  const store = new MemoryTodoStore();

  const response = handleListTodos(store);

  assertEquals(response.status, 200);
  assertEquals(await response.json(), { items: [] });
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
  assertObjectMatch(body, {
    title: "Comprar leite",
    completed: false,
  });
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
  assertEquals(await response.json(), {
    error: {
      code: "INVALID_PAYLOAD",
      message: "invalid payload",
    },
  });
  assertEquals(store.list(), []);
});
