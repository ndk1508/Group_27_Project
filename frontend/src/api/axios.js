// src/api/axios.js
import axios from "axios";
import tokenService from "../utils/tokenService";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: BASE_URL, // uses REACT_APP_API_URL in production (Vercel)
  // If backend sets httpOnly cookie for refreshToken we may need credentials for refresh calls
});

// Attach access token to requests
api.interceptors.request.use((config) => {
  const token = tokenService.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Concurrency handling for token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Response interceptor: on 401 try refresh (single inflight) and queue other requests
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // If 401 or 403 (token invalid/expired) and we haven't retried this request yet
    const status = error.response?.status;
    if ((status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // queue request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        const refreshToken = tokenService.getRefreshToken();

        // If backend stores refresh token in httpOnly cookie, we call refresh without body and send credentials
        const useCookie = !refreshToken;

        const resp = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          useCookie ? {} : { refreshToken },
          { withCredentials: true }
        );

        const newAccessToken = resp.data?.accessToken || resp.data?.token;
        if (newAccessToken) {
          tokenService.setToken(newAccessToken);
          processQueue(null, newAccessToken);
          // retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          // no token returned -> treat as session expired
          tokenService.clearTokens();
          tokenService.notifySessionExpired();
          processQueue(new Error("No new access token"), null);
          return Promise.reject(error);
        }
      } catch (err) {
        // refresh failed -> clear tokens, notify session expired and reject queued requests
        tokenService.clearTokens();
        tokenService.notifySessionExpired();
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
