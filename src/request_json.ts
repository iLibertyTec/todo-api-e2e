import { jsonError } from "./http_errors.ts";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonValue[];

export type JsonObject = { [key: string]: JsonValue };

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

function isJsonValue(value: unknown): value is JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  if (typeof value !== "object") {
    return false;
  }

  const prototype: object | null = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return false;
  }

  return Object.values(value).every(isJsonValue);
}

function isJsonObject(value: unknown): value is JsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype: object | null = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return false;
  }

  return Object.values(value).every(isJsonValue);
}

async function readBodyText(req: Request): Promise<string | null> {
  if (req.body === null) {
    return "";
  }

  const reader: ReadableStreamDefaultReader<Uint8Array> = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes: number = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      totalBytes += value.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bodyBytes = new Uint8Array(totalBytes);
  let offset: number = 0;

  for (const chunk of chunks) {
    bodyBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(bodyBytes);
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

  const rawBody: string | null = await readBodyText(req);

  if (rawBody === null) {
    return {
      ok: false,
      response: jsonError("invalid_payload", "Request body is too large", 400),
    };
  }

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
      response: jsonError(
        "invalid_payload",
        "Request body must be valid JSON",
        400,
      ),
    };
  }

  if (!isJsonObject(parsed)) {
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
    value: parsed,
  };
}
