import { Search, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import BottomNav from "../components/BottomNav";
import ThemeToggle from "../components/ThemeToggle";
import shopItems from "../data/shopItems";
import "./Shop.css";
import SignOutButton from "../components/SignOutButton/SignOutButton";

function Shop() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Cups", "Caps", "T-Shirts"];

  const filteredItems = useMemo(() => {
    return shopItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;

      const matchesQuery = item.name
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <main className="shop-page">
      <section className="shop-shell">
        <header className="shop-header">
          <div>
            <h1 className="shop-title">JUKSKEI</h1>
            <p className="shop-kicker">Toernooi Handelsware</p>
          </div>

          <div className="shop-header-actions">
            <div>
              <ThemeToggle />
              <SignOutButton />
            </div>
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
            {filteredItems.map((item) => (
              <article key={item.id} className="shop-card">
                <div className="shop-image-wrap">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="shop-card-image"
                  />
                </div>

                <div className="shop-card-body">
                  <p className="shop-card-price">N${item.price.toFixed(2)}</p>
                  <h3 className="shop-card-title">{item.subtitle}</h3>

                  {item.details && (
                    <p className="shop-card-details">{item.details}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <BottomNav />
      </section>
    </main>
  );
}

export default Shop;
