import { Moon, Sun } from "lucide-react";
import useTheme from "../hooks/useTheme";
import "./ThemeToggle.css";

function ThemeToggle() {
  const { theme, isDark } = useTheme();

  return (
    <div
      className="theme-system-indicator"
      title={`Using system ${theme} mode`}
      aria-label={`Using system ${theme} mode`}
    >
      <span className="theme-system-icon" aria-hidden="true">
        {isDark ? (
          <Moon size={15} strokeWidth={2.4} />
        ) : (
          <Sun size={15} strokeWidth={2.4} />
        )}
      </span>

      <span className="theme-system-text">System</span>
    </div>
  );
}

export default ThemeToggle;
