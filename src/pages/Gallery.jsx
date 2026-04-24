import { useState } from "react";
import "./Gallery.css";
import galleryImages from "../data/galleryImages";
import BottomNav from "../components/BottomNav";
import { Upload, Trash2, Star, X, ArrowLeft } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

function Gallery() {
  const [categories, setCategories] = useState(galleryImages);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const activeCategory = categories.find((cat) => cat.id === activeCategoryId);

  const handleUpload = (categoryId, event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    const newImages = files.map((file) => ({
      id: crypto.randomUUID(),
      title: file.name,
      image: URL.createObjectURL(file),
      isCover: false,
    }));

    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              images: [...category.images, ...newImages],
            }
          : category,
      ),
    );

    event.target.value = "";
  };

  const setCoverImage = (categoryId, imageId) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              coverImage: category.images.find((img) => img.id === imageId)
                ?.image,
            }
          : category,
      ),
    );
  };

  const deleteImage = (categoryId, imageId) => {
    setCategories((prev) =>
      prev.map((category) => {
        if (category.id !== categoryId) return category;

        const imageToDelete = category.images.find((img) => img.id === imageId);
        const updatedImages = category.images.filter(
          (img) => img.id !== imageId,
        );

        const wasCover = category.coverImage === imageToDelete?.image;

        return {
          ...category,
          images: updatedImages,
          coverImage: wasCover
            ? updatedImages[0]?.image || category.fallbackImage
            : category.coverImage,
        };
      }),
    );
  };

  return (
    <main className="gallery-page">
      <section className="gallery-shell">
        <header className="gallery-header">
          <h1 className="gallery-title">JUKSKEI</h1>

          <ThemeToggle />
        </header>

        {!activeCategory ? (
          <>
            <h2 className="page-heading">Gallery</h2>

            <p className="gallery-subtitle">
              View highlights, team moments and event photos.
            </p>

            <section className="gallery-grid">
              {categories.map((item) => (
                <button
                  key={item.id}
                  className="gallery-card"
                  onClick={() => setActiveCategoryId(item.id)}
                >
                  <img src={item.coverImage} alt={item.title} />

                  <div className="gallery-card-overlay">
                    <div>
                      <h2>{item.title}</h2>
                      <p>{item.images.length} photos</p>
                    </div>
                  </div>
                </button>
              ))}
            </section>
          </>
        ) : (
          <>
            <button
              className="gallery-back-button"
              onClick={() => setActiveCategoryId(null)}
            >
              <ArrowLeft size={18} />
              Back to Gallery
            </button>

            <div className="category-header">
              <div>
                <h2 className="page-heading">{activeCategory.title}</h2>
                <p className="gallery-subtitle">
                  Upload, preview, delete, or set a cover image.
                </p>
              </div>

              <label className="upload-button">
                <Upload size={17} />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => handleUpload(activeCategory.id, event)}
                />
              </label>
            </div>

            <section className="category-image-grid">
              {activeCategory.images.length === 0 ? (
                <div className="empty-gallery">
                  <p>No images in this category yet.</p>

                  <label className="upload-button">
                    <Upload size={17} />
                    Upload Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) =>
                        handleUpload(activeCategory.id, event)
                      }
                    />
                  </label>
                </div>
              ) : (
                activeCategory.images.map((image) => {
                  const isCover = activeCategory.coverImage === image.image;

                  return (
                    <article key={image.id} className="category-image-card">
                      <img
                        src={image.image}
                        alt={image.title}
                        onClick={() => setFullscreenImage(image)}
                      />

                      {isCover && <span className="cover-badge">Cover</span>}

                      <div className="image-actions">
                        <button
                          onClick={() =>
                            setCoverImage(activeCategory.id, image.id)
                          }
                          title="Set as cover"
                        >
                          <Star size={16} />
                        </button>

                        <button
                          onClick={() =>
                            deleteImage(activeCategory.id, image.id)
                          }
                          title="Delete image"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </section>
          </>
        )}

        <BottomNav />
      </section>

      {fullscreenImage && (
        <div className="fullscreen-viewer">
          <button
            className="fullscreen-close"
            onClick={() => setFullscreenImage(null)}
          >
            <X size={24} />
          </button>

          <img src={fullscreenImage.image} alt={fullscreenImage.title} />
        </div>
      )}
    </main>
  );
}

export default Gallery;
