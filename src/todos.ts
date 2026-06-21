export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export class TodoStore {
  #todos: Todo[] = [];

  list(): Todo[] {
    return this.#todos.map((todo: Todo) => ({ ...todo }));
  }

  create(title: string): Todo {
    const todo: Todo = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.#todos.push(todo);

    return { ...todo };
  }
}
