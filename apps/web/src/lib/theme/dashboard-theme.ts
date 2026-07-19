export const DASHBOARD_THEME_STORAGE_KEY = "arco-dashboard-theme";

export type DashboardTheme = "light" | "dark";

export function isDashboardTheme(value: unknown): value is DashboardTheme {
  return value === "light" || value === "dark";
}

export function readDashboardTheme(): DashboardTheme | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(DASHBOARD_THEME_STORAGE_KEY);
    return isDashboardTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function writeDashboardTheme(theme: DashboardTheme): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DASHBOARD_THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore quota / private mode failures.
  }
}

export function applyDashboardThemeClass(theme: DashboardTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function clearDashboardThemeClass(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove("dark");
  document.documentElement.style.colorScheme = "light";
}
