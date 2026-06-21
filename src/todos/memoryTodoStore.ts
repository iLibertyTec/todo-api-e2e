import {
  type CreateTodoInput,
  type Todo,
  type UpdateTodoInput,
} from "./types.ts";

export class MemoryTodoStore {
  #todos: Todo[] = [];
  #nextId: number;

  constructor(initialTodos: Todo[] = []) {
    this.#todos = initialTodos.map((todo: Todo): Todo => cloneTodo(todo));
    this.#nextId = getNextId(this.#todos);
  }

  list(): Todo[] {
    return this.#todos.map((todo: Todo): Todo => cloneTodo(todo));
  }

  create(input: CreateTodoInput): Todo {
    const now = new Date().toISOString();
    const todo: Todo = {
      id: String(this.#nextId++),
      title: input.title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    this.#todos.push(todo);

    return cloneTodo(todo);
  }

  getById(id: string): Todo | undefined {
    const todo = this.#todos.find((item: Todo): boolean => item.id === id);
    return todo ? cloneTodo(todo) : undefined;
  }

  update(id: string, input: UpdateTodoInput): Todo | undefined {
    const index = this.#todos.findIndex((todo: Todo): boolean => todo.id === id);

    if (index === -1) {
      return undefined;
    }

    const current = this.#todos[index];
    const updated: Todo = {
      ...current,
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.completed !== undefined ? { completed: input.completed } : {}),
      updatedAt: new Date().toISOString(),
    };

    this.#todos[index] = updated;

    return cloneTodo(updated);
  }

  delete(id: string): boolean {
    const index = this.#todos.findIndex((todo: Todo): boolean => todo.id === id);

    if (index === -1) {
      return false;
    }

    this.#todos.splice(index, 1);
    return true;
  }
}

function cloneTodo(todo: Todo): Todo {
  return {
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
  };
}

function getNextId(todos: Todo[]): number {
  let maxId = 0;

  for (const todo of todos) {
    const numericId = Number(todo.id);

    if (Number.isInteger(numericId) && numericId > maxId) {
      maxId = numericId;
    }
  }

  return maxId + 1;
}
