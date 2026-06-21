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

function cloneTodo(todo: Todo): Todo {
  return {
    ...todo,
    createdAt: new Date(todo.createdAt),
    updatedAt: new Date(todo.updatedAt),
  };
}

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export class InMemoryTodoStore implements TodoStore {
  readonly #todos: Map<string, Todo> = new Map();

  list(): Todo[] {
    return Array.from(this.#todos.values(), cloneTodo);
  }

  create(input: CreateTodoInput): Todo {
    const now = new Date();
    const todo: Todo = {
      id: createId(),
      title: input.title.trim(),
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    this.#todos.set(todo.id, todo);
    return cloneTodo(todo);
  }

  getById(id: string): Todo | undefined {
    const todo: Todo | undefined = this.#todos.get(id);
    return todo ? cloneTodo(todo) : undefined;
  }

  update(id: string, input: UpdateTodoInput): Todo | undefined {
    const current: Todo | undefined = this.#todos.get(id);

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
    return cloneTodo(updated);
  }

  replace(id: string, input: ReplaceTodoInput): Todo | undefined {
    const current: Todo | undefined = this.#todos.get(id);

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
    return cloneTodo(updated);
  }

  delete(id: string): boolean {
    return this.#todos.delete(id);
  }
}
