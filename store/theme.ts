"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

interface ThemeState {
  theme: Theme;
  hasHydrated: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      hasHydrated: false,
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const theme = get().theme === "dark" ? "light" : "dark";
        applyTheme(theme);
        set({ theme });
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "theme-store",
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyTheme(state.theme);
        state?.setHasHydrated(true);
      },
    },
  ),
);

if (typeof window !== "undefined") {
  useThemeStore.persist.onFinishHydration(() => {
    const state = useThemeStore.getState();
    applyTheme(state.theme);
    if (!state.hasHydrated) {
      useThemeStore.setState({ hasHydrated: true });
    }
  });
}
