import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ModernLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Login logic here
    setTimeout(() => {
      setLoading(false);
      navigate('/hr/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 mb-4 shadow-2xl">
            <span className="text-4xl text-white font-bold">GH</span>
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-2">GrandHR</h1>
          <p className="text-gray-600">Enterprise HR Management System</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 rounded-2xl shadow-2xl animate-slide-in-right">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="input-modern"
                placeholder="you@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="input-modern"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="rounded border-gray-300" />
                Remember me
              </label>
              <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="btn-gradient-primary w-full py-4 text-lg"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner-modern"></span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/hr/register" className="text-purple-600 hover:text-purple-700 font-semibold">
                Sign up
              </a>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="glass-card p-4 rounded-xl">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-xs text-gray-600">Secure</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-xs text-gray-600">Fast</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <div className="text-2xl mb-2">✨</div>
            <p className="text-xs text-gray-600">Modern</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernLogin;

