import { Bell, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import teams from "../data/teams";
import "./Teams.css";

function Teams() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filteredTeams = useMemo(() => {
    return teams.filter((team) =>
      team.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <main className="teams-page">
      <section className="teams-shell">
        <header className="teams-header">
          <h1 className="teams-title">JUKSKEI</h1>

          <button className="notification-button" aria-label="Notifications">
            <Bell size={18} strokeWidth={2.2} />
          </button>
        </header>

        <section className="teams-section">
          <h2 className="page-heading">All Teams</h2>

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
            {filteredTeams.map((team) => (
              <button
                key={team.id}
                type="button"
                className="team-row-card"
                onClick={() => navigate(`/teams/${team.slug}`)}
              >
                <span className="team-number">{team.id}</span>
                <span className="team-row-name">{team.name}</span>
                <span className={`team-badge ${team.color.toLowerCase()}`}>
                  {team.color}
                </span>
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