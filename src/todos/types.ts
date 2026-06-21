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

export function isCreateTodoInput(value: unknown): value is CreateTodoInput {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const input = value as Record<string, unknown>;
  return typeof input.title === "string" && input.title.trim().length > 0;
}

export function isUpdateTodoInput(value: unknown): value is UpdateTodoInput {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const input = value as Record<string, unknown>;

  if ("title" in input && input.title !== undefined) {
    if (typeof input.title !== "string" || input.title.trim().length === 0) {
      return false;
    }
  }

  if ("completed" in input && input.completed !== undefined) {
    if (typeof input.completed !== "boolean") {
      return false;
    }
  }

  return "title" in input || "completed" in input;
}
