import { useState } from "react";
import { Radio } from "lucide-react";
import MatchCard from "../components/MatchCard";
import BottomNav from "../components/BottomNav";
import ThemeToggle from "../components/ThemeToggle";
import matches from "../data/matches";
import "./Home.css";
import SignOutButton from "../components/SignOutButton/SignOutButton";

function Home() {
  const [activeTab, setActiveTab] = useState("live");

  const filteredMatches =
    activeTab === "live"
      ? matches.filter((match) => match.status === "Live")
      : matches.filter((match) => match.status !== "Live");

  return (
    <main className="home-page">
      <section className="home-shell">
        <header className="home-header">
          <div>
            <h1 className="home-title">JUKSKEI</h1>
            <p className="home-kicker">Toernooi Wedstrydsentrum</p>
          </div>

          <div>
            <ThemeToggle />
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
            {filteredMatches.map((match) => (
              <MatchCard key={match.id} {...match} />
            ))}
          </div>
        </section>

        <BottomNav />
      </section>
    </main>
  );
}

export default Home;
