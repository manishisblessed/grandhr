import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, TOKEN_KEY, LAST_ACTIVE_KEY } from '../constants/config';
import { Telemetry } from './telemetry';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

let logoutCallback: (() => void) | null = null;

export function setLogoutCallback(cb: () => void) {
  logoutCallback = cb;
}

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // refresh the activity marker on every authenticated request so the
      // idle watcher has a reliable signal even if UI events are missed.
      SecureStore.setItemAsync(LAST_ACTIVE_KEY, Date.now().toString()).catch(() => {});
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      logoutCallback?.();
    } else if (error.response && error.response.status >= 500) {
      Telemetry.captureError(error, {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
      });
    }
    return Promise.reject(error);
  },
);

export default api;
