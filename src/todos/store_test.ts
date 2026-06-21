import {
  assert,
  assertEquals,
  assertNotEquals,
} from "@std/assert";
import { InMemoryTodoStore } from "./store.ts";

deno.test("InMemoryTodoStore starts empty per instance", () => {
  const storeA: InMemoryTodoStore = new InMemoryTodoStore();
  const storeB: InMemoryTodoStore = new InMemoryTodoStore();

  storeA.create({ title: "Todo A" });

  assertEquals(storeA.list().length, 1);
  assertEquals(storeB.list(), []);
});

deno.test("InMemoryTodoStore creates and lists todos", () => {
  const store: InMemoryTodoStore = new InMemoryTodoStore();

  const todo = store.create({ title: "Comprar café" });
  const todos = store.list();

  assertEquals(todo.id, "1");
  assertEquals(todo.title, "Comprar café");
  assertEquals(todo.completed, false);
  assert(todo.createdAt instanceof Date);
  assert(todo.updatedAt instanceof Date);
  assertEquals(todos.length, 1);
  assertEquals(todos[0], todo);
});

deno.test("InMemoryTodoStore gets todo by id", () => {
  const store: InMemoryTodoStore = new InMemoryTodoStore();
  const created = store.create({ title: "Estudar Deno" });

  const found = store.getById(created.id);

  assertEquals(found, created);
  assertEquals(store.getById("missing"), undefined);
});

deno.test("InMemoryTodoStore updates todo fields", async () => {
  const store: InMemoryTodoStore = new InMemoryTodoStore();
  const created = store.create({ title: "Inicial" });

  await new Promise((resolve) => setTimeout(resolve, 1));

  const updated = store.update(created.id, {
    title: "Atualizada",
    completed: true,
  });

  assert(updated);
  assertEquals(updated.id, created.id);
  assertEquals(updated.title, "Atualizada");
  assertEquals(updated.completed, true);
  assertEquals(updated.createdAt, created.createdAt);
  assertNotEquals(updated.updatedAt, created.updatedAt);
  assertEquals(store.update("missing", { title: "X" }), undefined);
});

deno.test("InMemoryTodoStore deletes todo", () => {
  const store: InMemoryTodoStore = new InMemoryTodoStore();
  const created = store.create({ title: "Remover" });

  assertEquals(store.delete(created.id), true);
  assertEquals(store.getById(created.id), undefined);
  assertEquals(store.delete(created.id), false);
});

deno.test("InMemoryTodoStore reset clears state", () => {
  const store: InMemoryTodoStore = new InMemoryTodoStore();

  store.create({ title: "Primeiro" });
  store.create({ title: "Segundo" });
  store.reset();

  assertEquals(store.list(), []);

  const recreated = store.create({ title: "Novo" });
  assertEquals(recreated.id, "1");
});
