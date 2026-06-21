import type {
  CreateTodoInput,
  Todo,
  TodoListResponse,
  TodoStore,
} from "../types/todo.ts";

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  const headers: Headers = new Headers(init?.headers);

  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json; charset=utf-8");
  }

  return Response.json(body, {
    ...init,
    headers,
  });
}

function badRequest(message: string): Response {
  return jsonResponse(
    {
      error: {
        code: "INVALID_PAYLOAD",
        message,
      },
    },
    { status: 400 },
  );
}

function methodNotAllowed(allow: string): Response {
  return jsonResponse(
    {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "method not allowed",
      },
    },
    {
      status: 405,
      headers: {
        allow,
      },
    },
  );
}

function isJsonContentType(contentType: string | null): boolean {
  if (contentType === null) {
    return false;
  }

  const mediaType: string = contentType.split(";", 1)[0].trim().toLowerCase();

  return mediaType === "application/json" || mediaType.endsWith("+json");
}

function parseCreateTodoInput(body: unknown): CreateTodoInput | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const title: unknown = (body as { title?: unknown }).title;

  if (typeof title !== "string" || title.trim().length === 0) {
    return null;
  }

  return {
    title: title.trim(),
  };
}

function serializeTodo(todo: Todo): Todo {
  return {
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
  };
}

export function handleListTodos(req: Request, store: TodoStore): Response {
  if (req.method !== "GET") {
    return methodNotAllowed("GET");
  }

  const response: TodoListResponse = {
    items: store.list().map(serializeTodo),
  };

  return jsonResponse(response);
}

export async function handleCreateTodo(
  req: Request,
  store: TodoStore,
): Promise<Response> {
  if (req.method !== "POST") {
    return methodNotAllowed("POST");
  }

  if (!isJsonContentType(req.headers.get("content-type"))) {
    return badRequest("invalid payload");
  }

  const body: unknown = await req.json().catch(() => null);
  const input: CreateTodoInput | null = parseCreateTodoInput(body);

  if (input === null) {
    return badRequest("invalid payload");
  }

  const todo: Todo = store.create(input);
  return jsonResponse(serializeTodo(todo), { status: 201 });
}
