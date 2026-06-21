import type {
  CreateTodoInput,
  TodoListResponse,
  TodoStore,
} from "../types/todo.ts";

function badRequest(message: string): Response {
  return Response.json({ error: message }, { status: 400 });
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

export function handleListTodos(store: TodoStore): Response {
  const response: TodoListResponse = {
    items: store.list(),
  };

  return Response.json(response);
}

export async function handleCreateTodo(
  req: Request,
  store: TodoStore,
): Promise<Response> {
  if (!req.headers.get("content-type")?.includes("json")) {
    return badRequest("invalid payload");
  }

  const body: unknown = await req.json().catch(() => null);
  const input: CreateTodoInput | null = parseCreateTodoInput(body);

  if (input === null) {
    return badRequest("invalid payload");
  }

  const todo = store.create(input);
  return Response.json(todo, { status: 201 });
}
