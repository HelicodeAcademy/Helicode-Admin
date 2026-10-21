"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { applyTheme, useThemeStore } from "@/store/theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useThemeStore((state) => state.theme);
  const hasHydrated = useThemeStore((state) => state.hasHydrated);

  useLayoutEffect(() => {
    if (!hasHydrated) return;
    applyTheme(theme);
  }, [hasHydrated, theme]);

  return children;
}
