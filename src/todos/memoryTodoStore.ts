import type { Todo } from "./types.ts";

export interface CreateTodoInput {
  title: string;
}

export interface TodoCollectionStore {
  list(): Todo[];
  create(input: CreateTodoInput): Todo;
}

export class MemoryTodoStore implements TodoCollectionStore {
  readonly #todos: Todo[] = [];
  #nextId: number = 1;

  list(): Todo[] {
    return this.#todos.map((todo: Todo): Todo => ({ ...todo }));
  }

  create(input: CreateTodoInput): Todo {
    const title: string = input.title.trim();

    if (title.length === 0) {
      throw new Error("title must not be empty");
    }

    const now: string = new Date().toISOString();
    const todo: Todo = {
      id: String(this.#nextId++),
      title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    this.#todos.push(todo);

    return { ...todo };
  }

  getById(id: string): Todo | undefined {
    const todo: Todo | undefined = this.#todos.find((item: Todo): boolean => item.id === id);
    return todo ? { ...todo } : undefined;
  }
}
