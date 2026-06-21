export interface JsonErrorBody {
  error: string;
  message: string;
}

export function jsonError(
  error: string,
  message: string,
  status = 400,
): Response {
  const body: JsonErrorBody = {
    error,
    message,
  };

  return Response.json(body, { status });
}
