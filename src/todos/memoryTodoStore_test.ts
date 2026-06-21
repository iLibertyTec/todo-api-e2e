import {
  assert,
  assertEquals,
  assertNotEquals,
  assertNotStrictEquals,
} from "@std/assert";
import { MemoryTodoStore } from "./memoryTodoStore.ts";
import { Todo } from "./types.ts";

Deno.test("MemoryTodoStore starts empty by default", (): void => {
  const store = new MemoryTodoStore();

  assertEquals(store.list(), []);
});

Deno.test("MemoryTodoStore creates todo with generated id, completed false and timestamps", (): void => {
  const store = new MemoryTodoStore();

  const todo: Todo = store.create({ title: "Comprar pão" });

  assertEquals(todo.id, "1");
  assertEquals(todo.title, "Comprar pão");
  assertEquals(todo.completed, false);
  assert(todo.createdAt.length > 0);
  assert(todo.updatedAt.length > 0);
  assertEquals(todo.createdAt, todo.updatedAt);
});

Deno.test("MemoryTodoStore lists todos in creation order", (): void => {
  const store = new MemoryTodoStore();

  const first: Todo = store.create({ title: "Primeiro" });
  const second: Todo = store.create({ title: "Segundo" });

  assertEquals(store.list(), [first, second]);
});

Deno.test("MemoryTodoStore getById returns matching todo or undefined", (): void => {
  const store = new MemoryTodoStore();

  const created: Todo = store.create({ title: "Encontrar item" });

  assertEquals(store.getById(created.id), created);
  assertEquals(store.getById("999"), undefined);
});

Deno.test("MemoryTodoStore update changes provided fields, updates updatedAt and preserves other fields", async (): Promise<void> => {
  const store = new MemoryTodoStore();
  const created: Todo = store.create({ title: "Original" });

  await new Promise((resolve: () => void): number => setTimeout(resolve, 2));

  const updated: Todo | undefined = store.update(created.id, {
    title: "Atualizado",
    completed: true,
  });

  assert(updated);
  assertEquals(updated.id, created.id);
  assertEquals(updated.title, "Atualizado");
  assertEquals(updated.completed, true);
  assertEquals(updated.createdAt, created.createdAt);
  assertNotEquals(updated.updatedAt, created.updatedAt);
});

Deno.test("MemoryTodoStore remove returns success only when todo exists", (): void => {
  const store = new MemoryTodoStore();
  const created: Todo = store.create({ title: "Remover item" });

  assertEquals(store.remove(created.id), true);
  assertEquals(store.remove(created.id), false);
  assertEquals(store.remove("inexistente"), false);
});

Deno.test("MemoryTodoStore returns defensive copies", (): void => {
  const store = new MemoryTodoStore();
  const created: Todo = store.create({ title: "Imutável" });

  const fetched: Todo | undefined = store.getById(created.id);
  const listed: Todo[] = store.list();

  assert(fetched);
  assertNotStrictEquals(fetched, created);
  assertNotStrictEquals(listed[0], created);

  fetched.title = "Mutado fora";
  listed[0].completed = true;

  assertEquals(store.getById(created.id), created);
});
