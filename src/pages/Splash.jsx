import { useNavigate } from "react-router-dom";
import "./Splash.css";

function Splash() {
  const navigate = useNavigate();

  return (
    <main className="splash-page">
      <section className="splash-content">
        <div className="logo-block">
          <div className="logo-aura"></div>
          <div className="logo-mist"></div>
          <div className="logo-flare logo-flare-left"></div>
          <div className="logo-flare logo-flare-right"></div>

          <img
            src="/logo.png"
            alt="Jukskei Tournament Logo"
            className="splash-logo"
          />

         <img
            src="/logo.png"
            alt="Jukskei Tournament Logo"
            className="logo-aura"
          />
        </div>

        <div className="splash-powered">
          <p>Powered By</p>
          <img 
            src="/schoemans-logo.png"
            alt="Schoemans Logo"
            className="sponsor-logo"
          />
        </div>

        <button
          className="splash-button"
          onClick={() => navigate("/splash2")}
        >
          Login <span aria-hidden="true">→</span>
        </button>
      </section>
    </main>
  );
}

export default Splash;