import { useState } from "react";
import { Bell, Radio } from "lucide-react";
import MatchCard from "../components/MatchCard";
import BottomNav from "../components/BottomNav";
import matches from "../data/matches";
import "./Home.css";

function Home() {
  const [activeTab, setActiveTab] = useState("live");

  return (
    <main className="home-page">
      <section className="home-shell">
        <header className="home-header">
          <h1 className="home-title">JUKSKEI</h1>

          <button className="notification-button" aria-label="Notifications">
            <Bell size={18} strokeWidth={2.2} />
          </button>
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
            {matches.map((match) => (
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