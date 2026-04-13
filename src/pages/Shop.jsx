import { Bell, Search } from "lucide-react";
import { useMemo, useState } from "react";
import BottomNav from "../components/BottomNav";
import shopItems from "../data/shopItems";
import "./Shop.css";

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
          <h1 className="shop-title">JUKSKEI</h1>

          <div className="shop-header-actions">
            <button className="shop-icon-button" aria-label="Search">
              <Search size={18} strokeWidth={2.2} />
            </button>

            <button className="shop-icon-button" aria-label="Notifications">
              <Bell size={18} strokeWidth={2.2} />
            </button>
          </div>
        </header>

        <section className="shop-section">
          <h2 className="page-heading">Gift Shop</h2>

          <div className="shop-search-bar">
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button className="shop-search-icon-btn" aria-label="Search">
              <Search size={16} strokeWidth={2.2} />
            </button>
          </div>

          <div className="shop-category-row">
            {categories.map((category) => (
              <button
                key={category}
                className={`shop-category-btn ${
                  activeCategory === category ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="shop-grid">
            {filteredItems.map((item) => (
              <article key={item.id} className="shop-card">
                <img
                  src={item.image}
                  alt={item.name}
                  className="shop-card-image"
                />

                <div className="shop-card-body">
                  <p className="shop-card-price">N${item.price.toFixed(2)}</p>
                  <h3 className="shop-card-title">{item.subtitle}</h3>
                  {item.details ? (
                    <p className="shop-card-details">{item.details}</p>
                  ) : null}
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