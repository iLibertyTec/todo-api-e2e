import type { CreateTodoInput, Todo, UpdateTodoInput } from "./types.ts";

export interface TodoStore {
  create(input: CreateTodoInput): Todo;
  list(): Todo[];
  getById(id: string): Todo | undefined;
  update(id: string, input: UpdateTodoInput): Todo | undefined;
}

export interface TodoStoreDependencies {
  createId?: () => string;
  now?: () => string;
}

export class InMemoryTodoStore implements TodoStore {
  readonly #todos: Map<string, Todo>;
  readonly #createId: () => string;
  readonly #now: () => string;

  constructor(dependencies: TodoStoreDependencies = {}) {
    this.#todos = new Map<string, Todo>();
    this.#createId = dependencies.createId ?? crypto.randomUUID;
    this.#now = dependencies.now ?? (() => new Date().toISOString());
  }

  create(input: CreateTodoInput): Todo {
    const timestamp = this.#now();
    const todo: Todo = {
      id: this.#createId(),
      title: input.title,
      completed: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.#todos.set(todo.id, todo);

    return { ...todo };
  }

  list(): Todo[] {
    return Array.from(this.#todos.values(), (todo: Todo): Todo => ({ ...todo }));
  }

  getById(id: string): Todo | undefined {
    const todo = this.#todos.get(id);

    if (todo === undefined) {
      return undefined;
    }

    return { ...todo };
  }

  update(id: string, input: UpdateTodoInput): Todo | undefined {
    const current = this.#todos.get(id);

    if (current === undefined) {
      return undefined;
    }

    const next: Todo = {
      ...current,
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.completed !== undefined ? { completed: input.completed } : {}),
      updatedAt: this.#now(),
    };

    this.#todos.set(id, next);

    return { ...next };
  }
}
