import {
  assert,
  assertEquals,
  assertMatch,
} from "@std/assert";
import { handler } from "./main.ts";

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
