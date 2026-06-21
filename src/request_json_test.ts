import { assertEquals } from "@std/assert";
import { readJsonObject } from "./request_json.ts";

Deno.test("readJsonObject returns object for valid json object payload", async () => {
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

Deno.test("readJsonObject accepts application/json with charset", async () => {
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ visitorId: "abc" }),
  });

  const result = await readJsonObject(req);

  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, { visitorId: "abc" });
  }
});

Deno.test("readJsonObject accepts application/*+json content types", async () => {
  const payloads = [
    "application/ld+json",
    "application/problem+json",
  ];

  for (const contentType of payloads) {
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      headers: {
        "content-type": contentType,
      },
      body: JSON.stringify({ visitorId: "abc" }),
    });

    const result = await readJsonObject(req);

    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value, { visitorId: "abc" });
    }
  }
});

Deno.test("readJsonObject rejects missing payload", async () => {
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

Deno.test("readJsonObject rejects whitespace-only payload as invalid json", async () => {
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: "   \n\t  ",
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

Deno.test("readJsonObject rejects invalid json", async () => {
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

Deno.test("readJsonObject rejects non-object json values", async () => {
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

Deno.test("readJsonObject rejects unsupported content type", async () => {
  const payloads = [
    "text/plain",
    "text/json",
    "application/jsonp",
  ];

  for (const contentType of payloads) {
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      headers: {
        "content-type": contentType,
      },
      body: JSON.stringify({ visitorId: "abc" }),
    });

    const result = await readJsonObject(req);

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.response.status, 400);
      assertEquals(await result.response.json(), {
        error: "invalid_content_type",
        message: "Request body must be JSON",
      });
    }
  }
});

Deno.test("readJsonObject rejects oversized payload", async () => {
  const largeValue = "a".repeat((1024 * 1024) + 1);
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ data: largeValue }),
  });

  const result = await readJsonObject(req);

  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.response.status, 400);
    assertEquals(await result.response.json(), {
      error: "invalid_payload",
      message: "Request body is too large",
    });
  }
});

Deno.test("readJsonObject accepts nested strict json objects", async () => {
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      visitor: {
        id: "abc",
        tags: ["new", "web"],
        active: true,
      },
    }),
  });

  const result = await readJsonObject(req);

  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, {
      visitor: {
        id: "abc",
        tags: ["new", "web"],
        active: true,
      },
    });
  }
});
