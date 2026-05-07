import api, { unwrap } from './client';

export const employeesApi = {
  list: (params = {}) => api.get('/employees', { params }).then(unwrap),
  get: (id) => api.get(`/employees/${id}`).then(unwrap),
  create: (payload) => api.post('/employees', payload).then(unwrap),
  update: (id, payload) => api.put(`/employees/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/employees/${id}`).then(unwrap),
  byDepartment: (department) => api.get(`/employees/department/${department}`).then(unwrap),
  resendCredentials: (id) => api.post(`/employees/${id}/resend-credentials`).then(unwrap),
};
