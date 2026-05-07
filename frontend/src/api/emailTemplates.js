import { api, unwrap } from './client';

export const emailTemplatesApi = {
  list: () => api.get('/email-templates').then(unwrap),
  preview: (key, sample) =>
    api.post(`/email-templates/${key}/preview`, sample || {}).then(unwrap),
  sendTest: (key, { to, data } = {}) =>
    api.post(`/email-templates/${key}/test`, { to, data }).then(unwrap),
};
