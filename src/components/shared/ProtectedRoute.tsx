import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, initialized } = useAuth();

  // While auth state is initializing (reading localStorage), avoid redirecting to login.
  // This prevents a flash/redirect before AuthProvider restores the stored session.
  if (!initialized) {
    return null; // or a small spinner if desired
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
