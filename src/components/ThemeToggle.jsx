import { Moon, Sun } from "lucide-react";
import useTheme from "../hooks/useTheme";
import "./ThemeToggle.css";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDarkMode = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  return (
    <button
      type="button"
      className="theme-toggle-button"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-thumb">
          {isDarkMode ? (
            <Moon size={14} strokeWidth={2.4} />
          ) : (
            <Sun size={14} strokeWidth={2.4} />
          )}
        </span>
      </span>
    </button>
  );
}

export default ThemeToggle;
