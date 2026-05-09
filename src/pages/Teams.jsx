import { Search, SlidersHorizontal, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import SignOutButton from "../components/SignOutButton/SignOutButton";
import { usePublicQuery } from "../hooks/usePublicQuery";
import { getPublicTeams } from "../services/publicApi";
import "./Teams.css";

function Teams() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Teams");
  const navigate = useNavigate();

  const {
    data: teams = [],
    loading,
    error,
  } = usePublicQuery(getPublicTeams, [], ["teams"]);

  const divisions = useMemo(() => {
    const values = new Set(teams.map((team) => team.division).filter(Boolean));
    return ["All Teams", ...Array.from(values).sort()];
  }, [teams]);

  const filteredTeams = useMemo(() => {
    return teams
      .filter(
        (team) =>
          team.name.toLowerCase().includes(query.toLowerCase()) &&
          (activeTab === "All Teams" || team.division === activeTab),
      )
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [query, activeTab, teams]);

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
          <div>
            <h1 className="teams-title">JUKSKEI</h1>
            <p className="teams-kicker">Spanranglys</p>
          </div>

          <div>
            <SignOutButton />
          </div>
        </header>

        <section className="teams-hero">
          <div>
            <p className="teams-eyebrow">Tournament Rankings</p>
            <h2 className="teams-page-heading">Teams</h2>
            <p className="teams-hero-text">
              Blaai deur afdelings, soek spanne en sien ranglyste gebaseer op
              totale telling.
            </p>
          </div>

          <div className="teams-summary-card">
            <span>{filteredTeams.length}</span>
            <p>{filteredTeams.length === 1 ? "team shown" : "teams shown"}</p>
          </div>
        </section>

        <section className="teams-section">
          <div className="teams-toolbar">
            <div className="tabs" role="tablist" aria-label="Team divisions">
              {divisions.map((division) => (
                <button
                  key={division}
                  type="button"
                  className={`tab ${activeTab === division ? "active" : ""}`}
                  onClick={() => setActiveTab(division)}
                >
                  {division === "All Teams" ? "All" : `Division ${division}`}
                </button>
              ))}
            </div>

            <div className="search-bar">
              <input
                type="text"
                placeholder="Search teams"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <button
                className="search-icon-btn"
                type="button"
                aria-label="Filter"
              >
                <SlidersHorizontal size={16} />
              </button>

              <button
                className="search-icon-btn"
                type="button"
                aria-label="Search"
              >
                <Search size={16} />
              </button>
            </div>
          </div>

          <div className="teams-list">
            {loading ? (
              <p className="team-empty-state">Loading teams...</p>
            ) : error ? (
              <p className="team-empty-state">{error}</p>
            ) : filteredTeams.length === 0 ? (
              <p className="team-empty-state">No teams found.</p>
            ) : (
              filteredTeams.map((team, index) => (
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
                      <span className="team-meta">
                        Division {team.division}
                      </span>
                    </div>
                  </div>

                  <div className="score-area">
                    {index < 3 && <Trophy size={13} strokeWidth={2.5} />}
                    <span className="score-label">{getScoreLabel(index)}</span>
                    <span className="team-score-badge">{team.totalScore}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <BottomNav />
      </section>
    </main>
  );
}

export default Teams;
