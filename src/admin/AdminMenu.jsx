import { useEffect, useMemo, useState } from "react";
import { Edit3, Plus, Save, Trash2, Utensils, X } from "lucide-react";
import AdminLayout from "./AdminLayout";
import {
  deleteMenuCategory,
  deleteRow,
  listMenuCategories,
  listMenuItems,
  saveMenuCategory,
  saveMenuItem,
  uploadAsset,
} from "../services/adminApi";

const emptyForm = {
  name: "",
  description: "",
  price: 0,
  dow: "",
  categories: [],
  image_url: "",
  is_available: true,
};

const emptyCategoryForm = {
  name: "",
  sort_order: 0,
  is_active: true,
};

function AdminMenu() {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);

  const [editingId, setEditingId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const activeCategories = useMemo(() => {
    return categories.filter((category) => category.is_active !== false);
  }, [categories]);

  const loadRows = async () => {
    setLoading(true);
    setError("");

    try {
      const [menuData, categoryData] = await Promise.all([
        listMenuItems(),
        listMenuCategories(),
      ]);

      setRows(menuData);
      setCategories(categoryData);
    } catch (err) {
      setError(err.message || "Could not load menu.");
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

  const toggleItemCategory = (categoryName, checked) => {
    setForm((current) => {
      const currentCategories = Array.isArray(current.categories)
        ? current.categories
        : [];

      return {
        ...current,
        categories: checked
          ? Array.from(new Set([...currentCategories, categoryName]))
          : currentCategories.filter((item) => item !== categoryName),
      };
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setMessage("");
  };

  const resetCategoryForm = () => {
    setCategoryForm(emptyCategoryForm);
    setEditingCategoryId(null);
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
      categories: Array.isArray(row.categories) ? row.categories : [],
      image_url: row.image_url || "",
      is_available: row.is_available !== false,
    });
  };

  const editCategory = (category) => {
    setEditingCategoryId(category.id);
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

    if (!form.categories.length) {
      setError("Select at least one menu category.");
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
      const savedCategory = await saveMenuCategory(
        categoryForm,
        editingCategoryId,
      );

      setMessage(
        editingCategoryId ? "Menu category updated." : "Menu category created.",
      );

      resetCategoryForm();
      await loadRows();

      if (savedCategory?.name) {
        setForm((current) => ({
          ...current,
          categories: Array.from(
            new Set([...(current.categories || []), savedCategory.name]),
          ),
        }));
      }
    } catch (err) {
      setError(err.message || "Could not save menu category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this menu item?")) return;

    setSaving(true);
    setError("");

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

  const handleDeleteCategory = async (category) => {
    const assignedItems = rows.filter((item) =>
      Array.isArray(item.categories)
        ? item.categories.includes(category.name)
        : false,
    );

    if (assignedItems.length > 0) {
      setError(
        `Cannot delete ${category.name}. Remove it from ${assignedItems.length} menu item(s) first.`,
      );
      return;
    }

    if (!confirm(`Delete menu category "${category.name}"?`)) return;

    setSaving(true);
    setError("");

    try {
      await deleteMenuCategory(category.id);

      if (editingCategoryId === category.id) {
        resetCategoryForm();
      }

      await loadRows();
      setMessage("Menu category deleted.");
    } catch (err) {
      setError(err.message || "Could not delete menu category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Menu"
      description="Add food items, manage menu categories, prices, daily labels, and images displayed on the menu page."
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
              <button
                type="button"
                className="admin-icon-button"
                onClick={resetForm}
                aria-label="Cancel menu item editing"
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

              <label className="admin-field full">
                <span>Display day</span>
                <input
                  value={form.dow}
                  onChange={(e) => updateField("dow", e.target.value)}
                  placeholder="Everyday / Monday"
                />
              </label>

              <div className="admin-field full">
                <span>Categories</span>

                <div className="admin-checkbox-grid">
                  {activeCategories.length === 0 ? (
                    <p className="admin-empty">Create a category first.</p>
                  ) : (
                    activeCategories.map((category) => (
                      <label className="admin-checkbox" key={category.id}>
                        <input
                          type="checkbox"
                          checked={form.categories.includes(category.name)}
                          onChange={(e) =>
                            toggleItemCategory(category.name, e.target.checked)
                          }
                        />
                        {category.name}
                      </label>
                    ))
                  )}
                </div>
              </div>

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
                  placeholder="Saturday Specials"
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
                const assignedCount = rows.filter((item) =>
                  Array.isArray(item.categories)
                    ? item.categories.includes(category.name)
                    : false,
                ).length;

                return (
                  <article className="admin-list-item" key={category.id}>
                    <div className="admin-list-icon">
                      <Utensils size={20} />
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
                    <img
                      src={row.image_url}
                      alt=""
                      className="admin-list-image"
                    />
                  ) : (
                    <div className="admin-list-icon">
                      <Utensils size={20} />
                    </div>
                  )}

                  <div>
                    <p className="admin-list-title">{row.name}</p>
                    <p className="admin-list-meta">
                      N${Number(row.price || 0).toFixed(2)} ·{" "}
                      {Array.isArray(row.categories) && row.categories.length
                        ? row.categories.join(", ")
                        : "No category"}
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

export default AdminMenu;
