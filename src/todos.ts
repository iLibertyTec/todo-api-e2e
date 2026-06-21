export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export class InMemoryTodoStore {
  #todos: Todo[] = [];
  #nextId: number = 1;

  create(title: string): Todo {
    const todo: Todo = {
      id: String(this.#nextId++),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.#todos.push(todo);
    return todo;
  }

  list(): Todo[] {
    return [...this.#todos];
  }
}
