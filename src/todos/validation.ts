import type { CreateTodoInput, UpdateTodoInput } from "./types.ts";

export interface ValidationSuccess<T> {
  ok: true;
  value: T;
}

export interface ValidationFailure {
  ok: false;
  error: string;
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateCreateTodoInput(
  value: unknown,
): ValidationResult<CreateTodoInput> {
  if (!isPlainObject(value)) {
    return { ok: false, error: "Payload must be an object." };
  }

  if (typeof value.title !== "string") {
    return { ok: false, error: 'Field "title" must be a string.' };
  }

  const title: string = value.title.trim();

  if (title.length === 0) {
    return { ok: false, error: 'Field "title" cannot be empty.' };
  }

  return {
    ok: true,
    value: {
      title,
    },
  };
}

export function validateUpdateTodoInput(
  value: unknown,
): ValidationResult<UpdateTodoInput> {
  if (!isPlainObject(value)) {
    return { ok: false, error: "Payload must be an object." };
  }

  const result: UpdateTodoInput = {};

  if ("title" in value) {
    if (typeof value.title !== "string") {
      return { ok: false, error: 'Field "title" must be a string.' };
    }

    const title: string = value.title.trim();

    if (title.length === 0) {
      return { ok: false, error: 'Field "title" cannot be empty.' };
    }

    result.title = title;
  }

  if ("completed" in value) {
    if (typeof value.completed !== "boolean") {
      return { ok: false, error: 'Field "completed" must be a boolean.' };
    }

    result.completed = value.completed;
  }

  if (!("title" in value) && !("completed" in value)) {
    return {
      ok: false,
      error: 'At least one of "title" or "completed" must be provided.',
    };
  }

  return {
    ok: true,
    value: result,
  };
}
