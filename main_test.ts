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
