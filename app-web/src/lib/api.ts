import axios from "axios";
import { branding } from "@/config/branding";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || `https://${branding.urls.apiServer}`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      const currentPath = window.location.pathname;
      if (
        !currentPath.startsWith("/auth/") &&
        !currentPath.startsWith("/creator/") &&
        currentPath !== "/"
      ) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
