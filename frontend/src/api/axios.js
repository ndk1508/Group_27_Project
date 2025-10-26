// src/api/axios.js
import axios from "axios";


const api = axios.create({
  baseURL: "http://localhost:3000", // backend chạy ở port 3000
});

// Tự động gắn Authorization: Bearer <token> nếu có trong localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default api;
