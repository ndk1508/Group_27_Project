// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import tokenService from "../utils/tokenService";
import SessionExpiredModal from "../components/SessionExpiredModal";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenService.getToken() || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [sessionExpired, setSessionExpired] = useState(false);

  // subscribe to token changes from tokenService (e.g. axios refresh)
  useEffect(() => {
    const unsub = tokenService.subscribe((t) => setToken(t || ""));
    return unsub;
  }, []);

  // subscribe to session-expired notifications from tokenService
  useEffect(() => {
    const unsub = tokenService.onSessionExpired(() => {
      setSessionExpired(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // login accepts access token, user object, and optional refresh token
  const login = (accessToken, userObj, refreshToken) => {
    tokenService.setToken(accessToken || "");
    if (refreshToken) tokenService.setRefreshToken(refreshToken);
    setUser(userObj || null);
  };

  const logout = () => {
    tokenService.clearTokens();
    setUser(null);
    // Also remove user from storage
    localStorage.removeItem("user");
  };

  const onSessionModalClose = () => {
    setSessionExpired(false);
    // ensure tokens cleared and redirect to login
    logout();
    try {
      if (typeof window !== "undefined") window.location.href = "/login";
    } catch (e) {}
  };

  // Role check helpers
  const hasRole = (role) => {
    return user?.role === role;
  };

  const isAdmin = () => hasRole("admin");
  const isModerator = () => hasRole("moderator");
  const isUser = () => hasRole("user");

  const value = { 
    token, 
    user, 
    login, 
    logout, 
    isAuthenticated: !!token,
    isAdmin,
    isModerator,
    isUser,
    hasRole
  };
  
  return (
    <>
      {sessionExpired && <SessionExpiredModal onClose={onSessionModalClose} />}
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
