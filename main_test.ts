import {
  assert,
  assertEquals,
  assertMatch,
} from "@std/assert";
import { handler, resetTodos, seedTodo } from "./main.ts";

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
  resetTodos();

  const response = await handler(new Request("http://localhost/todos"));

  assertEquals(response.status, 200);
  assertEquals(await response.json(), []);
});

denoTest("GET /todos/:id returns 404 when todo does not exist", async (): Promise<void> => {
  resetTodos();

  const response = await handler(new Request("http://localhost/todos/missing"));

  assertEquals(response.status, 404);
  assert(
    response.headers.get("content-type")?.includes("application/json") ?? false,
  );
  assertEquals(await response.json(), { error: "not found" });
});

denoTest("GET /todos/:id returns todo when id exists", async (): Promise<void> => {
  resetTodos();
  const todo = seedTodo("Primeira tarefa");

  const response = await handler(
    new Request(`http://localhost/todos/${todo.id}`),
  );

  assertEquals(response.status, 200);
  assertEquals(await response.json(), todo);
});

denoTest("GET /todos/:id decodes url-encoded ids", async (): Promise<void> => {
  resetTodos();
  const todo = seedTodo("Tarefa com id codificado");

  const response = await handler(
    new Request(`http://localhost/todos/${encodeURIComponent(todo.id)}`),
  );

  assertEquals(response.status, 200);
  assertEquals(await response.json(), todo);
});

denoTest("GET /todos/:id does not match extra path segments", async (): Promise<void> => {
  resetTodos();
  const response = await handler(
    new Request("http://localhost/todos/abc/extra"),
  );

  assertEquals(response.status, 404);
  assertEquals(await response.json(), { error: "not found" });
});

denoTest("GET / returns html page", async (): Promise<void> => {
  const response = await handler(new Request("http://localhost/"));

  assertEquals(response.status, 200);
  assert(
    response.headers.get("content-type")?.includes("text/html") ?? false,
  );
});

denoTest("unknown route returns 404", async (): Promise<void> => {
  const response = await handler(new Request("http://localhost/missing"));

  assertEquals(response.status, 404);
  assertEquals(await response.json(), { error: "not found" });
});

function denoTest(
  name: string,
  fn: () => Promise<void> | void,
): void {
  Deno.test(name, fn);
}
