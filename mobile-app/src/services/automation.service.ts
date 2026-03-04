import api from './api';

export interface AutomationJob {
  id: string;
  name: string;
  type: string;
  schedule: string;
  status: string;
  lastRun?: string;
  nextRun?: string;
  runCount: number;
  isActive: boolean;
  config?: Record<string, any>;
  createdAt: string;
}

export const AutomationService = {
  getAll: () => api.get<{ jobs: AutomationJob[] }>('/automation'),

  create: (data: { name: string; type: string; schedule: string }) =>
    api.post('/automation', data),

  run: (id: string) => api.post(`/automation/${id}/run`),

  toggle: (id: string, isActive: boolean) =>
    api.patch(`/automation/${id}/toggle`, { isActive }),

  delete: (id: string) => api.delete(`/automation/${id}`),
};
