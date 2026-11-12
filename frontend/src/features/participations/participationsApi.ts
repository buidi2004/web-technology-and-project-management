import { api } from '../../lib/api';
import type { MyParticipation, Summary } from '../../lib/types';

export const participationsApi = {
  mine: () => api.get<MyParticipation[]>('/api/me/participations'),

  summary: () => api.get<Summary>('/api/me/summary'),

  verify: (participationId: number, approve: boolean) =>
    api.post<void>(`/api/participations/${participationId}/verify`, { approve }),
};
