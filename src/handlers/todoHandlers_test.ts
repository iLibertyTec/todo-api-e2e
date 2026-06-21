import { assertEquals, assertInstanceOf } from "@std/assert";
import {
  createTodoCollectionHandlers,
  methodNotAllowedJson,
} from "./todoHandlers.ts";
import { MemoryTodoStore } from "../todos/memoryTodoStore.ts";

Deno.test("handle returns 200 with todo list as json", async (): Promise<void> => {
  const store = new MemoryTodoStore();
  store.create({ title: "Primeira tarefa" });
  const handlers = createTodoCollectionHandlers(store);

  const response = await handlers.handle(
    new Request("http://localhost/api/todos", { method: "GET" }),
  );

  assertEquals(response.status, 200);
  assertEquals(response.headers.get("content-type"), "application/json");
  assertEquals(response.headers.get("cache-control"), "no-store");
  assertEquals(await response.json(), [
    {
      id: "1",
      title: "Primeira tarefa",
      completed: false,
      createdAt: store.getById("1")?.createdAt,
      updatedAt: store.getById("1")?.updatedAt,
    },
  ]);
});

Deno.test("handle returns 200 for HEAD without body", async (): Promise<void> => {
  const store = new MemoryTodoStore();
  store.create({ title: "Primeira tarefa" });
  const handlers = createTodoCollectionHandlers(store);

  const response = await handlers.handle(
    new Request("http://localhost/api/todos", { method: "HEAD" }),
  );

  assertEquals(response.status, 200);
  assertEquals(response.headers.get("content-type"), "application/json");
  assertEquals(response.headers.get("cache-control"), "no-store");
  assertEquals(await response.text(), "");
});

Deno.test("handle returns 201 with created todo", async (): Promise<void> => {
  const store = new MemoryTodoStore();
  const handlers = createTodoCollectionHandlers(store);
  const request = new Request("http://localhost/api/todos", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Nova tarefa" }),
  });

  const response = await handlers.handle(request);
  const body = await response.json();

  assertEquals(response.status, 201);
  assertEquals(response.headers.get("content-type"), "application/json");
  assertEquals(response.headers.get("cache-control"), "no-store");
  assertEquals(body.id, "1");
  assertEquals(body.title, "Nova tarefa");
  assertEquals(body.completed, false);
  assertInstanceOf(body.createdAt, String);
  assertInstanceOf(body.updatedAt, String);
});

Deno.test("handle returns 400 for invalid json", async (): Promise<void> => {
  const store = new MemoryTodoStore();
  const handlers = createTodoCollectionHandlers(store);
  const request = new Request("http://localhost/api/todos", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{",
  });

  const response = await handlers.handle(request);

  assertEquals(response.status, 400);
  assertEquals(response.headers.get("content-type"), "application/json");
  assertEquals(response.headers.get("cache-control"), "no-store");
  assertEquals(await response.json(), { error: "invalid json" });
});

Deno.test("handle returns 400 when title is missing", async (): Promise<void> => {
  const store = new MemoryTodoStore();
  const handlers = createTodoCollectionHandlers(store);
  const request = new Request("http://localhost/api/todos", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });

  const response = await handlers.handle(request);

  assertEquals(response.status, 400);
  assertEquals(response.headers.get("content-type"), "application/json");
  assertEquals(response.headers.get("cache-control"), "no-store");
  assertEquals(await response.json(), { error: "invalid payload" });
});

Deno.test("handle returns 400 when title is empty", async (): Promise<void> => {
  const store = new MemoryTodoStore();
  const handlers = createTodoCollectionHandlers(store);
  const request = new Request("http://localhost/api/todos", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "   " }),
  });

  const response = await handlers.handle(request);

  assertEquals(response.status, 400);
  assertEquals(response.headers.get("content-type"), "application/json");
  assertEquals(response.headers.get("cache-control"), "no-store");
  assertEquals(await response.json(), { error: "title must not be empty" });
});

Deno.test("methodNotAllowedJson returns 405 with Allow header", async (): Promise<void> => {
  const response = methodNotAllowedJson(["GET", "HEAD", "POST", "OPTIONS"]);

  assertEquals(response.status, 405);
  assertEquals(response.headers.get("Allow"), "GET, HEAD, POST, OPTIONS");
  assertEquals(response.headers.get("content-type"), "application/json");
  assertEquals(response.headers.get("cache-control"), "no-store");
  assertEquals(await response.json(), { error: "method not allowed" });
});

Deno.test("handle routes GET HEAD POST OPTIONS and 405 for todo collection", async (): Promise<void> => {
  const store = new MemoryTodoStore();
  const handlers = createTodoCollectionHandlers(store);

  const getResponse = await handlers.handle(
    new Request("http://localhost/api/todos", { method: "GET" }),
  );
  assertEquals(getResponse.status, 200);

  const headResponse = await handlers.handle(
    new Request("http://localhost/api/todos", { method: "HEAD" }),
  );
  assertEquals(headResponse.status, 200);
  assertEquals(await headResponse.text(), "");

  const postResponse = await handlers.handle(
    new Request("http://localhost/api/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Tarefa via handle" }),
    }),
  );
  assertEquals(postResponse.status, 201);

  const optionsResponse = await handlers.handle(
    new Request("http://localhost/api/todos", { method: "OPTIONS" }),
  );
  assertEquals(optionsResponse.status, 204);
  assertEquals(
    optionsResponse.headers.get("Allow"),
    "GET, HEAD, POST, OPTIONS",
  );
  assertEquals(
    optionsResponse.headers.get("access-control-allow-methods"),
    "GET, HEAD, POST, OPTIONS",
  );
  assertEquals(
    optionsResponse.headers.get("access-control-allow-headers"),
    "content-type",
  );
  assertEquals(await optionsResponse.text(), "");

  const methodNotAllowedResponse = await handlers.handle(
    new Request("http://localhost/api/todos", { method: "DELETE" }),
  );
  assertEquals(methodNotAllowedResponse.status, 405);
  assertEquals(
    methodNotAllowedResponse.headers.get("Allow"),
    "GET, HEAD, POST, OPTIONS",
  );
  assertEquals(await methodNotAllowedResponse.json(), {
    error: "method not allowed",
  });
});
