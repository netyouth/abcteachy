import * as React from "react";
import { useTheme } from "@/components/theme-provider";

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function setDocumentDarkClass(enabled: boolean): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (enabled) root.classList.add("dark");
  else root.classList.remove("dark");
}

export function DashboardThemeScope({ children }: { children: React.ReactNode }): JSX.Element {
  const { theme } = useTheme();

  const apply = React.useCallback(() => {
    const isDark = theme === "dark" || (theme === "system" && getSystemPrefersDark());
    setDocumentDarkClass(isDark);
  }, [theme]);

  React.useEffect(() => {
    apply();
  }, [apply]);

  React.useEffect(() => {
    if (theme !== "system") return;
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => apply();

    if (typeof (media as any).addEventListener === "function") {
      (media as any).addEventListener("change", handler);
      return () => (media as any).removeEventListener("change", handler);
    }
    if (typeof (media as any).addListener === "function") {
      (media as any).addListener(handler);
      return () => (media as any).removeListener(handler);
    }
    return () => {};
  }, [theme, apply]);

  React.useEffect(() => {
    return () => {
      // Ensure we leave the document in light mode when unmounting dashboards
      setDocumentDarkClass(false);
    };
  }, []);

  return <>{children}</>;
}
