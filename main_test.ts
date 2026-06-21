import {
  assertEquals,
  assertStringIncludes,
} from "@std/assert";
import { handler } from "./main.ts";
import { TodoStore, type Todo } from "./src/todos.ts";

describe("handler", () => {
  Deno.test("GET /health returns service status", async () => {
    const response = await handler(new Request("http://localhost/health"));

    assertEquals(response.status, 200);
    assertEquals(await response.json(), {
      ok: true,
      service: "ifactory-product",
      version: "0.1.0",
    });
  });

  Deno.test("GET / returns HTML page", async () => {
    const response = await handler(new Request("http://localhost/"));
    const body = await response.text();

    assertEquals(response.status, 200);
    assertStringIncludes(
      response.headers.get("content-type") ?? "",
      "text/html",
    );
    assertStringIncludes(body, "Visit Analytics");
  });

  Deno.test("GET /api/visits returns current state", async () => {
    const response = await handler(new Request("http://localhost/api/visits"));
    const body = await response.json();

    assertEquals(response.status, 200);
    assertEquals(typeof body.visits, "number");
    assertEquals("lastVisitor" in body, true);
  });

  Deno.test("GET /todos returns empty list with isolated store", async () => {
    const todos = new TodoStore();
    const response = await handler(new Request("http://localhost/todos"), {
      todos,
    });

    assertEquals(response.status, 200);
    assertEquals(await response.json(), []);
  });

  Deno.test("GET /todos returns seeded todos with isolated store", async () => {
    const seededTodos: Todo[] = [
      { id: "1", title: "Primeira tarefa", completed: false },
      { id: "2", title: "Segunda tarefa", completed: true },
    ];
    const todos = new TodoStore(seededTodos);
    const response = await handler(new Request("http://localhost/todos"), {
      todos,
    });

    assertEquals(response.status, 200);
    assertEquals(await response.json(), seededTodos);
  });
});
