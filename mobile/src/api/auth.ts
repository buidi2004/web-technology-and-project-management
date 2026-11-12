import { api } from './client';
import type { AuthResponse, User } from './types';

export const authApi = {
  login: (studentCode: string, password: string) =>
    api.post<AuthResponse>('/api/auth/login', { studentCode, password }),

  register: (studentCode: string, fullName: string, password: string) =>
    api.post<AuthResponse>('/api/auth/register', { studentCode, fullName, password }),

  me: () => api.get<User>('/api/me'),
};
