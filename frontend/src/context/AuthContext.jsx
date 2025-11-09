// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import tokenService from "../utils/tokenService";
import SessionExpiredModal from "../components/SessionExpiredModal";
import axios from "axios";

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

  // On mount try a silent refresh if we have a refresh token but no access token
  useEffect(() => {
    let mounted = true;
    const tryRefresh = async () => {
      try {
        const rt = tokenService.getRefreshToken();
        const current = tokenService.getToken();
        if (!current && rt) {
          // call refresh endpoint directly (avoid using api instance to prevent interceptor loops)
          const resp = await axios.post("http://localhost:3000/api/auth/refresh", { refreshToken: rt });
          const newAccess = resp.data?.accessToken || resp.data?.token;
          const newRefresh = resp.data?.refreshToken;
          if (mounted && newAccess) {
            tokenService.setToken(newAccess);
            if (newRefresh) tokenService.setRefreshToken(newRefresh);
            setToken(newAccess);
          }
        }
      } catch (e) {
        // refresh failed -> clear tokens and notify session expired
        tokenService.clearTokens();
        tokenService.notifySessionExpired();
      }
    };

    tryRefresh();
    return () => { mounted = false; };
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

  // Allow updating user object from child components (e.g. after avatar upload)
  const updateUser = (patchOrUser) => {
    if (typeof patchOrUser === "function") {
      setUser((prev) => ({ ...prev, ...patchOrUser(prev) }));
    } else if (typeof patchOrUser === "object") {
      setUser((prev) => ({ ...prev, ...patchOrUser }));
    }
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
    updateUser,
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
