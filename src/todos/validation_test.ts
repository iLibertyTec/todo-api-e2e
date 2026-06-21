import { assertEquals, assertThrows } from "@std/assert";
import {
  validateCreateTodoInput,
  validateUpdateTodoInput,
} from "./validation.ts";

Deno.test("validateCreateTodoInput normaliza título com trim", (): void => {
  const result = validateCreateTodoInput({ title: "  Estudar Deno  " });

  assertEquals(result, { title: "Estudar Deno" });
});

Deno.test("validateCreateTodoInput rejeita payload que não é objeto", (): void => {
  assertThrows(
    (): void => {
      validateCreateTodoInput(null);
    },
    Error,
    "input must be an object",
  );
});

Deno.test("validateCreateTodoInput rejeita título inválido", (): void => {
  assertThrows(
    (): void => {
      validateCreateTodoInput({ title: 123 });
    },
    Error,
    "title must be a string",
  );
});

Deno.test("validateCreateTodoInput rejeita título vazio", (): void => {
  assertThrows(
    (): void => {
      validateCreateTodoInput({ title: "   " });
    },
    Error,
    "title must not be empty",
  );
});

Deno.test("validateUpdateTodoInput normaliza campos válidos", (): void => {
  const result = validateUpdateTodoInput({
    title: "  Atualizado  ",
    completed: true,
  });

  assertEquals(result, {
    title: "Atualizado",
    completed: true,
  });
});

Deno.test("validateUpdateTodoInput rejeita payload que não é objeto", (): void => {
  assertThrows(
    (): void => {
      validateUpdateTodoInput(undefined);
    },
    Error,
    "input must be an object",
  );
});

Deno.test("validateUpdateTodoInput rejeita update vazio", (): void => {
  assertThrows(
    (): void => {
      validateUpdateTodoInput({});
    },
    Error,
    "update must include at least one field",
  );
});

Deno.test("validateUpdateTodoInput rejeita title inválido", (): void => {
  assertThrows(
    (): void => {
      validateUpdateTodoInput({ title: 123 });
    },
    Error,
    "title must be a string",
  );
});

Deno.test("validateUpdateTodoInput rejeita completed inválido", (): void => {
  assertThrows(
    (): void => {
      validateUpdateTodoInput({ completed: "sim" });
    },
    Error,
    "completed must be a boolean",
  );
});
