import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import Layout from './Layout';

const CompanyOnboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const [companyData, setCompanyData] = useState({
    // Company Information
    name: '',
    legalName: '',
    domain: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    taxId: '',
    registrationNumber: '',
    panNumber: '',
    gstNumber: '',
    
    // Admin User Information
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setCompanyData({
      ...companyData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateStep = (stepNum) => {
    setError('');
    
    if (stepNum === 1) {
      if (!companyData.name.trim()) {
        setError('Company name is required');
        return false;
      }
      if (!companyData.email.trim()) {
        setError('Company email is required');
        return false;
      }
      if (companyData.email && !/\S+@\S+\.\S+/.test(companyData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    }
    
    if (stepNum === 2) {
      if (!companyData.adminFirstName.trim()) {
        setError('First name is required');
        return false;
      }
      if (!companyData.adminLastName.trim()) {
        setError('Last name is required');
        return false;
      }
      if (!companyData.adminEmail.trim()) {
        setError('Admin email is required');
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(companyData.adminEmail)) {
        setError('Please enter a valid email address');
        return false;
      }
      if (!companyData.adminPassword) {
        setError('Password is required');
        return false;
      }
      if (companyData.adminPassword.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }
      if (companyData.adminPassword !== companyData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateStep(2)) {
      return;
    }

    setLoading(true);

    try {
      // Prepare company data
      const companyPayload = {
        name: companyData.name,
        legalName: companyData.legalName || companyData.name,
        domain: companyData.domain || undefined,
        email: companyData.email,
        phone: companyData.phone || undefined,
        website: companyData.website || undefined,
        address: companyData.address || undefined,
        city: companyData.city || undefined,
        state: companyData.state || undefined,
        zipCode: companyData.zipCode || undefined,
        country: companyData.country || undefined,
        taxId: companyData.taxId || undefined,
        registrationNumber: companyData.registrationNumber || undefined,
        panNumber: companyData.panNumber || undefined,
        gstNumber: companyData.gstNumber || undefined,
      };

      // Prepare admin user data
      const adminPayload = {
        email: companyData.adminEmail,
        password: companyData.adminPassword,
        firstName: companyData.adminFirstName,
        lastName: companyData.adminLastName,
        role: 'COMPANY_ADMIN',
      };

      // Call the company registration endpoint
      const response = await api.post('/company/register', {
        company: companyPayload,
        admin: adminPayload,
      });

      const { company, user, token } = response.data;

      // Store auth tokens
      localStorage.setItem('hr_token', token);
      localStorage.setItem('hr_user', JSON.stringify(user));
      localStorage.setItem('hr_company', JSON.stringify(company));

      setSuccess('Company registered successfully! Redirecting to dashboard...');
      
      setTimeout(() => {
        navigate('/hr/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Company Onboarding" description="Register your company and get started with GrandHR" icon="🏢">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center ${step >= 1 ? 'text-accent-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? 'bg-accent-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Company Information</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-accent-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-accent-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? 'bg-accent-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Admin Account</span>
            </div>
          </div>
        </div>

        <div className="card shadow-xl">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* Step 1: Company Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Company Information</h2>
                <p className="text-gray-600">Tell us about your company</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={companyData.name}
                    onChange={handleChange}
                    placeholder="Acme Corporation"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">Legal Name (Optional)</label>
                  <input
                    type="text"
                    name="legalName"
                    className="form-input"
                    value={companyData.legalName}
                    onChange={handleChange}
                    placeholder="Acme Corporation Private Limited"
                  />
                </div>

                <div>
                  <label className="form-label">Company Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={companyData.email}
                    onChange={handleChange}
                    placeholder="contact@company.com"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={companyData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="form-label">Website</label>
                  <input
                    type="url"
                    name="website"
                    className="form-input"
                    value={companyData.website}
                    onChange={handleChange}
                    placeholder="https://www.company.com"
                  />
                </div>

                <div>
                  <label className="form-label">Domain (Optional)</label>
                  <input
                    type="text"
                    name="domain"
                    className="form-input"
                    value={companyData.domain}
                    onChange={handleChange}
                    placeholder="company.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for company-specific access</p>
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    value={companyData.address}
                    onChange={handleChange}
                    placeholder="123 Business Street"
                  />
                </div>

                <div>
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-input"
                    value={companyData.city}
                    onChange={handleChange}
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="form-label">State/Province</label>
                  <input
                    type="text"
                    name="state"
                    className="form-input"
                    value={companyData.state}
                    onChange={handleChange}
                    placeholder="NY"
                  />
                </div>

                <div>
                  <label className="form-label">ZIP/Postal Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    className="form-input"
                    value={companyData.zipCode}
                    onChange={handleChange}
                    placeholder="10001"
                  />
                </div>

                <div>
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    name="country"
                    className="form-input"
                    value={companyData.country}
                    onChange={handleChange}
                    placeholder="United States"
                  />
                </div>

                <div>
                  <label className="form-label">Tax ID</label>
                  <input
                    type="text"
                    name="taxId"
                    className="form-input"
                    value={companyData.taxId}
                    onChange={handleChange}
                    placeholder="EIN: 12-3456789"
                  />
                </div>

                <div>
                  <label className="form-label">Registration Number</label>
                  <input
                    type="text"
                    name="registrationNumber"
                    className="form-input"
                    value={companyData.registrationNumber}
                    onChange={handleChange}
                    placeholder="Registration #"
                  />
                </div>

                <div>
                  <label className="form-label">PAN Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    className="form-input"
                    value={companyData.panNumber}
                    onChange={handleChange}
                    placeholder="ABCDE1234F"
                  />
                </div>

                <div>
                  <label className="form-label">GST Number</label>
                  <input
                    type="text"
                    name="gstNumber"
                    className="form-input"
                    value={companyData.gstNumber}
                    onChange={handleChange}
                    placeholder="GSTIN"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Link
                  to="/"
                  className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-semibold"
                >
                  Next: Admin Account →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Admin Account */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Admin Account</h2>
                <p className="text-gray-600">Set up your administrator account to manage your company</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    name="adminFirstName"
                    className="form-input"
                    value={companyData.adminFirstName}
                    onChange={handleChange}
                    placeholder="John"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    name="adminLastName"
                    className="form-input"
                    value={companyData.adminLastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="adminEmail"
                    className="form-input"
                    value={companyData.adminEmail}
                    onChange={handleChange}
                    placeholder="admin@company.com"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be your login email</p>
                </div>

                <div>
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    name="adminPassword"
                    className="form-input"
                    value={companyData.adminPassword}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-input"
                    value={companyData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <strong>Note:</strong> You will be set up as the Company Administrator with full access to manage employees, payroll, leaves, and all HR functions.
              </div>

              <div className="flex justify-between gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Already have an account?{' '}
            <Link to="/hr/login" className="text-accent-600 hover:text-accent-700 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default CompanyOnboarding;

