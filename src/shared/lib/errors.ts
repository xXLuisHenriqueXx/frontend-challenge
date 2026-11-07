import { isAxiosError } from "axios";
import type { ApiError } from "../api/api-error";

export type AppError =
  | {
      kind: "api";
      message: string;
      code: string;
      fields: Record<string, string>;
      status: number;
    }
  | { kind: "network"; message: string }
  | { kind: "unexpected"; message: string };

export function normalizeError(error: unknown): AppError {
  if (isAxiosError<ApiError>(error)) {
    const message =
      error.response?.data.message ?? "Falha de conexão. Tente novamente.";
    return error.response
      ? {
          kind: "api",
          message,
          code: error.response.data.code,
          fields: error.response.data.fields ?? {},
          status: error.response.status,
        }
      : { kind: "network", message };
  }
  return {
    kind: "unexpected",
    message: error instanceof Error ? error.message : "Falha inesperada",
  };
}

export const message = (error: unknown) => normalizeError(error).message;
export function errorsFor(error: unknown): Record<string, string> {
  const normalized = normalizeError(error);
  return normalized.kind === "api" ? normalized.fields : {};
}
