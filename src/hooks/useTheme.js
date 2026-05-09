import { useEffect, useState } from "react";

const DARK_MODE_QUERY = "(prefers-color-scheme: dark)";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia(DARK_MODE_QUERY).matches ? "dark" : "light";
}

function applyTheme(theme) {
  const root = document.documentElement;
  const isDark = theme === "dark";

  root.classList.toggle("dark-mode", isDark);
  root.classList.toggle("light-mode", !isDark);
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
}

export default function useTheme() {
  const [theme, setTheme] = useState(getSystemTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_MODE_QUERY);

    const updateTheme = () => {
      const systemTheme = mediaQuery.matches ? "dark" : "light";
      applyTheme(systemTheme);
      setTheme(systemTheme);
    };

    updateTheme();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateTheme);
    } else {
      mediaQuery.addListener(updateTheme);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", updateTheme);
      } else {
        mediaQuery.removeListener(updateTheme);
      }
    };
  }, []);

  return {
    theme,
    isDark: theme === "dark",
    isLight: theme === "light",
  };
}