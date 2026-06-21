import { assertEquals } from "@std/assert";
import { readJsonObject } from "./request_json.ts";

deno.test("readJsonObject returns object for valid json object payload", async () => {
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ visitorId: "abc", count: 1 }),
  });

  const result = await readJsonObject(req);

  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, { visitorId: "abc", count: 1 });
  }
});

deno.test("readJsonObject rejects missing payload", async () => {
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: "",
  });

  const result = await readJsonObject(req);

  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.response.status, 400);
    assertEquals(await result.response.json(), {
      error: "invalid_payload",
      message: "Request body is required",
    });
  }
});

deno.test("readJsonObject rejects invalid json", async () => {
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: "{",
  });

  const result = await readJsonObject(req);

  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.response.status, 400);
    assertEquals(await result.response.json(), {
      error: "invalid_payload",
      message: "Request body must be valid JSON",
    });
  }
});

deno.test("readJsonObject rejects non-object json values", async () => {
  const payloads = [
    '"text"',
    "123",
    "true",
    "null",
    "[]",
  ];

  for (const body of payloads) {
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body,
    });

    const result = await readJsonObject(req);

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.response.status, 400);
      assertEquals(await result.response.json(), {
        error: "invalid_payload",
        message: "Request body must be a JSON object",
      });
    }
  }
});

deno.test("readJsonObject rejects unsupported content type", async () => {
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: {
      "content-type": "text/plain",
    },
    body: JSON.stringify({ visitorId: "abc" }),
  });

  const result = await readJsonObject(req);

  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.response.status, 400);
    assertEquals(await result.response.json(), {
      error: "invalid_content_type",
      message: "Request body must be application/json",
    });
  }
});
