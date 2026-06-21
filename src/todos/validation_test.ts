import { assertEquals, assertThrows } from "@std/assert";
import {
  validateCreateTodoInput,
  validateUpdateTodoInput,
} from "./validation.ts";

Deno.test("validateCreateTodoInput normaliza o title com trim", (): void => {
  const input = validateCreateTodoInput({ title: "  Estudar Deno  " });

  assertEquals(input, { title: "Estudar Deno" });
});

Deno.test("validateCreateTodoInput rejeita title vazio", (): void => {
  assertThrows(
    (): void => {
      validateCreateTodoInput({ title: "   " });
    },
    Error,
    "title must not be empty",
  );
});

Deno.test("validateUpdateTodoInput exige ao menos um campo", (): void => {
  assertThrows(
    (): void => {
      validateUpdateTodoInput({});
    },
    Error,
    "update must include at least one field",
  );
});

Deno.test("validateUpdateTodoInput normaliza title quando informado", (): void => {
  const input = validateUpdateTodoInput({ title: "  Título final  " });

  assertEquals(input, { title: "Título final" });
});

Deno.test("validateUpdateTodoInput preserva completed sem alterar", (): void => {
  const input = validateUpdateTodoInput({ completed: true });

  assertEquals(input, { completed: true });
});

Deno.test("validateUpdateTodoInput rejeita title vazio", (): void => {
  assertThrows(
    (): void => {
      validateUpdateTodoInput({ title: "   " });
    },
    Error,
    "title must not be empty",
  );
});
