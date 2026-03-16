import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY, USER_KEY } from '../constants/config';
import { AuthService } from '../services/auth.service';
import { setLogoutCallback } from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  setLogoutCallback(() => {
    set({ user: null, isAuthenticated: false });
  });

  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,

    initialize: async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const userData = await SecureStore.getItemAsync(USER_KEY);

        if (token && userData) {
          const user = JSON.parse(userData) as User;
          set({ user, isAuthenticated: true });
        }
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
      } finally {
        set({ isInitialized: true });
      }
    },

    signIn: async (email, password) => {
      set({ isLoading: true });
      try {
        const response = await AuthService.login(email, password);
        const { user, token } = response.data;

        await SecureStore.setItemAsync(TOKEN_KEY, token);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

        set({ user, isAuthenticated: true, isLoading: false });
        return {};
      } catch (error: any) {
        set({ isLoading: false });
        const msg =
          error.response?.data?.message ||
          error.message ||
          'Login failed. Please try again.';
        if (__DEV__) console.log('Login error:', error.message, error.response?.status);
        return { error: msg };
      }
    },

    signOut: async () => {
      try {
        await AuthService.logout();
      } catch {
        // ignore
      } finally {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
        set({ user: null, isAuthenticated: false });
      }
    },

    setUser: (user) => set({ user }),
  };
});
