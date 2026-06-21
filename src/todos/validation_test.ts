import {
  assertEquals,
  assertObjectMatch,
} from "@std/assert";
import {
  validateCreateTodoInput,
  validateUpdateTodoInput,
} from "./validation.ts";

Deno.test("validateCreateTodoInput aceita title válido e faz trim", () => {
  const result = validateCreateTodoInput({ title: "  Comprar pão  " });

  assertEquals(result, {
    ok: true,
    value: {
      title: "Comprar pão",
    },
  });
});

Deno.test("validateCreateTodoInput rejeita payload que não é objeto", () => {
  const result = validateCreateTodoInput("invalid");

  assertEquals(result, {
    ok: false,
    error: "Payload must be an object.",
  });
});

Deno.test("validateCreateTodoInput rejeita title ausente ou inválido", () => {
  assertEquals(validateCreateTodoInput({}), {
    ok: false,
    error: 'Field "title" must be a string.',
  });

  assertEquals(validateCreateTodoInput({ title: 123 }), {
    ok: false,
    error: 'Field "title" must be a string.',
  });
});

Deno.test("validateCreateTodoInput rejeita title vazio após trim", () => {
  const result = validateCreateTodoInput({ title: "   " });

  assertEquals(result, {
    ok: false,
    error: 'Field "title" cannot be empty.',
  });
});

Deno.test("validateUpdateTodoInput aceita title e completed válidos", () => {
  const result = validateUpdateTodoInput({
    title: "  Estudar Deno  ",
    completed: true,
  });

  assertEquals(result, {
    ok: true,
    value: {
      title: "Estudar Deno",
      completed: true,
    },
  });
});

Deno.test("validateUpdateTodoInput aceita atualização parcial", () => {
  const result = validateUpdateTodoInput({ completed: false });

  assertEquals(result, {
    ok: true,
    value: {
      completed: false,
    },
  });
});

Deno.test("validateUpdateTodoInput rejeita payload sem campos permitidos", () => {
  const result = validateUpdateTodoInput({ other: "value" });

  assertEquals(result, {
    ok: false,
    error: 'At least one of "title" or "completed" must be provided.',
  });
});

Deno.test("validateUpdateTodoInput rejeita title inválido", () => {
  const invalidType = validateUpdateTodoInput({ title: 1 });
  const invalidEmpty = validateUpdateTodoInput({ title: "   " });

  assertObjectMatch(invalidType, {
    ok: false,
    error: 'Field "title" must be a string.',
  });

  assertObjectMatch(invalidEmpty, {
    ok: false,
    error: 'Field "title" cannot be empty.',
  });
});

Deno.test("validateUpdateTodoInput rejeita completed inválido", () => {
  const result = validateUpdateTodoInput({ completed: "yes" });

  assertEquals(result, {
    ok: false,
    error: 'Field "completed" must be a boolean.',
  });
});
