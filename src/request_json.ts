import { jsonError } from "./http_errors.ts";

export type JsonObject = Record<string, unknown>;

export async function readJsonObject(
  req: Request,
): Promise<{ ok: true; value: JsonObject } | { ok: false; response: Response }> {
  const contentType: string | null = req.headers.get("content-type");

  if (!contentType?.includes("json")) {
    return {
      ok: false,
      response: jsonError(
        "invalid_content_type",
        "Request body must be application/json",
        400,
      ),
    };
  }

  const rawBody: string = await req.text();

  if (rawBody.trim() === "") {
    return {
      ok: false,
      response: jsonError("invalid_payload", "Request body is required", 400),
    };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return {
      ok: false,
      response: jsonError("invalid_payload", "Request body must be valid JSON", 400),
    };
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed)
  ) {
    return {
      ok: false,
      response: jsonError(
        "invalid_payload",
        "Request body must be a JSON object",
        400,
      ),
    };
  }

  return {
    ok: true,
    value: parsed as JsonObject,
  };
}
