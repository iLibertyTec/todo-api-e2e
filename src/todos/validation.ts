import type { CreateTodoInput, UpdateTodoInput } from "./types.ts";

export function validateCreateTodoInput(input: unknown): CreateTodoInput {
  if (typeof input !== "object" || input === null) {
    throw new Error("input must be an object");
  }

  const { title } = input as { title?: unknown };

  if (typeof title !== "string") {
    throw new Error("title must be a string");
  }

  const normalizedTitle = title.trim();

  if (normalizedTitle.length === 0) {
    throw new Error("title must not be empty");
  }

  return Object.freeze({ title: normalizedTitle });
}

export function validateUpdateTodoInput(input: unknown): UpdateTodoInput {
  if (typeof input !== "object" || input === null) {
    throw new Error("input must be an object");
  }

  const { title, completed } = input as {
    title?: unknown;
    completed?: unknown;
  };

  if (title === undefined && completed === undefined) {
    throw new Error("update must include at least one field");
  }

  const normalized: UpdateTodoInput = {};

  if (title !== undefined) {
    if (typeof title !== "string") {
      throw new Error("title must be a string");
    }

    const normalizedTitle = title.trim();

    if (normalizedTitle.length === 0) {
      throw new Error("title must not be empty");
    }

    normalized.title = normalizedTitle;
  }

  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      throw new Error("completed must be a boolean");
    }

    normalized.completed = completed;
  }

  return Object.freeze({ ...normalized });
}
