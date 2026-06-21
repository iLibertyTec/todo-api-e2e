export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  title: string;
}

export interface TodoListResponse {
  items: Todo[];
}

export interface TodoStore {
  list(): Todo[];
  create(input: CreateTodoInput): Todo;
}
