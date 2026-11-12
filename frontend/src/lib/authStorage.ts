import type { User } from './types';

const STORAGE_KEY = 'ctxh.auth';

export interface StoredAuth {
  token: string;
  user: User;
}

export function readAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredAuth>;
    if (typeof parsed.token !== 'string' || !parsed.user) return null;

    return parsed as StoredAuth;
  } catch {
    return null;
  }
}

export function writeAuth(auth: StoredAuth): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}
