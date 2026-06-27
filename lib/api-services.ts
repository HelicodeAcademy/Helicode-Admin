/* eslint-disable @typescript-eslint/no-explicit-any */
import { getApiClient } from "./api-client";
import { User } from "@/store/auth";

const api = getApiClient();

// Types
export interface SetupCodeResponse {
  adminId: string;
  code: string;
  expiresIn: number;
}

export interface SetupConfirmRequest {
  email: string;
  code: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface StatsResponse {
  totalSignups: number;
  activeBusinesses: number;
  activeTeams: number;
  volume: {
    total: number;
    byCurrency: Record<string, number>;
    byWalletType: Record<string, number>;
    syncInfo: Record<string, number>;
  };
}

export interface Signup {
  id: string;
  email: string;
  employeeEmail: string;
  companyName?: string;
  teamName?: string;
  type: "company" | "team";
  kycStatus: "PENDING" | "APPROVED" | "REJECTED";
  bridgeCustomerStatus: "PENDING" | "CONNECTED" | "FAILED";
  dateOfSignup: string;
}

export interface SignupsResponse {
  data: Signup[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
export interface Companies {
  companyId: string;
  companyName: string;
  membershipStatus: string;
  department: string;
  role: string;
  employeeType: string;
  startDate: string;
  kycProfileSubmitted: string;
  payroll: {
    amount: number;
    currency: string;
    frequency: string;
  };
  withdrawalsCount: string;
}

export interface TeamMember {
  id: string;
  email: string;
  fullName: string;
  role: string;
  walletBalance: number;
  totalTransactions: number;
  companies: Companies[];
  createdAt: string;
  signupDate: string;
}

export interface TeamsResponse {
  data: TeamMember[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "SUPER_ADMIN" | "ADMIN";
  status: "ACTIVE" | "PENDING";
  invitedAt: string;
  createdAt: string;
}

export interface AdminsResponse {
  data: Admin[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Auth endpoints
export const authAPI = {
  setupCode: async (email: string) => {
    const response = await api.post<{ data: SetupCodeResponse }>(
      "/admin-dashboard/auth/setup-code",
      { email },
    );
    return response.data.data;
  },

  setupConfirm: async (payload: SetupConfirmRequest) => {
    const response = await api.post<{ data: AuthResponse }>(
      "/admin-dashboard/auth/setup-confirm",
      payload,
    );
    return response.data.data;
  },

  login: async (payload: LoginRequest) => {
    const response = await api.post<{ data: AuthResponse }>(
      "/admin-dashboard/auth/login",
      payload,
    );
    return response.data.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await api.post<{
      data: { accessToken: string; refreshToken: string };
    }>("/admin-dashboard/auth/refresh", { refreshToken });
    return response.data.data;
  },
};

// Dashboard endpoints
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get<{ data: StatsResponse }>(
      "/admin-dashboard/stats",
    );
    return response.data.data;
  },

  getSignups: async (page: number = 1, limit: number = 10, filters?: any) => {
    const response = await api.get<{ data: SignupsResponse }>(
      "/admin-dashboard/signups",
      {
        params: {
          page,
          limit,
          ...filters,
        },
      },
    );
    return response.data.data;
  },

  getTeams: async (page: number = 1, limit: number = 10, filters?: any) => {
    const response = await api.get<{ data: TeamsResponse }>(
      "/admin-dashboard/teams",
      {
        params: {
          page,
          limit,
          ...filters,
        },
      },
    );
    return response.data.data;
  },
};

// Admin management endpoints
export const adminAPI = {
  getAdmins: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<{ data: AdminsResponse }>(
      "/admin-dashboard/admins",
      {
        params: {
          page,
          limit,
        },
      },
    );
    return response.data.data;
  },

  inviteAdmin: async (email: string, firstName: string, lastName: string) => {
    const response = await api.post<{ data: { id: string } }>(
      "/admin-dashboard/admins/invite",
      {
        email,
        firstName,
        lastName,
      },
    );
    return response.data.data;
  },

  resendInvite: async (adminId: string) => {
    const response = await api.post<{ data: { message: string } }>(
      `/admin-dashboard/admins/${adminId}/resend-invite`,
      {},
    );
    return response.data.data;
  },

  removeAdmin: async (adminId: string) => {
    const response = await api.delete<{ data: { message: string } }>(
      `/admin-dashboard/admins/${adminId}`,
    );
    return response.data.data;
  },
};
