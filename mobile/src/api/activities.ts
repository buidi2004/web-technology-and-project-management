import { api } from './client';
import type { Activity, RegistrationResult } from './types';

export const activitiesApi = {
  list: () => api.get<Activity[]>('/api/activities'),

  get: (id: number) => api.get<Activity>(`/api/activities/${id}`),

  register: (id: number) =>
    api.post<RegistrationResult>(`/api/activities/${id}/register`),

  checkIn: (id: number, code: string) =>
    api.post<void>(`/api/activities/${id}/check-in`, { code }),
};
