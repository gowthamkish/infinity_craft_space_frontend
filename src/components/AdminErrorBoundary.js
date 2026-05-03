import { Component } from "react";

export default class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[AdminErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "3rem", textAlign: "center" }}>
          <h3 style={{ color: "#dc2626", marginBottom: "0.5rem" }}>Admin panel error</h3>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
            {this.state.error?.message || "Something went wrong rendering this page."}
          </p>
          <button
            style={{ padding: "0.5rem 1.25rem", borderRadius: 8, background: "#1d4ed8", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
