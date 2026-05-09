import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Splash.css";

const INTRO_DURATION = 3000;
const EXIT_DURATION = 650;

function Splash() {
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsLeaving(true);
    }, INTRO_DURATION);

    const navigateTimer = setTimeout(() => {
      navigate("/splash2", { replace: true });
    }, INTRO_DURATION + EXIT_DURATION);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <main
      className={`splash-page ${isLeaving ? "is-leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Jukskei Tournament app"
    >
      <div className="splash-orb splash-orb-one"></div>
      <div className="splash-orb splash-orb-two"></div>
      <div className="splash-grid"></div>

      <section className="splash-content">
        <div className="splash-main">
          <div className="logo-block" aria-hidden="true">
            <div className="logo-aura"></div>
            <div className="logo-ring"></div>
            <div className="logo-mist"></div>
            <div className="logo-flare logo-flare-left"></div>
            <div className="logo-flare logo-flare-right"></div>

            <img
              src="/logo.png"
              alt="Jukskei Tournament Logo"
              className="splash-logo"
            />
          </div>

          <div className="splash-text">
            <p className="splash-eyebrow">Namibia Ope Jukskei Toernooi</p>
            <h1 className="splash-heading">Welkom by Jukskei</h1>
            <p className="splash-subtitle">
              Volg spanne, wedstryde, uitslae, galery-oomblikke en
              toernooi-opdaterings op een plek.
            </p>
          </div>
        </div>

        <aside className="splash-side">
          <div className="splash-powered">
            <p>Powered By</p>
            <img
              src="/schoemans-logo.png"
              alt="Schoemans Logo"
              className="sponsor-logo"
            />
          </div>

          <div className="loading-block">
            <div className="loading-bar">
              <span></span>
            </div>

            <div className="loading-text">
              <span>Loading tournament experience</span>
              <div className="loading-dots" aria-hidden="true">
                <i></i>
                <i></i>
                <i></i>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default Splash;
