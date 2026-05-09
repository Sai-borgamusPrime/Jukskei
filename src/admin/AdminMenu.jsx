import { useEffect, useState } from "react";
import { Edit3, Plus, Save, Trash2, Utensils, X } from "lucide-react";
import AdminLayout from "./AdminLayout";
import {
  deleteRow,
  listMenuItems,
  saveMenuItem,
  uploadAsset,
} from "../services/adminApi";

const emptyForm = {
  name: "",
  description: "",
  price: 0,
  dow: "",
  categories: "Everyday",
  image_url: "",
  is_available: true,
};

function AdminMenu() {
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
      setRows(await listMenuItems());
    } catch (err) {
      setError(err.message || "Could not load menu items.");
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
      name: row.name || "",
      description: row.description || "",
      price: row.price || 0,
      dow: row.dow || "",
      categories: Array.isArray(row.categories) ? row.categories.join(", ") : "",
      image_url: row.image_url || "",
      is_available: row.is_available !== false,
    });
  };

  const handleUpload = async (file) => {
    if (!file) return;

    try {
      setSaving(true);
      const url = await uploadAsset(file, "menu");
      updateField("image_url", url);
    } catch (err) {
      setError(err.message || "Image upload failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Menu item name is required.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveMenuItem(form, editingId);
      setMessage(editingId ? "Menu item updated." : "Menu item created.");
      resetForm();
      await loadRows();
    } catch (err) {
      setError(err.message || "Could not save menu item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this menu item?")) return;

    setSaving(true);

    try {
      await deleteRow("menu_items", id);
      await loadRows();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message || "Could not delete menu item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Menu"
      description="Add food items, prices, daily categories, and images displayed on the menu page."
    >
      <div className="admin-grid two">
        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <p className="admin-section-kicker">Menu form</p>
              <h2 className="admin-card-title">
                {editingId ? "Edit menu item" : "Add menu item"}
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
                  placeholder="Menu item"
                />
              </label>

              <label className="admin-field">
                <span>Price</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                />
              </label>

              <label className="admin-field">
                <span>Display day</span>
                <input
                  value={form.dow}
                  onChange={(e) => updateField("dow", e.target.value)}
                  placeholder="Everyday / Monday"
                />
              </label>

              <label className="admin-field">
                <span>Categories</span>
                <input
                  value={form.categories}
                  onChange={(e) => updateField("categories", e.target.value)}
                  placeholder="Everyday, Monday"
                />
              </label>

              <label className="admin-field full">
                <span>Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Optional description"
                />
              </label>

              <label className="admin-field full">
                <span>Image URL</span>
                <input
                  value={form.image_url}
                  onChange={(e) => updateField("image_url", e.target.value)}
                  placeholder="https://..."
                />
              </label>

              <label className="admin-field full">
                <span>Upload image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e.target.files?.[0])}
                />
              </label>
            </div>

            {form.image_url && (
              <img src={form.image_url} alt="" className="admin-image-preview" />
            )}

            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={(e) => updateField("is_available", e.target.checked)}
              />
              Available
            </label>

            <button type="submit" className="admin-button" disabled={saving}>
              {editingId ? <Save size={16} /> : <Plus size={16} />}
              {saving ? "Saving..." : editingId ? "Save changes" : "Create item"}
            </button>
          </form>
        </section>

        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <p className="admin-section-kicker">Records</p>
              <h2 className="admin-card-title">Menu items</h2>
            </div>

            <span className="admin-pill">{rows.length} items</span>
          </div>

          <div className="admin-list">
            {loading ? (
              <p className="admin-empty">Loading menu...</p>
            ) : rows.length === 0 ? (
              <p className="admin-empty">No menu items yet.</p>
            ) : (
              rows.map((row) => (
                <article className="admin-list-item" key={row.id}>
                  {row.image_url ? (
                    <img src={row.image_url} alt="" className="admin-list-image" />
                  ) : (
                    <div className="admin-list-icon">
                      <Utensils size={20} />
                    </div>
                  )}

                  <div>
                    <p className="admin-list-title">{row.name}</p>
                    <p className="admin-list-meta">
                      N${Number(row.price || 0).toFixed(2)} ·{" "}
                      {Array.isArray(row.categories)
                        ? row.categories.join(", ")
                        : "No category"}
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

export default AdminMenu;
