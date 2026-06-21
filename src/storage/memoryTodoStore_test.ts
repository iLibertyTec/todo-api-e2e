import {
  assertEquals,
  assertMatch,
  assertNotSame,
  assertThrows,
} from "@std/assert";
import { MemoryTodoStore } from "./memoryTodoStore.ts";

Deno.test("MemoryTodoStore lista tarefas inicialmente vazio", (): void => {
  const store = new MemoryTodoStore();

  assertEquals(store.list(), []);
});

Deno.test("MemoryTodoStore cria tarefa com título válido", (): void => {
  const store = new MemoryTodoStore();

  const todo = store.create({ title: "Comprar pão" });

  assertMatch(todo.id, /^[0-9a-f-]{36}$/i);
  assertEquals(todo.title, "Comprar pão");
  assertEquals(todo.completed, false);
  assertMatch(todo.createdAt, /^\d{4}-\d{2}-\d{2}T/);
  assertEquals(todo.updatedAt, todo.createdAt);
  assertEquals(store.list(), [todo]);
});

Deno.test("MemoryTodoStore rejeita título vazio de forma previsível", (): void => {
  const store = new MemoryTodoStore();

  assertThrows(
    (): void => {
      store.create({ title: "   " });
    },
    Error,
    "Title must not be empty",
  );
});

Deno.test("MemoryTodoStore não compartilha estado entre instâncias", (): void => {
  const storeA = new MemoryTodoStore();
  const storeB = new MemoryTodoStore();

  storeA.create({ title: "Tarefa A" });

  assertEquals(storeA.list().length, 1);
  assertEquals(storeB.list(), []);
});

Deno.test("MemoryTodoStore list retorna cópias defensivas em ordem de criação", (): void => {
  const store = new MemoryTodoStore();

  const first = store.create({ title: "Primeira" });
  const second = store.create({ title: "Segunda" });
  const listed = store.list();

  assertEquals(listed, [first, second]);
  assertNotSame(listed[0], first);
  assertNotSame(listed[1], second);

  listed[0].title = "Alterada externamente";

  assertEquals(store.list(), [first, second]);
});
