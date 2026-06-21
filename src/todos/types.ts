export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoInput {
  title: string;
}

export interface UpdateTodoInput {
  title?: string;
  completed?: boolean;
}

export interface ReplaceTodoInput {
  title: string;
  completed: boolean;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasOnlyKeys(
  input: Record<string, unknown>,
  allowedKeys: readonly string[],
): boolean {
  return Object.keys(input).every((key: string) => allowedKeys.includes(key));
}

export function isCreateTodoInput(value: unknown): value is CreateTodoInput {
  if (!isPlainObject(value) || !hasOnlyKeys(value, ["title"])) {
    return false;
  }

  return typeof value.title === "string" && value.title.trim().length > 0;
}

export function isUpdateTodoInput(value: unknown): value is UpdateTodoInput {
  if (
    !isPlainObject(value) ||
    !hasOnlyKeys(value, ["title", "completed"])
  ) {
    return false;
  }

  if ("title" in value && value.title !== undefined) {
    if (typeof value.title !== "string" || value.title.trim().length === 0) {
      return false;
    }
  }

  if ("completed" in value && value.completed !== undefined) {
    if (typeof value.completed !== "boolean") {
      return false;
    }
  }

  return "title" in value || "completed" in value;
}

export function isReplaceTodoInput(value: unknown): value is ReplaceTodoInput {
  if (
    !isPlainObject(value) ||
    !hasOnlyKeys(value, ["title", "completed"])
  ) {
    return false;
  }

  return (
    typeof value.title === "string" &&
    value.title.trim().length > 0 &&
    typeof value.completed === "boolean"
  );
}
