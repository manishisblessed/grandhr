import { api, unwrap } from './client';

export const pushApi = {
  publicKey: () => api.get('/push/public-key').then(unwrap),
  status: () => api.get('/push/status').then(unwrap),
  subscribe: (subscription, userAgent) =>
    api.post('/push/subscribe', { ...subscription, userAgent }).then(unwrap),
  unsubscribe: (endpoint) => api.post('/push/unsubscribe', { endpoint }).then(unwrap),
  test: () => api.post('/push/test').then(unwrap),
};
