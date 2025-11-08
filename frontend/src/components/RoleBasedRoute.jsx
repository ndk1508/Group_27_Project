import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RoleBasedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

export function AdminRoute({ children }) {
  return <RoleBasedRoute allowedRoles={['admin']}>{children}</RoleBasedRoute>;
}

export function ModeratorRoute({ children }) {
  return <RoleBasedRoute allowedRoles={['admin', 'moderator']}>{children}</RoleBasedRoute>;
}

export function UserRoute({ children }) {
  return <RoleBasedRoute allowedRoles={['admin', 'moderator', 'user']}>{children}</RoleBasedRoute>;
}