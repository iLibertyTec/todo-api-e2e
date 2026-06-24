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

function hasOnlyAllowedPatchKeys(value: Record<string, unknown>): boolean {
  return Object.keys(value).every((key: string) => {
    return key === "title" || key === "completed";
  });
}

function validateTodoPatch(patch: TodoPatch): void {
  const patchRecord = patch as Record<string, unknown>;

  if (!hasOnlyAllowedPatchKeys(patchRecord)) {
    throw new Error("Todo patch contains invalid fields.");
  }

  if (Object.keys(patchRecord).length === 0) {
    throw new Error("Todo patch must include at least one editable field.");
  }

  if (patch.title !== undefined) {
    if (typeof patch.title !== "string" || !isValidTitle(patch.title)) {
      throw new Error("Todo title must not be empty.");
    }
  }

  if (patch.completed !== undefined && typeof patch.completed !== "boolean") {
    throw new Error("Todo completed must be a boolean.");
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

  create(title: string): Todo {
    if (!isValidTitle(title)) {
      throw new Error("Todo title must not be empty.");
    }

    const todo: Todo = {
      id: crypto.randomUUID(),
      title,
      completed: false,
    };

    this.#todos.set(todo.id, todo);
    return { ...todo };
  }

  clear(): void {
    this.#todos.clear();
  }

  list(): Todo[] {
    return Array.from(this.#todos.values(), (todo: Todo) => ({ ...todo }));
  }

  getById(id: string): Todo | null {
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
      id: current.id,
      title: patch.title ?? current.title,
      completed: patch.completed ?? current.completed,
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
