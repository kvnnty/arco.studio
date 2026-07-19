"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useConsent } from "@/components/consent/consent-provider";
import {
  applyDashboardThemeClass,
  clearDashboardThemeClass,
  readDashboardTheme,
  writeDashboardTheme,
  type DashboardTheme,
} from "@/lib/theme/dashboard-theme";

type DashboardThemeContextValue = {
  theme: DashboardTheme;
  setTheme: (theme: DashboardTheme) => void;
  toggleTheme: () => void;
};

const DashboardThemeContext = createContext<DashboardThemeContextValue | null>(
  null,
);

export function useDashboardTheme() {
  const context = useContext(DashboardThemeContext);
  if (!context) {
    throw new Error(
      "useDashboardTheme must be used within DashboardThemeProvider.",
    );
  }
  return context;
}

export function DashboardThemeProvider({ children }: { children: ReactNode }) {
  const { consent } = useConsent();
  const [theme, setThemeState] = useState<DashboardTheme>("light");

  useEffect(() => {
    const stored = readDashboardTheme();
    if (stored) {
      setThemeState(stored);
      applyDashboardThemeClass(stored);
    } else {
      applyDashboardThemeClass("light");
    }

    return () => {
      clearDashboardThemeClass();
    };
  }, []);

  useEffect(() => {
    applyDashboardThemeClass(theme);
    if (consent.functional) {
      writeDashboardTheme(theme);
    }
  }, [theme, consent.functional]);

  const setTheme = useCallback((next: DashboardTheme) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <DashboardThemeContext.Provider value={value}>
      {children}
    </DashboardThemeContext.Provider>
  );
}
