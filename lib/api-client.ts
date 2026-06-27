/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosError } from "axios";
import { useAuthStore } from "@/store/auth";

const API_BASE_URL = "https://helicode-backend.onrender.com";

let axiosInstance: AxiosInstance;

export const initializeApiClient = () => {
  axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor - add token to headers
  axiosInstance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor - handle token refresh on 401
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = useAuthStore.getState().refreshToken;
          if (!refreshToken) {
            useAuthStore.getState().logout();
            window.location.href = "/login";
            return Promise.reject(error);
          }

          const response = await axios.post(
            `${API_BASE_URL}/admin-dashboard/auth/refresh`,
            { refreshToken },
          );

          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;

          useAuthStore.getState().setTokens(accessToken, newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          useAuthStore.getState().logout();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );

  return axiosInstance;
};

export const getApiClient = () => {
  if (!axiosInstance) {
    initializeApiClient();
  }
  return axiosInstance;
};
