import {
  assertEquals,
  assertMatch,
  assertNotEquals,
} from "@std/assert";
import { InMemoryTodoStore } from "./todos.ts";

Deno.test("create preserves title and applies default values", () => {
  const store = new InMemoryTodoStore();

  const todo = store.create("Comprar pão");

  assertEquals(todo.title, "Comprar pão");
  assertEquals(todo.completed, false);
  assertMatch(
    todo.createdAt,
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
  );
});

Deno.test("create generates unique ids", () => {
  const store = new InMemoryTodoStore();

  const first = store.create("Primeira tarefa");
  const second = store.create("Segunda tarefa");

  assertNotEquals(first.id, second.id);
});

Deno.test("list returns currently stored todos", () => {
  const store = new InMemoryTodoStore();

  const first = store.create("Primeira tarefa");
  const second = store.create("Segunda tarefa");

  assertEquals(store.list(), [first, second]);
});
