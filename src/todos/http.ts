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

async function readJsonBody(req: Request): Promise<unknown | Response> {
  const contentType = req.headers.get("content-type")?.toLowerCase();

  if (contentType && !contentType.includes("json")) {
    return unsupportedMediaType();
  }

  try {
    return await req.json();
  } catch {
    return badRequest("invalid json payload");
  }
}

export function createTodoHandler(store: TodoStore) {
  return async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const pathname = url.pathname;

    if (pathname === "/" && req.method === "GET") {
      return json({
        ok: true,
        service: "ifactory-product",
        resources: {
          health: "/health",
          todos: "/api/todos",
        },
      });
    }

    if (pathname === "/health" && req.method === "GET") {
      return json({
        ok: true,
        service: "ifactory-product",
        version: "0.1.0",
      });
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

    const todoMatch = pathname.match(/^\/api\/todos\/([^/]+)$/);

    if (todoMatch) {
      const id = todoMatch[1];

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
        const deleted = store.delete(id);
        return deleted ? new Response(null, { status: 204 }) : notFound();
      }

      return methodNotAllowed();
    }

    return notFound();
  };
}
