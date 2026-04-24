import { useEffect, useState } from "react";

function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("jukskei-theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("jukskei-theme", theme);

    document.documentElement.classList.remove("light-mode", "dark-mode");
    document.documentElement.classList.add(`${theme}-mode`);
  }, [theme]);

  return { theme, setTheme, isDarkMode: theme === "dark" };
}

export default useTheme;