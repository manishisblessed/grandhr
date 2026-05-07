import api, { unwrap } from './client';

export const documentsApi = {
  myDocuments: () => api.get('/generated-documents/me').then(unwrap).catch(() => ({ documents: [] })),
  list: (params = {}) => api.get('/generated-documents', { params }).then(unwrap),
  get: (id) => api.get(`/generated-documents/${id}`).then(unwrap),
  create: (payload) => api.post('/generated-documents', payload).then(unwrap),
  remove: (id) => api.delete(`/generated-documents/${id}`).then(unwrap),
};
