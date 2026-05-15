import { Search, SlidersHorizontal, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { usePublicQuery } from "../hooks/usePublicQuery";
import {
  getPublicDivisions,
  getPublicMatches,
  getPublicTeams,
} from "../services/publicApi";
import "./Teams.css";

function toNumber(value) {
  if (value === null || typeof value === "undefined" || value === "") return 0;

  const cleanedValue = String(value)
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  const numberValue = Number(cleanedValue);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function normalise(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getTeamSlug(team) {
  return normalise(team?.slug || team?.team_slug);
}

function getTeamName(team) {
  return normalise(team?.name || team?.team_name);
}

function getTeamId(team) {
  const value = team?.id || team?.team_id || team?.teamId;
  return value === null || typeof value === "undefined" ? "" : String(value);
}

function getMatchTeam(match, side) {
  if (side === "A") {
    return (
      match.teamA ||
      match.team_a ||
      match.team_a_data || {
        id: match.team_a_id || match.teamAId || match.team_a,
        slug: match.team_a_slug,
        name: match.team_a_name || match.teamAName,
        logo: match.team_a_logo || match.teamALogo,
      }
    );
  }

  return (
    match.teamB ||
    match.team_b ||
    match.team_b_data || {
      id: match.team_b_id || match.teamBId || match.team_b,
      slug: match.team_b_slug,
      name: match.team_b_name || match.teamBName,
      logo: match.team_b_logo || match.teamBLogo,
    }
  );
}

function getMatchScore(match, side) {
  if (side === "A") {
    return toNumber(
      match.teamAScore ??
        match.team_a_score ??
        match.teamA_score ??
        match.scoreA ??
        match.score_a ??
        match.team_a_points,
    );
  }

  return toNumber(
    match.teamBScore ??
      match.team_b_score ??
      match.teamB_score ??
      match.scoreB ??
      match.score_b ??
      match.team_b_points,
  );
}

function isSameTeam(team, matchTeam) {
  if (!team || !matchTeam) return false;

  const teamId = getTeamId(team);
  const matchTeamId = getTeamId(matchTeam);

  if (teamId && matchTeamId && teamId === matchTeamId) return true;

  const teamSlug = getTeamSlug(team);
  const matchTeamSlug = getTeamSlug(matchTeam);

  if (teamSlug && matchTeamSlug && teamSlug === matchTeamSlug) return true;

  const teamName = getTeamName(team);
  const matchTeamName = getTeamName(matchTeam);

  return Boolean(teamName && matchTeamName && teamName === matchTeamName);
}

function calculateTeamScore(team, matches) {
  let totalScore = 0;
  let hasRelatedMatch = false;

  matches.forEach((match) => {
    const status = normalise(match.status);

    if (status === "cancelled" || status === "canceled") return;

    const teamA = getMatchTeam(match, "A");
    const teamB = getMatchTeam(match, "B");

    if (isSameTeam(team, teamA)) {
      hasRelatedMatch = true;
      totalScore += getMatchScore(match, "A");
    }

    if (isSameTeam(team, teamB)) {
      hasRelatedMatch = true;
      totalScore += getMatchScore(match, "B");
    }
  });

  return hasRelatedMatch ? totalScore : toNumber(team?.totalScore);
}

function Teams() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Teams");
  const navigate = useNavigate();

  const {
    data: teams = [],
    loading: teamsLoading,
    error: teamsError,
  } = usePublicQuery(
    getPublicTeams,
    [],
    ["teams", "team_divisions", "matches"],
  );

  const {
    data: divisions = [],
    loading: divisionsLoading,
    error: divisionsError,
  } = usePublicQuery(getPublicDivisions, [], ["team_divisions"]);

  const {
    data: matches = [],
    loading: matchesLoading,
    error: matchesError,
  } = usePublicQuery(getPublicMatches, [], ["matches", "teams"]);

  const teamsWithLiveScores = useMemo(() => {
    return teams.map((team) => ({
      ...team,
      totalScore: calculateTeamScore(team, matches),
    }));
  }, [teams, matches]);

  const divisionCodes = useMemo(
    () => divisions.map((division) => division.code),
    [divisions],
  );

  useEffect(() => {
    if (activeTab !== "All Teams" && !divisionCodes.includes(activeTab)) {
      setActiveTab("All Teams");
    }
  }, [activeTab, divisionCodes]);

  const filteredTeams = useMemo(() => {
    return [...teamsWithLiveScores]
      .filter((team) => {
        const matchesSearch = team.name
          .toLowerCase()
          .includes(query.toLowerCase());

        const matchesDivision =
          activeTab === "All Teams" || team.division === activeTab;

        return matchesSearch && matchesDivision;
      })
      .sort((a, b) => toNumber(b.totalScore) - toNumber(a.totalScore));
  }, [query, activeTab, teamsWithLiveScores]);

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

  const isLoading = teamsLoading || divisionsLoading || matchesLoading;
  const error = teamsError || divisionsError || matchesError;

  return (
    <main className="teams-page">
      <section className="teams-shell">
        <header className="teams-header">
          <div>
            <h1 className="teams-title">JUKSKEI</h1>
            <p className="teams-kicker">Team Rankings</p>
          </div>
        </header>

        <section className="teams-hero">
          <div>
            <p className="teams-eyebrow">Tournament Rankings</p>
            <h2 className="teams-page-heading">Teams</h2>
            <p className="teams-hero-text">
              Browse divisions, search teams, and view rankings based on total
              score.
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
              <button
                type="button"
                className={`tab ${activeTab === "All Teams" ? "active" : ""}`}
                onClick={() => setActiveTab("All Teams")}
              >
                All
              </button>

              {divisions.map((division) => (
                <button
                  key={division.id}
                  type="button"
                  className={`tab ${
                    activeTab === division.code ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(division.code)}
                >
                  {division.name}
                </button>
              ))}
            </div>

            <div className="search-bar">
              <input
                type="text"
                placeholder="Search teams"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
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
            {isLoading ? (
              <p className="admin-empty">Loading teams...</p>
            ) : error ? (
              <p className="admin-error">{error}</p>
            ) : filteredTeams.length === 0 ? (
              <p className="admin-empty">No teams found.</p>
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
                        src={team.logo || "/logo.webp"}
                        alt={team.name}
                        className="team-logo"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = "/logo.webp";
                        }}
                      />
                    </div>

                    <div className="team-text">
                      <span className="team-row-name">{team.name}</span>
                      <span className="team-meta">
                        {team.divisionName || `Division ${team.division}`}
                      </span>
                    </div>
                  </div>

                  <div className="score-area">
                    {index < 3 && <Trophy size={13} strokeWidth={2.5} />}

                    <span className="score-label">{getScoreLabel(index)}</span>

                    <span className="team-score-badge">
                      {toNumber(team.totalScore)}
                    </span>
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
