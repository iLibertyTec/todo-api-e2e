import {
  assertEquals,
  assertObjectMatch,
} from "@std/assert";
import { handler } from "./main.ts";
import { SERVICE_NAME, SERVICE_VERSION } from "./src/config/service.ts";

Deno.test("GET /health responde 200 com metadados do serviço", async (): Promise<void> => {
  const response = await handler(new Request("http://localhost/health"));

  assertEquals(response.status, 200);
  assertEquals(
    response.headers.get("content-type")?.includes("application/json"),
    true,
  );

  const body = await response.json();
  assertObjectMatch(body, {
    ok: true,
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
  });
});

Deno.test("GET /api/todos responde 200 com listagem", async (): Promise<void> => {
  const response = await handler(new Request("http://localhost/api/todos"));

  assertEquals(response.status, 200);
  assertEquals(
    response.headers.get("content-type")?.includes("application/json"),
    true,
  );

  const body = await response.json();
  assertEquals(Array.isArray(body.items), true);
  assertEquals(typeof body.total, "number");
});

Deno.test("GET /api/todos/ responde 404 para evitar dependência de trailing slash", async (): Promise<void> => {
  const response = await handler(new Request("http://localhost/api/todos/"));

  assertEquals(response.status, 404);
  assertEquals(
    response.headers.get("content-type")?.includes("application/json"),
    true,
  );
  assertEquals(await response.json(), { error: "not found" });
});

Deno.test("POST /api/todos responde 201 para payload válido", async (): Promise<void> => {
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
  assertEquals(
    response.headers.get("content-type")?.includes("application/json"),
    true,
  );

  const body = await response.json();
  assertEquals(body.title, "Comprar café");
});

Deno.test("rota desconhecida responde 404 com erro em JSON", async (): Promise<void> => {
  const response = await handler(new Request("http://localhost/nao-existe"));

  assertEquals(response.status, 404);
  assertEquals(
    response.headers.get("content-type")?.includes("application/json"),
    true,
  );
  assertEquals(await response.json(), { error: "not found" });
});
