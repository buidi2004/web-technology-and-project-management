import { api } from './client';
import type { MyParticipation, Summary } from './types';

export const participationsApi = {
  mine: () => api.get<MyParticipation[]>('/api/me/participations'),

  summary: () => api.get<Summary>('/api/me/summary'),
};
