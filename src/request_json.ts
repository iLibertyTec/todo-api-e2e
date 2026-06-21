import { jsonError } from "./http_errors.ts";

export type JsonObject = Record<string, unknown>;

type ReadJsonObjectResult =
  | { ok: true; value: JsonObject }
  | { ok: false; response: Response };

const MAX_BODY_BYTES: number = 1024 * 1024;

function isSupportedJsonContentType(contentType: string | null): boolean {
  if (contentType === null) {
    return false;
  }

  const [mediaType] = contentType.split(";", 1);
  return mediaType.trim().toLowerCase() === "application/json";
}

export async function readJsonObject(
  req: Request,
): Promise<ReadJsonObjectResult> {
  if (!isSupportedJsonContentType(req.headers.get("content-type"))) {
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

  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return {
      ok: false,
      response: jsonError("invalid_payload", "Request body is too large", 400),
    };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return {
      ok: false,
      response: jsonError(
        "invalid_payload",
        "Request body must be valid JSON",
        400,
      ),
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
