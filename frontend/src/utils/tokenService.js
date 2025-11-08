// Small token service to centralize access/refresh token storage and notify subscribers
const STORAGE_KEY = "token";
const REFRESH_KEY = "refreshToken";

let _subscribers = new Set();

function notify() {
  _subscribers.forEach((cb) => {
    try { cb(getToken()); } catch (e) { /* ignore subscriber errors */ }
  });
}

export function getToken() {
  return localStorage.getItem(STORAGE_KEY) || "";
}

export function setToken(token) {
  if (token) localStorage.setItem(STORAGE_KEY, token);
  else localStorage.removeItem(STORAGE_KEY);
  notify();
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY) || "";
}

export function setRefreshToken(rt) {
  if (rt) localStorage.setItem(REFRESH_KEY, rt);
  else localStorage.removeItem(REFRESH_KEY);
}

export function clearTokens() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(REFRESH_KEY);
  notify();
}

export function subscribe(cb) {
  _subscribers.add(cb);
  return () => { _subscribers.delete(cb); };
}

// Session expired notification subscribers (for showing modal before redirect)
let _sessionExpiredSubscribers = new Set();
export function notifySessionExpired() {
  _sessionExpiredSubscribers.forEach((cb) => {
    try { cb(); } catch (e) {}
  });
}

export function onSessionExpired(cb) {
  _sessionExpiredSubscribers.add(cb);
  return () => { _sessionExpiredSubscribers.delete(cb); };
}

const tokenServiceObj = {
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  clearTokens,
  subscribe,
  notifySessionExpired,
  onSessionExpired,
};

export default tokenServiceObj;
