import {
  assertEquals,
  assertNotEquals,
  assertStrictEquals,
  assertThrows,
} from "@std/assert";
import { InMemoryTodoStore } from "./memory_store.ts";

Deno.test("InMemoryTodoStore cria e lista tarefas", (): void => {
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

Deno.test("InMemoryTodoStore lista múltiplas tarefas em ordem de criação", (): void => {
  let idCounter = 0;
  let nowCounter = 0;
  const timestamps = [
    "2024-01-01T00:00:00.000Z",
    "2024-01-01T01:00:00.000Z",
  ];
  const store = new InMemoryTodoStore({
    createId: () => {
      idCounter += 1;
      return `todo-${idCounter}`;
    },
    now: () => {
      const timestamp = timestamps[nowCounter] ?? timestamps[timestamps.length - 1];
      nowCounter += 1;
      return timestamp;
    },
  });

  const first = store.create({ title: "Primeira" });
  const second = store.create({ title: "Segunda" });

  assertEquals(store.list(), [first, second]);
});

Deno.test("InMemoryTodoStore busca tarefa por id", (): void => {
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

Deno.test("InMemoryTodoStore atualiza title e completed de tarefa existente", (): void => {
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

Deno.test("InMemoryTodoStore atualiza parcialmente sem sobrescrever campos ausentes", (): void => {
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
  const updated = store.update("todo-1", { completed: true });

  assertEquals(updated, {
    id: "todo-1",
    title: "Título inicial",
    completed: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T01:00:00.000Z",
  });
});

Deno.test("InMemoryTodoStore retorna undefined ao atualizar id inexistente", (): void => {
  const store = new InMemoryTodoStore();

  const updated = store.update("todo-inexistente", { completed: true });

  assertStrictEquals(updated, undefined);
});

Deno.test("InMemoryTodoStore aplica validação de domínio na criação", (): void => {
  const store = new InMemoryTodoStore();

  assertThrows(
    (): void => {
      store.create({ title: "   " });
    },
    Error,
    "title must not be empty",
  );
});

Deno.test("InMemoryTodoStore rejeita tipo inválido na criação", (): void => {
  const store = new InMemoryTodoStore();

  assertThrows(
    (): void => {
      store.create({ title: 123 } as unknown as { title: string });
    },
    Error,
    "title must be a string",
  );
});

Deno.test("InMemoryTodoStore aplica validação de domínio na atualização", (): void => {
  const store = new InMemoryTodoStore({
    createId: () => "todo-1",
    now: () => "2024-01-01T00:00:00.000Z",
  });

  store.create({ title: "Original" });

  assertThrows(
    (): void => {
      store.update("todo-1", {});
    },
    Error,
    "update must include at least one field",
  );
});

Deno.test("InMemoryTodoStore rejeita tipos inválidos na atualização", (): void => {
  const store = new InMemoryTodoStore({
    createId: () => "todo-1",
    now: () => "2024-01-01T00:00:00.000Z",
  });

  store.create({ title: "Original" });

  assertThrows(
    (): void => {
      store.update(
        "todo-1",
        { completed: "sim" } as unknown as { completed?: boolean },
      );
    },
    Error,
    "completed must be a boolean",
  );
});

Deno.test("InMemoryTodoStore retorna cópias defensivas", (): void => {
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

Deno.test("InMemoryTodoStore mantém estado interno após mutação da lista retornada", (): void => {
  const store = new InMemoryTodoStore({
    createId: () => "todo-1",
    now: () => "2024-01-01T00:00:00.000Z",
  });

  store.create({ title: "Original" });
  const listed = store.list();

  listed[0]!.title = "Mutado fora do store";
  listed.push({
    id: "todo-2",
    title: "Inserido fora do store",
    completed: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  });

  assertEquals(store.list(), [{
    id: "todo-1",
    title: "Original",
    completed: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  }]);
});

Deno.test("InMemoryTodoStore retorna cópia defensiva em update", (): void => {
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

  store.create({ title: "Original" });
  const updated = store.update("todo-1", { title: "Atualizado" });

  if (updated === undefined) {
    throw new Error("expected updated todo");
  }

  updated.title = "Mutado fora do store";
  const fetched = store.getById("todo-1");

  assertEquals(fetched?.title, "Atualizado");
  assertNotEquals(updated.title, fetched?.title);
});
