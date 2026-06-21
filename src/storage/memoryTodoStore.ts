import type { CreateTodoInput, Todo, TodoStore } from "../types/todo.ts";

export class MemoryTodoStore implements TodoStore {
  readonly #items: Todo[] = [];
  #nextId: number = 1;

  list(): Todo[] {
    return [...this.#items];
  }

  create(input: CreateTodoInput): Todo {
    const todo: Todo = {
      id: String(this.#nextId++),
      title: input.title,
      completed: false,
    };

    this.#items.push(todo);

    return todo;
  }
}
