import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireRole({ allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    // Not logged in, redirect to home to open login modal
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Logged in, but wrong role. Redirect to their actual role dashboard
    switch (user.role) {
      case 'ADMIN':
        return <Navigate to="/admin" replace />;
      case 'VENDOR':
        return <Navigate to="/vendor" replace />;
      case 'RIDER':
        return <Navigate to="/rider" replace />;
      default:
        return <Navigate to="/customer" replace />;
    }
  }

  // Authorized! Render the child routes.
  return <Outlet />;
}
