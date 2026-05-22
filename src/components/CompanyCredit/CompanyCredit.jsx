import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Building2, HeartHandshake, X } from "lucide-react";
import "./CompanyCredit.css";

const COMPANY_NAME = "Schoemans Digital Solutions";
const COMPANY_LOGO = "/schoemans-logo.webp";

function CompanyCredit() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

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
        aria-label={`View app credit for ${COMPANY_NAME}`}
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
                  src={COMPANY_LOGO}
                  alt={`${COMPANY_NAME} logo`}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/logo.webp";
                  }}
                />
              </div>

              <div>
                <p>Professional acknowledgement</p>
                <h2 id="company-credit-title">
                  Proudly powered by Schoemans Digital Solutions
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
                A special thank you goes to <strong>{COMPANY_NAME}</strong> for
                supporting practical digital innovation and community-focused
                technology.
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
