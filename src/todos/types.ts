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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyTitle(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isCreateTodoInput(value: unknown): value is CreateTodoInput {
  if (!isRecord(value)) {
    return false;
  }

  const keys: string[] = Object.keys(value);
  return keys.length === 1 && isNonEmptyTitle(value.title);
}

export function isUpdateTodoInput(value: unknown): value is UpdateTodoInput {
  if (!isRecord(value)) {
    return false;
  }

  const keys: string[] = Object.keys(value);

  if (keys.length === 0) {
    return false;
  }

  for (const key of keys) {
    if (key !== "title" && key !== "completed") {
      return false;
    }
  }

  if ("title" in value && !isNonEmptyTitle(value.title)) {
    return false;
  }

  if ("completed" in value && typeof value.completed !== "boolean") {
    return false;
  }

  return true;
}

export function isReplaceTodoInput(value: unknown): value is ReplaceTodoInput {
  if (!isRecord(value)) {
    return false;
  }

  const keys: string[] = Object.keys(value);

  if (keys.length !== 2) {
    return false;
  }

  return isNonEmptyTitle(value.title) && typeof value.completed === "boolean";
}
