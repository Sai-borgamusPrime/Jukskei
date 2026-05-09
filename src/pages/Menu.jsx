import { Search, Utensils } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "../components/BottomNav";
import { usePublicQuery } from "../hooks/usePublicQuery";
import {
  getPublicMenuCategories,
  getPublicMenuItems,
} from "../services/publicApi";
import "./Menu.css";

function Menu() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const {
    data: menuItems = [],
    loading: itemsLoading,
    error: itemsError,
  } = usePublicQuery(getPublicMenuItems, [], ["menu_items", "menu_categories"]);

  const {
    data: menuCategories = [],
    loading: categoriesLoading,
    error: categoriesError,
  } = usePublicQuery(getPublicMenuCategories, [], ["menu_categories"]);

  const categories = useMemo(() => {
    return ["All", ...menuCategories.map((category) => category.name)];
  }, [menuCategories]);

  useEffect(() => {
    if (!categories.includes(activeCategory)) {
      setActiveCategory("All");
    }
  }, [activeCategory, categories]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.categories?.includes(activeCategory);

      const matchesQuery = item.name
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory, menuItems]);

  const loading = itemsLoading || categoriesLoading;
  const error = itemsError || categoriesError;

  return (
    <main className="menu-page">
      <section className="menu-shell">
        <header className="menu-header">
          <div>
            <h1 className="menu-title">JUKSKEI</h1>
            <p className="menu-kicker">Kos en verversings</p>
          </div>
        </header>

        <section className="menu-hero">
          <div>
            <p className="menu-eyebrow">Tournament Menu</p>
            <h2 className="menu-page-heading">Menu</h2>
            <p className="menu-hero-text">
              Blaai deur etes, daaglikse spesiale aanbiedinge en kosopsies wat
              tydens die toernooi beskikbaar is.
            </p>
          </div>

          <div className="menu-summary-card">
            <Utensils size={22} />
            <span>{filteredItems.length}</span>
            <p>{filteredItems.length === 1 ? "item shown" : "items shown"}</p>
          </div>
        </section>

        <section className="menu-section">
          <div className="menu-toolbar">
            <div className="menu-search-bar">
              <input
                type="text"
                placeholder="Search menu"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <button
                className="menu-search-icon-btn"
                type="button"
                aria-label="Search"
              >
                <Search size={16} strokeWidth={2.2} />
              </button>
            </div>

            <div className="menu-category-row">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`menu-category-btn ${
                    activeCategory === category ? "active" : ""
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="menu-grid">
            {loading ? (
              <p className="empty-events">Loading menu...</p>
            ) : error ? (
              <p className="empty-events">{error}</p>
            ) : filteredItems.length === 0 ? (
              <p className="empty-events">No menu items found.</p>
            ) : (
              filteredItems.map((item) => (
                <article key={item.id} className="menu-card">
                  <img
                    src={item.image || "/logo.webp"}
                    alt={item.name}
                    className="menu-card-image"
                    onError={(event) => {
                      event.currentTarget.src = "/logo.webp";
                    }}
                  />

                  <div className="menu-card-body">
                    <h3 className="menu-card-title">{item.name}</h3>

                    <p className="menu-card-time">
                      <span className="menu-time-dot"></span>
                      {item.DOW || "Available"}
                    </p>

                    <p className="menu-card-price">N${item.price.toFixed(2)}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <BottomNav />
      </section>
    </main>
  );
}

export default Menu;
