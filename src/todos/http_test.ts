import {
  assertEquals,
  assertInstanceOf,
  assertNotEquals,
} from "@std/assert";
import { createTodoHandler } from "./http.ts";
import { InMemoryTodoStore } from "./store.ts";

Deno.test("GET /health returns service status", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const res = await handler(new Request("http://localhost/health"));

  assertEquals(res.status, 200);
  assertEquals(await res.json(), {
    ok: true,
    service: "ifactory-product",
    version: "0.1.0",
  });
});

Deno.test("known routes return 405 for unsupported methods", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const rootRes = await handler(
    new Request("http://localhost/", { method: "POST" }),
  );
  const healthRes = await handler(
    new Request("http://localhost/health", { method: "POST" }),
  );

  assertEquals(rootRes.status, 405);
  assertEquals(await rootRes.json(), { error: "method not allowed" });
  assertEquals(healthRes.status, 405);
  assertEquals(await healthRes.json(), { error: "method not allowed" });
});

Deno.test("GET / returns 404", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const res = await handler(new Request("http://localhost/"));

  assertEquals(res.status, 404);
  assertEquals(await res.text(), "Not Found");
});

Deno.test("CRUD /api/todos works end-to-end", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const createRes = await handler(
    new Request("http://localhost/api/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Buy milk" }),
    }),
  );

  assertEquals(createRes.status, 201);
  const created = await createRes.json();
  assertEquals(created.title, "Buy milk");
  assertEquals(created.completed, false);
  assertInstanceOf(new Date(created.createdAt), Date);
  assertInstanceOf(new Date(created.updatedAt), Date);

  const listRes = await handler(new Request("http://localhost/api/todos"));
  assertEquals(listRes.status, 200);
  const list = await listRes.json();
  assertEquals(list.length, 1);
  assertEquals(list[0].id, created.id);

  const getRes = await handler(
    new Request(`http://localhost/api/todos/${created.id}`),
  );
  assertEquals(getRes.status, 200);
  const fetched = await getRes.json();
  assertEquals(fetched.id, created.id);

  const patchRes = await handler(
    new Request(`http://localhost/api/todos/${created.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ completed: true }),
    }),
  );
  assertEquals(patchRes.status, 200);
  const patched = await patchRes.json();
  assertEquals(patched.completed, true);

  const putRes = await handler(
    new Request(`http://localhost/api/todos/${created.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Buy bread", completed: false }),
    }),
  );
  assertEquals(putRes.status, 200);
  const replaced = await putRes.json();
  assertEquals(replaced.title, "Buy bread");
  assertEquals(replaced.completed, false);
  assertNotEquals(replaced.updatedAt, created.updatedAt);

  const deleteRes = await handler(
    new Request(`http://localhost/api/todos/${created.id}`, {
      method: "DELETE",
    }),
  );
  assertEquals(deleteRes.status, 204);

  const getMissingRes = await handler(
    new Request(`http://localhost/api/todos/${created.id}`),
  );
  assertEquals(getMissingRes.status, 404);
  assertEquals(await getMissingRes.json(), { error: "not found" });
});

Deno.test("invalid payloads return 400", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const emptyBodyRes = await handler(
    new Request("http://localhost/api/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
    }),
  );

  assertEquals(emptyBodyRes.status, 400);
  assertEquals(await emptyBodyRes.json(), { error: "invalid todo payload" });

  const invalidShapeRes = await handler(
    new Request("http://localhost/api/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "" }),
    }),
  );

  assertEquals(invalidShapeRes.status, 400);
  assertEquals(await invalidShapeRes.json(), {
    error: "invalid todo payload",
  });
});

Deno.test("unsupported media type returns 415", async () => {
  const handler = createTodoHandler(new InMemoryTodoStore());

  const res = await handler(
    new Request("http://localhost/api/todos", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "hello",
    }),
  );

  assertEquals(res.status, 415);
  assertEquals(await res.json(), { error: "unsupported media type" });
});

Deno.test("store does not expose internal todo references", () => {
  const store = new InMemoryTodoStore();
  const created = store.create({ title: "Test" });

  created.title = "Changed outside";
  created.createdAt.setFullYear(2000);

  const fetched = store.getById(created.id);

  assertEquals(fetched?.title, "Test");
  assertNotEquals(fetched?.createdAt.getFullYear(), 2000);
});
