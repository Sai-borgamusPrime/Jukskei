import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./Splash2.css";

function Splash2() {
  const navigate = useNavigate();

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [authMode, setAuthMode] = useState(null);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

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
        closeAuthModal();
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
    setAuthError("");
    setAuthMessage("");
  };

  const closeAuthModal = () => {
    setAuthMode(null);
    setAuthError("");
    setAuthMessage("");
    setIsAuthLoading(false);
  };

  const getUserRedirectPath = async (userId) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Profile role check failed:", error.message);
      return "/home";
    }

    return profile?.role === "super_admin" ? "/admin" : "/home";
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    if (isAuthLoading) return;

    setAuthError("");
    setAuthMessage("");
    setIsAuthLoading(true);

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();

    const password = String(formData.get("password") || "");
    const fullName = String(formData.get("fullName") || "").trim();
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!email || !password) {
      setAuthError("Please enter your email address and password.");
      setIsAuthLoading(false);
      return;
    }

    if (authMode === "signup" && password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      setIsAuthLoading(false);
      return;
    }

    try {
      if (authMode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        const userId = data?.user?.id;

        if (!userId) {
          throw new Error("Login succeeded, but no user profile was returned.");
        }

        const redirectPath = await getUserRedirectPath(userId);

        closeAuthModal();
        navigate(redirectPath, { replace: true });
        return;
      }

      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        const userId = data?.user?.id;
        const session = data?.session;

        if (!session) {
          setAuthMessage(
            "Account created. Please check your email to confirm your account, then log in.",
          );
          setIsAuthLoading(false);
          return;
        }

        if (!userId) {
          throw new Error("Account created, but no user profile was returned.");
        }

        const redirectPath = await getUserRedirectPath(userId);

        closeAuthModal();
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      setAuthError(error.message || "Something went wrong. Please try again.");
      setIsAuthLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setAuthError("");
    setAuthMessage("");

    const emailInput = document.querySelector("input[name='email']");
    const email = emailInput?.value?.trim()?.toLowerCase();

    if (!email) {
      setAuthError(
        "Enter your email address first, then click forgot password.",
      );
      return;
    }

    setIsAuthLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/splash2`,
      });

      if (error) throw error;

      setAuthMessage("Password reset email sent. Please check your inbox.");
    } catch (error) {
      setAuthError(error.message || "Could not send password reset email.");
    } finally {
      setIsAuthLoading(false);
    }
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
              disabled={isAuthLoading}
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
                className={`auth-tab ${
                  authMode === "login" ? "is-active" : ""
                }`}
                onClick={() => openAuthModal("login")}
                disabled={isAuthLoading}
              >
                Login
              </button>

              <button
                type="button"
                className={`auth-tab ${
                  authMode === "signup" ? "is-active" : ""
                }`}
                onClick={() => openAuthModal("signup")}
                disabled={isAuthLoading}
              >
                Sign up
              </button>
            </div>

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {authError && (
                <p className="auth-error-message" role="alert">
                  {authError}
                </p>
              )}

              {authMessage && (
                <p className="auth-success-message" role="status">
                  {authMessage}
                </p>
              )}

              {authMode === "signup" && (
                <label className="auth-field">
                  <span>Full name</span>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    disabled={isAuthLoading}
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
                  disabled={isAuthLoading}
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
                  disabled={isAuthLoading}
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
                    disabled={isAuthLoading}
                    required
                  />
                </label>
              )}

              {authMode === "login" ? (
                <div className="auth-options-row">
                  <label className="auth-checkbox">
                    <input type="checkbox" disabled={isAuthLoading} />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    className="auth-text-button"
                    onClick={handleForgotPassword}
                    disabled={isAuthLoading}
                  >
                    Forgot password?
                  </button>
                </div>
              ) : (
                <label className="auth-checkbox auth-terms">
                  <input type="checkbox" disabled={isAuthLoading} required />
                  <span>
                    I agree to the tournament app terms and privacy policy.
                  </span>
                </label>
              )}

              <button
                type="submit"
                className="auth-submit-button"
                disabled={isAuthLoading}
              >
                {isAuthLoading
                  ? authMode === "login"
                    ? "Logging in..."
                    : "Creating account..."
                  : authMode === "login"
                    ? "Login to app"
                    : "Create account"}
              </button>
            </form>

            <p className="auth-switch-text">
              {authMode === "login"
                ? "New to the tournament app?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() =>
                  openAuthModal(authMode === "login" ? "signup" : "login")
                }
                disabled={isAuthLoading}
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
