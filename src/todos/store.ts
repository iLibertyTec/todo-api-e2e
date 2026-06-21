import {
  CreateTodoInput,
  Todo,
  UpdateTodoInput,
} from "./types.ts";

function cloneTodo(todo: Todo): Todo {
  return {
    ...todo,
    createdAt: new Date(todo.createdAt),
    updatedAt: new Date(todo.updatedAt),
  };
}

export class InMemoryTodoStore {
  #todos: Map<string, Todo>;
  #nextId: number;

  constructor() {
    this.#todos = new Map<string, Todo>();
    this.#nextId = 1;
  }

  list(): Todo[] {
    return Array.from(this.#todos.values()).map(cloneTodo);
  }

  getById(id: string): Todo | undefined {
    const todo: Todo | undefined = this.#todos.get(id);
    return todo ? cloneTodo(todo) : undefined;
  }

  create(input: CreateTodoInput): Todo {
    const now: Date = new Date();
    const todo: Todo = {
      id: String(this.#nextId++),
      title: input.title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    this.#todos.set(todo.id, todo);
    return cloneTodo(todo);
  }

  update(id: string, input: UpdateTodoInput): Todo | undefined {
    const current: Todo | undefined = this.#todos.get(id);

    if (!current) {
      return undefined;
    }

    const updated: Todo = {
      ...current,
      title: input.title ?? current.title,
      completed: input.completed ?? current.completed,
      updatedAt: new Date(),
    };

    this.#todos.set(id, updated);
    return cloneTodo(updated);
  }

  delete(id: string): boolean {
    return this.#todos.delete(id);
  }

  reset(): void {
    this.#todos.clear();
    this.#nextId = 1;
  }
}
