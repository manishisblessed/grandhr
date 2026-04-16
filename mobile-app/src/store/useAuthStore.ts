import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY, USER_KEY, LAST_ACTIVE_KEY } from '../constants/config';
import { AuthService } from '../services/auth.service';
import { setLogoutCallback } from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithSession: (user: User, token: string) => Promise<void>;
  signOut: (opts?: { silent?: boolean }) => Promise<void>;
  deleteAccount: (currentPassword: string) => Promise<{ error?: string }>;
  setUser: (user: User) => void;
}

async function persistSession(user: User, token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  await SecureStore.setItemAsync(LAST_ACTIVE_KEY, Date.now().toString());
}

async function clearSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
  await SecureStore.deleteItemAsync(LAST_ACTIVE_KEY);
}

export const useAuthStore = create<AuthState>((set, get) => {
  setLogoutCallback(() => {
    set({ user: null, token: null, isAuthenticated: false });
  });

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,

    initialize: async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const userData = await SecureStore.getItemAsync(USER_KEY);

        if (token && userData) {
          const user = JSON.parse(userData) as User;
          set({ user, token, isAuthenticated: true });
        }
      } catch {
        await clearSession();
      } finally {
        set({ isInitialized: true });
      }
    },

    signIn: async (email, password) => {
      set({ isLoading: true });
      try {
        const response = await AuthService.login(email, password);
        const { user, token } = response.data;
        await persistSession(user, token);
        set({ user, token, isAuthenticated: true, isLoading: false });
        return {};
      } catch (error: any) {
        set({ isLoading: false });
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          'Login failed. Please try again.';
        if (__DEV__) console.log('Login error:', error?.message, error?.response?.status);
        return { error: msg };
      }
    },

    /**
     * Used by Register and Company Onboarding flows where a session is
     * returned directly from a non-login endpoint. Keeps all state mutations
     * inside the store (no external setState hacks).
     */
    signInWithSession: async (user, token) => {
      await persistSession(user, token);
      set({ user, token, isAuthenticated: true });
    },

    signOut: async ({ silent = false } = {}) => {
      if (!silent) {
        try {
          await AuthService.logout();
        } catch {
          // best-effort; server may be unreachable
        }
      }
      await clearSession();
      set({ user: null, token: null, isAuthenticated: false });
    },

    deleteAccount: async (currentPassword) => {
      try {
        await AuthService.deleteAccount(currentPassword);
        await clearSession();
        set({ user: null, token: null, isAuthenticated: false });
        return {};
      } catch (error: any) {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          'Account deletion failed. Please try again.';
        return { error: msg };
      }
    },

    setUser: (user) => set({ user }),
  };
});
