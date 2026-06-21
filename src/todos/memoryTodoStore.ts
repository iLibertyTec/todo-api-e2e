import { Todo } from "./types.ts";

export interface CreateTodoInput {
  title: string;
}

export interface UpdateTodoInput {
  title?: string;
  completed?: boolean;
}

export class MemoryTodoStore {
  #todos: Todo[] = [];
  #nextId: number = 1;

  list(): Todo[] {
    return this.#todos.map((todo: Todo): Todo => ({ ...todo }));
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

    this.#todos = [...this.#todos, todo];

    return { ...todo };
  }

  getById(id: string): Todo | undefined {
    const todo: Todo | undefined = this.#todos.find((item: Todo): boolean => item.id === id);
    return todo ? { ...todo } : undefined;
  }

  update(id: string, input: UpdateTodoInput): Todo | undefined {
    const index: number = this.#todos.findIndex((item: Todo): boolean => item.id === id);

    if (index === -1) {
      return undefined;
    }

    const current: Todo = this.#todos[index];
    const updated: Todo = {
      ...current,
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.completed !== undefined ? { completed: input.completed } : {}),
      updatedAt: new Date().toISOString(),
    };

    this.#todos = this.#todos.map((todo: Todo, todoIndex: number): Todo =>
      todoIndex === index ? updated : todo
    );

    return { ...updated };
  }

  remove(id: string): boolean {
    const beforeLength: number = this.#todos.length;
    this.#todos = this.#todos.filter((todo: Todo): boolean => todo.id !== id);
    return this.#todos.length !== beforeLength;
  }
}
