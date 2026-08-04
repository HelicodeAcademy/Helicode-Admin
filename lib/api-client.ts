/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosError } from "axios";
import { useAuthStore } from "@/store/auth";

const API_BASE_URL = "https://helicode-backend.onrender.com";

let axiosInstance: AxiosInstance | null = null;
let refreshPromise: Promise<string> | null = null;

const isAuthFailure = (error: unknown) => {
  if (!axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 401 || status === 403;
};

const forceLogout = () => {
  useAuthStore.getState().logout();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

const refreshAccessToken = async (): Promise<string> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      forceLogout();
      throw new Error("No refresh token available");
    }

    const response = await axios.post(
      `${API_BASE_URL}/admin-dashboard/auth/refresh`,
      { refreshToken },
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    useAuthStore.getState().setTokens(accessToken, newRefreshToken);
    return accessToken as string;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

export const initializeApiClient = () => {
  if (axiosInstance) {
    return axiosInstance;
  }

  axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  axiosInstance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const accessToken = await refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance!(originalRequest);
        } catch (refreshError) {
          // Only clear the session when the refresh token is rejected.
          // Transient network / cold-start errors should not log the user out.
          if (isAuthFailure(refreshError)) {
            forceLogout();
          }
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
  return axiosInstance!;
};
