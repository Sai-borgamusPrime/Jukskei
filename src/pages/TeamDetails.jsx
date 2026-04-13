import { Bell, ChevronLeft, Radio } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import teams from "../data/teams";
import "./TeamDetails.css";

function TeamDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("past");

  const team = useMemo(() => {
    return teams.find((item) => item.slug === slug);
  }, [slug]);

  if (!team) {
    return (
      <main className="team-details-page">
        <section className="team-details-shell">
          <p>Team not found.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="team-details-page">
      <section className="team-details-shell">
        <div className="team-hero">
          <div className="team-hero-top">
            <button
              className="team-icon-button"
              aria-label="Go back"
              onClick={() => navigate("/teams")}
            >
              <ChevronLeft size={18} strokeWidth={2.4} />
            </button>

            <button className="team-icon-button" aria-label="Notifications">
              <Bell size={18} strokeWidth={2.2} />
            </button>
          </div>

          <div className="team-hero-content">
            <img
              src={team.bannerLogo}
              alt={team.name}
              className="team-hero-logo"
            />
            <h1 className="team-hero-title">{team.name}</h1>
          </div>
        </div>

        <div className="team-tabs">
          <button
            className={`team-tab ${activeTab === "live" ? "active" : ""}`}
            onClick={() => setActiveTab("live")}
          >
            <Radio size={14} strokeWidth={2.2} />
            <span>Live</span>
          </button>

          <button
            className={`team-tab ${activeTab === "past" ? "active" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            <span>Past Matches</span>
          </button>
        </div>

        <section className="team-schedule-section">
          <h2 className="team-section-title">Team Schedule</h2>

          <div className="team-schedule-list">
            {team.schedule.map((item) => (
              <article key={item.id} className="team-schedule-row">
                <div className={`team-schedule-dot ${item.dotColor}`}></div>

                <div className="team-schedule-card">
                  <p className="team-schedule-time">{item.datetime}</p>
                  <p className="team-schedule-match">{item.match}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <BottomNav />
      </section>
    </main>
  );
}

export default TeamDetails;