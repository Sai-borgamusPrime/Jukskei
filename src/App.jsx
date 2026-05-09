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

import AdminDashboard from "./admin/AdminDashboard";
import AdminTeams from "./admin/AdminTeams";
import AdminMatches from "./admin/AdminMatches";
import AdminSchedule from "./admin/AdminSchedule";
import AdminMenu from "./admin/AdminMenu";
import AdminShop from "./admin/AdminShop";
import AdminGallery from "./admin/AdminGallery";

import useTheme from "./hooks/useTheme";
import { useAuthProfile } from "./hooks/useAuthProfile";
import { supabase } from "./lib/supabaseClient";

import AdminAccessButton from "./components/AdminAccessButton/AdminAccessButton";

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
      <div
        style={{
          width: "min(100%, 520px)",
          padding: "2rem",
          borderRadius: "24px",
          background: "#ffffff",
          boxShadow: "0 20px 50px rgba(127, 29, 29, 0.12)",
        }}
      >
        <h1 style={{ marginTop: 0 }}>Authentication error</h1>

        <p style={{ lineHeight: 1.6 }}>
          {message || "Something went wrong while checking your account."}
        </p>

        <Link
          to="/logout"
          style={{
            display: "inline-flex",
            marginTop: "1rem",
            color: "#ffffff",
            background: "#b42318",
            padding: "0.85rem 1rem",
            borderRadius: "14px",
            textDecoration: "none",
            fontWeight: 800,
          }}
        >
          Clear session and restart
        </Link>
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
        if (supabase?.auth) {
          await supabase.auth.signOut({ scope: "local" });
        }
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

function App() {
  useTheme();

  return (
    <>
      <Routes>
        {/* Splash / Auth */}
        <Route path="/" element={<Splash />} />
        <Route path="/splash2" element={<Splash2 />} />
        <Route path="/logout" element={<Logout />} />

        {/* Public App */}
        <Route path="/home" element={<Home />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:slug" element={<TeamDetails />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/scores" element={<Placeholder title="Scores" />} />

        {/* Protected Admin Portal */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/teams"
          element={
            <AdminRoute>
              <AdminTeams />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/matches"
          element={
            <AdminRoute>
              <AdminMatches />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/schedule"
          element={
            <AdminRoute>
              <AdminSchedule />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/menu"
          element={
            <AdminRoute>
              <AdminMenu />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/shop"
          element={
            <AdminRoute>
              <AdminShop />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/gallery"
          element={
            <AdminRoute>
              <AdminGallery />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      <AdminAccessButton />
    </>
  );
}

export default App;
