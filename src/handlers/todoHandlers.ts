import type {
  CreateTodoInput,
  TodoCollectionStore,
} from "../todos/memoryTodoStore.ts";
import type { Todo } from "../todos/types.ts";

interface CreateTodoRequestBody {
  title?: string;
}

const TODO_COLLECTION_ALLOWED_METHODS: string[] = ["GET", "POST", "OPTIONS"];
const TODO_COLLECTION_ALLOW_HEADER: string = TODO_COLLECTION_ALLOWED_METHODS.join(
  ", ",
);

export interface TodoCollectionHandlers {
  handle(req: Request): Promise<Response>;
  getTodos(): Response;
  createTodo(req: Request): Promise<Response>;
  options(): Response;
}

function jsonHeaders(extraHeaders?: HeadersInit): Headers {
  const headers = new Headers(extraHeaders);
  headers.set("content-type", "application/json");
  headers.set("cache-control", "no-store");
  return headers;
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: jsonHeaders(),
  });
}

function parseCreateTodoRequestBody(value: unknown): CreateTodoRequestBody {
  if (typeof value !== "object" || value === null) {
    return {};
  }

  const title: string | undefined = "title" in value && typeof value.title === "string"
    ? value.title
    : undefined;

  return { title };
}

export function methodNotAllowedJson(allowedMethods: string[]): Response {
  return new Response(JSON.stringify({ error: "method not allowed" }), {
    status: 405,
    headers: jsonHeaders({
      Allow: allowedMethods.join(", "),
    }),
  });
}

function optionsJson(allowedMethods: string[]): Response {
  const allowHeader: string = allowedMethods.join(", ");

  return new Response(JSON.stringify({ methods: allowedMethods }), {
    status: 200,
    headers: jsonHeaders({
      Allow: allowHeader,
      "access-control-allow-methods": allowHeader,
      "access-control-allow-headers": "content-type",
    }),
  });
}

export function createTodoCollectionHandlers(
  store: TodoCollectionStore,
): TodoCollectionHandlers {
  return {
    async handle(req: Request): Promise<Response> {
      if (req.method === "GET") {
        return this.getTodos();
      }

      if (req.method === "POST") {
        return await this.createTodo(req);
      }

      if (req.method === "OPTIONS") {
        return this.options();
      }

      return methodNotAllowedJson(TODO_COLLECTION_ALLOWED_METHODS);
    },

    getTodos(): Response {
      const todos: Todo[] = store.list();
      return new Response(JSON.stringify(todos), {
        status: 200,
        headers: jsonHeaders(),
      });
    },

    async createTodo(req: Request): Promise<Response> {
      let rawBody: unknown;

      try {
        rawBody = await req.json();
      } catch {
        return jsonError("invalid json", 400);
      }

      const body: CreateTodoRequestBody = parseCreateTodoRequestBody(rawBody);

      if (body.title === undefined) {
        return jsonError("invalid payload", 400);
      }

      try {
        const todo: Todo = store.create(body as CreateTodoInput);
        return new Response(JSON.stringify(todo), {
          status: 201,
          headers: jsonHeaders(),
        });
      } catch (error: unknown) {
        if (error instanceof Error && error.message === "title must not be empty") {
          return jsonError("title must not be empty", 400);
        }

        throw error;
      }
    },

    options(): Response {
      return optionsJson(TODO_COLLECTION_ALLOWED_METHODS);
    },
  };
}
