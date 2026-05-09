import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import "./SignOutButton.css";

function SignOutButton({ className = "", label = "Sign out" }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut({ scope: "local" });
      }

      localStorage.clear();
      sessionStorage.clear();

      navigate("/splash2", { replace: true });
    } catch (error) {
      console.error("Sign out failed:", error);
      alert("Could not sign out. Please try again.");
    }
  };

  return (
    <button
      type="button"
      className={`signout-button ${className}`}
      onClick={handleSignOut}
    >
      <span className="signout-icon" aria-hidden="true">
        ↗
      </span>
      {label}
    </button>
  );
}

export default SignOutButton;
