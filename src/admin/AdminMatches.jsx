import { useEffect, useMemo, useState } from "react";
import { Edit3, Plus, Radio, Save, Trash2, X } from "lucide-react";
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

function toDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 16);
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

  const teamMap = useMemo(() => {
    return teams.reduce((acc, team) => {
      acc[team.id] = team;
      return acc;
    }, {});
  }, [teams]);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [teamRows, matchRows] = await Promise.all([listTeams(), listMatches()]);
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
              <button type="button" className="admin-icon-button" onClick={resetForm}>
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
              {saving ? "Saving..." : editingId ? "Save changes" : "Create match"}
            </button>
          </form>
        </section>

        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <p className="admin-section-kicker">Records</p>
              <h2 className="admin-card-title">Matches</h2>
            </div>

            <span className="admin-pill">{matches.length} matches</span>
          </div>

          <div className="admin-list">
            {loading ? (
              <p className="admin-empty">Loading matches...</p>
            ) : matches.length === 0 ? (
              <p className="admin-empty">No matches yet.</p>
            ) : (
              matches.map((row) => (
                <article className="admin-list-item" key={row.id}>
                  <div className="admin-list-icon">
                    <Radio size={20} />
                  </div>

                  <div>
                    <p className="admin-list-title">
                      {row.title ||
                        `${row.team_a_name || "Team A"} vs ${
                          row.team_b_name || "Team B"
                        }`}
                    </p>
                    <p className="admin-list-meta">
                      {row.team_a_score} - {row.team_b_score} ·{" "}
                      {row.venue || "No venue"} · {row.status}
                    </p>
                  </div>

                  <div className="admin-list-actions">
                    <button
                      type="button"
                      className="admin-icon-button"
                      onClick={() => editRow(row)}
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      type="button"
                      className="admin-icon-button danger"
                      onClick={() => handleDelete(row.id)}
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
