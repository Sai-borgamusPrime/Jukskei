import { useNavigate } from "react-router-dom";
import "./Splash2.css";

function Splash2() {
  const navigate = useNavigate();

  return (
    <main className="splash2-page">
      {/* Background Image */}
      <img
        src="/player.jpeg"
        alt="Jukskei Player"
        className="splash2-image"
      />

      {/* Bottom Fade */}
      <div className="splash2-fade"></div>

      {/* Content */}
      <section className="splash2-content">
        <h1>Welkom by Jukskei 25</h1>

        <p>
          Vier 25 jaar van jukskei-uitnemendheid en passie.
          Volg wedstryde, skedules en beleef die toernooi op een plek.
        </p>

        <button onClick={() => navigate("/splash3")}>
          Login →
        </button>
      </section>

    </main>
  );
}

export default Splash2;