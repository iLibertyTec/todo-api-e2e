import {
  assert,
  assertEquals,
  assertInstanceOf,
} from "@std/assert";
import { handler } from "./main.ts";
import { listTodos } from "./src/todos.ts";

Deno.test("GET /todos returns 200 with a JSON array body", async () => {
  const response = await handler(new Request("http://localhost/todos"));

  assertEquals(response.status, 200);
  assert(
    response.headers.get("content-type")?.includes("application/json") ?? false,
  );

  const body: unknown = await response.json();
  assertInstanceOf(body, Array);
  assertEquals(body, listTodos());
});

Deno.test("GET /health continues working", async () => {
  const response = await handler(new Request("http://localhost/health"));

  assertEquals(response.status, 200);
});

Deno.test("GET /api/visits continues working", async () => {
  const response = await handler(new Request("http://localhost/api/visits"));

  assertEquals(response.status, 200);
});
