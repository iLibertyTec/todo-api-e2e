import type { CreateTodoInput, Todo, UpdateTodoInput } from "./types.ts";
import {
  validateCreateTodoInput,
  validateUpdateTodoInput,
} from "./validation.ts";

export interface TodoStore {
  create(input: CreateTodoInput): Readonly<Todo>;
  list(): ReadonlyArray<Readonly<Todo>>;
  getById(id: string): Readonly<Todo> | undefined;
  update(id: string, input: UpdateTodoInput): Readonly<Todo> | undefined;
}

export interface TodoStoreDependencies {
  createId?: () => string;
  now?: () => string;
}

function freezeTodo(todo: Todo): Readonly<Todo> {
  return Object.freeze({ ...todo });
}

export class InMemoryTodoStore implements TodoStore {
  readonly #todos: Map<string, Readonly<Todo>>;
  readonly #createId: () => string;
  readonly #now: () => string;

  constructor(dependencies: TodoStoreDependencies = {}) {
    this.#todos = new Map<string, Readonly<Todo>>();
    this.#createId = dependencies.createId ?? (() => crypto.randomUUID());
    this.#now = dependencies.now ?? (() => new Date().toISOString());
  }

  create(input: CreateTodoInput): Readonly<Todo> {
    const validatedInput = validateCreateTodoInput(input);
    const timestamp = this.#now();
    const todo = freezeTodo({
      id: this.#createId(),
      title: validatedInput.title,
      completed: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    this.#todos.set(todo.id, todo);

    return freezeTodo(todo);
  }

  list(): ReadonlyArray<Readonly<Todo>> {
    return this.#todos.values().map((todo: Readonly<Todo>): Readonly<Todo> => freezeTodo(todo)).toArray();
  }

  getById(id: string): Readonly<Todo> | undefined {
    const todo = this.#todos.get(id);

    if (todo === undefined) {
      return undefined;
    }

    return freezeTodo(todo);
  }

  update(id: string, input: UpdateTodoInput): Readonly<Todo> | undefined {
    const current = this.#todos.get(id);

    if (current === undefined) {
      return undefined;
    }

    const validatedInput = validateUpdateTodoInput(input);
    const next = freezeTodo({
      ...current,
      ...(validatedInput.title !== undefined
        ? { title: validatedInput.title }
        : {}),
      ...(validatedInput.completed !== undefined
        ? { completed: validatedInput.completed }
        : {}),
      updatedAt: this.#now(),
    });

    this.#todos.set(id, next);

    return freezeTodo(next);
  }
}
