import api, { unwrap } from './client';

export const authApi = {
  login: (payload) => api.post('/auth/login', payload).then(unwrap),
  register: (payload) => api.post('/auth/register', payload).then(unwrap),
  profile: () => api.get('/auth/profile').then(unwrap),
  updateProfile: (payload) => api.put('/auth/profile', payload).then(unwrap),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload).then(unwrap),
  forgotUsername: (payload) => api.post('/auth/forgot-username', payload).then(unwrap),
  resetPassword: (payload) => api.post('/auth/reset-password', payload).then(unwrap),
};
