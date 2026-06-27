import { createTodoHandler } from "./src/todos/http.ts";
import { InMemoryTodoStore } from "./src/todos/store.ts";

const store = new InMemoryTodoStore();

export const handler = createTodoHandler(store);

if (import.meta.main) {
  const port = Number(Deno.env.get("PORT") ?? 8000);
  console.log(`iFactory Product on http://localhost:${port}`);
  Deno.serve({ port }, handler);
}
