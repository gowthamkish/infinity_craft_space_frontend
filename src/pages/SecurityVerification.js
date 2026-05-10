import { useState, useEffect, useCallback, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContext } from "../context/ToastContext";
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

// Countdown timer for the 10-minute verification window
function useCountdown(seconds) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);
  return remaining;
}

export default function SecurityVerification() {
  const navigate = useNavigate();
  const { addError } = useContext(ToastContext);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(["", ""]);
  const [showAnswers, setShowAnswers] = useState([false, false]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const timeLeft = useCountdown(10 * 60); // 10 min verification window

  const vtoken = sessionStorage.getItem("reset_vtoken") || "";
  const verifiedRef = useRef(false);

  // Redirect to step 1 if no token
  useEffect(() => {
    if (!vtoken && !verifiedRef.current) { navigate("/forgot-password"); return; }

    api.get(`/api/auth/security-questions/${encodeURIComponent(vtoken)}`)
      .then(({ data }) => {
        setQuestions(data.questions || []);
        setAnswers(new Array(data.questions?.length || 2).fill(""));
      })
      .catch(() => setError("Could not load security questions. Please start over."))
      .finally(() => setLoading(false));
  }, [vtoken, navigate]);

  const toggleShowAnswer = useCallback((idx) => {
    setShowAnswers((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (answers.some((a) => !a.trim())) {
      setError("Please answer all security questions.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/api/auth/verify-answers", {
        verificationToken: vtoken,
        answers: answers.map((a) => a.trim()),
      });
      verifiedRef.current = true;
      sessionStorage.setItem("reset_rtoken", data.resetToken || "");
      sessionStorage.removeItem("reset_vtoken");
      navigate("/reset-password");
    } catch (err) {
      const msg = err.response?.data?.error ||
        (err.response?.status === 429
          ? "Too many attempts. Please restart the process."
          : "Verification failed. Please try again.");
      setError(msg);
      addError(msg, "Verification Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const isUrgent = timeLeft < 120;

  if (timeLeft <= 0) {
    return (
      <div className="auth-page">
        <div className="auth-form-panel" style={{ width: "100%" }}>
          <div className="auth-card" style={{ textAlign: "center" }}>
            <p className="auth-title" style={{ color: "#ef4444" }}>Session Expired</p>
            <p className="auth-subtitle" style={{ marginBottom: "1.5rem" }}>
              Your verification window expired. Please start over.
            </p>
            <button className="auth-btn auth-btn--primary" onClick={() => {
              sessionStorage.removeItem("reset_vtoken");
              navigate("/forgot-password");
            }}>
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`Verify Identity · ${SEO_CONFIG.SITE_NAME}`}
        description="Answer your security questions to reset your password."
        noindex={true}
      />
      <div className="auth-page">
        <div className="auth-brand-panel" aria-hidden="true">
          <div className="auth-brand-content">
            <img src="/ICS_Logo.jpeg" alt="Infinity Craft Space" className="auth-brand-logo" />
            <h2 className="auth-brand-title">Infinity Craft Space</h2>
            <p className="auth-brand-subtitle">Premium craft supplies for creative minds</p>
            <ul className="auth-brand-perks">
              <li><span className="perk-icon">🔒</span> Secure account recovery</li>
              <li><span className="perk-icon">🛡️</span> Answers are never stored in plain text</li>
              <li><span className="perk-icon">⏱️</span> 3 attempts allowed</li>
            </ul>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-card">
            <StepBar current={1} />

            <div className="auth-card-header">
              <h1 className="auth-title">Verify Your Identity</h1>
              <p className="auth-subtitle">
                Answer the security questions you set up when configuring your account.
              </p>
            </div>

            <div className={`reset-expiry-badge ${isUrgent ? "reset-expiry-badge--urgent" : ""}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              Session expires in {mins}:{secs}
            </div>

            {error && (
              <div className="auth-alert auth-alert--error" role="alert">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a1 1 0 110-2 1 1 0 010 2z" fill="currentColor" />
                </svg>
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem 0", color: "#94a3b8" }}>
                <span className="auth-spinner" aria-hidden="true" style={{ width: 28, height: 28, borderWidth: 3 }} />
                <p style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}>Loading questions…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {questions.map((q, idx) => (
                  <div key={q.index} className="reset-question-block">
                    <p className="reset-question-label">Question {idx + 1}</p>
                    <p className="reset-question-text">{q.question}</p>
                    <div className="auth-input-wrapper">
                      <input
                        type={showAnswers[idx] ? "text" : "password"}
                        className="auth-input auth-input--with-icon"
                        value={answers[idx] || ""}
                        onChange={(e) => {
                          const next = [...answers];
                          next[idx] = e.target.value;
                          setAnswers(next);
                          setError("");
                        }}
                        placeholder="Your answer"
                        autoComplete="off"
                        required
                      />
                      <button
                        type="button"
                        className="auth-eye-btn"
                        onClick={() => toggleShowAnswer(idx)}
                        aria-label={showAnswers[idx] ? "Hide answer" : "Show answer"}
                        tabIndex={-1}
                      >
                        {showAnswers[idx] ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "1rem" }}>
                  Answers are case-insensitive. Extra spaces are ignored.
                </p>

                <button
                  type="submit"
                  className="auth-btn auth-btn--primary"
                  disabled={submitting || answers.some((a) => !a.trim())}
                >
                  {submitting ? (
                    <><span className="auth-spinner" aria-hidden="true" /> Verifying…</>
                  ) : (
                    "Verify & Continue →"
                  )}
                </button>
              </form>
            )}

            <div className="auth-footer-link" style={{ marginTop: "1.25rem", textAlign: "center" }}>
              <button type="button" onClick={() => {
                sessionStorage.removeItem("reset_vtoken");
                navigate("/forgot-password");
              }}>
                ← Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
