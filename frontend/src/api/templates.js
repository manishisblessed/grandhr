import api, { unwrap } from './client';

export const templatesApi = {
  list: (params = {}) => api.get('/templates', { params }).then(unwrap),
  get: (id) => api.get(`/templates/${id}`).then(unwrap),
  create: (payload) => api.post('/templates', payload).then(unwrap),
  update: (id, payload) => api.put(`/templates/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/templates/${id}`).then(unwrap),
  upload: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api
      .post('/templates/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(unwrap);
  },
  send: (id, payload) => api.post(`/templates/${id}/send`, payload).then(unwrap),
  preview: (id, payload) => api.post(`/templates/${id}/preview`, payload).then(unwrap),
};
