import { SERVICE_NAME } from "./src/config/service.ts";
import { handleHealth } from "./src/handlers/health.ts";
import { handleCreateTodo, handleListTodos } from "./src/handlers/todos.ts";
import { MemoryTodoStore } from "./src/storage/memoryTodoStore.ts";

const todoStore = new MemoryTodoStore();

export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/health") {
    if (req.method !== "GET") {
      return Response.json(
        { error: "method not allowed" },
        {
          status: 405,
          headers: {
            allow: "GET",
          },
        },
      );
    }

    return handleHealth();
  }

  if (url.pathname === "/api/todos") {
    if (req.method === "GET") {
      return handleListTodos(req, todoStore);
    }

    if (req.method === "POST") {
      return await handleCreateTodo(req, todoStore);
    }
  }

  if (url.pathname === "/") {
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Todo API</title>
    <style>
      :root {
        color-scheme: light dark;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: system-ui, sans-serif;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #0b1020;
        color: #e5e7eb;
      }

      main {
        width: min(680px, 92vw);
        padding: 32px;
        border-radius: 16px;
        background: #11182d;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      h1 {
        margin: 0 0 12px;
        font-size: 2rem;
      }

      p {
        margin: 0 0 16px;
        line-height: 1.5;
        color: #cbd5e1;
      }

      ul {
        margin: 0;
        padding-left: 20px;
        color: #cbd5e1;
      }

      code {
        color: #93c5fd;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Todo API</h1>
      <p>
        API simples para gerenciamento de tarefas, com endpoints para listar e
        criar todos.
      </p>
      <ul>
        <li><code>GET /health</code> verifica a saúde do serviço.</li>
        <li><code>GET /api/todos</code> retorna a lista de tarefas.</li>
        <li><code>POST /api/todos</code> cria uma nova tarefa.</li>
      </ul>
    </main>
  </body>
</html>`;
    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  return Response.json({ error: "not found" }, { status: 404 });
}

if (import.meta.main) {
  const port = Number(Deno.env.get("PORT") ?? 8000);
  console.log(`${SERVICE_NAME} on http://localhost:${port}`);
  Deno.serve({ port }, handler);
}
