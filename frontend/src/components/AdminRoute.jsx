// src/components/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';

export default function AdminRoute({ children }) {
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.auth.user);
  const isAdmin = token && user?.role === "admin";
  return isAdmin ? children : <Navigate to="/unauthorized" replace />;
}
