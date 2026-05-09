import { NavLink } from "react-router-dom";
import {
  CalendarDays,
  GalleryHorizontal,
  Home,
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  Users,
  Radio,
} from "lucide-react";
import SignOutButton from "../components/SignOutButton/SignOutButton";
import "./AdminPortal.css";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/teams", label: "Teams", icon: Users },
  { to: "/admin/matches", label: "Matches", icon: Radio },
  { to: "/admin/schedule", label: "Schedule", icon: CalendarDays },
  { to: "/admin/menu", label: "Menu", icon: Utensils },
  { to: "/admin/shop", label: "Shop", icon: ShoppingBag },
  { to: "/admin/gallery", label: "Gallery", icon: GalleryHorizontal },
];

function AdminLayout({ title, description, children, actions }) {
  return (
    <main className="admin-page">
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <img
              src="/logo.webp"
              alt="Jukskei Tournament Logo"
              className="admin-brand-logo"
            />

            <div>
              <p className="admin-brand-kicker">Super Admin</p>
              <h2 className="admin-brand-title">Jukskei Portal</h2>
            </div>
          </div>

          <nav className="admin-nav" aria-label="Admin navigation">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `admin-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={18} strokeWidth={2.4} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="admin-sidebar-footer">
            <NavLink to="/home" className="admin-nav-link">
              <Home size={18} strokeWidth={2.4} />
              <span>Back to app</span>
            </NavLink>

            <SignOutButton label="Sign out" />
          </div>
        </aside>

        <section className="admin-content">
          <header className="admin-topbar">
            <div>
              <p className="admin-page-eyebrow">Tournament control room</p>
              <h1 className="admin-page-title">{title}</h1>

              {description && <p className="admin-page-copy">{description}</p>}
            </div>

            {actions && <div className="admin-actions-row">{actions}</div>}
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}

export default AdminLayout;
