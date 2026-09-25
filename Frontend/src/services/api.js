import axios from "axios";
import { API_URL } from "../utils/constants";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired / invalid — clear storage and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/register")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
