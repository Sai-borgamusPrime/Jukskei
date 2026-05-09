import { useMemo, useState } from "react";
import { Radio } from "lucide-react";
import BottomNav from "../components/BottomNav";
import SignOutButton from "../components/SignOutButton/SignOutButton";
import { usePublicQuery } from "../hooks/usePublicQuery";
import { getPublicMatches } from "../services/publicApi";
import "./Home.css";

function MatchCard({ match }) {
  const statusClass = match.status === "Live" ? "live" : "finished";

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
            src={match.teamA.logo}
            alt={match.teamA.name}
            className="team-logo"
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
            src={match.teamB.logo}
            alt={match.teamB.name}
            className="team-logo"
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
  const [activeTab, setActiveTab] = useState("live");

  const {
    data: matches = [],
    loading,
    error,
  } = usePublicQuery(getPublicMatches, [], ["matches", "teams"]);

  const filteredMatches = useMemo(() => {
    return activeTab === "live"
      ? matches.filter((match) => match.status === "Live")
      : matches.filter((match) => match.status !== "Live");
  }, [activeTab, matches]);

  return (
    <main className="home-page">
      <section className="home-shell">
        <header className="home-header">
          <div>
            <h1 className="home-title">JUKSKEI</h1>
            <p className="home-kicker">Toernooi Wedstrydsentrum</p>
          </div>

          <div>
            <SignOutButton />
          </div>
        </header>

        <section className="home-hero">
          <div className="home-hero-content">
            <p className="home-eyebrow">Live Scoreboard</p>
            <h2 className="home-hero-title">
              Volg die nuutste Jukskei-wedstryde in reële tyd.
            </h2>
          </div>

          <div className="home-tabs" role="tablist" aria-label="Match filters">
            <button
              className={`tab-button ${activeTab === "live" ? "active" : ""}`}
              onClick={() => setActiveTab("live")}
              type="button"
            >
              <Radio size={14} strokeWidth={2.2} />
              <span>Live</span>
            </button>

            <button
              className={`tab-button ${activeTab === "past" ? "active" : ""}`}
              onClick={() => setActiveTab("past")}
              type="button"
            >
              <span>Past Matches</span>
            </button>
          </div>
        </section>

        <section className="matches-section">
          <div className="section-heading-row">
            <h2 className="section-title">
              {activeTab === "live" ? "Live Matches" : "Past Matches"}
            </h2>

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
