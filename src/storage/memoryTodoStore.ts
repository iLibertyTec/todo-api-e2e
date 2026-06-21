import type { CreateTodoInput, Todo, TodoStore } from "../types/todo.ts";

export class MemoryTodoStore implements TodoStore {
  readonly #items: Todo[] = [];
  #nextId: number = 1;

  list(): Todo[] {
    return [...this.#items];
  }

  create(input: CreateTodoInput): Todo {
    const now: string = new Date().toISOString();
    const todo: Todo = {
      id: String(this.#nextId++),
      title: input.title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    this.#items.push(todo);

    return todo;
  }
}
