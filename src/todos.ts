export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

const todos: Todo[] = [];

export function createTodo(title: string): Todo {
  const todo: Todo = {
    id: crypto.randomUUID(),
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.push(todo);
  return todo;
}

export function listTodos(): Todo[] {
  return [...todos];
}

export function resetTodos(): void {
  todos.length = 0;
}
