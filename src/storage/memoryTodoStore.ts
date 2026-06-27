import type { CreateTodoInput, Todo } from "../domain/todo.ts";

export class MemoryTodoStore {
  readonly #items: Todo[] = [];

  list(): { items: Todo[]; total: number } {
    return {
      items: [...this.#items],
      total: this.#items.length,
    };
  }

  create(input: CreateTodoInput): Todo {
    const todo: Todo = {
      id: crypto.randomUUID(),
      title: input.title,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.#items.push(todo);

    return todo;
  }
}
