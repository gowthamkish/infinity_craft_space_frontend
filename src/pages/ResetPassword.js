import { useState, useEffect } from "react";
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
                ) : i + 1}
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

// ── Password strength analyser ──────────────────────────────────────────────
function analysePassword(pw) {
  const reqs = [
    { label: "At least 8 characters",           met: pw.length >= 8 },
    { label: "One uppercase letter (A–Z)",       met: /[A-Z]/.test(pw) },
    { label: "One lowercase letter (a–z)",       met: /[a-z]/.test(pw) },
    { label: "One number (0–9)",                 met: /[0-9]/.test(pw) },
    { label: "One special character (!@#$…)",   met: /[^A-Za-z0-9]/.test(pw) },
  ];
  const score = reqs.filter((r) => r.met).length;
  const level =
    score <= 1 ? "weak"
    : score <= 2 ? "fair"
    : score <= 3 ? "good"
    : "strong";
  return { reqs, score, level };
}

function PasswordStrength({ password }) {
  if (!password) return null;
  const { reqs, score, level } = analysePassword(password);
  const labels = { weak: "Weak", fair: "Fair", good: "Good", strong: "Strong" };
  return (
    <div className="pw-strength">
      <div className="pw-strength-bars">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`pw-strength-bar ${i < score ? `pw-strength-bar--${level}` : ""}`}
          />
        ))}
      </div>
      <span className={`pw-strength-label pw-strength-label--${level}`}>
        Password strength: {labels[level]}
      </span>
      <ul className="pw-requirements">
        {reqs.map((r) => (
          <li key={r.label} className={`pw-req ${r.met ? "pw-req--met" : ""}`}>
            <span className="pw-req-dot" />
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const rtoken = sessionStorage.getItem("reset_rtoken") || "";

  useEffect(() => {
    if (!rtoken) navigate("/forgot-password");
  }, [rtoken, navigate]);

  const { score } = analysePassword(newPassword);
  const isStrong = score >= 5;
  const mismatch = confirmPassword && newPassword !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isStrong) { setError("Please choose a stronger password."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", {
        resetToken: rtoken,
        newPassword,
      });
      sessionStorage.removeItem("reset_rtoken");
      setDone(true);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          (err.response?.status === 429
            ? "Too many attempts. Please try again later."
            : "Password reset failed. Your link may have expired — please start over.")
      );
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <>
        <SEOHead title={`Password Reset · ${SEO_CONFIG.SITE_NAME}`} noindex={true} />
        <div className="auth-page">
          <div className="auth-brand-panel" aria-hidden="true">
            <div className="auth-brand-content">
              <img src="/ICS_Logo.jpeg" alt="Infinity Craft Space" className="auth-brand-logo" />
              <h2 className="auth-brand-title">Infinity Craft Space</h2>
              <p className="auth-brand-subtitle">Premium craft supplies for creative minds</p>
            </div>
          </div>
          <div className="auth-form-panel">
            <div className="auth-card">
              <StepBar current={3} />
              <div className="reset-success">
                <div className="reset-success-icon">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h1 className="auth-title">Password Reset!</h1>
                <p className="auth-subtitle" style={{ marginBottom: "1.5rem" }}>
                  Your password has been updated. All existing sessions have been signed out for security.
                </p>
                <button
                  className="auth-btn auth-btn--primary"
                  onClick={() => navigate("/login")}
                >
                  Sign In with New Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={`Reset Password · ${SEO_CONFIG.SITE_NAME}`}
        description="Create a new secure password for your account."
        noindex={true}
      />
      <div className="auth-page">
        <div className="auth-brand-panel" aria-hidden="true">
          <div className="auth-brand-content">
            <img src="/ICS_Logo.jpeg" alt="Infinity Craft Space" className="auth-brand-logo" />
            <h2 className="auth-brand-title">Infinity Craft Space</h2>
            <p className="auth-brand-subtitle">Premium craft supplies for creative minds</p>
            <ul className="auth-brand-perks">
              <li><span className="perk-icon">🔒</span> Hashed with bcrypt-12</li>
              <li><span className="perk-icon">🔄</span> All sessions invalidated on reset</li>
              <li><span className="perk-icon">🛡️</span> Previous password blocked</li>
            </ul>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-card">
            <StepBar current={2} />

            <div className="auth-card-header">
              <h1 className="auth-title">Create New Password</h1>
              <p className="auth-subtitle">
                Choose a strong password. Signing in from other devices will be required.
              </p>
            </div>

            {error && (
              <div className="auth-alert auth-alert--error" role="alert">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a1 1 0 110-2 1 1 0 010 2z" fill="currentColor" />
                </svg>
                {error}
                {error.includes("start over") && (
                  <button
                    className="auth-alert-close"
                    onClick={() => navigate("/forgot-password")}
                    style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "inherit", textDecoration: "underline" }}
                  >
                    Start Over
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* New password */}
              <div className="auth-field">
                <label htmlFor="new-password" className="auth-label">New password</label>
                <div className="auth-input-wrapper">
                  <input
                    id="new-password"
                    type={showNew ? "text" : "password"}
                    className={`auth-input auth-input--with-icon ${newPassword && !isStrong ? "auth-input--error" : ""} ${isStrong ? "auth-input--valid" : ""}`}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowNew((s) => !s)} aria-label={showNew ? "Hide" : "Show"} tabIndex={-1}>
                    {showNew ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                <PasswordStrength password={newPassword} />
              </div>

              {/* Confirm password */}
              <div className="auth-field">
                <label htmlFor="confirm-password" className="auth-label">Confirm new password</label>
                <div className="auth-input-wrapper">
                  <input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    className={`auth-input auth-input--with-icon ${mismatch ? "auth-input--error" : ""} ${confirmPassword && !mismatch ? "auth-input--valid" : ""}`}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm((s) => !s)} aria-label={showConfirm ? "Hide" : "Show"} tabIndex={-1}>
                    {showConfirm ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                {mismatch && (
                  <p className="auth-field-error" role="alert">Passwords do not match.</p>
                )}
              </div>

              <button
                type="submit"
                className="auth-btn auth-btn--primary"
                disabled={loading || !isStrong || !confirmPassword || mismatch}
              >
                {loading ? (
                  <><span className="auth-spinner" aria-hidden="true" /> Resetting…</>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>

            <div className="auth-footer-link" style={{ marginTop: "1.25rem", textAlign: "center" }}>
              <button type="button" onClick={() => navigate("/forgot-password")}>
                ← Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
