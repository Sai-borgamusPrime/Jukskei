import { useEffect, useState } from "react";
import { CalendarDays, Edit3, Plus, Save, Trash2, X } from "lucide-react";
import AdminLayout from "./AdminLayout";
import {
  deleteRow,
  listScheduleEvents,
  saveScheduleEvent,
} from "../services/adminApi";

const emptyForm = {
  date: "2026-05-24",
  time: "",
  title: "",
  location: "",
  color: "green",
  sort_order: 0,
  is_active: true,
};

function AdminSchedule() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRows = async () => {
    setLoading(true);
    setError("");

    try {
      setRows(await listScheduleEvents());
    } catch (err) {
      setError(err.message || "Could not load schedule.");
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
    setError("");
    setMessage("");
  };

  const editRow = (row) => {
    setEditingId(row.id);
    setForm({
      date: row.date || "",
      time: row.time || "",
      title: row.title || "",
      location: row.location || "",
      color: row.color || "green",
      sort_order: row.sort_order || 0,
      is_active: row.is_active !== false,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.date || !form.time || !form.title.trim()) {
      setError("Date, time and title are required.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveScheduleEvent(form, editingId);
      setMessage(editingId ? "Event updated." : "Event created.");
      resetForm();
      await loadRows();
    } catch (err) {
      setError(err.message || "Could not save event.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this schedule event?")) return;

    setSaving(true);

    try {
      await deleteRow("schedule_events", id);
      await loadRows();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message || "Could not delete event.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Schedule"
      description="Manage the tournament calendar events shown on the schedule page."
    >
      <div className="admin-grid two">
        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <p className="admin-section-kicker">Schedule form</p>
              <h2 className="admin-card-title">
                {editingId ? "Edit event" : "Add event"}
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
                <span>Date</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => updateField("date", e.target.value)}
                />
              </label>

              <label className="admin-field">
                <span>Time</span>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => updateField("time", e.target.value)}
                />
              </label>

              <label className="admin-field full">
                <span>Title</span>
                <input
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Event title"
                />
              </label>

              <label className="admin-field">
                <span>Location</span>
                <input
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="Optional"
                />
              </label>

              <label className="admin-field">
                <span>Sort order</span>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => updateField("sort_order", e.target.value)}
                />
              </label>

              <label className="admin-field">
                <span>Color</span>
                <select
                  value={form.color}
                  onChange={(e) => updateField("color", e.target.value)}
                >
                  <option value="green">Green</option>
                  <option value="blue">Blue</option>
                  <option value="gold">Gold</option>
                  <option value="red">Red</option>
                </select>
              </label>
            </div>

            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => updateField("is_active", e.target.checked)}
              />
              Active event
            </label>

            <button type="submit" className="admin-button" disabled={saving}>
              {editingId ? <Save size={16} /> : <Plus size={16} />}
              {saving ? "Saving..." : editingId ? "Save changes" : "Create event"}
            </button>
          </form>
        </section>

        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <p className="admin-section-kicker">Records</p>
              <h2 className="admin-card-title">Schedule events</h2>
            </div>

            <span className="admin-pill">{rows.length} events</span>
          </div>

          <div className="admin-list">
            {loading ? (
              <p className="admin-empty">Loading events...</p>
            ) : rows.length === 0 ? (
              <p className="admin-empty">No schedule events yet.</p>
            ) : (
              rows.map((row) => (
                <article className="admin-list-item" key={row.id}>
                  <div className="admin-list-icon">
                    <CalendarDays size={20} />
                  </div>

                  <div>
                    <p className="admin-list-title">{row.title}</p>
                    <p className="admin-list-meta">
                      {row.date} · {row.time} · {row.location || "No location"}
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

export default AdminSchedule;
