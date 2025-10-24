import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUnauthenticated?: () => void;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = null,
  onUnauthenticated
}) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user && onUnauthenticated) {
      onUnauthenticated();
    }
  }, [user, loading, onUnauthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
