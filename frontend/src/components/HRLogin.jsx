import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import Layout from './Layout';

const HRLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const { user, token } = response.data;
      
      // Store HR auth separately from Supabase auth
      localStorage.setItem('hr_token', token);
      localStorage.setItem('hr_user', JSON.stringify(user));
      
      showSuccess(`Welcome back, ${user?.employee?.firstName || user?.email}!`);
      
      // Navigate based on role
      if (user?.role === 'EMPLOYEE') {
        navigate('/employee/dashboard');
      } else {
        navigate('/hr/dashboard');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
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
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In to HR System'}
            </button>

            <div className="text-center text-sm text-gray-600 space-y-2">
              <p className="mt-4">
                Don't have an account?{' '}
                <Link to="/hr/register" className="text-accent-600 hover:text-accent-700 font-semibold">
                  Register as Employee
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

