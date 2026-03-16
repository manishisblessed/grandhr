import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = () => {
      try {
        const token = localStorage.getItem('hr_token');
        const userData = localStorage.getItem('hr_user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        localStorage.removeItem('hr_token');
        localStorage.removeItem('hr_user');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signUp = async (email, password, name) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        name,
      });
      
      const { user, token } = response.data;
      
      localStorage.setItem('hr_token', token);
      localStorage.setItem('hr_user', JSON.stringify(user));
      setUser(user);
      
      return { data: { user, token }, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      const { user, token } = response.data;
      
      localStorage.setItem('hr_token', token);
      localStorage.setItem('hr_user', JSON.stringify(user));
      setUser(user);
      
      return { data: { user, token }, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const signOut = async () => {
    try {
      // Optionally call backend logout endpoint
      await api.post('/auth/logout').catch(() => {});
    } catch (error) {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('hr_token');
      localStorage.removeItem('hr_user');
      setUser(null);
    }
    
    return { error: null };
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

