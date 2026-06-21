export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export type UpdateTodoInput = {
  title?: string;
  completed?: boolean;
};

export class TodoStore {
  #todos: Todo[];

  constructor(initialTodos: Todo[] = []) {
    this.#todos = [...initialTodos];
  }

  list(): Todo[] {
    return [...this.#todos];
  }

  getById(id: string): Todo | undefined {
    return this.#todos.find((todo: Todo) => todo.id === id);
  }

  update(id: string, updates: UpdateTodoInput): Todo | undefined {
    const index = this.#todos.findIndex((todo: Todo) => todo.id === id);

    if (index === -1) {
      return undefined;
    }

    const current: Todo = this.#todos[index];
    const updated: Todo = {
      ...current,
      ...updates,
    };

    this.#todos = this.#todos.map((todo: Todo, todoIndex: number) =>
      todoIndex === index ? updated : todo
    );

    return updated;
  }

  delete(id: string): boolean {
    const initialLength = this.#todos.length;
    this.#todos = this.#todos.filter((todo: Todo) => todo.id !== id);
    return this.#todos.length !== initialLength;
  }

  reset(todos: Todo[] = []): void {
    this.#todos = [...todos];
  }
}

export const todoStore = new TodoStore();
