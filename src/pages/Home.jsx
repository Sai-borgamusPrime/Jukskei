import { useEffect, useMemo, useState } from "react";
import { Radio } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { usePublicQuery } from "../hooks/usePublicQuery";
import { getPublicMatches } from "../services/publicApi";
import "./Home.css";

const STATUS_ORDER = [
  "All",
  "Live",
  "Upcoming",
  "Past",
  "Completed",
  "Cancelled",
];

function getStatusClass(status) {
  const normalStatus = String(status || "").toLowerCase();

  if (normalStatus === "live") return "live";
  if (normalStatus === "upcoming") return "upcoming";
  if (normalStatus === "cancelled" || normalStatus === "canceled") {
    return "cancelled";
  }

  return "finished";
}

function getStatusLabel(status) {
  if (!status || status === "All") return "All Matches";
  if (status === "Past") return "Past Matches";
  return `${status} Matches`;
}

function getTeamLogo(src) {
  if (!src) return "/logo.webp";
  return String(src).replace(/\.(png|jpg|jpeg)$/i, ".webp");
}

function MatchCard({ match }) {
  const statusClass = getStatusClass(match.status);

  return (
    <article className="match-card">
      <div className="match-card-top">
        <div className="match-datetime">
          <span className="match-date">{match.date}</span>
          <span className="match-time">{match.time}</span>
        </div>

        <span className={`match-status ${statusClass}`}>{match.status}</span>
      </div>

      <div className="match-card-body">
        <div className="team-block">
          <img
            src={getTeamLogo(match.teamA.logo)}
            alt={match.teamA.name}
            className="team-logo"
            onError={(event) => {
              event.currentTarget.src = "/logo.webp";
            }}
          />
          <span className="team-name">{match.teamA.name}</span>
        </div>

        <div className="match-score">
          <span>{match.teamAScore}</span>
          <span className="score-divider">-</span>
          <span>{match.teamBScore}</span>
        </div>

        <div className="team-block">
          <img
            src={getTeamLogo(match.teamB.logo)}
            alt={match.teamB.name}
            className="team-logo"
            onError={(event) => {
              event.currentTarget.src = "/logo.webp";
            }}
          />
          <span className="team-name">{match.teamB.name}</span>
        </div>
      </div>

      {match.venue && (
        <button className="watch-button" type="button">
          {match.venue}
        </button>
      )}
    </article>
  );
}

function Home() {
  const [activeTab, setActiveTab] = useState("All");

  const {
    data: matches = [],
    loading,
    error,
  } = usePublicQuery(getPublicMatches, [], ["matches", "teams"]);

  const availableStatuses = useMemo(() => {
    const statusesFromMatches = Array.from(
      new Set(matches.map((match) => match.status).filter(Boolean)),
    );

    const orderedStatuses = STATUS_ORDER.filter(
      (status) => status === "All" || statusesFromMatches.includes(status),
    );

    const customStatuses = statusesFromMatches.filter(
      (status) => !STATUS_ORDER.includes(status),
    );

    return [...orderedStatuses, ...customStatuses];
  }, [matches]);

  useEffect(() => {
    if (!availableStatuses.includes(activeTab)) {
      setActiveTab("All");
    }
  }, [activeTab, availableStatuses]);

  const filteredMatches = useMemo(() => {
    if (activeTab === "All") return matches;

    return matches.filter((match) => match.status === activeTab);
  }, [activeTab, matches]);

  return (
    <main className="home-page">
      <section className="home-shell">
        <header className="home-header">
          <div>
            <h1 className="home-title">JUKSKEI</h1>
            <p className="home-kicker">Tournament Match Centre</p>
          </div>
        </header>

        <section className="home-hero">
          <div className="home-hero-content">
            <p className="home-eyebrow">Live Scoreboard</p>
            <h2 className="home-hero-title">
              Follow the latest Jukskei matches in real time.
            </h2>
          </div>

          <div className="home-tabs" role="tablist" aria-label="Match filters">
            {availableStatuses.map((status) => (
              <button
                key={status}
                className={`tab-button ${activeTab === status ? "active" : ""}`}
                onClick={() => setActiveTab(status)}
                type="button"
              >
                {status === "Live" && <Radio size={14} strokeWidth={2.2} />}
                <span>{status === "All" ? "All" : status}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="matches-section">
          <div className="section-heading-row">
            <h2 className="section-title">{getStatusLabel(activeTab)}</h2>

            <span className="match-count">
              {filteredMatches.length}{" "}
              {filteredMatches.length === 1 ? "match" : "matches"}
            </span>
          </div>

          <div className="matches-list">
            {loading ? (
              <p className="empty-events">Loading matches...</p>
            ) : error ? (
              <p className="empty-events">{error}</p>
            ) : filteredMatches.length === 0 ? (
              <p className="empty-events">No matches found.</p>
            ) : (
              filteredMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))
            )}
          </div>
        </section>

        <BottomNav />
      </section>
    </main>
  );
}

export default Home;
