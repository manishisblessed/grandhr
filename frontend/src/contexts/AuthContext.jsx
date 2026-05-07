import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { TOKEN_KEY, USER_KEY, setUnauthorizedHandler } from '../api/client';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const ROLE_HOME = {
  SUPER_ADMIN: '/super-admin',
  COMPANY_ADMIN: '/hr/dashboard',
  HR: '/hr/dashboard',
  MANAGER: '/hr/dashboard',
  EMPLOYEE: '/employee/dashboard',
};

export function getHomePathForRole(role) {
  return ROLE_HOME[role] || '/hr/login';
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load existing session on mount; revalidate token via /auth/profile
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const cached = localStorage.getItem(USER_KEY);
        if (!token) {
          setLoading(false);
          return;
        }
        if (cached) {
          try { setUser(JSON.parse(cached)); } catch { /* ignore */ }
        }
        // Revalidate in the background (don't block first paint)
        try {
          const profile = await authApi.profile();
          const u = profile?.user ?? profile;
          if (u) {
            setUser(u);
            localStorage.setItem(USER_KEY, JSON.stringify(u));
          }
        } catch (e) {
          // 401 handler will clear storage if token is bad
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Hook into 401 interceptor to clear session
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  const persist = useCallback((token, u) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const signIn = useCallback(async (email, password) => {
    try {
      const data = await authApi.login({ email, password });
      const { user: u, token } = data;
      persist(token, u);
      return { data: { user: u, token }, error: null };
    } catch (err) {
      return {
        data: null,
        error: err?.response?.data?.message || err.friendlyMessage || 'Login failed',
      };
    }
  }, [persist]);

  const signUp = useCallback(async (payload) => {
    try {
      const data = await authApi.register(payload);
      const { user: u, token } = data;
      persist(token, u);
      return { data: { user: u, token }, error: null };
    } catch (err) {
      return {
        data: null,
        error: err?.response?.data?.message || err.friendlyMessage || 'Registration failed',
      };
    }
  }, [persist]);

  const signOut = useCallback(async () => {
    try { await api.post('/auth/logout').catch(() => {}); } catch { /* ignore */ }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    return { error: null };
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await authApi.profile();
      const u = data?.user ?? data;
      if (u) {
        setUser(u);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
      }
      return u;
    } catch { return null; }
  }, []);

  const role = user?.role || null;
  const isAuthenticated = !!user;
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isCompanyAdmin = role === 'COMPANY_ADMIN';
  const isHR = role === 'HR' || isCompanyAdmin || isSuperAdmin;
  const isManager = role === 'MANAGER';
  const isEmployee = role === 'EMPLOYEE';
  const homePath = getHomePathForRole(role);

  const value = {
    user,
    setUser,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    isAuthenticated,
    role,
    isSuperAdmin,
    isCompanyAdmin,
    isHR,
    isManager,
    isEmployee,
    homePath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
