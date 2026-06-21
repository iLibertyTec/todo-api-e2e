import {
  assertEquals,
  assertNotEquals,
  assertStrictEquals,
} from "@std/assert";
import { InMemoryTodoStore } from "./memory_store.ts";

deno.test("InMemoryTodoStore cria e lista tarefas", (): void => {
  const store = new InMemoryTodoStore({
    createId: () => "todo-1",
    now: () => "2024-01-01T00:00:00.000Z",
  });

  const created = store.create({ title: "Estudar Deno" });
  const listed = store.list();

  assertEquals(created, {
    id: "todo-1",
    title: "Estudar Deno",
    completed: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  });
  assertEquals(listed, [created]);
});

deno.test("InMemoryTodoStore busca tarefa por id", (): void => {
  const store = new InMemoryTodoStore({
    createId: () => "todo-1",
    now: () => "2024-01-01T00:00:00.000Z",
  });

  store.create({ title: "Estudar Fresh" });

  const found = store.getById("todo-1");
  const missing = store.getById("todo-inexistente");

  assertEquals(found, {
    id: "todo-1",
    title: "Estudar Fresh",
    completed: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  });
  assertStrictEquals(missing, undefined);
});

deno.test("InMemoryTodoStore atualiza title e completed de tarefa existente", (): void => {
  let nowCall = 0;
  const store = new InMemoryTodoStore({
    createId: () => "todo-1",
    now: () => {
      nowCall += 1;
      return nowCall === 1
        ? "2024-01-01T00:00:00.000Z"
        : "2024-01-01T01:00:00.000Z";
    },
  });

  store.create({ title: "Título inicial" });
  const updated = store.update("todo-1", {
    title: "Título final",
    completed: true,
  });

  assertEquals(updated, {
    id: "todo-1",
    title: "Título final",
    completed: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T01:00:00.000Z",
  });
});

deno.test("InMemoryTodoStore retorna undefined ao atualizar id inexistente", (): void => {
  const store = new InMemoryTodoStore();

  const updated = store.update("todo-inexistente", { completed: true });

  assertStrictEquals(updated, undefined);
});

deno.test("InMemoryTodoStore retorna cópias defensivas", (): void => {
  const store = new InMemoryTodoStore({
    createId: () => "todo-1",
    now: () => "2024-01-01T00:00:00.000Z",
  });

  const created = store.create({ title: "Original" });
  created.title = "Mutado fora do store";

  const fetched = store.getById("todo-1");
  const listed = store.list();

  assertNotEquals(created.title, fetched?.title);
  assertEquals(fetched?.title, "Original");
  assertEquals(listed[0]?.title, "Original");
});
