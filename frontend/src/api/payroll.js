import api, { unwrap } from './client';

export const payrollApi = {
  myPayrolls: () => api.get('/payroll/my-payrolls').then(unwrap),
  get: (id) => api.get(`/payroll/${id}`).then(unwrap),
  // Admin
  list: (params = {}) => api.get('/payroll', { params }).then(unwrap),
  generate: (payload) => api.post('/payroll/generate', payload).then(unwrap),
  create: (payload) => api.post('/payroll', payload).then(unwrap),
  update: (id, payload) => api.put(`/payroll/${id}`, payload).then(unwrap),
};
