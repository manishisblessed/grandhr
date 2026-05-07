import api, { unwrap } from './client';

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats').then(unwrap).catch(() => ({})),
  recent: () => api.get('/dashboard/recent').then(unwrap).catch(() => ({})),
};
