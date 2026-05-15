import { ChevronLeft, Radio } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { usePublicQuery } from "../hooks/usePublicQuery";
import { getPublicMatches, getPublicTeamDetails } from "../services/publicApi";
import "./Home.css";
import "./TeamDetails.css";

const STATUS_ORDER = [
  "All",
  "Upcoming",
  "Live",
  "Past",
  "Completed",
  "Cancelled",
];

const scrollableTabsStyle = {
  display: "flex",
  flexWrap: "nowrap",
  gap: "10px",
  overflowX: "auto",
  overflowY: "hidden",
  WebkitOverflowScrolling: "touch",
  scrollbarWidth: "thin",
  paddingBottom: "6px",
};

const scrollableTabButtonStyle = {
  flex: "0 0 auto",
  whiteSpace: "nowrap",
};

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

function normaliseStatus(status) {
  const value = normalise(status);

  if (value === "live") return "Live";
  if (value === "upcoming") return "Upcoming";
  if (value === "past") return "Past";
  if (value === "completed" || value === "complete") return "Completed";
  if (value === "cancelled" || value === "canceled") return "Cancelled";

  return status || "Upcoming";
}

function getStatusClass(status) {
  const normalStatus = normaliseStatus(status).toLowerCase();

  if (normalStatus === "live") return "live";
  if (normalStatus === "upcoming") return "upcoming";
  if (normalStatus === "cancelled") return "cancelled";

  return "finished";
}

function getSafeLogo(src) {
  const value = String(src || "").trim();
  return value || "/logo.webp";
}

function getTeamSlug(team) {
  return normalise(team?.slug || team?.team_slug);
}

function getTeamName(team) {
  return normalise(team?.name || team?.team_name);
}

function getTeamId(team) {
  const value = team?.id ?? team?.team_id ?? team?.teamId;
  return value === null || typeof value === "undefined" ? "" : String(value);
}

