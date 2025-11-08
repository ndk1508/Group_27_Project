import React from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import "./App.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Unauthorized from "./pages/Unauthorized";
import { AdminRoute, ModeratorRoute, UserRoute } from "./components/RoleBasedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Navigation component
function Navigation() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">Home</Link></li>
        {isAuthenticated ? (
          <>
            <li><Link to="/profile">Profile</Link></li>
            {user?.role === 'admin' && <li><Link to="/admin">Admin Dashboard</Link></li>}
            {['admin', 'moderator'].includes(user?.role) && <li><Link to="/moderate">Moderator Dashboard</Link></li>}
            {['admin', 'moderator', 'user'].includes(user?.role) && <li><Link to="/dashboard">User Dashboard</Link></li>}
            <li><button onClick={logout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

// Role-specific dashboard components
function AdminDashboard() {
  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin dashboard. Here you can:</p>
      <ul>
        <li>Manage all users</li>
        <li>Configure system settings</li>
        <li>View system logs</li>
        <li>Manage roles and permissions</li>
      </ul>
    </div>
  );
}

function ModeratorDashboard() {
  return (
    <div className="dashboard">
      <h1>Moderator Dashboard</h1>
      <p>Welcome to the moderator dashboard. Here you can:</p>
      <ul>
        <li>Moderate user content</li>
        <li>Review reports</li>
        <li>Manage user discussions</li>
      </ul>
    </div>
  );
}

function UserDashboard() {
  return (
    <div className="dashboard">
      <h1>User Dashboard</h1>
      <p>Welcome to your dashboard. Here you can:</p>
      <ul>
        <li>View your profile</li>
        <li>Update your settings</li>
        <li>Manage your content</li>
      </ul>
    </div>
  );
}

// Home component
function Home() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <div className="home">
      <h1>Welcome to Our App</h1>
      {isAuthenticated ? (
        <p>Hello, {user?.name}! Your role is: {user?.role}</p>
      ) : (
        <p>Please log in to access your dashboard.</p>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected Routes */}
              <Route path="/profile" element={
                <UserRoute>
                  <Profile />
                </UserRoute>
              } />
              
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              
              <Route path="/moderate" element={
                <ModeratorRoute>
                  <ModeratorDashboard />
                </ModeratorRoute>
              } />
              
              <Route path="/dashboard" element={
                <UserRoute>
                  <UserDashboard />
                </UserRoute>
              } />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;