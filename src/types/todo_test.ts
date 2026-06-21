import { assertEquals } from "@std/assert";

import type { Todo, TodoListResponse } from "./todo.ts";

Deno.test("Todo possui o formato esperado", (): void => {
  const todo: Todo = {
    id: "todo-1",
    title: "Estudar Deno",
    completed: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  assertEquals(todo.id, "todo-1");
  assertEquals(todo.title, "Estudar Deno");
  assertEquals(todo.completed, false);
  assertEquals(todo.createdAt, "2024-01-01T00:00:00.000Z");
  assertEquals(todo.updatedAt, "2024-01-01T00:00:00.000Z");
});

Deno.test("TodoListResponse agrupa itens Todo", (): void => {
  const response: TodoListResponse = {
    items: [
      {
        id: "todo-1",
        title: "Estudar Deno",
        completed: false,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ],
  };

  assertEquals(response.items.length, 1);
  assertEquals(response.items[0]?.title, "Estudar Deno");
});
