import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * HR Protected Route - Requires JWT authentication
 */
const HRProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to HR login
    return <Navigate to="/hr/login" replace />;
  }

  return children;
};

export default HRProtectedRoute;

