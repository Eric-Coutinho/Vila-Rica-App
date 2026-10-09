import { clearSession, getAccessToken } from "./session";

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_BASE_URL = (
  configuredBaseUrl || "http://localhost:3000/api"
).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  authenticated = false,
): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new ApiError("Sessão não encontrada. Faça login novamente.", 401);
    }
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...options,
    headers,
  });

  if (authenticated && response.status === 401) {
    await clearSession();
  }

  return response;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof TypeError) return "Não foi possível conectar à API.";
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

