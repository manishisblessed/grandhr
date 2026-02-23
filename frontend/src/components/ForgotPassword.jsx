import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Layout from './Layout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Layout title="Check Your Email" icon="📧">
        <div className="max-w-md mx-auto">
          <div className="card shadow-xl text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Link Sent!</h3>
            <p className="text-gray-600 mb-6">
              If an account with <strong>{email}</strong> exists, we've sent a password reset link. 
              Please check your inbox and spam folder.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              The link will expire in 1 hour.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="btn-secondary w-full"
              >
                Try a different email
              </button>
              <Link to="/hr/login" className="block text-accent-600 hover:text-accent-700 font-medium text-sm">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Forgot Password" description="Reset your GrandHR account password" icon="🔑">
      <div className="max-w-md mx-auto">
        <div className="card shadow-xl">
          <p className="text-gray-600 text-sm mb-6">
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="form-label">Email Address:</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending...
                </span>
              ) : 'Send Reset Link'}
            </button>

            <div className="text-center text-sm text-gray-600 space-y-2 mt-4">
              <p>
                Remember your password?{' '}
                <Link to="/hr/login" className="text-accent-600 hover:text-accent-700 font-semibold">
                  Back to Login
                </Link>
              </p>
              <p>
                Forgot your username instead?{' '}
                <Link to="/forgot-username" className="text-accent-600 hover:text-accent-700 font-semibold">
                  Recover Username
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
