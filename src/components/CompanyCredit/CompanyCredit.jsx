import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Building2, HeartHandshake, X } from "lucide-react";
import "./CompanyCredit.css";

const COMPANY_NAME = "Schoemans";
const DIGITAL_NAME = "Digital";
const SOLUTIONS_NAME = "Solutions";

const COMPANY_LOGO = "/schoemans-logo.webp";
const COMPANY_LOGO_LIGHT_MODE = "/schoemans-logo-dark.png";

function detectLightMode() {
  if (typeof window === "undefined") return false;

  const root = document.documentElement;
  const body = document.body;

  const themeValue =
    root.getAttribute("data-theme") ||
    body.getAttribute("data-theme") ||
    root.getAttribute("data-bs-theme") ||
    body.getAttribute("data-bs-theme") ||
    root.getAttribute("data-color-mode") ||
    body.getAttribute("data-color-mode");

  if (themeValue?.toLowerCase().includes("light")) return true;
  if (themeValue?.toLowerCase().includes("dark")) return false;

  const classNames = `${root.className} ${body.className}`.toLowerCase();

  if (
    classNames.includes("light") ||
    classNames.includes("light-mode") ||
    classNames.includes("theme-light")
  ) {
    return true;
  }

  if (
    classNames.includes("dark") ||
    classNames.includes("dark-mode") ||
    classNames.includes("theme-dark")
  ) {
    return false;
  }

  return window.matchMedia?.("(prefers-color-scheme: light)").matches ?? false;
}

function CompanyCredit() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => detectLightMode());

  useEffect(() => {
    const syncLogoWithTheme = () => {
      setIsLightMode(detectLightMode());
    };

    syncLogoWithTheme();

    const observer = new MutationObserver(syncLogoWithTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        "class",
        "data-theme",
        "data-bs-theme",
        "data-color-mode",
        "style",
      ],
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: [
        "class",
        "data-theme",
        "data-bs-theme",
        "data-color-mode",
        "style",
      ],
    });

    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: light)");

    mediaQuery?.addEventListener?.("change", syncLogoWithTheme);

    return () => {
      observer.disconnect();
      mediaQuery?.removeEventListener?.("change", syncLogoWithTheme);
    };
  }, []);

  const currentLogo = isLightMode ? COMPANY_LOGO_LIGHT_MODE : COMPANY_LOGO;

  const routeState = useMemo(() => {
    const pathname = location.pathname;

    return {
      isAdminRoute: pathname.startsWith("/admin"),
      isHiddenRoute: pathname === "/logout",
      isSplashRoute: pathname === "/" || pathname === "/splash2",
    };
  }, [location.pathname]);

  if (routeState.isAdminRoute || routeState.isHiddenRoute) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={`company-credit-pill ${
          routeState.isSplashRoute ? "is-splash" : ""
        }`}
        onClick={() => setOpen(true)}
        aria-label={`View app credit for ${COMPANY_NAME} ${DIGITAL_NAME}`}
      >
        <span className="company-credit-icon" aria-hidden="true">
          <HeartHandshake size={15} strokeWidth={2.5} />
        </span>

        <span className="company-credit-text">
          <small>Powered by</small>
          <strong>Schoemans Digital Solutions</strong>
        </span>
      </button>

      {open && (
        <div
          className="company-credit-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="company-credit-title"
          onClick={() => setOpen(false)}
        >
          <section
            className="company-credit-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="company-credit-close"
              onClick={() => setOpen(false)}
              aria-label="Close company credit"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            <div className="company-credit-brand">
              <div className="company-credit-logo-wrap">
                <img
                  src={currentLogo}
                  alt={`${COMPANY_NAME} ${DIGITAL_NAME} logo`}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/logo.webp";
                  }}
                />
              </div>

              <div>
                <p>Professional acknowledgement</p>

                <h2 id="company-credit-title">
                  Proudly powered by{" "}
                  {/*<h2 style={{ color: "#0334c7" }}>Schoemans</h2>{" "}*/}
                  <span style={{ color: "#0334c7" }}>{DIGITAL_NAME}</span>{" "}
                  <span style={{ color: "#fe2202" }}>{SOLUTIONS_NAME}</span>
                </h2>
              </div>
            </div>

            <div className="company-credit-body">
              <p>
                This Jukskei Tournament app was built as a free digital solution
                to support the tournament experience for players, organisers,
                families, and supporters.
              </p>

              <p>
                A special thank you goes to{" "}
                {/*<strong style={{ color: "#0334c7" }}>{COMPANY_NAME}</strong>{" "}*/}
                <strong style={{ color: "#0334c7" }}>{DIGITAL_NAME}</strong>{" "}
                <strong style={{ color: "#fe2202" }}>{SOLUTIONS_NAME}</strong>{" "}
                for supporting practical digital innovation and
                community-focused technology.
              </p>

              <div className="company-credit-highlight">
                <Building2 size={18} strokeWidth={2.4} />
                <span>
                  Built with care, community spirit, and a commitment to making
                  tournament information easier to access.
                </span>
              </div>
            </div>

            <button
              type="button"
              className="company-credit-primary"
              onClick={() => setOpen(false)}
            >
              Continue to app
            </button>
          </section>
        </div>
      )}
    </>
  );
}

export default CompanyCredit;
