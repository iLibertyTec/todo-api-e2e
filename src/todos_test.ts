import {
  assertEquals,
  assertNotStrictEquals,
  assertThrows,
} from "@std/assert";
import { InMemoryTodoRepository, type Todo } from "./todos.ts";

Deno.test("InMemoryTodoRepository.findById returns a copy of the todo", () => {
  const initialTodo: Todo = {
    id: "todo-1",
    title: "Comprar leite",
    completed: false,
  };
  const repository = new InMemoryTodoRepository([initialTodo]);

  const found = repository.findById("todo-1");

  assertEquals(found, initialTodo);
  assertNotStrictEquals(found, initialTodo);
  assertEquals(repository.findById("missing"), null);
});

Deno.test("InMemoryTodoRepository.patch updates only editable fields", () => {
  const repository = new InMemoryTodoRepository([
    {
      id: "todo-1",
      title: "Comprar leite",
      completed: false,
    },
  ]);

  const updatedTitle = repository.patch("todo-1", {
    title: "Comprar pão",
  });
  const updatedCompleted = repository.patch("todo-1", {
    completed: true,
  });

  assertEquals(updatedTitle, {
    id: "todo-1",
    title: "Comprar pão",
    completed: false,
  });
  assertEquals(updatedCompleted, {
    id: "todo-1",
    title: "Comprar pão",
    completed: true,
  });
  assertEquals(repository.findById("todo-1"), {
    id: "todo-1",
    title: "Comprar pão",
    completed: true,
  });
  assertEquals(repository.patch("missing", { completed: true }), null);
});

Deno.test("InMemoryTodoRepository.remove deletes and returns removed todo", () => {
  const repository = new InMemoryTodoRepository([
    {
      id: "todo-1",
      title: "Comprar leite",
      completed: false,
    },
  ]);

  const removed = repository.remove("todo-1");

  assertEquals(removed, {
    id: "todo-1",
    title: "Comprar leite",
    completed: false,
  });
  assertEquals(repository.findById("todo-1"), null);
  assertEquals(repository.list(), []);
  assertEquals(repository.remove("missing"), null);
});

Deno.test("InMemoryTodoRepository rejects empty title updates", () => {
  const repository = new InMemoryTodoRepository([
    {
      id: "todo-1",
      title: "Comprar leite",
      completed: false,
    },
  ]);

  assertThrows(() => repository.patch("todo-1", { title: "   " }), Error);
  assertEquals(repository.findById("todo-1"), {
    id: "todo-1",
    title: "Comprar leite",
    completed: false,
  });
});
