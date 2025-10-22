// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token"); // Kiểm tra token có tồn tại hay không
  return token ? children : <Navigate to="/login" replace />;
}
