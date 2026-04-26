import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import api from "../api/axios";
import "./auth.css";
import "./reset.css";

const STEPS = ["Identify", "Verify", "Reset"];

function StepBar({ current }) {
  return (
    <div className="reset-steps" aria-label="Progress">
      {STEPS.map((label, i) => {
        const state = i < current ? "done" : i === current ? "active" : "";
        return (
          <div key={label} style={{ display: "flex", alignItems: "center" }}>
            <div className="reset-step">
              <div className={`reset-step-circle reset-step-circle--${state || "idle"}`}>
                {i < current ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`reset-step-label reset-step-label--${state || "idle"}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`reset-step-connector ${i < current ? "reset-step-connector--done" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) { setError("Please enter your email or username."); return; }
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/forgot-password", {
        identifier: identifier.trim(),
      });
      // Always navigate — the generic response never reveals account existence.
      // Store verificationToken in sessionStorage (not URL — avoids browser history exposure).
      sessionStorage.setItem("reset_vtoken", data.verificationToken || "");
      navigate("/verify-security");
    } catch (err) {
      // Even on network/rate-limit errors, show a neutral message.
      setError(
        err.response?.status === 429
          ? "Too many attempts. Please try again in 15 minutes."
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title={`Forgot Password · ${SEO_CONFIG.SITE_NAME}`}
        description="Reset your InfinityCraftSpace account password."
        noindex={true}
      />
      <div className="auth-page">
        {/* Brand panel */}
        <div className="auth-brand-panel" aria-hidden="true">
          <div className="auth-brand-content">
            <img src="/ICS_Logo.jpeg" alt="Infinity Craft Space" className="auth-brand-logo" />
            <h2 className="auth-brand-title">Infinity Craft Space</h2>
            <p className="auth-brand-subtitle">Premium craft supplies for creative minds</p>
            <ul className="auth-brand-perks">
              <li><span className="perk-icon">🔒</span> Secure account recovery</li>
              <li><span className="perk-icon">🛡️</span> No email required</li>
              <li><span className="perk-icon">⏱️</span> Done in 3 simple steps</li>
            </ul>
          </div>
        </div>

        {/* Form panel */}
        <div className="auth-form-panel">
          <div className="auth-card">
            <StepBar current={0} />

            <div className="auth-card-header">
              <h1 className="auth-title">Forgot Password?</h1>
              <p className="auth-subtitle">
                Enter your registered email or username to begin recovery.
              </p>
            </div>

            <div className="reset-info-note">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              You'll answer the security questions you set up to verify your identity — no email or SMS needed.
            </div>

            {error && (
              <div className="auth-alert auth-alert--error" role="alert">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a1 1 0 110-2 1 1 0 010 2z" fill="currentColor" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="identifier" className="auth-label">
                  Email address or username
                </label>
                <input
                  id="identifier"
                  type="text"
                  className="auth-input"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setError(""); }}
                  placeholder="you@example.com or your username"
                  autoComplete="username email"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="auth-btn auth-btn--primary"
                disabled={loading || !identifier.trim()}
              >
                {loading ? (
                  <><span className="auth-spinner" aria-hidden="true" /> Checking…</>
                ) : (
                  "Continue to Verification →"
                )}
              </button>
            </form>

            <div className="auth-footer-link" style={{ marginTop: "1.25rem", textAlign: "center" }}>
              <button type="button" onClick={() => navigate("/login")}>
                ← Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
