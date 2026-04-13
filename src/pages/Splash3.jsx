import { useNavigate } from "react-router-dom";
import "./Splash2.css";

function Splash3() {
  const navigate = useNavigate();

  return (
    <main className="splash2-page">
      <img
        src="/family.jpeg"
        alt="Jukskei Family"
        className="splash2-image"
      />

      <div className="splash2-fade"></div>

      <section className="splash2-content">
        <h1>Jukskei Familie</h1>

        <p>
          Viering van sport, gemeenskap en samewerking.
          Geniet die toernooi en wees deel van die jukskei-erfenis.
        </p>

        <button onClick={() => navigate("/home")}>
          Login →
        </button>
      </section>
    </main>
  );
}

export default Splash3;