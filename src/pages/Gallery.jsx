import { useState } from "react";
import { ArrowLeft, Images, X } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { usePublicQuery } from "../hooks/usePublicQuery";
import { getPublicGallery } from "../services/publicApi";
import "./Gallery.css";

const FACEBOOK_PAGE_URL =
  "https://www.facebook.com/media/set/?set=oa.1712426963226924&type=3";

function Gallery() {
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const {
    data: categories = [],
    loading,
    error,
  } = usePublicQuery(
    getPublicGallery,
    [],
    ["gallery_categories", "gallery_images"],
  );

  const activeCategory = categories.find((cat) => cat.id === activeCategoryId);

  const totalImages = categories.reduce(
    (total, category) => total + category.images.length,
    0,
  );

  return (
    <main className="gallery-page">
      <section className="gallery-shell">
        <header className="gallery-header">
          <div>
            <h1 className="gallery-title">JUKSKEI</h1>
            <p className="gallery-kicker">Tournament Memories</p>
          </div>
          <a
            className="gallery-facebook-button"
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Facebook page in a new tab"
          >
            <span className="gallery-facebook-icon" aria-hidden="true">
              f
            </span>
            <span>Facebook</span>
          </a>
        </header>

        {!activeCategory ? (
          <>
            <section className="gallery-hero">
              <div>
                <p className="gallery-eyebrow">Photo Gallery</p>
                <h2 className="page-heading">Gallery</h2>
                <p className="gallery-subtitle">
                  View highlights, team moments, and event photos.
                </p>
              </div>

              <div className="gallery-summary-card">
                <Images size={22} />
                <span>{totalImages}</span>
                <p>{totalImages === 1 ? "photo" : "photos"}</p>
              </div>
            </section>

            {loading ? (
              <p className="empty-gallery">Loading gallery...</p>
            ) : error ? (
              <p className="empty-gallery">{error}</p>
            ) : categories.length === 0 ? (
              <p className="empty-gallery">No gallery categories found.</p>
            ) : (
              <section className="gallery-grid">
                {categories.map((item) => (
                  <button
                    key={item.id}
                    className="gallery-card"
                    onClick={() => setActiveCategoryId(item.id)}
                    type="button"
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
            )}
          </>
        ) : (
          <>
            <button
              className="gallery-back-button"
              onClick={() => setActiveCategoryId(null)}
              type="button"
            >
              <ArrowLeft size={18} />
              Back to Gallery
            </button>

            <section className="category-header">
              <div>
                <p className="gallery-eyebrow">Category</p>
                <h2 className="page-heading">{activeCategory.title}</h2>
                <p className="gallery-subtitle">
                  Preview tournament photos uploaded from the admin portal.
                </p>
              </div>
            </section>

            <section className="category-image-grid">
              {activeCategory.images.length === 0 ? (
                <div className="empty-gallery">
                  <p>No images in this category yet.</p>
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
            type="button"
            aria-label="Close fullscreen image"
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
