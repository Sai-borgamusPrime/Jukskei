import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Splash2.css";

function Splash2() {
  const navigate = useNavigate();
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [authMode, setAuthMode] = useState(null);

  const slides = useMemo(
    () => [
      {
        image: "/player.png",
        alt: "Jukskei Player",
        title: "Welkom by Jukskei 25",
        text: "Vier 25 jaar van jukskei-uitnemendheid en passie. Volg wedstryde, skedules en beleef die toernooi op een plek.",
      },
      {
        image: "/family.png",
        alt: "Jukskei Family",
        title: "Jukskei Familie",
        text: "Viering van sport, gemeenskap en samewerking. Geniet die toernooi en wees deel van die jukskei-erfenis.",
      },
    ],
    [],
  );

  const isAuthModalOpen = Boolean(authMode);
  const currentSlide = slides[currentIndex];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [slides.length]);

  useEffect(() => {
    if (!isAuthModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setAuthMode(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isAuthModalOpen]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1,
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const handleTouchStart = (event) => {
    if (isAuthModalOpen) return;
    touchStartX.current = event.changedTouches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (isAuthModalOpen) return;

    touchEndX.current = event.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (swipeDistance > minSwipeDistance) {
      goToNext();
    } else if (swipeDistance < -minSwipeDistance) {
      goToPrevious();
    }
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
  };

  const closeAuthModal = () => {
    setAuthMode(null);
  };

  const handleAuthSubmit = (event) => {
    event.preventDefault();

    // Replace this with your real Supabase/Firebase/API login/signup logic later.
    navigate("/home");
  };

  return (
    <main
      className="splash2-page"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="splash2-background">
        {slides.map((slide, index) => (
          <img
            key={slide.title}
            src={slide.image}
            alt={slide.alt}
            className={`splash2-image ${
              index === currentIndex ? "is-active" : ""
            }`}
          />
        ))}
      </div>

      <div className="splash2-fade" />

      <section className="splash2-content">
        <div className="splash2-copy">
          <p className="splash2-eyebrow">Jukskei Tournament</p>

          <h1>{currentSlide.title}</h1>
          <p>{currentSlide.text}</p>

          <div className="splash2-slider-controls" aria-label="Splash slides">
            <div
              className="splash2-dots"
              role="tablist"
              aria-label="Slide picker"
            >
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  className={`splash2-dot ${
                    index === currentIndex ? "is-active" : ""
                  }`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-selected={index === currentIndex}
                  role="tab"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="splash2-actions">
          <button
            type="button"
            className="splash2-login-button"
            onClick={() => openAuthModal("login")}
          >
            Login →
          </button>

          <button
            type="button"
            className="auth-link2 auth-button-link"
            onClick={() => openAuthModal("signup")}
          >
            Don’t have an account?{" "}
            <span className="signup-highlight2">Sign up</span>
          </button>
        </div>
      </section>

      {isAuthModalOpen && (
        <div className="auth-modal-overlay" onClick={closeAuthModal}>
          <section
            className="auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="auth-close-button"
              onClick={closeAuthModal}
              aria-label="Close authentication modal"
            >
              ×
            </button>

            <div className="auth-brand">
              <img src="/logo.png" alt="Jukskei Tournament Logo" />
              <div>
                <p>Jukskei Tournament</p>
                <h2 id="auth-modal-title">
                  {authMode === "login" ? "Welcome back" : "Create account"}
                </h2>
              </div>
            </div>

            <div className="auth-tabs" role="tablist" aria-label="Auth options">
              <button
                type="button"
                className={`auth-tab ${authMode === "login" ? "is-active" : ""}`}
                onClick={() => setAuthMode("login")}
              >
                Login
              </button>

              <button
                type="button"
                className={`auth-tab ${
                  authMode === "signup" ? "is-active" : ""
                }`}
                onClick={() => setAuthMode("signup")}
              >
                Sign up
              </button>
            </div>

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {authMode === "signup" && (
                <label className="auth-field">
                  <span>Full name</span>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </label>
              )}

              <label className="auth-field">
                <span>Email address</span>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  autoComplete={
                    authMode === "login" ? "current-password" : "new-password"
                  }
                  required
                />
              </label>

              {authMode === "signup" && (
                <label className="auth-field">
                  <span>Confirm password</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                  />
                </label>
              )}

              {authMode === "login" ? (
                <div className="auth-options-row">
                  <label className="auth-checkbox">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>

                  <button type="button" className="auth-text-button">
                    Forgot password?
                  </button>
                </div>
              ) : (
                <label className="auth-checkbox auth-terms">
                  <input type="checkbox" required />
                  <span>
                    I agree to the tournament app terms and privacy policy.
                  </span>
                </label>
              )}

              <button type="submit" className="auth-submit-button">
                {authMode === "login" ? "Login to dashboard" : "Create account"}
              </button>
            </form>

            <p className="auth-switch-text">
              {authMode === "login"
                ? "New to the tournament app?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() =>
                  setAuthMode(authMode === "login" ? "signup" : "login")
                }
              >
                {authMode === "login" ? "Create an account" : "Login instead"}
              </button>
            </p>
          </section>
        </div>
      )}
    </main>
  );
}

export default Splash2;
