import { useEffect, useMemo, useState } from "react";
import { Edit3, Plus, Save, ShoppingBag, Trash2, X } from "lucide-react";
import AdminLayout from "./AdminLayout";
import {
  deleteRow,
  deleteShopCategory,
  listShopCategories,
  listShopItems,
  saveShopCategory,
  saveShopItem,
  updateShopItemsCategory,
  uploadAsset,
} from "../services/adminApi";

const emptyForm = {
  name: "",
  subtitle: "",
  details: "",
  price: 0,
  category: "",
  image_url: "",
  is_available: true,
};

const emptyCategoryForm = {
  name: "",
  sort_order: 0,
  is_active: true,
};

function AdminShop() {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);

  const [editingId, setEditingId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const activeCategories = useMemo(() => {
    return categories.filter((category) => category.is_active !== false);
  }, [categories]);

  const defaultCategory = activeCategories[0]?.name || "";

  const loadRows = async () => {
    setLoading(true);
    setError("");

    try {
      const [shopData, categoryData] = await Promise.all([
        listShopItems(),
        listShopCategories(),
      ]);

      setRows(shopData);
      setCategories(categoryData);

      const fallbackCategory = categoryData.find(
        (category) => category.is_active !== false,
      );

      setForm((current) => ({
        ...current,
        category: current.category || fallbackCategory?.name || "",
      }));
    } catch (err) {
      setError(err.message || "Could not load shop items and categories.");
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

  const updateCategoryField = (field, value) => {
    setCategoryForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      ...emptyForm,
      category: defaultCategory,
    });
    setEditingId(null);
    setError("");
    setMessage("");
  };

  const resetCategoryForm = () => {
    setCategoryForm(emptyCategoryForm);
    setEditingCategoryId(null);
    setEditingCategoryName("");
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
      category: row.category || defaultCategory,
      image_url: row.image_url || "",
      is_available: row.is_available !== false,
    });
  };

  const editCategory = (category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name || "");
    setCategoryForm({
      name: category.name || "",
      sort_order: category.sort_order || 0,
      is_active: category.is_active !== false,
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

    if (!form.category) {
      setError("Select or create a shop category before saving this item.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveShopItem(
        {
          ...form,
          category: form.category || defaultCategory,
        },
        editingId,
      );

      setMessage(editingId ? "Shop item updated." : "Shop item created.");
      resetForm();
      await loadRows();
    } catch (err) {
      setError(err.message || "Could not save shop item.");
    } finally {
      setSaving(false);
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();

    if (!categoryForm.name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const savedCategory = await saveShopCategory(
        categoryForm,
        editingCategoryId,
      );

      if (
        editingCategoryId &&
        editingCategoryName &&
        savedCategory?.name &&
        savedCategory.name !== editingCategoryName
      ) {
        await updateShopItemsCategory(editingCategoryName, savedCategory.name);
      }

      setMessage(
        editingCategoryId ? "Shop category updated." : "Shop category created.",
      );

      resetCategoryForm();

      const [shopData, categoryData] = await Promise.all([
        listShopItems(),
        listShopCategories(),
      ]);

      setRows(shopData);
      setCategories(categoryData);

      if (savedCategory?.name) {
        setForm((current) => ({
          ...current,
          category: savedCategory.name,
        }));
      }
    } catch (err) {
      setError(err.message || "Could not save shop category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this shop item?")) return;

    setSaving(true);
    setError("");

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

  const handleDeleteCategory = async (category) => {
    const assignedItems = rows.filter(
      (item) => item.category === category.name,
    );

    if (assignedItems.length > 0) {
      setError(
        `Cannot delete ${category.name}. Move or delete its ${assignedItems.length} assigned shop item(s) first.`,
      );
      return;
    }

    if (!confirm(`Delete shop category "${category.name}"?`)) return;

    setSaving(true);
    setError("");

    try {
      await deleteShopCategory(category.id);

      if (editingCategoryId === category.id) {
        resetCategoryForm();
      }

      await loadRows();
      setMessage("Shop category deleted.");
    } catch (err) {
      setError(err.message || "Could not delete shop category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Shop"
      description="Manage shop categories, merchandise, prices, product details, and images shown in the gift shop."
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
              <button
                type="button"
                className="admin-icon-button"
                onClick={resetForm}
                aria-label="Cancel shop item editing"
              >
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
                  value={form.category || ""}
                  onChange={(e) => updateField("category", e.target.value)}
                  disabled={activeCategories.length === 0}
                >
                  {activeCategories.length === 0 ? (
                    <option value="">Create a category first</option>
                  ) : (
                    <>
                      <option value="">Select category</option>

                      {activeCategories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </>
                  )}
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
              <img
                src={form.image_url}
                alt=""
                className="admin-image-preview"
              />
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
              {saving
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Create item"}
            </button>
          </form>
        </section>

        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <p className="admin-section-kicker">Categories</p>
              <h2 className="admin-card-title">
                {editingCategoryId ? "Edit category" : "Add category"}
              </h2>
            </div>

            {editingCategoryId && (
              <button
                type="button"
                className="admin-icon-button"
                onClick={resetCategoryForm}
                aria-label="Cancel category editing"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <form className="admin-form" onSubmit={handleCategorySubmit}>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Category name</span>
                <input
                  value={categoryForm.name}
                  onChange={(e) => updateCategoryField("name", e.target.value)}
                  placeholder="Scarves"
                />
              </label>

              <label className="admin-field">
                <span>Sort order</span>
                <input
                  type="number"
                  value={categoryForm.sort_order}
                  onChange={(e) =>
                    updateCategoryField("sort_order", e.target.value)
                  }
                />
              </label>

              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={categoryForm.is_active}
                  onChange={(e) =>
                    updateCategoryField("is_active", e.target.checked)
                  }
                />
                Active category
              </label>
            </div>

            <button type="submit" className="admin-button" disabled={saving}>
              {editingCategoryId ? <Save size={16} /> : <Plus size={16} />}
              {saving
                ? "Saving..."
                : editingCategoryId
                  ? "Save category"
                  : "Create category"}
            </button>
          </form>

          <div className="admin-list" style={{ marginTop: 16 }}>
            {categories.length === 0 ? (
              <p className="admin-empty">No categories yet.</p>
            ) : (
              categories.map((category) => {
                const assignedCount = rows.filter(
                  (item) => item.category === category.name,
                ).length;

                return (
                  <article className="admin-list-item" key={category.id}>
                    <div className="admin-list-icon">
                      <ShoppingBag size={20} />
                    </div>

                    <div>
                      <p className="admin-list-title">{category.name}</p>
                      <p className="admin-list-meta">
                        {assignedCount} {assignedCount === 1 ? "item" : "items"}{" "}
                        · {category.is_active ? "Active" : "Inactive"}
                      </p>
                    </div>

                    <div className="admin-list-actions">
                      <button
                        type="button"
                        className="admin-icon-button"
                        onClick={() => editCategory(category)}
                        aria-label={`Edit ${category.name}`}
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        type="button"
                        className="admin-icon-button danger"
                        onClick={() => handleDeleteCategory(category)}
                        aria-label={`Delete ${category.name}`}
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
                    <img
                      src={row.image_url}
                      alt=""
                      className="admin-list-image"
                    />
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
                      aria-label={`Edit ${row.name}`}
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      type="button"
                      className="admin-icon-button danger"
                      onClick={() => handleDelete(row.id)}
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

export default AdminShop;
