import { API_BASE_URL } from '../lib/config';
import { clearStoredToken, getStoredToken, storeToken } from '../lib/storage';

let token: string | null = null;

export async function loadAuthToken(): Promise<string | null> {
  token = await getStoredToken();
  return token;
}

export async function setAuthToken(next: string | null): Promise<void> {
  token = next;
  if (next) await storeToken(next);
  else await clearStoredToken();
}

interface ProblemDetails {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn';
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(
      `Không kết nối được API tại ${API_BASE_URL}. Kiểm tra EXPO_PUBLIC_API_URL và backend.`,
      0,
    );
  }

  if (response.status === 204) return undefined as T;

  const data = await readBody(response);

  if (!response.ok) {
    const problem = (data && typeof data === 'object' ? data : {}) as ProblemDetails;
    const firstFieldError = problem.errors
      ? Object.values(problem.errors).flat()[0]
      : undefined;

    throw new ApiError(
      problem.detail ?? firstFieldError ?? problem.title ?? `Yêu cầu thất bại (${response.status})`,
      response.status,
      problem.errors,
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
};
