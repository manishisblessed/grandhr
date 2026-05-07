import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TOKEN_KEY = 'hr_token';
export const USER_KEY = 'hr_user';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ----- Auth header injection -----
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ----- Response interceptor: 401 -> session cleanup, surface friendlier errors -----
let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';

    if (status === 401) {
      // Don't blow away session for the login attempt itself.
      const isAuthCall = /\/auth\/(login|register|forgot|reset|forgot-username)/.test(url);
      if (!isAuthCall) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        if (typeof onUnauthorized === 'function') onUnauthorized();
      }
    }

    // Network error friendly message
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error'))) {
      error.friendlyMessage =
        'Cannot reach server. Please verify the backend is running and CORS allows this origin.';
    } else if (status >= 500) {
      error.friendlyMessage = 'Server error. Please try again in a moment.';
    } else {
      error.friendlyMessage =
        error?.response?.data?.message || error.message || 'Request failed';
    }

    return Promise.reject(error);
  }
);

// Convenience helper to extract data
export const unwrap = (res) => res?.data;

export default api;
