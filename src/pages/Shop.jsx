import { Search, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "../components/BottomNav";
import { usePublicQuery } from "../hooks/usePublicQuery";
import {
  getPublicShopCategories,
  getPublicShopItems,
} from "../services/publicApi";
import "./Shop.css";

function Shop() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const {
    data: shopItems = [],
    loading: itemsLoading,
    error: itemsError,
  } = usePublicQuery(getPublicShopItems, [], ["shop_items", "shop_categories"]);

  const {
    data: shopCategories = [],
    loading: categoriesLoading,
    error: categoriesError,
  } = usePublicQuery(getPublicShopCategories, [], ["shop_categories"]);

  const categories = useMemo(() => {
    return ["All", ...shopCategories.map((category) => category.name)];
  }, [shopCategories]);

  useEffect(() => {
    if (!categories.includes(activeCategory)) {
      setActiveCategory("All");
    }
  }, [activeCategory, categories]);

  const filteredItems = useMemo(() => {
    return shopItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;

      const matchesQuery = item.name
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory, shopItems]);

  const loading = itemsLoading || categoriesLoading;
  const error = itemsError || categoriesError;

  return (
    <main className="shop-page">
      <section className="shop-shell">
        <header className="shop-header">
          <div>
            <h1 className="shop-title">JUKSKEI</h1>
            <p className="shop-kicker">Toernooi Handelsware</p>
          </div>
        </header>

        <section className="shop-hero">
          <div>
            <p className="shop-eyebrow">Gift Store</p>
            <h2 className="shop-page-heading">Gift Shop</h2>
            <p className="shop-hero-text">
              Blaai deur amptelike geleentheidsware, aandenkinge en
              toernooi-bykomstighede.
            </p>
          </div>

          <div className="shop-summary-card">
            <ShoppingBag size={22} />
            <span>{filteredItems.length}</span>
            <p>{filteredItems.length === 1 ? "item shown" : "items shown"}</p>
          </div>
        </section>

        <section className="shop-section">
          <div className="shop-toolbar">
            <div className="shop-search-bar">
              <input
                type="text"
                placeholder="Search shop"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <button
                className="shop-search-icon-btn"
                type="button"
                aria-label="Search"
              >
                <Search size={16} strokeWidth={2.2} />
              </button>
            </div>

            <div className="shop-category-row">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`shop-category-btn ${
                    activeCategory === category ? "active" : ""
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="shop-grid">
            {loading ? (
              <p className="empty-events">Loading shop...</p>
            ) : error ? (
              <p className="empty-events">{error}</p>
            ) : filteredItems.length === 0 ? (
              <p className="empty-events">No shop items found.</p>
            ) : (
              filteredItems.map((item) => (
                <article key={item.id} className="shop-card">
                  <div className="shop-image-wrap">
                    <img
                      src={item.image || "/logo.webp"}
                      alt={item.name}
                      className="shop-card-image"
                      onError={(event) => {
                        event.currentTarget.src = "/logo.webp";
                      }}
                    />
                  </div>

                  <div className="shop-card-body">
                    <p className="shop-card-price">N${item.price.toFixed(2)}</p>

                    <h3 className="shop-card-title">
                      {item.subtitle || item.name}
                    </h3>

                    {item.details && (
                      <p className="shop-card-details">{item.details}</p>
                    )}
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

export default Shop;
