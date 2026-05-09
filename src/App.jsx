import { useEffect } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";

import Splash from "./pages/Splash";
import Splash2 from "./pages/Splash2";
import Home from "./pages/Home";
import Schedule from "./pages/Schedule";
import Teams from "./pages/Teams";
import TeamDetails from "./pages/TeamDetails";
import Menu from "./pages/Menu";
import Shop from "./pages/Shop";
import Gallery from "./pages/Gallery";

import useTheme from "./hooks/useTheme";
import { useAuthProfile } from "./hooks/useAuthProfile";
import { supabase } from "./lib/supabaseClient";

function Placeholder({ title }) {
  return (
    <main style={{ minHeight: "100vh", padding: "2rem" }}>
      <h1>{title}</h1>
    </main>
  );
}

function PageLoader() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#001a4d",
        color: "#ffffff",
        fontWeight: 800,
      }}
    >
      Loading...
    </main>
  );
}

function AuthErrorScreen({ message }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background: "#fff5f5",
        color: "#7f1d1d",
      }}
    >
      <div>
        <h1>Authentication error</h1>
        <p>{message}</p>
        <Link to="/logout">Clear session and restart</Link>
      </div>
    </main>
  );
}

function AdminRoute({ children }) {
  const { loading, error, isLoggedIn, isSuperAdmin } = useAuthProfile();

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return <AuthErrorScreen message={error} />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/splash2" replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    async function logout() {
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch (error) {
        console.error("Logout failed:", error);
      } finally {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/", { replace: true });
      }
    }

    logout();
  }, [navigate]);

  return <PageLoader />;
}

function AdminLayout({ title, children }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        color: "#101828",
        display: "grid",
        gridTemplateColumns: "minmax(220px, 260px) 1fr",
      }}
    >
      <aside
        style={{
          padding: "1.5rem",
          background: "#001a4d",
          color: "#ffffff",
        }}
      >
        <h2 style={{ margin: "0 0 1.5rem" }}>Jukskei Admin</h2>

        <nav
          style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}
        >
          <AdminNavLink to="/admin">Dashboard</AdminNavLink>
          <AdminNavLink to="/admin/teams">Teams</AdminNavLink>
          <AdminNavLink to="/admin/matches">Matches</AdminNavLink>
          <AdminNavLink to="/admin/schedule">Schedule</AdminNavLink>
          <AdminNavLink to="/admin/menu">Menu</AdminNavLink>
          <AdminNavLink to="/admin/gallery">Gallery</AdminNavLink>
          <AdminNavLink to="/home">Back to App</AdminNavLink>
          <AdminNavLink to="/logout">Sign out</AdminNavLink>
        </nav>
      </aside>

      <section style={{ padding: "2rem" }}>
        <header style={{ marginBottom: "1.5rem" }}>
          <p
            style={{
              margin: "0 0 0.35rem",
              color: "#2f6fff",
              fontSize: "0.8rem",
              fontWeight: 900,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Super Admin Portal
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "-0.06em",
            }}
          >
            {title}
          </h1>
        </header>

        {children}
      </section>
    </main>
  );
}

function AdminNavLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        color: "#ffffff",
        textDecoration: "none",
        padding: "0.85rem 1rem",
        borderRadius: "14px",
        background: "rgba(255, 255, 255, 0.1)",
        fontWeight: 700,
      }}
    >
      {children}
    </Link>
  );
}

function AdminPlaceholder({ title, description }) {
  return (
    <AdminLayout title={title}>
      <div
        style={{
          padding: "1.5rem",
          borderRadius: "24px",
          background: "#ffffff",
          boxShadow: "0 20px 50px rgba(0, 26, 77, 0.08)",
          border: "1px solid rgba(0, 26, 77, 0.08)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>{title} page coming soon</h2>
        <p style={{ maxWidth: "680px", color: "#475467", lineHeight: 1.7 }}>
          {description}
        </p>
      </div>
    </AdminLayout>
  );
}

function App() {
  useTheme();

  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/splash2" element={<Splash2 />} />

      <Route path="/home" element={<Home />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/teams" element={<Teams />} />
      <Route path="/teams/:slug" element={<TeamDetails />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/scores" element={<Placeholder title="Scores" />} />

      <Route path="/logout" element={<Logout />} />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPlaceholder
              title="Dashboard"
              description="This will become your admin overview with live matches, quick actions, and tournament status."
            />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/teams"
        element={
          <AdminRoute>
            <AdminPlaceholder
              title="Teams"
              description="This page will manage teams, divisions, logos, and team scores."
            />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/matches"
        element={
          <AdminRoute>
            <AdminPlaceholder
              title="Matches"
              description="This page will manage fixtures, live scores, and final results."
            />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/schedule"
        element={
          <AdminRoute>
            <AdminPlaceholder
              title="Schedule"
              description="This page will manage tournament events, dates, times, and locations."
            />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/menu"
        element={
          <AdminRoute>
            <AdminPlaceholder
              title="Menu"
              description="This page will manage food items, prices, categories, and availability."
            />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/gallery"
        element={
          <AdminRoute>
            <AdminPlaceholder
              title="Gallery"
              description="This page will manage gallery images, categories, and cover photos."
            />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
