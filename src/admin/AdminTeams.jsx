import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Filter,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import {
  deleteDivision,
  deleteRow,
  listDivisions,
  listTeams,
  saveDivision,
  saveTeam,
  uploadAsset,
} from "../services/adminApi";

const emptyTeamForm = {
  name: "",
  slug: "",
  division: "",
  logo_url: "",
  banner_logo_url: "",
  total_score: 0,
  is_active: true,
};

const emptyDivisionForm = {
  name: "",
  code: "",
  sort_order: 0,
  is_active: true,
};

const teamStatusOptions = ["All", "Active", "Inactive"];

function makeDivisionCode(value) {
  return String(value || "")
    .trim()
    .replace(/^division\s+/i, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();
}

function AdminTeams() {
  const [rows, setRows] = useState([]);
  const [divisions, setDivisions] = useState([]);

  const [form, setForm] = useState(emptyTeamForm);
  const [divisionForm, setDivisionForm] = useState(emptyDivisionForm);

  const [editingId, setEditingId] = useState(null);
  const [editingDivisionId, setEditingDivisionId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [teamSearchTerm, setTeamSearchTerm] = useState("");
  const [teamDivisionFilter, setTeamDivisionFilter] = useState("All");
  const [teamStatusFilter, setTeamStatusFilter] = useState("All");

  const divisionMap = useMemo(() => {
    return divisions.reduce((acc, division) => {
      acc[division.code] = division;
      return acc;
    }, {});
  }, [divisions]);

  const activeDivisions = useMemo(() => {
    return divisions.filter((division) => division.is_active !== false);
  }, [divisions]);

  const defaultDivisionCode = activeDivisions[0]?.code || "";

  const getDivisionName = (code) => {
    const division = divisionMap[code];
    return division?.name || code || "-";
  };

  const filteredRows = useMemo(() => {
    const query = teamSearchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      const divisionName =
        divisionMap[row.division]?.name || row.division || "";
      const isActive = row.is_active !== false;

      const searchableText = [
        row.name,
        row.slug,
        row.division,
        divisionName,
        row.total_score,
        isActive ? "active" : "inactive",
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      const matchesDivision =
        teamDivisionFilter === "All" || row.division === teamDivisionFilter;

      const matchesStatus =
        teamStatusFilter === "All" ||
        (teamStatusFilter === "Active" && isActive) ||
        (teamStatusFilter === "Inactive" && !isActive);

      return matchesSearch && matchesDivision && matchesStatus;
    });
  }, [rows, teamSearchTerm, teamDivisionFilter, teamStatusFilter, divisionMap]);

  const hasActiveTeamFilters =
    teamSearchTerm.trim() ||
    teamDivisionFilter !== "All" ||
    teamStatusFilter !== "All";

  const loadRows = async () => {
    setLoading(true);
    setError("");

    try {
      const [teamData, divisionData] = await Promise.all([
        listTeams(),
        listDivisions(),
      ]);

      setRows(teamData);
      setDivisions(divisionData);

      const fallbackDivision = divisionData.find(
        (item) => item.is_active !== false,
      );

      setForm((current) => ({
        ...current,
        division: current.division || fallbackDivision?.code || "",
      }));
    } catch (err) {
      setError(err.message || "Could not load teams and divisions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateDivisionField = (field, value) => {
    setDivisionForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "name" && !editingDivisionId) {
        next.code = makeDivisionCode(value);
      }

      return next;
    });
  };

  const resetForm = () => {
    setForm({
      ...emptyTeamForm,
      division: defaultDivisionCode,
    });
    setEditingId(null);
    setMessage("");
    setError("");
  };

  const resetDivisionForm = () => {
    setDivisionForm(emptyDivisionForm);
    setEditingDivisionId(null);
    setMessage("");
    setError("");
  };

  const resetTeamFilters = () => {
    setTeamSearchTerm("");
    setTeamDivisionFilter("All");
    setTeamStatusFilter("All");
  };

  const editRow = (row) => {
    setEditingId(row.id);
    setForm({
      name: row.name || "",
      slug: row.slug || "",
      division: row.division || defaultDivisionCode,
      logo_url: row.logo_url || "",
      banner_logo_url: row.banner_logo_url || "",
      total_score: row.total_score || 0,
      is_active: row.is_active !== false,
    });

    setMessage("");
    setError("");
  };

  const editDivision = (division) => {
    setEditingDivisionId(division.id);
    setDivisionForm({
      name: division.name || "",
      code: division.code || "",
      sort_order: division.sort_order || 0,
      is_active: division.is_active !== false,
    });

    setMessage("");
    setError("");
  };

  const handleUpload = async (field, file) => {
    if (!file) return;

    try {
      setSaving(true);
      const publicUrl = await uploadAsset(file, "teams");
      updateField(field, publicUrl);
    } catch (err) {
      setError(err.message || "Image upload failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleTeamSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Team name is required.");
      return;
    }

    if (!form.division) {
      setError("Create or select a division before saving this team.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveTeam(
        {
          ...form,
          division: form.division || defaultDivisionCode,
        },
        editingId,
      );

      setMessage(editingId ? "Team updated." : "Team created.");
      resetForm();
      await loadRows();
    } catch (err) {
      setError(err.message || "Could not save team.");
    } finally {
      setSaving(false);
    }
  };

  const handleDivisionSubmit = async (event) => {
    event.preventDefault();

    if (!divisionForm.name.trim()) {
      setError("Division name is required.");
      return;
    }

    if (!divisionForm.code.trim()) {
      setError("Division code is required.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveDivision(divisionForm, editingDivisionId);

      setMessage(editingDivisionId ? "Division updated." : "Division created.");

      resetDivisionForm();
      await loadRows();
    } catch (err) {
      setError(err.message || "Could not save division.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!confirm("Delete this team?")) return;

    setSaving(true);
    setError("");

    try {
      await deleteRow("teams", id);
      await loadRows();

      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message || "Could not delete team.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDivision = async (division) => {
    const assignedTeams = rows.filter(
      (team) => team.division === division.code,
    );

    if (assignedTeams.length > 0) {
      setError(
        `Cannot delete ${division.name}. Move or delete its ${assignedTeams.length} assigned team(s) first.`,
      );
      return;
    }

    if (!confirm(`Delete ${division.name}?`)) return;

    setSaving(true);
    setError("");

    try {
      await deleteDivision(division.id);

      if (editingDivisionId === division.id) {
        resetDivisionForm();
      }

      await loadRows();
      setMessage("Division deleted.");
    } catch (err) {
      setError(err.message || "Could not delete division.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Teams"
      description="Create divisions, assign teams to divisions, upload logos, and control the total score used by the public rankings page."
    >
      <div className="admin-grid two">
        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <p className="admin-section-kicker">Team form</p>
              <h2 className="admin-card-title">
                {editingId ? "Edit team" : "Add team"}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                className="admin-icon-button"
                onClick={resetForm}
                aria-label="Cancel team editing"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {error && <p className="admin-error">{error}</p>}
          {message && <p className="admin-success">{message}</p>}

          <form className="admin-form" onSubmit={handleTeamSubmit}>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Name</span>
                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Team name"
                />
              </label>

              <label className="admin-field">
                <span>Division</span>
                <select
                  value={form.division || defaultDivisionCode}
                  onChange={(e) => updateField("division", e.target.value)}
                  disabled={activeDivisions.length === 0}
                >
                  {activeDivisions.length === 0 ? (
                    <option value="">Create a division first</option>
                  ) : (
                    activeDivisions.map((division) => (
                      <option key={division.id} value={division.code}>
                        {division.name}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="admin-field">
                <span>Slug</span>
                <input
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="optional-url-slug"
                />
              </label>

              <label className="admin-field">
                <span>Total score</span>
                <input
                  type="number"
                  value={form.total_score}
                  onChange={(e) => updateField("total_score", e.target.value)}
                />
              </label>

              <label className="admin-field full">
                <span>Logo URL</span>
                <input
                  value={form.logo_url}
                  onChange={(e) => updateField("logo_url", e.target.value)}
                  placeholder="https://..."
                />
              </label>

              <label className="admin-field full">
                <span>Upload logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleUpload("logo_url", e.target.files?.[0])
                  }
                />
              </label>

              <label className="admin-field full">
                <span>Banner logo URL</span>
                <input
                  value={form.banner_logo_url}
                  onChange={(e) =>
                    updateField("banner_logo_url", e.target.value)
                  }
                  placeholder="https://..."
                />
              </label>

              <label className="admin-field full">
                <span>Upload banner logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleUpload("banner_logo_url", e.target.files?.[0])
                  }
                />
              </label>
            </div>

            {form.logo_url && (
              <img src={form.logo_url} alt="" className="admin-image-preview" />
            )}

            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => updateField("is_active", e.target.checked)}
              />
              Active team
            </label>

            <button type="submit" className="admin-button" disabled={saving}>
              {editingId ? <Save size={16} /> : <Plus size={16} />}
              {saving
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Create team"}
            </button>
          </form>
        </section>

        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <p className="admin-section-kicker">Divisions</p>
              <h2 className="admin-card-title">
                {editingDivisionId ? "Edit division" : "Create division"}
              </h2>
            </div>

            {editingDivisionId && (
              <button
                type="button"
                className="admin-icon-button"
                onClick={resetDivisionForm}
                aria-label="Cancel division editing"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <form className="admin-form" onSubmit={handleDivisionSubmit}>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Division name</span>
                <input
                  value={divisionForm.name}
                  onChange={(e) => updateDivisionField("name", e.target.value)}
                  placeholder="Division C"
                />
              </label>

              <label className="admin-field">
                <span>Code</span>
                <input
                  value={divisionForm.code}
                  onChange={(e) =>
                    updateDivisionField(
                      "code",
                      makeDivisionCode(e.target.value),
                    )
                  }
                  placeholder="C"
                />
              </label>

              <label className="admin-field">
                <span>Sort order</span>
                <input
                  type="number"
                  value={divisionForm.sort_order}
                  onChange={(e) =>
                    updateDivisionField("sort_order", e.target.value)
                  }
                />
              </label>

              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={divisionForm.is_active}
                  onChange={(e) =>
                    updateDivisionField("is_active", e.target.checked)
                  }
                />
                Active division
              </label>
            </div>

            <button type="submit" className="admin-button" disabled={saving}>
              {editingDivisionId ? <Save size={16} /> : <Plus size={16} />}
              {saving
                ? "Saving..."
                : editingDivisionId
                  ? "Save division"
                  : "Create division"}
            </button>
          </form>

          <div className="admin-list" style={{ marginTop: 16 }}>
            {divisions.length === 0 ? (
              <p className="admin-empty">No divisions yet.</p>
            ) : (
              divisions.map((division) => {
                const assignedCount = rows.filter(
                  (team) => team.division === division.code,
                ).length;

                return (
                  <article className="admin-list-item" key={division.id}>
                    <div className="admin-list-icon">
                      <Users size={20} />
                    </div>

                    <div>
                      <p className="admin-list-title">{division.name}</p>
                      <p className="admin-list-meta">
                        Code {division.code} · {assignedCount}{" "}
                        {assignedCount === 1 ? "team" : "teams"}
                      </p>
                    </div>

                    <div className="admin-list-actions">
                      <button
                        type="button"
                        className="admin-icon-button"
                        onClick={() => editDivision(division)}
                        aria-label={`Edit ${division.name}`}
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        type="button"
                        className="admin-icon-button danger"
                        onClick={() => handleDeleteDivision(division)}
                        aria-label={`Delete ${division.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-records-toolbar">
            <label className="admin-search-field">
              <Search size={17} />
              <input
                value={teamSearchTerm}
                onChange={(e) => setTeamSearchTerm(e.target.value)}
                placeholder="Search by team name, division, slug, score..."
              />
            </label>

            <div className="admin-filter-strip">
              <label className="admin-filter-field">
                <span>Division</span>
                <select
                  value={teamDivisionFilter}
                  onChange={(e) => setTeamDivisionFilter(e.target.value)}
                >
                  <option value="All">All divisions</option>
                  {divisions.map((division) => (
                    <option key={division.id} value={division.code}>
                      {division.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-filter-field">
                <span>Status</span>
                <select
                  value={teamStatusFilter}
                  onChange={(e) => setTeamStatusFilter(e.target.value)}
                >
                  {teamStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status === "All" ? "All teams" : status}
                    </option>
                  ))}
                </select>
              </label>

              {hasActiveTeamFilters && (
                <button
                  type="button"
                  className="admin-button secondary compact"
                  onClick={resetTeamFilters}
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
              <h2 className="admin-card-title">Teams</h2>
            </div>

            <span className="admin-pill">
              {filteredRows.length} of {rows.length} teams
            </span>
          </div>

          <div className="admin-list">
            {loading ? (
              <p className="admin-empty">Loading teams...</p>
            ) : rows.length === 0 ? (
              <p className="admin-empty">No teams yet.</p>
            ) : filteredRows.length === 0 ? (
              <p className="admin-empty">
                No teams found. Adjust your search or filters.
              </p>
            ) : (
              filteredRows.map((row) => (
                <article className="admin-list-item" key={row.id}>
                  {row.logo_url ? (
                    <img
                      src={row.logo_url}
                      alt=""
                      className="admin-list-image"
                    />
                  ) : (
                    <div className="admin-list-icon">
                      <Users size={20} />
                    </div>
                  )}

                  <div>
                    <p className="admin-list-title">{row.name}</p>
                    <p className="admin-list-meta">
                      {getDivisionName(row.division)} · Score{" "}
                      {row.total_score || 0} ·{" "}
                      {row.is_active === false ? "Inactive" : "Active"}
                    </p>
                  </div>

                  <div className="admin-list-actions">
                    <button
                      type="button"
                      className="admin-icon-button"
                      onClick={() => editRow(row)}
                      aria-label={`Edit ${row.name}`}
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      type="button"
                      className="admin-icon-button danger"
                      onClick={() => handleDeleteTeam(row.id)}
                      aria-label={`Delete ${row.name}`}
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

export default AdminTeams;
