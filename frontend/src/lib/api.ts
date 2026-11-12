import { readAuth } from './authStorage';
import type { ActivityType, ParticipationStatus, Role } from './types';

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000').replace(/\/+$/, '');

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
  const auth = readAuth();
  const headers = new Headers(init.headers);

  if (init.body !== undefined) headers.set('Content-Type', 'application/json');
  if (auth?.token) headers.set('Authorization', `Bearer ${auth.token}`);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(
      `Không kết nối được API tại ${BASE_URL}. Kiểm tra backend đã chạy chưa.`,
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

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn';
}

export const roleLabels: Record<Role, string> = {
  Student: 'Sinh viên',
  Organizer: 'Cán bộ Đoàn - Hội',
  Admin: 'Quản trị viên',
};

export const activityTypeLabels: Record<ActivityType, string> = {
  CongTacXaHoi: 'Công tác xã hội',
  LaoDong: 'Ngày lao động',
};

export const participationStatusLabels: Record<ParticipationStatus, string> = {
  Registered: 'Đã đăng ký',
  CheckedIn: 'Đã điểm danh',
  Verified: 'Đã xác nhận',
  Rejected: 'Bị từ chối',
};
