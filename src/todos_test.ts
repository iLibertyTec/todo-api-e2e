import {
  assert,
  assertEquals,
  assertMatch,
  assertNotEquals,
} from "@std/assert";
import { TodoStore } from "./todos.ts";

Deno.test("create returns a todo with expected defaults", () => {
  const store = new TodoStore();

  const todo = store.create("Estudar Deno");

  assertEquals(todo.title, "Estudar Deno");
  assertEquals(todo.completed, false);
  assertMatch(todo.id, /^[0-9a-f-]{36}$/i);
  assert(!Number.isNaN(Date.parse(todo.createdAt)));
});

Deno.test("create generates unique ids", () => {
  const store = new TodoStore();

  const first = store.create("Primeira tarefa");
  const second = store.create("Segunda tarefa");

  assertNotEquals(first.id, second.id);
});

Deno.test("list returns current todos", () => {
  const store = new TodoStore();

  const first = store.create("Primeira tarefa");
  const second = store.create("Segunda tarefa");

  assertEquals(store.list(), [first, second]);
});

Deno.test("list does not allow accidental mutation of internal state", () => {
  const store = new TodoStore();

  store.create("Tarefa original");
  const listed = store.list();

  listed[0].title = "Tarefa alterada";
  listed.push({
    id: "extra",
    title: "Extra",
    completed: true,
    createdAt: new Date().toISOString(),
  });

  assertEquals(store.list(), [
    {
      id: store.list()[0].id,
      title: "Tarefa original",
      completed: false,
      createdAt: store.list()[0].createdAt,
    },
  ]);
});
