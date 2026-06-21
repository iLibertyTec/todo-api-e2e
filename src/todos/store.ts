import type {
  CreateTodoInput,
  ReplaceTodoInput,
  Todo,
  UpdateTodoInput,
} from "./types.ts";

export interface TodoStore {
  list(): Todo[];
  create(input: CreateTodoInput): Todo;
  getById(id: string): Todo | undefined;
  update(id: string, input: UpdateTodoInput): Todo | undefined;
  replace(id: string, input: ReplaceTodoInput): Todo | undefined;
  delete(id: string): boolean;
}

export class InMemoryTodoStore implements TodoStore {
  readonly #todos: Map<string, Todo> = new Map();

  list(): Todo[] {
    return Array.from(this.#todos.values());
  }

  create(input: CreateTodoInput): Todo {
    const now = new Date();
    const todo: Todo = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    this.#todos.set(todo.id, todo);
    return todo;
  }

  getById(id: string): Todo | undefined {
    return this.#todos.get(id);
  }

  update(id: string, input: UpdateTodoInput): Todo | undefined {
    const current = this.#todos.get(id);

    if (!current) {
      return undefined;
    }

    const updated: Todo = {
      ...current,
      title: input.title !== undefined ? input.title.trim() : current.title,
      completed: input.completed !== undefined
        ? input.completed
        : current.completed,
      updatedAt: new Date(),
    };

    this.#todos.set(id, updated);
    return updated;
  }

  replace(id: string, input: ReplaceTodoInput): Todo | undefined {
    const current = this.#todos.get(id);

    if (!current) {
      return undefined;
    }

    const updated: Todo = {
      ...current,
      title: input.title.trim(),
      completed: input.completed,
      updatedAt: new Date(),
    };

    this.#todos.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.#todos.delete(id);
  }
}
