import type { CreateTodoInput, TodoCollectionStore } from "../todos/memoryTodoStore.ts";
import type { Todo } from "../todos/types.ts";

interface CreateTodoRequestBody {
  title?: string;
}

export interface TodoCollectionHandlers {
  getTodos(): Response;
  createTodo(req: Request): Promise<Response>;
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "content-type": "application/json",
    },
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
    headers: {
      Allow: allowedMethods.join(", "),
      "content-type": "application/json",
    },
  });
}

export function createTodoCollectionHandlers(
  store: TodoCollectionStore,
): TodoCollectionHandlers {
  return {
    getTodos(): Response {
      const todos: Todo[] = store.list();
      return Response.json(todos);
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
        return Response.json(todo, { status: 201 });
      } catch (error: unknown) {
        if (error instanceof Error && error.message === "title must not be empty") {
          return jsonError("title must not be empty", 400);
        }

        throw error;
      }
    },
  };
}
