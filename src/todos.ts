export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const todos: Todo[] = [];
let nextTodoId = 1;

export function createTodo(title: string): Todo {
  const todo: Todo = {
    id: nextTodoId++,
    title,
    completed: false,
  };

  todos.push(todo);
  return todo;
}

// In-memory and ephemeral storage for this PoC. Data is reset on reload/restart.
export function listTodos(): readonly Todo[] {
  return todos;
}
