import { Todo } from "./types.ts";

export interface CreateTodoInput {
  title: string;
}

export interface UpdateTodoInput {
  title?: string;
  completed?: boolean;
}

function normalizeTitle(title: string): string {
  const normalized: string = title.trim();

  if (normalized.length === 0) {
    throw new Error("title must not be empty");
  }

  return normalized;
}

export class MemoryTodoStore {
  #todos: Todo[] = [];
  #nextId: number = 1;

  list(): Todo[] {
    return this.#todos.map((todo: Todo): Todo => ({ ...todo }));
  }

  create(input: CreateTodoInput): Todo {
    const title: string = normalizeTitle(input.title);
    const now: string = new Date().toISOString();
    const todo: Todo = {
      id: String(this.#nextId++),
      title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    this.#todos = [...this.#todos, todo];

    return { ...todo };
  }

  getById(id: string): Todo | undefined {
    const todo: Todo | undefined = this.#todos.find((item: Todo): boolean => item.id === id);
    return todo ? { ...todo } : undefined;
  }

  update(id: string, input: UpdateTodoInput): Todo | undefined {
    const index: number = this.#todos.findIndex((item: Todo): boolean => item.id === id);

    if (index === -1) {
      return undefined;
    }

    const hasTitleUpdate: boolean = input.title !== undefined;
    const hasCompletedUpdate: boolean = input.completed !== undefined;

    if (!hasTitleUpdate && !hasCompletedUpdate) {
      throw new Error("update requires at least one field");
    }

    const current: Todo = this.#todos[index];
    const updated: Todo = {
      ...current,
      ...(hasTitleUpdate ? { title: normalizeTitle(input.title as string) } : {}),
      ...(hasCompletedUpdate ? { completed: input.completed as boolean } : {}),
      updatedAt: new Date().toISOString(),
    };

    const nextTodos: Todo[] = [...this.#todos];
    nextTodos[index] = updated;
    this.#todos = nextTodos;

    return { ...updated };
  }

  remove(id: string): boolean {
    const beforeLength: number = this.#todos.length;
    this.#todos = this.#todos.filter((todo: Todo): boolean => todo.id !== id);
    return this.#todos.length !== beforeLength;
  }
}
