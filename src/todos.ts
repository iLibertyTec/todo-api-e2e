export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export interface TodoRepository {
  list(): Todo[];
}

export class TodoStore implements TodoRepository {
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

export const todoStore: TodoStore = new TodoStore();
