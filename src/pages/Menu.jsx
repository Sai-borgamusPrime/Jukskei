import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import BottomNav from "../components/BottomNav";
import ThemeToggle from "../components/ThemeToggle";
import menuItems from "../data/menuItems";
import "./Menu.css";

function Menu() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    "Everyday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Special Events",
  ];

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.categories?.includes(activeCategory);

      const matchesQuery = item.name
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <main className="menu-page">
      <section className="menu-shell">
        <header className="menu-header">
          <h1 className="menu-title">JUKSKEI</h1>

          <div className="menu-header-actions">
            <ThemeToggle />
          </div>
        </header>

        <section className="menu-section">
          <h2 className="menu-page-heading">Menu</h2>

          <div className="menu-search-bar">
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button className="menu-search-icon-btn" aria-label="Search">
              <Search size={16} strokeWidth={2.2} />
            </button>
          </div>

          <div className="menu-category-row">
            {categories.map((category) => (
              <button
                key={category}
                className={`menu-category-btn ${
                  activeCategory === category ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="menu-grid">
            {filteredItems.map((item) => (
              <article key={item.id} className="menu-card">
                <img
                  src={item.image}
                  alt={item.name}
                  className="menu-card-image"
                />

                <div className="menu-card-body">
                  <h3 className="menu-card-title">{item.name}</h3>

                  <p className="menu-card-time">
                    <span className="menu-time-dot"></span>
                    {item.DOW}
                  </p>

                  <p className="menu-card-price">N${item.price.toFixed(2)}</p>
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

export default Menu;
