import { useEffect, useState } from "react";
import {
  CalendarDays,
  GalleryHorizontal,
  Radio,
  RefreshCw,
  Trophy,
  ShoppingBag,
  Utensils,
  Users,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import { getDashboardStats } from "../services/adminApi";

const initialStats = {
  totals: {
    teams: 0,
    matches: 0,
    liveMatches: 0,
    events: 0,
    menuItems: 0,
    shopItems: 0,
    galleryImages: 0,
  },
  recentMatches: [],
  upcomingEvents: [],
};

function StatCard({ label, value, icon: Icon }) {
  return (
    <article className="admin-stat">
      <Icon size={22} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || "Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <AdminLayout
      title="Dashboard"
      description="Monitor the tournament content your public app displays and jump into the areas that need updates."
      actions={
        <button type="button" className="admin-button secondary" onClick={loadStats}>
          <RefreshCw size={16} />
          Refresh
        </button>
      }
    >
      <div className="admin-grid">
        {error && <p className="admin-error">{error}</p>}

        <section className="admin-stat-grid">
          <StatCard label="Teams" value={stats.totals.teams} icon={Users} />
          <StatCard label="Matches" value={stats.totals.matches} icon={Radio} />
          <StatCard label="Live" value={stats.totals.liveMatches} icon={Trophy} />
          <StatCard label="Events" value={stats.totals.events} icon={CalendarDays} />
          <StatCard label="Menu" value={stats.totals.menuItems} icon={Utensils} />
          <StatCard label="Shop" value={stats.totals.shopItems} icon={ShoppingBag} />
          <StatCard
            label="Gallery"
            value={stats.totals.galleryImages}
            icon={GalleryHorizontal}
          />
        </section>

        <div className="admin-grid two">
          <section className="admin-card">
            <div className="admin-card-header">
              <div>
                <p className="admin-section-kicker">Scoreboard</p>
                <h2 className="admin-card-title">Recent matches</h2>
              </div>
            </div>

            <div className="admin-list">
              {loading ? (
                <p className="admin-empty">Loading matches...</p>
              ) : stats.recentMatches.length === 0 ? (
                <p className="admin-empty">No matches have been created yet.</p>
              ) : (
                stats.recentMatches.map((match) => (
                  <article className="admin-list-item" key={match.id}>
                    <div className="admin-list-icon">
                      <Radio size={20} />
                    </div>

                    <div>
                      <p className="admin-list-title">
                        {match.title ||
                          `${match.team_a_name || "Team A"} vs ${
                            match.team_b_name || "Team B"
                          }`}
                      </p>
                      <p className="admin-list-meta">
                        {match.team_a_score} - {match.team_b_score} ·{" "}
                        {match.venue || "No venue"}
                      </p>
                    </div>

                    <span
                      className={`admin-pill ${
                        match.status === "Live"
                          ? "live"
                          : match.status === "Past"
                            ? "past"
                            : ""
                      }`}
                    >
                      {match.status}
                    </span>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="admin-card">
            <div className="admin-card-header">
              <div>
                <p className="admin-section-kicker">Schedule</p>
                <h2 className="admin-card-title">Upcoming events</h2>
              </div>
            </div>

            <div className="admin-list">
              {loading ? (
                <p className="admin-empty">Loading events...</p>
              ) : stats.upcomingEvents.length === 0 ? (
                <p className="admin-empty">No schedule events have been created yet.</p>
              ) : (
                stats.upcomingEvents.map((event) => (
                  <article className="admin-list-item" key={event.id}>
                    <div className="admin-list-icon">
                      <CalendarDays size={20} />
                    </div>

                    <div>
                      <p className="admin-list-title">{event.title}</p>
                      <p className="admin-list-meta">
                        {event.date} · {event.time} · {event.location || "No location"}
                      </p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
