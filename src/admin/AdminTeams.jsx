import { useEffect, useState } from "react";
import { Edit3, ImagePlus, Plus, Save, Trash2, Users, X } from "lucide-react";
import AdminLayout from "./AdminLayout";
import {
  deleteRow,
  listTeams,
  saveTeam,
  uploadAsset,
} from "../services/adminApi";

const emptyForm = {
  name: "",
  slug: "",
  division: "A",
  logo_url: "",
  banner_logo_url: "",
  total_score: 0,
  is_active: true,
};

function AdminTeams() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRows = async () => {
    setLoading(true);
    setError("");

    try {
      setRows(await listTeams());
    } catch (err) {
      setError(err.message || "Could not load teams.");
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

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
    setError("");
  };

  const editRow = (row) => {
    setEditingId(row.id);
    setForm({
      name: row.name || "",
      slug: row.slug || "",
      division: row.division || "A",
      logo_url: row.logo_url || "",
      banner_logo_url: row.banner_logo_url || "",
      total_score: row.total_score || 0,
      is_active: row.is_active !== false,
    });
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Team name is required.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveTeam(form, editingId);
      setMessage(editingId ? "Team updated." : "Team created.");
      resetForm();
      await loadRows();
    } catch (err) {
      setError(err.message || "Could not save team.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
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

  return (
    <AdminLayout
      title="Teams"
      description="Create teams, manage divisions, upload logos, and control the total score used by the public rankings page."
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
              <button type="button" className="admin-icon-button" onClick={resetForm}>
                <X size={16} />
              </button>
            )}
          </div>

          {error && <p className="admin-error">{error}</p>}
          {message && <p className="admin-success">{message}</p>}

          <form className="admin-form" onSubmit={handleSubmit}>
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
                  value={form.division}
                  onChange={(e) => updateField("division", e.target.value)}
                >
                  <option value="A">Division A</option>
                  <option value="B">Division B</option>
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
                  onChange={(e) => handleUpload("logo_url", e.target.files?.[0])}
                />
              </label>

              <label className="admin-field full">
                <span>Banner logo URL</span>
                <input
                  value={form.banner_logo_url}
                  onChange={(e) => updateField("banner_logo_url", e.target.value)}
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
              {saving ? "Saving..." : editingId ? "Save changes" : "Create team"}
            </button>
          </form>
        </section>

        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <p className="admin-section-kicker">Records</p>
              <h2 className="admin-card-title">Teams</h2>
            </div>

            <span className="admin-pill">{rows.length} teams</span>
          </div>

          <div className="admin-list">
            {loading ? (
              <p className="admin-empty">Loading teams...</p>
            ) : rows.length === 0 ? (
              <p className="admin-empty">No teams yet.</p>
            ) : (
              rows.map((row) => (
                <article className="admin-list-item" key={row.id}>
                  {row.logo_url ? (
                    <img src={row.logo_url} alt="" className="admin-list-image" />
                  ) : (
                    <div className="admin-list-icon">
                      <Users size={20} />
                    </div>
                  )}

                  <div>
                    <p className="admin-list-title">{row.name}</p>
                    <p className="admin-list-meta">
                      Division {row.division || "-"} · Score {row.total_score || 0}
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

export default AdminTeams;
