export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoPatch {
  title?: string;
  completed?: boolean;
}

function isValidTitle(title: string): boolean {
  return title.trim().length > 0;
}

function validateTodoPatch(patch: TodoPatch): void {
  if (patch.title !== undefined && !isValidTitle(patch.title)) {
    throw new Error("Todo title must not be empty.");
  }
}

export class InMemoryTodoRepository {
  #todos: Map<string, Todo>;

  constructor(initialTodos: Todo[] = []) {
    this.#todos = new Map<string, Todo>();

    for (const todo of initialTodos) {
      if (!isValidTitle(todo.title)) {
        throw new Error("Todo title must not be empty.");
      }

      this.#todos.set(todo.id, { ...todo });
    }
  }

  list(): Todo[] {
    return Array.from(this.#todos.values(), (todo: Todo) => ({ ...todo }));
  }

  findById(id: string): Todo | null {
    const todo = this.#todos.get(id);
    return todo ? { ...todo } : null;
  }

  patch(id: string, patch: TodoPatch): Todo | null {
    const current = this.#todos.get(id);
    if (!current) {
      return null;
    }

    validateTodoPatch(patch);

    const updated: Todo = {
      ...current,
      ...patch,
    };

    this.#todos.set(id, updated);
    return { ...updated };
  }

  remove(id: string): Todo | null {
    const current = this.#todos.get(id);
    if (!current) {
      return null;
    }

    this.#todos.delete(id);
    return { ...current };
  }
}
