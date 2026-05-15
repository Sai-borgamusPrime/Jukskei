import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Filter,
  Plus,
  Radio,
  RotateCcw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import {
  deleteRow,
  listMatches,
  listTeams,
  saveMatch,
} from "../services/adminApi";

const emptyForm = {
  title: "",
  team_a_id: "",
  team_b_id: "",
  team_a_name: "",
  team_b_name: "",
  team_a_score: 0,
  team_b_score: 0,
  match_date: "",
  venue: "",
  status: "Upcoming",
  round_label: "",
  is_featured: false,
};

const statusOptions = [
  "All",
  "Upcoming",
  "Live",
  "Past",
  "Completed",
  "Cancelled",
];

const dateFilterOptions = [
  { value: "All", label: "All dates" },
  { value: "Today", label: "Today" },
  { value: "UpcomingDates", label: "Upcoming dates" },
  { value: "PastDates", label: "Past dates" },
  { value: "NoDate", label: "No date" },
];

function toDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 16);
}

function formatMatchDate(value) {
  if (!value) return "No date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No date";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getMatchTitle(row) {
  return (
    row.title ||
    `${row.team_a_name || "Team A"} vs ${row.team_b_name || "Team B"}`
  );
}

function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  const teamMap = useMemo(() => {
    return teams.reduce((acc, team) => {
      acc[team.id] = team;
      return acc;
    }, {});
  }, [teams]);

  const filteredMatches = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const selectedTeamName =
      teamFilter !== "All" ? teamMap[teamFilter]?.name?.toLowerCase() : "";

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    return matches.filter((row) => {
      const matchDate = row.match_date ? new Date(row.match_date) : null;
      const hasValidDate = matchDate && !Number.isNaN(matchDate.getTime());

      const searchableText = [
        getMatchTitle(row),
        row.team_a_name,
        row.team_b_name,
        row.team_a_score,
        row.team_b_score,
        row.venue,
        row.status,
        row.round_label,
        formatMatchDate(row.match_date),
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        String(row.status || "").toLowerCase() === statusFilter.toLowerCase();

      const matchesTeam =
        teamFilter === "All" ||
        String(row.team_a_id || "") === String(teamFilter) ||
        String(row.team_b_id || "") === String(teamFilter) ||
        String(row.team_a_name || "").toLowerCase() === selectedTeamName ||
        String(row.team_b_name || "").toLowerCase() === selectedTeamName;

      let matchesDate = true;

      if (dateFilter === "Today") {
        matchesDate =
          hasValidDate && matchDate >= todayStart && matchDate < tomorrowStart;
      }

      if (dateFilter === "UpcomingDates") {
        matchesDate = hasValidDate && matchDate >= todayStart;
      }

      if (dateFilter === "PastDates") {
        matchesDate = hasValidDate && matchDate < todayStart;
      }

      if (dateFilter === "NoDate") {
        matchesDate = !hasValidDate;
      }

      return matchesSearch && matchesStatus && matchesTeam && matchesDate;
    });
  }, [matches, searchTerm, statusFilter, teamFilter, dateFilter, teamMap]);

  const hasActiveFilters =
    searchTerm.trim() ||
    statusFilter !== "All" ||
    teamFilter !== "All" ||
    dateFilter !== "All";

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [teamRows, matchRows] = await Promise.all([
        listTeams(),
        listMatches(),
      ]);

      setTeams(teamRows);
      setMatches(matchRows);
    } catch (err) {
      setError(err.message || "Could not load matches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateField = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "team_a_id") {
        next.team_a_name = teamMap[value]?.name || "";
      }

      if (field === "team_b_id") {
        next.team_b_name = teamMap[value]?.name || "";
      }

      return next;
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
    setError("");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setTeamFilter("All");
    setDateFilter("All");
  };

  const editRow = (row) => {
    setEditingId(row.id);
    setForm({
      title: row.title || "",
      team_a_id: row.team_a_id || "",
      team_b_id: row.team_b_id || "",
      team_a_name: row.team_a_name || teamMap[row.team_a_id]?.name || "",
      team_b_name: row.team_b_name || teamMap[row.team_b_id]?.name || "",
      team_a_score: row.team_a_score || 0,
      team_b_score: row.team_b_score || 0,
      match_date: toDateTimeLocal(row.match_date),
      venue: row.venue || "",
      status: row.status || "Upcoming",
      round_label: row.round_label || "",
      is_featured: Boolean(row.is_featured),
    });

    setMessage("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.team_a_name.trim() || !form.team_b_name.trim()) {
      setError("Both team names are required.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveMatch(form, editingId);
      setMessage(editingId ? "Match updated." : "Match created.");
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message || "Could not save match.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this match?")) return;

    setSaving(true);

    try {
      await deleteRow("matches", id);
      await loadData();

      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message || "Could not delete match.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Matches"
      description="Create fixtures, mark live matches, and update the scoreboard shown on the home page."
    >
      <div className="admin-grid two">
        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <p className="admin-section-kicker">Match form</p>
              <h2 className="admin-card-title">
                {editingId ? "Edit match" : "Add match"}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                className="admin-icon-button"
                onClick={resetForm}
                aria-label="Cancel editing"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {error && <p className="admin-error">{error}</p>}
          {message && <p className="admin-success">{message}</p>}

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <label className="admin-field full">
                <span>Title</span>
                <input
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Optional: Finals / Court 1"
                />
              </label>

              <label className="admin-field">
                <span>Team A</span>
                <select
                  value={form.team_a_id}
                  onChange={(e) => updateField("team_a_id", e.target.value)}
                >
                  <option value="">Manual / Select team</option>
                  {teams.map((team) => (
                    <option value={team.id} key={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-field">
                <span>Team B</span>
                <select
                  value={form.team_b_id}
                  onChange={(e) => updateField("team_b_id", e.target.value)}
                >
                  <option value="">Manual / Select team</option>
                  {teams.map((team) => (
                    <option value={team.id} key={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-field">
                <span>Team A name</span>
                <input
                  value={form.team_a_name}
                  onChange={(e) => updateField("team_a_name", e.target.value)}
                />
              </label>

              <label className="admin-field">
                <span>Team B name</span>
                <input
                  value={form.team_b_name}
                  onChange={(e) => updateField("team_b_name", e.target.value)}
                />
              </label>

              <label className="admin-field">
                <span>Team A score</span>
                <input
                  type="number"
                  value={form.team_a_score}
                  onChange={(e) => updateField("team_a_score", e.target.value)}
                />
              </label>

              <label className="admin-field">
                <span>Team B score</span>
                <input
                  type="number"
                  value={form.team_b_score}
                  onChange={(e) => updateField("team_b_score", e.target.value)}
                />
              </label>

              <label className="admin-field">
                <span>Status</span>
                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                >
                  <option>Upcoming</option>
                  <option>Live</option>
                  <option>Past</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </label>

              <label className="admin-field">
                <span>Date/time</span>
                <input
                  type="datetime-local"
                  value={form.match_date}
                  onChange={(e) => updateField("match_date", e.target.value)}
                />
              </label>

              <label className="admin-field">
                <span>Venue</span>
                <input
                  value={form.venue}
                  onChange={(e) => updateField("venue", e.target.value)}
                  placeholder="Court / location"
                />
              </label>

              <label className="admin-field">
                <span>Round</span>
                <input
                  value={form.round_label}
                  onChange={(e) => updateField("round_label", e.target.value)}
                  placeholder="Round 1 / Final"
                />
              </label>
            </div>

            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => updateField("is_featured", e.target.checked)}
              />
              Feature this match
            </label>

            <button type="submit" className="admin-button" disabled={saving}>
              {editingId ? <Save size={16} /> : <Plus size={16} />}
              {saving
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Create match"}
            </button>
          </form>
        </section>

        <section className="admin-card">
          <div className="admin-records-toolbar">
            <label className="admin-search-field">
              <Search size={17} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by team, title, venue, round, score..."
              />
            </label>

            <div className="admin-filter-strip">
              <label className="admin-filter-field">
                <span>Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option value={status} key={status}>
                      {status === "All" ? "All statuses" : status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-filter-field">
                <span>Team</span>
                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                >
                  <option value="All">All teams</option>
                  {teams.map((team) => (
                    <option value={team.id} key={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-filter-field">
                <span>Date</span>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  {dateFilterOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="admin-button secondary compact"
                  onClick={resetFilters}
                >
                  <RotateCcw size={15} />
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="admin-card-header">
            <div>
              <p className="admin-section-kicker">
                Records <Filter size={13} />
              </p>
              <h2 className="admin-card-title">Matches</h2>
            </div>

            <span className="admin-pill">
              {filteredMatches.length} of {matches.length} matches
            </span>
          </div>

          <div className="admin-list">
            {loading ? (
              <p className="admin-empty">Loading matches...</p>
            ) : matches.length === 0 ? (
              <p className="admin-empty">No matches yet.</p>
            ) : filteredMatches.length === 0 ? (
              <p className="admin-empty">
                No matches found. Adjust your search or filters.
              </p>
            ) : (
              filteredMatches.map((row) => (
                <article className="admin-list-item" key={row.id}>
                  <div className="admin-list-icon">
                    <Radio size={20} />
                  </div>

                  <div>
                    <p className="admin-list-title">{getMatchTitle(row)}</p>
                    <p className="admin-list-meta">
                      {row.team_a_score} - {row.team_b_score} ·{" "}
                      {row.venue || "No venue"} · {row.status} ·{" "}
                      {formatMatchDate(row.match_date)}
                    </p>
                  </div>

                  <div className="admin-list-actions">
                    <button
                      type="button"
                      className="admin-icon-button"
                      onClick={() => editRow(row)}
                      aria-label={`Edit ${getMatchTitle(row)}`}
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      type="button"
                      className="admin-icon-button danger"
                      onClick={() => handleDelete(row.id)}
                      aria-label={`Delete ${getMatchTitle(row)}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminMatches;
