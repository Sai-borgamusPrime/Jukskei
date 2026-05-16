import { useEffect, useMemo, useState } from "react";
import "./PWAInstallPrompt.css";

function isStandaloneMode() {
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );
}

function getDeviceInstructions() {
  const userAgent = window.navigator.userAgent.toLowerCase();

  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isMac = /macintosh/.test(userAgent);

  if (isIOS) {
    return {
      title: "Add Jukskei to Your Home Screen?",
      copy: "Add this app to your home screen for quick and easy access when you're on the go. Here's how:",
      steps: [
        {
          text: "Tap the Share icon in Safari, or the",
          showMenuIcon: true,
          afterIcon: "menu icon if you are using Chrome.",
        },
        {
          text: "Select Add to Home Screen.",
        },
        {
          text: "Tap Add in the top-right corner to finish.",
        },
      ],
      note: "On iPhone, the option may appear under Safari's Share menu or your browser's More Options menu.",
    };
  }

  if (isAndroid) {
    return {
      title: "Add Jukskei to Your Home Screen?",
      copy: "Add this app to your home screen for quick and easy access when you're on the go. Here's how:",
      steps: [
        {
          text: "Tap the",
          showMenuIcon: true,
          afterIcon: "menu icon More Options.",
        },
        {
          text: "Select Add to Home Screen or Install app.",
        },
        {
          text: "Confirm by tapping Add or Install.",
        },
      ],
      note: "The wording may differ slightly depending on your Android browser.",
    };
  }

  if (isMac) {
    return {
      title: "Add Jukskei to Your Mac?",
      copy: "Add this app for quick access from your Dock or Applications. Here's how:",
      steps: [
        {
          text: "Open the browser",
          showMenuIcon: true,
          afterIcon: "menu.",
        },
        {
          text: "Select Add to Dock or Install Jukskei if available.",
        },
        {
          text: "Open it from your Dock or Applications.",
        },
      ],
      note: "Availability depends on the browser and whether the app is opened from a supported browser.",
    };
  }

  return {
    title: "Add Jukskei to Your Device?",
    copy: "Add this app for quick access from your desktop, Start menu, Dock, or apps list. Here's how:",
    steps: [
      {
        text: "Open your browser",
        showMenuIcon: true,
        afterIcon: "menu.",
      },
      {
        text: "Look for Install app, Add to Home Screen, or Add to Dock.",
      },
      {
        text: "Follow the browser prompt to finish.",
      },
    ],
    note: "Some browsers do not support installing web apps. Try Chrome, Edge, or Safari.",
  };
}

function StepText({ step }) {
  return (
    <span className="pwa-install-step-text">
      {step.text}

      {step.showMenuIcon && (
        <>
          {" "}
          <span
            className="pwa-install-menu-icon"
            aria-label="More Options menu icon"
            title="More Options"
          >
            ⋮
          </span>{" "}
        </>
      )}

      {step.afterIcon}
    </span>
  );
}

function PWAInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const instructions = useMemo(() => getDeviceInstructions(), []);

  useEffect(() => {
    if (isStandaloneMode()) {
      setVisible(false);
      return;
    }

    setVisible(true);

    const handleAppInstalled = () => {
      setVisible(false);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible || isStandaloneMode()) {
    return null;
  }

  return (
    <div className="pwa-install-overlay" role="dialog" aria-modal="true">
      <section className="pwa-install-modal">
        <button
          type="button"
          className="pwa-install-close"
          onClick={handleClose}
          aria-label="Close install prompt"
        >
          ×
        </button>

        <div className="pwa-install-logo-wrap">
          <img
            src="/logo.webp"
            alt="Jukskei Tournament Logo"
            className="pwa-install-logo"
          />
        </div>

        <h2 className="pwa-install-title">{instructions.title}</h2>

        <p className="pwa-install-copy">{instructions.copy}</p>

        <ol className="pwa-install-steps">
          {instructions.steps.map((step, index) => (
            <li className="pwa-install-step" key={`${index}-${step.text}`}>
              <span className="pwa-install-step-number">{index + 1}.</span>
              <StepText step={step} />
            </li>
          ))}
        </ol>

        <p className="pwa-install-note">{instructions.note}</p>
      </section>
    </div>
  );
}

export default PWAInstallPrompt;
