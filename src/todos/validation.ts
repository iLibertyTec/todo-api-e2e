import type { CreateTodoInput, UpdateTodoInput } from "./types.ts";

function normalizeTitle(title: string): string {
  return title.trim();
}

export function validateCreateTodoInput(
  input: CreateTodoInput,
): CreateTodoInput {
  const title = normalizeTitle(input.title);

  if (title.length === 0) {
    throw new Error("title must not be empty");
  }

  return { title };
}

export function validateUpdateTodoInput(
  input: UpdateTodoInput,
): UpdateTodoInput {
  const hasTitle = input.title !== undefined;
  const hasCompleted = input.completed !== undefined;

  if (!hasTitle && !hasCompleted) {
    throw new Error("update must include at least one field");
  }

  if (hasTitle) {
    const title = normalizeTitle(input.title as string);

    if (title.length === 0) {
      throw new Error("title must not be empty");
    }

    return {
      ...input,
      title,
    };
  }

  return { ...input };
}
