import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

function ErrorScreen({ error }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2rem",
        background: "#0f172a",
        color: "#ffffff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>App crashed</h1>
      <p style={{ color: "#cbd5e1" }}>
        This is the real error causing the blank screen:
      </p>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          background: "rgba(255,255,255,0.08)",
          padding: "1rem",
          borderRadius: "12px",
          color: "#fecaca",
        }}
      >
        {error?.message || String(error)}
      </pre>
    </main>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return <ErrorScreen error={this.state.error} />;
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
