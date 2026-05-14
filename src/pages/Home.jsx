import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Radio } from "lucide-react";
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

function getSafeLogo(src) {
  const value = String(src || "").trim();
  return value || "/logo.webp";
}

function getDateKey(value) {
  if (!value) return "";

  const stringValue = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(stringValue)) {
    return stringValue.slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateChip(dateKey) {
  if (!dateKey) return "Date TBC";

  const [year, month, day] = dateKey.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return dateKey;

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function formatSelectedDate(dateKey) {
  if (!dateKey || dateKey === "all") return "All tournament dates";

  const [year, month, day] = dateKey.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return dateKey;

  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
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
            src={getSafeLogo(match.teamA?.logo)}
            alt={match.teamA?.name || "Team A"}
            className="team-logo"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/logo.webp";
            }}
          />

          <span className="team-name">{match.teamA?.name || "Team A"}</span>
        </div>

        <div className="match-score">
          <span>{match.teamAScore}</span>
          <span className="score-divider">-</span>
          <span>{match.teamBScore}</span>
        </div>

        <div className="team-block">
          <img
            src={getSafeLogo(match.teamB?.logo)}
            alt={match.teamB?.name || "Team B"}
            className="team-logo"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/logo.webp";
            }}
          />

          <span className="team-name">{match.teamB?.name || "Team B"}</span>
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
  const [activeDate, setActiveDate] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");

  const {
    data: matches = [],
    loading,
    error,
  } = usePublicQuery(getPublicMatches, [], ["matches", "teams"]);

  const matchesWithDateKey = useMemo(() => {
    return matches.map((match) => ({
      ...match,
      dateKey: getDateKey(match.matchDate || match.match_date),
    }));
  }, [matches]);

  const availableDates = useMemo(() => {
    const uniqueDates = Array.from(
      new Set(matchesWithDateKey.map((match) => match.dateKey).filter(Boolean)),
    );

    return uniqueDates.sort((a, b) => a.localeCompare(b));
  }, [matchesWithDateKey]);

  useEffect(() => {
    if (!activeDate && availableDates.length > 0) {
      setActiveDate(availableDates[0]);
      return;
    }

    if (
      activeDate &&
      activeDate !== "all" &&
      availableDates.length > 0 &&
      !availableDates.includes(activeDate)
    ) {
      setActiveDate(availableDates[0]);
    }
  }, [activeDate, availableDates]);

  const dateFilteredMatches = useMemo(() => {
    if (!activeDate || activeDate === "all") {
      return matchesWithDateKey;
    }

    return matchesWithDateKey.filter((match) => match.dateKey === activeDate);
  }, [activeDate, matchesWithDateKey]);

  const availableStatuses = useMemo(() => {
    const statusesFromMatches = Array.from(
      new Set(dateFilteredMatches.map((match) => match.status).filter(Boolean)),
    );

    const orderedStatuses = STATUS_ORDER.filter(
      (status) => status === "All" || statusesFromMatches.includes(status),
    );

    const customStatuses = statusesFromMatches.filter(
      (status) => !STATUS_ORDER.includes(status),
    );

    return [...orderedStatuses, ...customStatuses];
  }, [dateFilteredMatches]);

  useEffect(() => {
    if (!availableStatuses.includes(activeStatus)) {
      setActiveStatus("All");
    }
  }, [activeStatus, availableStatuses]);

  const filteredMatches = useMemo(() => {
    if (activeStatus === "All") {
      return dateFilteredMatches;
    }

    return dateFilteredMatches.filter((match) => match.status === activeStatus);
  }, [activeStatus, dateFilteredMatches]);

  const visibleDateLabel = formatSelectedDate(activeDate);

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

          <div className="home-filter-panel">
            <div className="home-filter-header">
              <div>
                <p className="home-filter-label">Selected date</p>
                <h3>{visibleDateLabel}</h3>
              </div>

              <span className="home-filter-count">
                {filteredMatches.length}{" "}
                {filteredMatches.length === 1 ? "match" : "matches"}
              </span>
            </div>

            <div className="home-date-tabs" aria-label="Match date filters">
              <button
                type="button"
                className={`date-tab ${activeDate === "all" ? "active" : ""}`}
                onClick={() => setActiveDate("all")}
              >
                <CalendarDays size={14} strokeWidth={2.3} />
                <span>All dates</span>
              </button>

              {availableDates.map((dateKey) => (
                <button
                  key={dateKey}
                  type="button"
                  className={`date-tab ${
                    activeDate === dateKey ? "active" : ""
                  }`}
                  onClick={() => setActiveDate(dateKey)}
                >
                  {formatDateChip(dateKey)}
                </button>
              ))}
            </div>

            <div
              className="home-tabs"
              role="tablist"
              aria-label="Match status filters"
            >
              {availableStatuses.map((status) => (
                <button
                  key={status}
                  className={`tab-button ${
                    activeStatus === status ? "active" : ""
                  }`}
                  onClick={() => setActiveStatus(status)}
                  type="button"
                >
                  {status === "Live" && <Radio size={14} strokeWidth={2.2} />}
                  <span>{status === "All" ? "All" : status}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="matches-section">
          <div className="section-heading-row">
            <div>
              <h2 className="section-title">{getStatusLabel(activeStatus)}</h2>
              <p className="section-subtitle">{visibleDateLabel}</p>
            </div>

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
            ) : availableDates.length === 0 ? (
              <p className="empty-events">No match dates found.</p>
            ) : filteredMatches.length === 0 ? (
              <p className="empty-events">
                No matches found for this date and status.
              </p>
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
