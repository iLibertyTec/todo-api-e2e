import type { CreateTodoInput, UpdateTodoInput } from "./types.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeTitle(title: string): string {
  return title.trim();
}

export function parseCreateTodoInput(value: unknown): CreateTodoInput {
  if (!isRecord(value) || typeof value.title !== "string") {
    throw new Error("Invalid todo title");
  }

  const title = normalizeTitle(value.title);

  if (title.length === 0) {
    throw new Error("Invalid todo title");
  }

  return { title };
}

export function parseUpdateTodoInput(value: unknown): UpdateTodoInput {
  if (!isRecord(value)) {
    throw new Error("Invalid todo update");
  }

  const input: UpdateTodoInput = {};

  if ("title" in value) {
    if (typeof value.title !== "string") {
      throw new Error("Invalid todo title");
    }

    const title = normalizeTitle(value.title);

    if (title.length === 0) {
      throw new Error("Invalid todo title");
    }

    input.title = title;
  }

  if ("completed" in value) {
    if (typeof value.completed !== "boolean") {
      throw new Error("Invalid todo completed flag");
    }

    input.completed = value.completed;
  }

  if (Object.keys(input).length === 0) {
    throw new Error("Invalid todo update");
  }

  return input;
}
