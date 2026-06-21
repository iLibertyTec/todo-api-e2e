import {
  assert,
  assertEquals,
  assertMatch,
} from "@std/assert";
import { handler, resetTodos, seedTodo } from "./main.ts";

function denoTest(
  name: string,
  fn: () => void | Promise<void>,
): void {
  Deno.test(name, async (): Promise<void> => {
    resetTodos();
    await fn();
  });
}

denoTest("GET /health returns service metadata", async (): Promise<void> => {
  const response = await handler(new Request("http://localhost/health"));

  assertEquals(response.status, 200);
  assertEquals(await response.json(), {
    ok: true,
    service: "ifactory-product",
    version: "0.1.0",
  });
});

denoTest("GET /api/visits returns counter state", async (): Promise<void> => {
  const response = await handler(new Request("http://localhost/api/visits"));

  assertEquals(response.status, 200);
  assertEquals(await response.json(), {
    visits: 0,
    lastVisitor: null,
  });
});

denoTest("POST /api/visits records a visit", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/api/visits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitorId: "tester" }),
    }),
  );

  assertEquals(response.status, 200);

  const body = await response.json();
  assertEquals(body.visits, 1);
  assertEquals(body.lastVisitor, "tester");
  assertMatch(body.message, /tester/);
});

denoTest("GET /todos returns an empty array by default", async (): Promise<void> => {
  const response = await handler(new Request("http://localhost/todos"));

  assertEquals(response.status, 200);
  assertEquals(await response.json(), []);
});

denoTest("GET /todos/:id returns 404 when todo does not exist", async (): Promise<void> => {
  const response = await handler(new Request("http://localhost/todos/missing"));

  assertEquals(response.status, 404);
  assert(
    response.headers.get("content-type")?.includes("application/json") ??
      false,
  );
  assertEquals(await response.json(), { error: "not found" });
});

denoTest("GET /todos/:id returns todo when id exists", async (): Promise<void> => {
  const todo = seedTodo("Primeira tarefa");

  const response = await handler(
    new Request(`http://localhost/todos/${todo.id}`),
  );

  assertEquals(response.status, 200);
  assertEquals(await response.json(), todo);
});

denoTest("GET /todos/:id decodes url-encoded ids", async (): Promise<void> => {
  const todo = seedTodo("Tarefa com id codificado");

  const response = await handler(
    new Request(`http://localhost/todos/${encodeURIComponent(todo.id)}`),
  );

  assertEquals(response.status, 200);
  assertEquals(await response.json(), todo);
});

denoTest("GET /todos/:id does not match extra path segments", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos/abc/extra"),
  );

  assertEquals(response.status, 404);
  assertEquals(await response.json(), { error: "not found" });
});

denoTest("PATCH /todos/:id updates only title", async (): Promise<void> => {
  const todo = seedTodo("Título inicial");

  const response = await handler(
    new Request(`http://localhost/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Título atualizado" }),
    }),
  );

  assertEquals(response.status, 200);
  assertEquals(await response.json(), {
    id: todo.id,
    title: "Título atualizado",
    completed: false,
  });
});

denoTest("PATCH /todos/:id updates only completed", async (): Promise<void> => {
  const todo = seedTodo("Concluir tarefa");

  const response = await handler(
    new Request(`http://localhost/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ completed: true }),
    }),
  );

  assertEquals(response.status, 200);
  assertEquals(await response.json(), {
    id: todo.id,
    title: "Concluir tarefa",
    completed: true,
  });
});

denoTest("PATCH /todos/:id updates title and completed", async (): Promise<void> => {
  const todo = seedTodo("Original");

  const response = await handler(
    new Request(`http://localhost/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Atualizada",
        completed: true,
      }),
    }),
  );

  assertEquals(response.status, 200);
  assertEquals(await response.json(), {
    id: todo.id,
    title: "Atualizada",
    completed: true,
  });
});

denoTest("PATCH /todos/:id keeps id immutable even with extra id in payload", async (): Promise<void> => {
  const todo = seedTodo("Imutável");

  const response = await handler(
    new Request(`http://localhost/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: "outro-id",
        title: "Novo título",
      }),
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(await response.json(), { error: "invalid payload" });
});

denoTest("PATCH /todos/:id returns 404 when todo does not exist", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/todos/inexistente", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Novo título" }),
    }),
  );

  assertEquals(response.status, 404);
  assertEquals(await response.json(), { error: "not found" });
});

denoTest("PATCH /todos/:id returns 400 for malformed json", async (): Promise<void> => {
  const todo = seedTodo("Teste json");

  const response = await handler(
    new Request(`http://localhost/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: "{",
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(await response.json(), { error: "invalid json" });
});

denoTest("PATCH /todos/:id returns 400 for invalid payload", async (): Promise<void> => {
  const todo = seedTodo("Teste payload");

  const response = await handler(
    new Request(`http://localhost/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ completed: "sim" }),
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(await response.json(), { error: "invalid payload" });
});

denoTest("PATCH /todos/:id returns 400 for empty payload", async (): Promise<void> => {
  const todo = seedTodo("Teste vazio");

  const response = await handler(
    new Request(`http://localhost/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(await response.json(), { error: "invalid payload" });
});

denoTest("PATCH /todos/:id returns 400 for empty title", async (): Promise<void> => {
  const todo = seedTodo("Teste título");

  const response = await handler(
    new Request(`http://localhost/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "   " }),
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(await response.json(), { error: "invalid payload" });
});
