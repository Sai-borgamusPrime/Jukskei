import { useEffect, useState } from "react";
import { Edit3, Plus, Save, ShoppingBag, Trash2, X } from "lucide-react";
import AdminLayout from "./AdminLayout";
import {
  deleteRow,
  listShopItems,
  saveShopItem,
  uploadAsset,
} from "../services/adminApi";

const emptyForm = {
  name: "",
  subtitle: "",
  details: "",
  price: 0,
  category: "Cups",
  image_url: "",
  is_available: true,
};

function AdminShop() {
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
      setRows(await listShopItems());
    } catch (err) {
      setError(err.message || "Could not load shop items.");
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
      subtitle: row.subtitle || "",
      details: row.details || "",
      price: row.price || 0,
      category: row.category || "Cups",
      image_url: row.image_url || "",
      is_available: row.is_available !== false,
    });
  };

  const handleUpload = async (file) => {
    if (!file) return;

    try {
      setSaving(true);
      const url = await uploadAsset(file, "shop");
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
      setError("Shop item name is required.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveShopItem(form, editingId);
      setMessage(editingId ? "Shop item updated." : "Shop item created.");
      resetForm();
      await loadRows();
    } catch (err) {
      setError(err.message || "Could not save shop item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this shop item?")) return;

    setSaving(true);

    try {
      await deleteRow("shop_items", id);
      await loadRows();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message || "Could not delete shop item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Shop"
      description="Manage merchandise, prices, categories, product details, and images shown in the gift shop."
    >
      <div className="admin-grid two">
        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <p className="admin-section-kicker">Shop form</p>
              <h2 className="admin-card-title">
                {editingId ? "Edit shop item" : "Add shop item"}
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
                  placeholder="Product name"
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
                <span>Category</span>
                <select
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                >
                  <option>Cups</option>
                  <option>Caps</option>
                  <option>T-Shirts</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="admin-field">
                <span>Subtitle</span>
                <input
                  value={form.subtitle}
                  onChange={(e) => updateField("subtitle", e.target.value)}
                  placeholder="Short product title"
                />
              </label>

              <label className="admin-field full">
                <span>Details</span>
                <textarea
                  value={form.details}
                  onChange={(e) => updateField("details", e.target.value)}
                  placeholder="Product details"
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
              <h2 className="admin-card-title">Shop items</h2>
            </div>

            <span className="admin-pill">{rows.length} items</span>
          </div>

          <div className="admin-list">
            {loading ? (
              <p className="admin-empty">Loading shop...</p>
            ) : rows.length === 0 ? (
              <p className="admin-empty">No shop items yet.</p>
            ) : (
              rows.map((row) => (
                <article className="admin-list-item" key={row.id}>
                  {row.image_url ? (
                    <img src={row.image_url} alt="" className="admin-list-image" />
                  ) : (
                    <div className="admin-list-icon">
                      <ShoppingBag size={20} />
                    </div>
                  )}

                  <div>
                    <p className="admin-list-title">{row.name}</p>
                    <p className="admin-list-meta">
                      N${Number(row.price || 0).toFixed(2)} ·{" "}
                      {row.category || "No category"}
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

export default AdminShop;
