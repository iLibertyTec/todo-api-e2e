import type { CreateTodoInput } from "../domain/todo.ts";
import type { MemoryTodoStore } from "../storage/memoryTodoStore.ts";

export function handleListTodos(
  _req: Request,
  store: MemoryTodoStore,
): Response {
  return Response.json(store.list());
}

export async function handleCreateTodo(
  req: Request,
  store: MemoryTodoStore,
): Promise<Response> {
  const contentType: string = req.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const body: unknown = await req.json().catch((): unknown => null);

  if (!isCreateTodoInput(body)) {
    return Response.json({ error: "invalid payload" }, { status: 400 });
  }

  const todo = store.create({ title: body.title.trim() });
  return Response.json(todo, { status: 201 });
}

function isCreateTodoInput(value: unknown): value is CreateTodoInput {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const title: unknown = (value as { title?: unknown }).title;
  return typeof title === "string" && title.trim().length > 0;
}
