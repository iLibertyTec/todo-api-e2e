import { assertEquals } from "@std/assert";
import type { CreateTodoInput, Todo, TodoListResponse } from "./todo.ts";

Deno.test("Todo contract aceita os campos esperados", (): void => {
  const todo: Todo = {
    id: "todo-1",
    title: "Estudar Deno",
    completed: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  assertEquals(todo.title, "Estudar Deno");
  assertEquals(todo.completed, false);
});

Deno.test("CreateTodoInput expõe title e TodoListResponse expõe items", (): void => {
  const input: CreateTodoInput = {
    title: "Nova tarefa",
  };
  const response: TodoListResponse = {
    items: [
      {
        id: "todo-1",
        title: input.title,
        completed: false,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ],
  };

  assertEquals(response.items[0].title, "Nova tarefa");
  assertEquals(response.items.length, 1);
});
