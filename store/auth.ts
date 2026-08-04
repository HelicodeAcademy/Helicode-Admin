import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "SUPER_ADMIN" | "ADMIN";
  createdAt: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;

  // Actions
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  clear: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoading: false,
      error: null,
      isHydrated: false,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      setUser: (user) => {
        set({ user });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          error: null,
        });
      },
      setHydrated: (hydrated) => {
        set({ isHydrated: hydrated });
      },

      clear: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      // Use the rehydrated `state` arg — do not call useAuthStore here.
      // localStorage rehydration can finish synchronously during create(),
      // before the const binding is initialized (TDZ).
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

// Safety net: if rehydration errored (callback gets no state), still unblock the UI.
if (typeof window !== "undefined") {
  useAuthStore.persist.onFinishHydration(() => {
    if (!useAuthStore.getState().isHydrated) {
      useAuthStore.setState({ isHydrated: true });
    }
  });
  if (useAuthStore.persist.hasHydrated() && !useAuthStore.getState().isHydrated) {
    useAuthStore.setState({ isHydrated: true });
  }
}
