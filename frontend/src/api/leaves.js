import api, { unwrap } from './client';

export const leavesApi = {
  // ----- Employee actions -----
  myLeaves: () => api.get('/leaves/my-leaves').then(unwrap),
  myBalance: () => api.get('/leaves/balance').then(unwrap),
  apply: (payload) => api.post('/leaves', payload).then(unwrap),
  cancel: (id) => api.post(`/leaves/${id}/cancel`).then(unwrap),

  // ----- Admin / HR actions -----
  list: (params = {}) => api.get('/leaves', { params }).then(unwrap),
  get: (id) => api.get(`/leaves/${id}`).then(unwrap),
  updateStatus: (id, payload) => api.put(`/leaves/${id}/status`, payload).then(unwrap),
  approve: (id) => api.put(`/leaves/${id}/status`, { status: 'APPROVED' }).then(unwrap),
  reject: (id, rejectedReason) =>
    api.put(`/leaves/${id}/status`, { status: 'REJECTED', rejectedReason }).then(unwrap),
};
