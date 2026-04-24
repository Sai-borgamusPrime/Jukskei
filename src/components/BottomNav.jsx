import { Link, useLocation } from "react-router-dom";
import {
  House,
  CalendarDays,
  Trophy,
  UtensilsCrossed,
  Store,
  Images,
} from "lucide-react";

function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: "/home", icon: House, label: "Home" },
    { path: "/schedule", icon: CalendarDays, label: "Schedule" },
    { path: "/teams", icon: Trophy, label: "Teams" },
    { path: "/gallery", icon: Images, label: "Gallery" },
    { path: "/menu", icon: UtensilsCrossed, label: "Menu" },
    { path: "/shop", icon: Store, label: "Shop" },
  ];

  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      {navItems.map(({ path, icon: Icon, label }) => {
        const active =
          location.pathname === path ||
          location.pathname.startsWith(`${path}/`);

        return (
          <Link
            key={path}
            to={path}
            className={`nav-item ${active ? "active" : ""}`}
            aria-label={label}
            title={label}
          >
            <Icon size={20} strokeWidth={2.2} />
          </Link>
        );
      })}
    </nav>
  );
}

export default BottomNav;
