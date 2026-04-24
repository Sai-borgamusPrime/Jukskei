import { Search, SlidersHorizontal, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import ThemeToggle from "../components/ThemeToggle";
import teams from "../data/teams";
import "./Teams.css";

function Teams() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Teams");
  const navigate = useNavigate();

  const filteredTeams = useMemo(() => {
    return teams
      .filter(
        (team) =>
          team.name.toLowerCase().includes(query.toLowerCase()) &&
          (activeTab === "All Teams" || team.division === activeTab),
      )
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [query, activeTab]);

  const getRankClass = (index) => {
    if (index === 0) return "rank-gold";
    if (index === 1) return "rank-silver";
    if (index === 2) return "rank-bronze";
    return "rank-blue";
  };

  const getScoreLabel = (index) => {
    if (index === 0) return "Gold";
    if (index === 1) return "Silver";
    if (index === 2) return "Bronze";
    return "Score";
  };

  return (
    <main className="teams-page">
      <section className="teams-shell">
        <header className="teams-header">
          <h1 className="teams-title">JUKSKEI</h1>

          <ThemeToggle />
        </header>

        <section className="teams-section">
          <h2 className="teams-page-heading">Teams</h2>

          <div className="tabs">
            <button
              className={`tab ${activeTab === "All Teams" ? "active" : ""}`}
              onClick={() => setActiveTab("All Teams")}
            >
              All
            </button>

            <button
              className={`tab ${activeTab === "A" ? "active" : ""}`}
              onClick={() => setActiveTab("A")}
            >
              Division A
            </button>

            <button
              className={`tab ${activeTab === "B" ? "active" : ""}`}
              onClick={() => setActiveTab("B")}
            >
              Division B
            </button>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button className="search-icon-btn" aria-label="Filter">
              <SlidersHorizontal size={16} />
            </button>

            <button className="search-icon-btn" aria-label="Search">
              <Search size={16} />
            </button>
          </div>

          <div className="teams-list">
            {filteredTeams.map((team, index) => (
              <button
                key={team.id}
                type="button"
                className={`team-row-card ${getRankClass(index)}`}
                onClick={() => navigate(`/teams/${team.slug}`)}
              >
                <div className="rank-pill">
                  <span>{index + 1}</span>
                </div>

                <div className="team-main">
                  <div className="team-logo-wrap">
                    <img
                      src={team.logo}
                      alt={team.name}
                      className="team-logo"
                    />
                  </div>

                  <div className="team-text">
                    <span className="team-row-name">{team.name}</span>
                    <span className="team-meta">Division {team.division}</span>
                  </div>
                </div>

                <div className="score-area">
                  {index < 3 && <Trophy size={13} strokeWidth={2.5} />}

                  <span className="score-label">{getScoreLabel(index)}</span>

                  <span className="team-score-badge">{team.totalScore}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <BottomNav />
      </section>
    </main>
  );
}

export default Teams;
