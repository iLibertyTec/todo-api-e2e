import {
  assert,
  assertEquals,
  assertMatch,
} from "@std/assert";
import { handler } from "./main.ts";

Deno.test("GET /todos returns empty array with fresh store", async () => {
  const response = await handler(new Request("http://localhost/todos"));

  assertEquals(response.status, 200);
  assertMatch(
    response.headers.get("content-type") ?? "",
    /application\/json/,
  );
  assertEquals(await response.json(), []);
});

Deno.test("POST /todos creates todo and GET /todos returns it", async () => {
  const createResponse = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "Nova tarefa" }),
    }),
  );

  assertEquals(createResponse.status, 201);
  assertMatch(
    createResponse.headers.get("content-type") ?? "",
    /application\/json/,
  );

  const createdTodo = await createResponse.json();
  assertEquals(createdTodo.title, "Nova tarefa");
  assertEquals(createdTodo.completed, false);
  assertEquals(typeof createdTodo.id, "string");
  assertEquals(typeof createdTodo.createdAt, "string");

  const listResponse = await handler(new Request("http://localhost/todos"));
  assertEquals(listResponse.status, 200);
  assertEquals(await listResponse.json(), [createdTodo]);
});

Deno.test("POST /todos validates required title", async () => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(await response.json(), { error: "title is required" });
});

Deno.test("POST /todos returns 400 for invalid json without mutating store", async () => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{",
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(await response.json(), { error: "invalid json" });

  const listResponse = await handler(new Request("http://localhost/todos"));
  assertEquals(listResponse.status, 200);
  assertEquals(await listResponse.json(), []);
});

Deno.test("POST /todos returns 400 when title is missing without mutating store", async () => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: false }),
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(await response.json(), { error: "title is required" });

  const listResponse = await handler(new Request("http://localhost/todos"));
  assertEquals(listResponse.status, 200);
  assertEquals(await listResponse.json(), []);
});

Deno.test("POST /todos returns 400 when title is blank", async () => {
  const response = await handler(
    new Request("http://localhost/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "   " }),
    }),
  );

  assertEquals(response.status, 400);
  assertEquals(await response.json(), { error: "title is required" });
});

Deno.test("GET /todos does not conflict with existing static routes", async () => {
  const todosResponse = await handler(new Request("http://localhost/todos"));
  assertEquals(todosResponse.status, 200);
  assertEquals(await todosResponse.json(), []);

  const healthResponse = await handler(new Request("http://localhost/health"));
  assertEquals(healthResponse.status, 200);
  assertEquals(await healthResponse.json(), {
    ok: true,
    service: "ifactory-product",
    version: "0.1.0",
  });

  const visitsResponse = await handler(
    new Request("http://localhost/api/visits"),
  );
  assertEquals(visitsResponse.status, 200);
  assertEquals(await visitsResponse.json(), {
    visits: 0,
    lastVisitor: null,
  });

  const rootResponse = await handler(new Request("http://localhost/"));
  assertEquals(rootResponse.status, 200);
  assert(
    (rootResponse.headers.get("content-type") ?? "").includes("text/html"),
  );
});

Deno.test("existing endpoints remain available", async () => {
  const healthResponse = await handler(new Request("http://localhost/health"));
  assertEquals(healthResponse.status, 200);

  const visitsResponse = await handler(
    new Request("http://localhost/api/visits"),
  );
  assertEquals(visitsResponse.status, 200);

  const rootResponse = await handler(new Request("http://localhost/"));
  assertEquals(rootResponse.status, 200);
  assert(
    (rootResponse.headers.get("content-type") ?? "").includes("text/html"),
  );
});
