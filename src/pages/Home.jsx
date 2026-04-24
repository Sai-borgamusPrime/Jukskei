import { useState } from "react";
import { Radio } from "lucide-react";
import MatchCard from "../components/MatchCard";
import BottomNav from "../components/BottomNav";
import ThemeToggle from "../components/ThemeToggle";
import matches from "../data/matches";
import "./Home.css";

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
          <h1 className="home-title">JUKSKEI</h1>

          <ThemeToggle />
        </header>

        <div className="home-tabs">
          <button
            className={`tab-button ${activeTab === "live" ? "active" : ""}`}
            onClick={() => setActiveTab("live")}
          >
            <Radio size={14} strokeWidth={2.2} />
            <span>Live</span>
          </button>

          <button
            className={`tab-button ${activeTab === "past" ? "active" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            <span>Past Matches</span>
          </button>
        </div>

        <section className="matches-section">
          <h2 className="section-title">
            {activeTab === "live" ? "Live Matches" : "Past Matches"}
          </h2>

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
