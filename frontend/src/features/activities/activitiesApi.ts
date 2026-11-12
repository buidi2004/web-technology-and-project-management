import { api } from '../../lib/api';
import type {
  Activity,
  ActivityCreated,
  ActivityParticipation,
  CreateActivityInput,
  RegistrationResult,
} from '../../lib/types';

export const activitiesApi = {
  list: () => api.get<Activity[]>('/api/activities'),

  get: (id: number) => api.get<Activity>(`/api/activities/${id}`),

  create: (input: CreateActivityInput) =>
    api.post<ActivityCreated>('/api/activities', input),

  qr: (id: number) => api.get<{ qr: string }>(`/api/activities/${id}/qr`),

  register: (id: number) =>
    api.post<RegistrationResult>(`/api/activities/${id}/register`),

  checkIn: (id: number, code: string) =>
    api.post<void>(`/api/activities/${id}/check-in`, { code }),

  participations: (id: number) =>
    api.get<ActivityParticipation[]>(`/api/activities/${id}/participations`),
};
