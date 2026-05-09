import { useLocation, useNavigate } from "react-router-dom";
import { useAuthProfile } from "../../hooks/useAuthProfile";
import "./AdminAccessButton.css";

function AdminAccessButton() {
  const location = useLocation();
  const navigate = useNavigate();

  const { loading, isLoggedIn, isSuperAdmin } = useAuthProfile();

  const isAdminRoute = location.pathname.startsWith("/admin");

  const hiddenRoutes = ["/", "/splash2", "/logout"];

  const shouldHide = hiddenRoutes.includes(location.pathname) || isAdminRoute;

  if (shouldHide) {
    return null;
  }

  const handleClick = () => {
    if (!loading && isLoggedIn && isSuperAdmin) {
      navigate("/admin");
      return;
    }

    navigate("/splash2?admin=login");
  };

  return (
    <button
      type="button"
      className="floating-admin-access"
      onClick={handleClick}
      aria-label="Open admin access"
    >
      <span aria-hidden="true">⚙</span>
      {!loading && isLoggedIn && isSuperAdmin ? "Admin Portal" : "Admin Access"}
    </button>
  );
}

export default AdminAccessButton;