function getMatchTeam(match, side) {
  if (side === "A") {
    return (
      match.teamA ||
      match.team_a ||
      match.team_a_data || {
        id: match.team_a_id ?? match.teamAId ?? match.team_a,
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
      id: match.team_b_id ?? match.teamBId ?? match.team_b,
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

function getMatchId(match) {
  return String(
    match.id ??
      match.match_id ??
      `${getTeamId(getMatchTeam(match, "A"))}-${getTeamId(
        getMatchTeam(match, "B"),
      )}-${match.date || match.matchDate || match.match_date}-${match.time || ""}`,
  );
}

function calculateTeamScore(team, matches) {
  let totalScore = 0;
  let hasRelatedMatch = false;

  matches.forEach((match) => {
    const status = normaliseStatus(match.status);

    if (status === "Cancelled") return;

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

function formatDate(value) {
  if (!value) return "Date TBC";

  const stringValue = String(value);

  if (!/^\d{4}-\d{2}-\d{2}/.test(stringValue)) {
    return stringValue;
  }

  const [year, month, day] = stringValue.slice(0, 10).split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return stringValue;

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function getMatchDate(match) {
  return formatDate(match.date || match.matchDate || match.match_date);
}

function getMatchTime(match) {
  return (
    match.time ||
    match.matchTime ||
    match.match_time ||
    match.start_time ||
    "Time TBC"
  );
}

function MatchCard({ match }) {
  const teamA = getMatchTeam(match, "A");
  const teamB = getMatchTeam(match, "B");

  const statusLabel = normaliseStatus(match.status);
  const statusClass = getStatusClass(statusLabel);

  return (
    <article className="match-card">
      <div className="match-card-top">
        <div className="match-datetime">
          <span className="match-date">{getMatchDate(match)}</span>
          <span className="match-time">{getMatchTime(match)}</span>
        </div>

        <span className={`match-status ${statusClass}`}>{statusLabel}</span>
      </div>

      <div className="match-card-body">
        <div className="team-block">
          <img
            src={getSafeLogo(teamA?.logo)}
            alt={teamA?.name || "Team A"}
            className="team-logo"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/logo.webp";
            }}
          />

          <span className="team-name">{teamA?.name || "Team A"}</span>
        </div>

        <div className="match-score">
          <span>{getMatchScore(match, "A")}</span>
          <span className="score-divider">-</span>
          <span>{getMatchScore(match, "B")}</span>
        </div>

        <div className="team-block">
          <img
            src={getSafeLogo(teamB?.logo)}
            alt={teamB?.name || "Team B"}
            className="team-logo"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/logo.webp";
            }}
          />

          <span className="team-name">{teamB?.name || "Team B"}</span>
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

function TeamDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState("All");

  const teamLoader = useCallback(() => getPublicTeamDetails(slug), [slug]);

  const {
    data,
    loading: teamLoading,
    error: teamError,
  } = usePublicQuery(teamLoader, [slug], ["teams", "matches"]);

  const {
    data: allMatches = [],
    loading: matchesLoading,
    error: matchesError,
  } = usePublicQuery(getPublicMatches, [], ["matches", "teams"]);

  const team = data?.team;
  const fallbackTeamMatches = data?.matches || [];

  const teamMatches = useMemo(() => {
    if (!team) return [];

    const combinedMatches = [...allMatches, ...fallbackTeamMatches];
    const uniqueMatches = new Map();

    combinedMatches.forEach((match) => {
      const teamA = getMatchTeam(match, "A");
      const teamB = getMatchTeam(match, "B");

      const isRelatedMatch = isSameTeam(team, teamA) || isSameTeam(team, teamB);

      if (!isRelatedMatch) return;

      const matchId = getMatchId(match);

      if (!uniqueMatches.has(matchId)) {
        uniqueMatches.set(matchId, match);
      }
    });

    return Array.from(uniqueMatches.values());
  }, [team, allMatches, fallbackTeamMatches]);

  const liveTotalScore = useMemo(() => {
    if (!team) return 0;

    return calculateTeamScore(team, teamMatches);
  }, [team, teamMatches]);

  const availableStatusCounts = useMemo(() => {
    return teamMatches.reduce((accumulator, match) => {
      const status = normaliseStatus(match.status);

      accumulator[status] = (accumulator[status] || 0) + 1;
      accumulator.All = (accumulator.All || 0) + 1;

      return accumulator;
    }, {});
  }, [teamMatches]);

  const filteredMatches = useMemo(() => {
    if (activeStatus === "All") {
      return teamMatches;
    }

    return teamMatches.filter(
      (match) => normaliseStatus(match.status) === activeStatus,
    );
  }, [teamMatches, activeStatus]);

  const loading = teamLoading || matchesLoading;
  const error = teamError || matchesError;

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
              <img
                src={getSafeLogo(team.bannerLogo || team.logo)}
                alt={team.name}
                className="team-hero-logo"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/logo.webp";
                }}
              />
            </div>

            <div className="team-hero-text">
              <p className="team-hero-eyebrow">Division {team.division}</p>
              <h1 className="team-hero-title">{team.name}</h1>

              <div className="team-total-score">
                <span>Total Score</span>
                <strong>{liveTotalScore}</strong>
              </div>
            </div>
          </div>
        </div>

        <section className="team-content">
          <section className="team-schedule-section">
            <div className="team-section-heading">
              <div>
                <p className="team-section-eyebrow">Fixtures</p>
                <h2 className="team-section-title">Team Matches</h2>
              </div>

              <span className="team-match-count">
                {filteredMatches.length}{" "}
                {filteredMatches.length === 1 ? "match" : "matches"}
              </span>
            </div>

            <div
              className="home-tabs team-status-tabs"
              role="tablist"
              aria-label="Team match status filters"
              style={scrollableTabsStyle}
            >
              {STATUS_ORDER.map((status) => (
                <button
                  key={status}
                  className={`tab-button ${
                    activeStatus === status ? "active" : ""
                  }`}
                  onClick={() => setActiveStatus(status)}
                  type="button"
                  style={scrollableTabButtonStyle}
                >
                  {status === "Live" && <Radio size={14} strokeWidth={2.2} />}

                  <span>
                    {status}
                    {typeof availableStatusCounts[status] !== "undefined"
                      ? ` (${availableStatusCounts[status]})`
                      : " (0)"}
                  </span>
                </button>
              ))}
            </div>

            <div className="matches-list">
              {filteredMatches.length === 0 ? (
                <p className="team-empty-state">
                  No {activeStatus === "All" ? "" : activeStatus.toLowerCase()}{" "}
                  matches found for this team.
                </p>
              ) : (
                filteredMatches.map((match) => (
                  <MatchCard key={getMatchId(match)} match={match} />
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
