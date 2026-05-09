import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  GalleryHorizontal,
  ImagePlus,
  Plus,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import {
  deleteRow,
  listGalleryCategories,
  listGalleryImages,
  saveGalleryCategory,
  saveGalleryImage,
  uploadAsset,
} from "../services/adminApi";

const emptyCategoryForm = {
  title: "",
  slug: "",
  cover_image_url: "",
  fallback_image_url: "",
  sort_order: 0,
  is_active: true,
};

const emptyImageForm = {
  category_id: "",
  title: "",
  image_url: "",
  is_cover: false,
  is_active: true,
};

function AdminGallery() {
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [imageForm, setImageForm] = useState(emptyImageForm);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingImageId, setEditingImageId] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const visibleImages = useMemo(() => {
    return activeCategoryId
      ? images.filter((image) => image.category_id === activeCategoryId)
      : images;
  }, [activeCategoryId, images]);

  const categoryMap = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.id] = category;
      return acc;
    }, {});
  }, [categories]);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [categoryRows, imageRows] = await Promise.all([
        listGalleryCategories(),
        listGalleryImages(),
      ]);

      setCategories(categoryRows);
      setImages(imageRows);
    } catch (err) {
      setError(err.message || "Could not load gallery.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateCategoryField = (field, value) => {
    setCategoryForm((current) => ({ ...current, [field]: value }));
  };

  const updateImageField = (field, value) => {
    setImageForm((current) => ({ ...current, [field]: value }));
  };

  const resetCategoryForm = () => {
    setCategoryForm(emptyCategoryForm);
    setEditingCategoryId(null);
  };

  const resetImageForm = () => {
    setImageForm({
      ...emptyImageForm,
      category_id: activeCategoryId || "",
    });
    setEditingImageId(null);
  };

  const editCategory = (category) => {
    setEditingCategoryId(category.id);
    setCategoryForm({
      title: category.title || "",
      slug: category.slug || "",
      cover_image_url: category.cover_image_url || "",
      fallback_image_url: category.fallback_image_url || "",
      sort_order: category.sort_order || 0,
      is_active: category.is_active !== false,
    });
  };

  const editImage = (image) => {
    setEditingImageId(image.id);
    setImageForm({
      category_id: image.category_id || "",
      title: image.title || "",
      image_url: image.image_url || "",
      is_cover: Boolean(image.is_cover),
      is_active: image.is_active !== false,
    });
  };

  const handleUpload = async (target, file) => {
    if (!file) return;

    try {
      setSaving(true);
      const url = await uploadAsset(file, "gallery");

      if (target === "category_cover") {
        updateCategoryField("cover_image_url", url);
      } else if (target === "category_fallback") {
        updateCategoryField("fallback_image_url", url);
      } else {
        updateImageField("image_url", url);
      }
    } catch (err) {
      setError(err.message || "Image upload failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();

    if (!categoryForm.title.trim()) {
      setError("Category title is required.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveGalleryCategory(categoryForm, editingCategoryId);
      setMessage(editingCategoryId ? "Category updated." : "Category created.");
      resetCategoryForm();
      await loadData();
    } catch (err) {
      setError(err.message || "Could not save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageSubmit = async (event) => {
    event.preventDefault();

    if (!imageForm.category_id || !imageForm.image_url) {
      setError("Image category and image URL are required.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveGalleryImage(imageForm, editingImageId);
      setMessage(editingImageId ? "Image updated." : "Image created.");
      resetImageForm();
      await loadData();
    } catch (err) {
      setError(err.message || "Could not save image.");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm("Delete this category and its images?")) return;

    setSaving(true);

    try {
      await deleteRow("gallery_categories", id);
      await loadData();
      if (editingCategoryId === id) resetCategoryForm();
    } catch (err) {
      setError(err.message || "Could not delete category.");
    } finally {
      setSaving(false);
    }
  };

  const deleteImage = async (id) => {
    if (!confirm("Delete this gallery image?")) return;

    setSaving(true);

    try {
      await deleteRow("gallery_images", id);
      await loadData();
      if (editingImageId === id) resetImageForm();
    } catch (err) {
      setError(err.message || "Could not delete image.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Gallery"
      description="Create gallery categories, upload images, select cover photos, and control what appears on the public gallery page."
    >
      <div className="admin-grid">
        {error && <p className="admin-error">{error}</p>}
        {message && <p className="admin-success">{message}</p>}

        <div className="admin-grid two">
          <section className="admin-card">
            <div className="admin-card-header">
              <div>
                <p className="admin-section-kicker">Category form</p>
                <h2 className="admin-card-title">
                  {editingCategoryId ? "Edit category" : "Add category"}
                </h2>
              </div>

              {editingCategoryId && (
                <button
                  type="button"
                  className="admin-icon-button"
                  onClick={resetCategoryForm}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <form className="admin-form" onSubmit={handleCategorySubmit}>
              <div className="admin-form-grid">
                <label className="admin-field">
                  <span>Title</span>
                  <input
                    value={categoryForm.title}
                    onChange={(e) => updateCategoryField("title", e.target.value)}
                    placeholder="Opening Ceremony"
                  />
                </label>

                <label className="admin-field">
                  <span>Slug</span>
                  <input
                    value={categoryForm.slug}
                    onChange={(e) => updateCategoryField("slug", e.target.value)}
                    placeholder="opening-ceremony"
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

                <label className="admin-field">
                  <span>Cover upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleUpload("category_cover", e.target.files?.[0])
                    }
                  />
                </label>

                <label className="admin-field full">
                  <span>Cover URL</span>
                  <input
                    value={categoryForm.cover_image_url}
                    onChange={(e) =>
                      updateCategoryField("cover_image_url", e.target.value)
                    }
                  />
                </label>

                <label className="admin-field full">
                  <span>Fallback URL</span>
                  <input
                    value={categoryForm.fallback_image_url}
                    onChange={(e) =>
                      updateCategoryField("fallback_image_url", e.target.value)
                    }
                  />
                </label>
              </div>

              {categoryForm.cover_image_url && (
                <img
                  src={categoryForm.cover_image_url}
                  alt=""
                  className="admin-image-preview"
                />
              )}

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

              <button type="submit" className="admin-button" disabled={saving}>
                {editingCategoryId ? <Save size={16} /> : <Plus size={16} />}
                {editingCategoryId ? "Save category" : "Create category"}
              </button>
            </form>
          </section>

          <section className="admin-card">
            <div className="admin-card-header">
              <div>
                <p className="admin-section-kicker">Image form</p>
                <h2 className="admin-card-title">
                  {editingImageId ? "Edit image" : "Add image"}
                </h2>
              </div>

              {editingImageId && (
                <button
                  type="button"
                  className="admin-icon-button"
                  onClick={resetImageForm}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <form className="admin-form" onSubmit={handleImageSubmit}>
              <div className="admin-form-grid">
                <label className="admin-field">
                  <span>Category</span>
                  <select
                    value={imageForm.category_id}
                    onChange={(e) => updateImageField("category_id", e.target.value)}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-field">
                  <span>Title</span>
                  <input
                    value={imageForm.title}
                    onChange={(e) => updateImageField("title", e.target.value)}
                    placeholder="Photo title"
                  />
                </label>

                <label className="admin-field full">
                  <span>Image URL</span>
                  <input
                    value={imageForm.image_url}
                    onChange={(e) => updateImageField("image_url", e.target.value)}
                    placeholder="https://..."
                  />
                </label>

                <label className="admin-field full">
                  <span>Upload image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUpload("image", e.target.files?.[0])}
                  />
                </label>
              </div>

              {imageForm.image_url && (
                <img src={imageForm.image_url} alt="" className="admin-image-preview" />
              )}

              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={imageForm.is_cover}
                  onChange={(e) => updateImageField("is_cover", e.target.checked)}
                />
                Use as category cover
              </label>

              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={imageForm.is_active}
                  onChange={(e) => updateImageField("is_active", e.target.checked)}
                />
                Active image
              </label>

              <button type="submit" className="admin-button" disabled={saving}>
                {editingImageId ? <Save size={16} /> : <ImagePlus size={16} />}
                {editingImageId ? "Save image" : "Create image"}
              </button>
            </form>
          </section>
        </div>

        <div className="admin-grid two">
          <section className="admin-card">
            <div className="admin-card-header">
              <div>
                <p className="admin-section-kicker">Records</p>
                <h2 className="admin-card-title">Categories</h2>
              </div>

              <span className="admin-pill">{categories.length} categories</span>
            </div>

            <div className="admin-list">
              {loading ? (
                <p className="admin-empty">Loading categories...</p>
              ) : categories.length === 0 ? (
                <p className="admin-empty">No gallery categories yet.</p>
              ) : (
                categories.map((category) => (
                  <article className="admin-list-item" key={category.id}>
                    {category.cover_image_url ? (
                      <img
                        src={category.cover_image_url}
                        alt=""
                        className="admin-list-image"
                      />
                    ) : (
                      <div className="admin-list-icon">
                        <GalleryHorizontal size={20} />
                      </div>
                    )}

                    <div>
                      <p className="admin-list-title">{category.title}</p>
                      <p className="admin-list-meta">
                        {category.slug || "No slug"} · Order{" "}
                        {category.sort_order || 0}
                      </p>
                    </div>

                    <div className="admin-list-actions">
                      <button
                        type="button"
                        className="admin-icon-button"
                        onClick={() => {
                          setActiveCategoryId(category.id);
                          editCategory(category);
                        }}
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        type="button"
                        className="admin-icon-button danger"
                        onClick={() => deleteCategory(category.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="admin-card">
            <div className="admin-card-header">
              <div>
                <p className="admin-section-kicker">Records</p>
                <h2 className="admin-card-title">Images</h2>
              </div>

              <select
                className="admin-field"
                value={activeCategoryId}
                onChange={(e) => {
                  setActiveCategoryId(e.target.value);
                  setImageForm((current) => ({
                    ...current,
                    category_id: e.target.value,
                  }));
                }}
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-list">
              {loading ? (
                <p className="admin-empty">Loading images...</p>
              ) : visibleImages.length === 0 ? (
                <p className="admin-empty">No gallery images yet.</p>
              ) : (
                visibleImages.map((image) => (
                  <article className="admin-list-item" key={image.id}>
                    <img src={image.image_url} alt="" className="admin-list-image" />

                    <div>
                      <p className="admin-list-title">
                        {image.title || "Untitled image"}
                      </p>
                      <p className="admin-list-meta">
                        {categoryMap[image.category_id]?.title || "No category"}
                        {image.is_cover ? " · Cover image" : ""}
                      </p>
                    </div>

                    <div className="admin-list-actions">
                      {image.is_cover && (
                        <span className="admin-pill">
                          <Star size={12} />
                        </span>
                      )}

                      <button
                        type="button"
                        className="admin-icon-button"
                        onClick={() => editImage(image)}
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        type="button"
                        className="admin-icon-button danger"
                        onClick={() => deleteImage(image.id)}
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
      </div>
    </AdminLayout>
  );
}

export default AdminGallery;
