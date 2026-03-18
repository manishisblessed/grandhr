import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import Layout from './Layout';

const HRLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data || {};

      // Only treat as success when we have a 2xx response with token and user
      const ok = response.status >= 200 && response.status < 300 && token && user;
      if (!ok) {
        const msg = response.data?.message || 'Login failed. Please check your credentials.';
        setError(msg);
        showError(msg);
        setLoading(false);
        return;
      }

      // Store HR auth in localStorage
      localStorage.setItem('hr_token', token);
      localStorage.setItem('hr_user', JSON.stringify(user));

      showSuccess(`Welcome back, ${user?.employee?.firstName || user?.email}!`);
      
      // Navigate based on role
      if (user?.role === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else if (user?.role === 'EMPLOYEE') {
        navigate('/employee/dashboard');
      } else {
        navigate('/hr/dashboard');
      }
    } catch (err) {
      const isNetworkError = !err.response && (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error'));
      const isConnectionRefused = isNetworkError || err.message?.includes('CONNECTION_REFUSED');
      const errorMsg = isConnectionRefused
        ? 'Cannot reach server. Please start the backend (e.g. run "npm run dev" in the backend folder) and try again.'
        : (err.response?.data?.message || 'Login failed. Please check your credentials.');
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="HR Login" description="Login to HR Management System" icon="🔐">
      <div className="max-w-md mx-auto">
        <div className="card shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="form-label">Email:</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="form-label">Password:</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In to HR System'}
            </button>

            <div className="flex items-center justify-between text-sm mt-2">
              <Link to="/forgot-password" className="text-accent-600 hover:text-accent-700 font-medium">
                Forgot Password?
              </Link>
              <Link to="/forgot-username" className="text-accent-600 hover:text-accent-700 font-medium">
                Forgot Username?
              </Link>
            </div>

            <div className="text-center text-sm text-gray-600 space-y-2 mt-4">
              <p>
                Don't have an account?{' '}
                <Link to="/hr/company-onboarding" className="text-accent-600 hover:text-accent-700 font-semibold">
                  Register your Company
                </Link>
              </p>
              <p>
                <Link to="/" className="text-accent-600 hover:text-accent-700 font-semibold">
                  ← Back to Home
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default HRLogin;

