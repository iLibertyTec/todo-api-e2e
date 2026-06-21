import type { CreateTodoInput, Todo } from "../types/todo.ts";

export class MemoryTodoStore {
  #todos: Todo[] = [];

  list(): Todo[] {
    return this.#todos.map((todo: Todo): Todo => ({ ...todo }));
  }

  create(input: CreateTodoInput): Todo {
    const title: string = input.title.trim();

    if (title.length === 0) {
      throw new Error("Title must not be empty");
    }

    const now: string = new Date().toISOString();
    const todo: Todo = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    this.#todos.push(todo);

    return { ...todo };
  }
}
