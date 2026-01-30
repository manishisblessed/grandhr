import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import Layout from './Layout';

const HRRegister = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    employeeId: '',
    role: 'EMPLOYEE', // Default to employee
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await api.post('/auth/register', registerData);
      const { user, token } = response.data;
      
      // Store HR auth
      localStorage.setItem('hr_token', token);
      localStorage.setItem('hr_user', JSON.stringify(user));
      
      navigate('/hr/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Layout title="HR Registration" description="Register for HR Management System" icon="📝">
      <div className="max-w-md mx-auto">
        <div className="card shadow-xl">
          <div className="mb-6 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Join GrandHR
            </h3>
            <p className="text-sm text-gray-600">
              Register as an Employee to access your HR information
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-input"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="form-label">Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-input"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Email:</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="form-label">Employee ID (Optional):</label>
              <input
                type="text"
                name="employeeId"
                className="form-input"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="EMP001"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to auto-generate
              </p>
            </div>

            <div>
              <label className="form-label">Password:</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                required
              />
            </div>

            <div>
              <label className="form-label">Confirm Password:</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <strong>Note:</strong> By default, you'll be registered as an <strong>Employee</strong>. 
              Contact your HR administrator to upgrade your role to Manager, HR, or Admin.
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register as Employee'}
            </button>

            <div className="text-center text-sm text-gray-600">
              <p>
                Already have an account?{' '}
                <Link to="/hr/login" className="text-accent-600 hover:text-accent-700 font-semibold">
                  Sign In
                </Link>
              </p>
              <p className="mt-2">
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

export default HRRegister;

