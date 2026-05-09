import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./Splash2.css";

const PROFILE_CHECK_RETRIES = 6;
const PROFILE_CHECK_DELAY = 350;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function Splash2() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
    const adminParam = searchParams.get("admin");

    if (adminParam === "login" || adminParam === "true") {
      setAuthMode("login");
      setAuthError("");
      setAuthMessage("");
    }
  }, [searchParams]);

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

  const goToPublicApp = () => {
    navigate("/home", { replace: true });
  };

  const getAdminProfile = async (userId) => {
    for (let attempt = 0; attempt < PROFILE_CHECK_RETRIES; attempt += 1) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Admin profile check failed:", error.message);
      }

      if (data) {
        return data;
      }

      await wait(PROFILE_CHECK_DELAY);
    }

    return null;
  };

  const redirectAdminOrReject = async (userId) => {
    const profile = await getAdminProfile(userId);

    if (profile?.role === "super_admin") {
      closeAuthModal();
      navigate("/admin", { replace: true });
      return;
    }

    await supabase.auth.signOut({ scope: "local" });

    throw new Error(
      "This login area is reserved for approved tournament administrators only.",
    );
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    if (isAuthLoading) return;

    setAuthError("");
    setAuthMessage("");
    setIsAuthLoading(true);

    if (!supabase?.auth) {
      setAuthError("Supabase is not configured correctly.");
      setIsAuthLoading(false);
      return;
    }

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") || "")
      .trim()
      .replace(/\s+/g, "")
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

        await redirectAdminOrReject(userId);
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

        const session = data?.session;
        const userId = data?.user?.id;

        if (!session) {
          setAuthMessage(
            "Admin account created. Please confirm your email, then log in.",
          );
          setIsAuthLoading(false);
          return;
        }

        if (!userId) {
          throw new Error("Account created, but no user profile was returned.");
        }

        await redirectAdminOrReject(userId);
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
        redirectTo: `${window.location.origin}/splash2?admin=login`,
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
            className="splash2-enter-button"
            onClick={goToPublicApp}
          >
            Enter App <span aria-hidden="true">→</span>
          </button>

          <button
            type="button"
            className="splash2-admin-access"
            onClick={() => openAuthModal("login")}
          >
            Admin access
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
                <p>Admin Portal</p>
                <h2 id="auth-modal-title">
                  {authMode === "login" ? "Admin login" : "Admin sign up"}
                </h2>
              </div>
            </div>

            <p className="auth-admin-note">
              Public users can enter the tournament app without logging in. This
              area is only for approved tournament administrators.
            </p>

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
                  placeholder="Enter your admin email address"
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
                    I confirm that this account is for tournament admin use.
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
                    ? "Login to admin portal"
                    : "Create admin account"}
              </button>
            </form>

            <p className="auth-switch-text">
              {authMode === "login"
                ? "Need an approved admin account?"
                : "Already have an admin account?"}{" "}
              <button
                type="button"
                onClick={() =>
                  openAuthModal(authMode === "login" ? "signup" : "login")
                }
                disabled={isAuthLoading}
              >
                {authMode === "login" ? "Sign up" : "Login instead"}
              </button>
            </p>
          </section>
        </div>
      )}
    </main>
  );
}

export default Splash2;
