import api from './api';

export interface GeneratedDocument {
  id: string;
  documentType: string;
  title: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export const DocumentService = {
  getMyDocuments: () =>
    api.get<{ documents: GeneratedDocument[] }>('/generated-documents'),

  getById: (id: string) =>
    api.get<{ document: GeneratedDocument }>(`/generated-documents/${id}`),

  delete: (id: string) => api.delete(`/generated-documents/${id}`),
};
