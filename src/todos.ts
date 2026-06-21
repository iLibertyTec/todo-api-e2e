export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export class TodoStore {
  #todos: Todo[];

  constructor(initialTodos: Todo[] = []) {
    this.#todos = [...initialTodos];
  }

  list(): Todo[] {
    return [...this.#todos];
  }

  reset(todos: Todo[] = []): void {
    this.#todos = [...todos];
  }
}

export const todoStore = new TodoStore();
