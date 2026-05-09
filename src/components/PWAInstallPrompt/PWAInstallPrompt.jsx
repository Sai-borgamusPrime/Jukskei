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
  const isMac = /macintosh/.test(userAgent);
  const isAndroid = /android/.test(userAgent);

  if (isIOS) {
    return {
      type: "ios",
      title: "Install Jukskei on your iPhone",
      steps: [
        "Tap the Share icon in your browser.",
        "Choose Add to Home Screen.",
        "Tap Add to finish installing the app.",
      ],
    };
  }

  if (isMac) {
    return {
      type: "manual",
      title: "Install Jukskei on your Mac",
      steps: [
        "Open the browser menu.",
        "Choose Add to Dock or Install Jukskei if available.",
        "Launch it from your Dock or Applications.",
      ],
    };
  }

  if (isAndroid) {
    return {
      type: "manual",
      title: "Install Jukskei on your phone",
      steps: [
        "Tap Install below if your browser supports it.",
        "If no prompt appears, open the browser menu.",
        "Choose Add to Home Screen or Install app.",
      ],
    };
  }

  return {
    type: "desktop",
    title: "Install Jukskei on this device",
    steps: [
      "Click Install below if prompted.",
      "After installation, open it from your desktop, Start menu, Dock, or apps list.",
      "Pin it manually to the taskbar if your operating system allows it.",
    ],
  };
}

function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [installStatus, setInstallStatus] = useState("idle");

  const instructions = useMemo(() => getDeviceInstructions(), []);

  useEffect(() => {
    if (isStandaloneMode()) {
      setVisible(false);
      return;
    }

    setVisible(true);

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setInstallStatus("installed");
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setInstallStatus("manual");
      return;
    }

    try {
      setInstallStatus("prompting");

      deferredPrompt.prompt();

      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setInstallStatus("installed");
        setVisible(false);
      } else {
        setInstallStatus("dismissed");
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error("Install prompt failed:", error);
      setInstallStatus("manual");
    }
  };

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

        <div className="pwa-install-brand">
          <img src="/logo.webp" alt="Jukskei Tournament Logo" />
          <div>
            <p>Install App</p>
            <h2>{instructions.title}</h2>
          </div>
        </div>

        <p className="pwa-install-copy">
          Install the Jukskei Tournament app for faster access, a full-screen
          app experience, and easier launching from your phone or computer.
        </p>

        <div className="pwa-install-steps">
          {instructions.steps.map((step, index) => (
            <div className="pwa-install-step" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>

        {installStatus === "manual" && (
          <p className="pwa-install-note">
            Your browser does not allow this app to open the install prompt
            automatically. Use your browser menu to add it manually.
          </p>
        )}

        {installStatus === "dismissed" && (
          <p className="pwa-install-note">
            Installation was cancelled. You can still install it later from your
            browser menu.
          </p>
        )}

        <div className="pwa-install-actions">
          <button
            type="button"
            className="pwa-install-primary"
            onClick={handleInstall}
            disabled={installStatus === "prompting"}
          >
            {installStatus === "prompting"
              ? "Opening install prompt..."
              : "Install App"}
          </button>

          <button
            type="button"
            className="pwa-install-secondary"
            onClick={handleClose}
          >
            Not now
          </button>
        </div>
      </section>
    </div>
  );
}

export default PWAInstallPrompt;
