export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateTodoInput = Readonly<{
  title: string;
}>;

export type UpdateTodoInput = Readonly<{
  title?: string;
  completed?: boolean;
}>;
