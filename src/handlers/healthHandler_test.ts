import { assertEquals } from "@std/assert";
import { handler } from "../../main.ts";
import { appInfo } from "../config/appInfo.ts";
import { healthHandler } from "./healthHandler.ts";

deno.test("healthHandler returns 200 with minimum contract", async (): Promise<void> => {
  const response = healthHandler();
  const body = await response.json() as {
    ok: boolean;
    service: string;
    version: string;
  };

  assertEquals(response.status, 200);
  assertEquals(body.ok, true);
  assertEquals(body.service, appInfo.service);
  assertEquals(body.version, appInfo.version);
});

deno.test("handler routes GET /health with expected contract", async (): Promise<void> => {
  const request = new Request("http://localhost/health", { method: "GET" });
  const response = await handler(request);
  const body = await response.json() as {
    ok: boolean;
    service: string;
    version: string;
  };

  assertEquals(response.status, 200);
  assertEquals(body, {
    ok: true,
    service: appInfo.service,
    version: appInfo.version,
  });
});

deno.test("handler routes POST /health with expected contract", async (): Promise<void> => {
  const request = new Request("http://localhost/health", { method: "POST" });
  const response = await handler(request);
  const body = await response.json() as {
    ok: boolean;
    service: string;
    version: string;
  };

  assertEquals(response.status, 200);
  assertEquals(body, {
    ok: true,
    service: appInfo.service,
    version: appInfo.version,
  });
});

deno.test("healthHandler supports HEAD for compatibility", async (): Promise<void> => {
  const response = healthHandler("HEAD");
  const text = await response.text();

  assertEquals(response.status, 200);
  assertEquals(text, "");
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
});
