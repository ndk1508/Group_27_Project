import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requireRole }) {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user?.role && ![...requireRole].includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
