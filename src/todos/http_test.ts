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

Deno.test("CRUD /api/todos works end-to-end", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const createResponse = await handler(
    new Request("http://localhost/api/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Comprar leite" }),
    }),
  );

  assertEquals(createResponse.status, 201);
  const created = await createResponse.json();
  assertEquals(created.title, "Comprar leite");
  assertEquals(created.completed, false);
  assertEquals(created.id, "1");

  const listResponse = await handler(
    new Request("http://localhost/api/todos"),
  );
  assertEquals(listResponse.status, 200);
  const list = await listResponse.json();
  assertEquals(list.length, 1);

  const getResponse = await handler(
    new Request(`http://localhost/api/todos/${created.id}`),
  );
  assertEquals(getResponse.status, 200);
  const fetched = await getResponse.json();
  assertEquals(fetched.id, created.id);

  const updateResponse = await handler(
    new Request(`http://localhost/api/todos/${created.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ completed: true }),
    }),
  );
  assertEquals(updateResponse.status, 200);
  const updated = await updateResponse.json();
  assertEquals(updated.completed, true);

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

Deno.test("invalid payloads return 400", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const response = await handler(
    new Request("http://localhost/api/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "" }),
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
