import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles } from 'lucide-react';

export function FullPageLoader({ label = 'Loading…' }) {
  return (
    <div className="min-h-screen grid place-items-center bg-background bg-mesh">
      <div className="flex flex-col items-center gap-4">
        <div className="relative size-16">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent animate-pulse-glow" />
          <div className="absolute inset-0 grid place-items-center">
            <Sparkles className="size-7 text-white" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
      </div>
    </div>
  );
}

/**
 * RoleRoute
 *   <RoleRoute roles={['HR', 'COMPANY_ADMIN']}>{children}</RoleRoute>
 *   When `roles` is omitted, it falls back to "any authenticated user" behavior.
 */
export function RoleRoute({ roles, redirectTo, children }) {
  const { isAuthenticated, loading, role, homePath } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;

  if (!isAuthenticated) {
    const target = redirectTo || (location.pathname.startsWith('/employee') ? '/login' : '/hr/login');
    return <Navigate to={target} replace state={{ from: location }} />;
  }

  if (Array.isArray(roles) && roles.length > 0 && !roles.includes(role)) {
    return <Navigate to={homePath} replace />;
  }

  return children;
}

export default RoleRoute;
