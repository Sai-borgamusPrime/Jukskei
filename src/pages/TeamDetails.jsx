import { ChevronLeft, Radio } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { usePublicQuery } from "../hooks/usePublicQuery";
import { getPublicTeamDetails } from "../services/publicApi";
import "./TeamDetails.css";

function getDotColor(status) {
  if (status === "Live") return "green";
  if (status === "Upcoming") return "yellow";
  if (status === "Cancelled") return "red";
  return "black";
}

function TeamDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("past");

  const loader = useCallback(() => getPublicTeamDetails(slug), [slug]);

  const {
    data,
    loading,
    error,
  } = usePublicQuery(loader, [slug], ["teams", "matches"]);

  const team = data?.team;
  const matches = data?.matches || [];

  const filteredSchedule = useMemo(() => {
    return matches
      .filter((item) => {
        if (activeTab === "live") {
          return item.status === "Live";
        }

        return item.status !== "Live";
      })
      .map((item) => ({
        id: item.id,
        datetime: item.datetime,
        match: item.title,
        dotColor: getDotColor(item.status),
      }));
  }, [matches, activeTab]);

  if (loading) {
    return (
      <main className="team-details-page">
        <section className="team-details-shell">
          <p className="team-not-found">Loading team...</p>
        </section>
      </main>
    );
  }

  if (error || !team) {
    return (
      <main className="team-details-page">
        <section className="team-details-shell">
          <p className="team-not-found">{error || "Team not found."}</p>
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
              type="button"
            >
              <ChevronLeft size={18} strokeWidth={2.4} />
            </button>
          </div>

          <div className="team-hero-content">
            <div className="team-hero-logo-card">
              <img src={team.bannerLogo} alt={team.name} className="team-hero-logo" />
            </div>

            <div className="team-hero-text">
              <p className="team-hero-eyebrow">Division {team.division}</p>
              <h1 className="team-hero-title">{team.name}</h1>

              {typeof team.totalScore !== "undefined" && (
                <div className="team-total-score">
                  <span>Total Score</span>
                  <strong>{team.totalScore}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="team-content">
          <div className="team-tabs">
            <button
              className={`team-tab ${activeTab === "past" ? "active" : ""}`}
              onClick={() => setActiveTab("past")}
              type="button"
            >
              <span>Past Matches</span>
            </button>

            <button
              className={`team-tab ${activeTab === "live" ? "active" : ""}`}
              onClick={() => setActiveTab("live")}
              type="button"
            >
              <Radio size={14} strokeWidth={2.2} />
              <span>Live</span>
            </button>
          </div>

          <section className="team-schedule-section">
            <div className="team-section-heading">
              <div>
                <p className="team-section-eyebrow">Fixtures</p>
                <h2 className="team-section-title">Team Schedule</h2>
              </div>

              <span className="team-match-count">
                {filteredSchedule.length} {filteredSchedule.length === 1 ? "match" : "matches"}
              </span>
            </div>

            <div className="team-schedule-list">
              {filteredSchedule.length === 0 ? (
                <p className="team-empty-state">
                  No {activeTab === "live" ? "live" : "past"} matches found.
                </p>
              ) : (
                filteredSchedule.map((item) => (
                  <article key={item.id} className="team-schedule-row">
                    <div className={`team-schedule-dot ${item.dotColor}`}></div>

                    <div className="team-schedule-card">
                      <p className="team-schedule-time">{item.datetime}</p>
                      <p className="team-schedule-match">{item.match}</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </section>

        <BottomNav />
      </section>
    </main>
  );
}

export default TeamDetails;
