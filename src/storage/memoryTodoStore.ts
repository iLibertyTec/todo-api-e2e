import { CreateTodoInput, Todo, TodoStore } from "../types/todo.ts";

export class MemoryTodoStore implements TodoStore {
  readonly #items: Todo[] = [];

  list(): Todo[] {
    return this.#items.map((item: Todo) => ({ ...item }));
  }

  create(input: CreateTodoInput): Todo {
    const title = input.title.trim();

    if (title.length === 0) {
      throw new Error("Title must not be empty");
    }

    const now = new Date().toISOString();
    const todo: Todo = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    this.#items.push(todo);

    return { ...todo };
  }
}
