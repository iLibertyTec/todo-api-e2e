import {
  isCreateTodoInput,
  isReplaceTodoInput,
  isUpdateTodoInput,
  type CreateTodoInput,
  type ReplaceTodoInput,
  type UpdateTodoInput,
} from "./types.ts";
import type { TodoStore } from "./store.ts";

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

function methodNotAllowed(): Response {
  return json({ error: "method not allowed" }, 405);
}

function badRequest(message: string): Response {
  return json({ error: message }, 400);
}

function unsupportedMediaType(): Response {
  return json({ error: "unsupported media type" }, 415);
}

function notFound(): Response {
  return json({ error: "not found" }, 404);
}

function hasRequestBody(req: Request): boolean {
  const contentLength: string | null = req.headers.get("content-length");

  if (contentLength !== null) {
    const parsed: number = Number(contentLength);

    if (Number.isFinite(parsed) && parsed > 0) {
      return true;
    }
  }

  return req.body !== null;
}

async function readJsonBody(req: Request): Promise<unknown | Response> {
  if (!hasRequestBody(req)) {
    return badRequest("missing todo payload");
  }

  const contentType: string | null = req.headers.get("content-type");

  if (contentType !== null) {
    const mediaType: string = contentType.split(";")[0].trim().toLowerCase();

    if (mediaType !== "application/json") {
      return unsupportedMediaType();
    }
  }

  try {
    return await req.json();
  } catch {
    return badRequest("invalid todo payload");
  }
}

export function createTodoHandler(store: TodoStore) {
  return async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const pathname = url.pathname;

    if (pathname === "/") {
      if (req.method === "GET") {
        return new Response(
          "<!doctype html><html><head><meta charset=\"utf-8\"><title>Todo API</title></head><body><h1>Todo API</h1><p>Service is running.</p></body></html>",
          {
            status: 200,
            headers: {
              "content-type": "text/html; charset=utf-8",
            },
          },
        );
      }

      return methodNotAllowed();
    }

    if (pathname === "/health") {
      if (req.method === "GET") {
        return json({
          ok: true,
          service: "ifactory-product",
          version: "0.1.0",
        });
      }

      return methodNotAllowed();
    }

    if (pathname === "/api/todos") {
      if (req.method === "GET") {
        return json(store.list());
      }

      if (req.method === "POST") {
        const body = await readJsonBody(req);

        if (body instanceof Response) {
          return body;
        }

        if (!isCreateTodoInput(body)) {
          return badRequest("invalid todo payload");
        }

        const input: CreateTodoInput = body;
        return json(store.create(input), 201);
      }

      return methodNotAllowed();
    }

    const todoMatch: RegExpMatchArray | null = pathname.match(
      /^\/api\/todos\/([^/]+)$/,
    );

    if (todoMatch) {
      const id: string = todoMatch[1];

      if (req.method === "GET") {
        const todo = store.getById(id);
        return todo ? json(todo) : notFound();
      }

      if (req.method === "PATCH") {
        const body = await readJsonBody(req);

        if (body instanceof Response) {
          return body;
        }

        if (!isUpdateTodoInput(body)) {
          return badRequest("invalid todo payload");
        }

        const input: UpdateTodoInput = body;
        const todo = store.update(id, input);
        return todo ? json(todo) : notFound();
      }

      if (req.method === "PUT") {
        const body = await readJsonBody(req);

        if (body instanceof Response) {
          return body;
        }

        if (!isReplaceTodoInput(body)) {
          return badRequest("invalid todo payload");
        }

        const input: ReplaceTodoInput = body;
        const todo = store.replace(id, input);
        return todo ? json(todo) : notFound();
      }

      if (req.method === "DELETE") {
        const deleted: boolean = store.delete(id);
        return deleted ? new Response(null, { status: 204 }) : notFound();
      }

      return methodNotAllowed();
    }

    return notFound();
  };
}
