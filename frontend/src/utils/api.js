import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.grandhr.in/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hr_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hr_token');
      localStorage.removeItem('hr_user');
      // Don't redirect automatically - let components handle it
    }
    return Promise.reject(error);
  }
);

export default api;
export { api };

