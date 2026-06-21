import {
  assertEquals,
  assertNotEquals,
  assertStrictEquals,
} from "@std/assert";
import { MemoryTodoStore } from "./memoryTodoStore.ts";
import type { Todo } from "./types.ts";

Deno.test("MemoryTodoStore starts empty by default", (): void => {
  const store = new MemoryTodoStore();

  assertEquals(store.list(), []);
});

Deno.test("MemoryTodoStore creates todo with generated id and timestamps", (): void => {
  const store = new MemoryTodoStore();

  const todo = store.create({ title: "Comprar pão" });

  assertEquals(todo.id, "1");
  assertEquals(todo.title, "Comprar pão");
  assertEquals(todo.completed, false);
  assertNotEquals(Date.parse(todo.createdAt), Number.NaN);
  assertNotEquals(Date.parse(todo.updatedAt), Number.NaN);
  assertEquals(todo.createdAt, todo.updatedAt);
  assertEquals(store.list(), [todo]);
});

Deno.test("MemoryTodoStore lists todos in creation order", (): void => {
  const store = new MemoryTodoStore();

  const first = store.create({ title: "Primeira" });
  const second = store.create({ title: "Segunda" });
  const third = store.create({ title: "Terceira" });

  assertEquals(store.list(), [first, second, third]);
});

Deno.test("MemoryTodoStore gets todo by id or returns undefined", (): void => {
  const store = new MemoryTodoStore();
  const created = store.create({ title: "Estudar Deno" });

  assertEquals(store.getById(created.id), created);
  assertStrictEquals(store.getById("missing"), undefined);
});

Deno.test("MemoryTodoStore updates title and completed preserving other fields", async (): Promise<void> => {
  const store = new MemoryTodoStore();
  const created = store.create({ title: "Original" });

  await new Promise((resolve): number => setTimeout(resolve, 1));

  const updated = store.update(created.id, {
    title: "Atualizado",
    completed: true,
  });

  assertEquals(updated, {
    id: created.id,
    title: "Atualizado",
    completed: true,
    createdAt: created.createdAt,
    updatedAt: updated?.updatedAt,
  });
  assertNotEquals(updated?.updatedAt, created.updatedAt);
  assertEquals(store.getById(created.id), updated);
});

Deno.test("MemoryTodoStore update returns undefined for missing id", (): void => {
  const store = new MemoryTodoStore();

  assertStrictEquals(
    store.update("missing", { title: "Nada", completed: true }),
    undefined,
  );
});

Deno.test("MemoryTodoStore deletes existing todo and reports success correctly", (): void => {
  const store = new MemoryTodoStore();
  const created = store.create({ title: "Remover" });

  assertEquals(store.delete(created.id), true);
  assertEquals(store.delete(created.id), false);
  assertEquals(store.list(), []);
});

Deno.test("MemoryTodoStore returns defensive copies", (): void => {
  const seed: Todo = {
    id: "10",
    title: "Seed",
    completed: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };
  const store = new MemoryTodoStore([seed]);

  const listed = store.list();
  listed[0].title = "Alterado fora";

  const fetched = store.getById("10");

  assertEquals(fetched?.title, "Seed");
});
