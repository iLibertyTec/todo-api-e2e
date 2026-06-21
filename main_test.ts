import {
  assertEquals,
  assertObjectMatch,
} from "@std/assert";
import { handler } from "./main.ts";

deno.test("GET /health responde 200 com metadados do serviço", async (): Promise<void> => {
  const response = await handler(new Request("http://localhost/health"));

  assertEquals(response.status, 200);
  assertEquals(response.headers.get("content-type"), "application/json");

  const body = await response.json();
  assertObjectMatch(body, {
    ok: true,
    service: "todo-api-e2e",
    version: "0.1.0",
  });
});

deno.test("GET /api/todos responde 200 com listagem", async (): Promise<void> => {
  const response = await handler(new Request("http://localhost/api/todos"));

  assertEquals(response.status, 200);
  assertEquals(response.headers.get("content-type"), "application/json");

  const body = await response.json();
  assertEquals(Array.isArray(body.items), true);
  assertEquals(typeof body.total, "number");
});

deno.test("POST /api/todos responde 201 para payload válido", async (): Promise<void> => {
  const response = await handler(
    new Request("http://localhost/api/todos", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title: "Comprar café",
      }),
    }),
  );

  assertEquals(response.status, 201);
  assertEquals(response.headers.get("content-type"), "application/json");

  const body = await response.json();
  assertEquals(body.title, "Comprar café");
});

deno.test("rota desconhecida responde 404 com erro em JSON", async (): Promise<void> => {
  const response = await handler(new Request("http://localhost/nao-existe"));

  assertEquals(response.status, 404);
  assertEquals(response.headers.get("content-type"), "application/json");
  assertEquals(await response.json(), { error: "not found" });
});
