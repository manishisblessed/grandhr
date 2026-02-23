import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Layout from './Layout';

const ForgotUsername = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-username', { email });
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
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Account Details Sent!</h3>
            <p className="text-gray-600 mb-6">
              If an account with <strong>{email}</strong> exists, we've sent your login details. 
              Please check your inbox and spam folder.
            </p>
            <div className="space-y-3">
              <Link to="/hr/login" className="btn-primary w-full block text-center">
                Go to Login
              </Link>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="btn-secondary w-full"
              >
                Try a different email
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Forgot Username" description="Recover your GrandHR login email" icon="👤">
      <div className="max-w-md mx-auto">
        <div className="card shadow-xl">
          <p className="text-gray-600 text-sm mb-6">
            Enter the email address you used when creating your GrandHR account. 
            We'll send your login credentials to that email.
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
              ) : 'Send My Login Details'}
            </button>

            <div className="text-center text-sm text-gray-600 space-y-2 mt-4">
              <p>
                Remember your credentials?{' '}
                <Link to="/hr/login" className="text-accent-600 hover:text-accent-700 font-semibold">
                  Back to Login
                </Link>
              </p>
              <p>
                Need to reset your password?{' '}
                <Link to="/forgot-password" className="text-accent-600 hover:text-accent-700 font-semibold">
                  Reset Password
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotUsername;
