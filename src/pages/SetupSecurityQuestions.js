import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import { useSelector } from "react-redux";
import api from "../api/axios";
import { SECURITY_QUESTIONS } from "../constants/securityQuestions";
import "./auth.css";
import "./reset.css";

export default function SetupSecurityQuestions() {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const [selected, setSelected] = useState([
    { questionIndex: 0, answer: "" },
    { questionIndex: 1, answer: "" },
  ]);
  const [showAnswers, setShowAnswers] = useState([false, false]);
  const [currentSetup, setCurrentSetup] = useState(null); // existing configured questions
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
  }, [user, navigate]);

  // Load current status
  useEffect(() => {
    api.get("/api/auth/security-questions-status")
      .then(({ data }) => {
        setCurrentSetup(data);
        if (data.hasQuestions && data.configured?.length >= 2) {
          setSelected([
            { questionIndex: data.configured[0].index, answer: "" },
            { questionIndex: data.configured[1].index, answer: "" },
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingStatus(false));
  }, []);

  const usedIndices = (excludeSlot) =>
    selected.filter((_, i) => i !== excludeSlot).map((s) => s.questionIndex);

  const updateQuestion = (slot, questionIndex) => {
    setSelected((prev) => prev.map((s, i) => i === slot ? { ...s, questionIndex: Number(questionIndex) } : s));
    setError("");
  };

  const updateAnswer = (slot, answer) => {
    setSelected((prev) => prev.map((s, i) => i === slot ? { ...s, answer } : s));
    setError("");
  };

  const toggleShow = (slot) =>
    setShowAnswers((prev) => prev.map((v, i) => i === slot ? !v : v));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selected[0].questionIndex === selected[1].questionIndex) {
      setError("Please choose two different questions.");
      return;
    }
    if (selected.some((s) => s.answer.trim().length < 2)) {
      setError("Each answer must be at least 2 characters.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await api.post("/api/auth/setup-security-questions", {
        questions: selected.map((s) => ({
          questionIndex: s.questionIndex,
          answer: s.answer.trim(),
        })),
      });
      setSuccess("Security questions saved! You can now use them to reset your password.");
      setSelected((prev) => prev.map((s) => ({ ...s, answer: "" })));
      setCurrentSetup({ hasQuestions: true, configured: selected.map((s) => ({ index: s.questionIndex, question: SECURITY_QUESTIONS[s.questionIndex] })) });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SEOHead
        title={`Security Questions · ${SEO_CONFIG.SITE_NAME}`}
        description="Set up security questions for account recovery."
        noindex={true}
      />
      <div className="auth-page">
        <div className="auth-brand-panel" aria-hidden="true">
          <div className="auth-brand-content">
            <img src="/ICS_Logo.jpeg" alt="Infinity Craft Space" className="auth-brand-logo" />
            <h2 className="auth-brand-title">Infinity Craft Space</h2>
            <p className="auth-brand-subtitle">Premium craft supplies for creative minds</p>
            <ul className="auth-brand-perks">
              <li><span className="perk-icon">🔒</span> Answers hashed — never readable</li>
              <li><span className="perk-icon">🛡️</span> Required for password recovery</li>
              <li><span className="perk-icon">⚠️</span> Use memorable but non-obvious answers</li>
            </ul>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-card-header">
              <h1 className="auth-title">Security Questions</h1>
              <p className="auth-subtitle">
                {currentSetup?.hasQuestions
                  ? "Update your security questions and answers below."
                  : "Set up 2 security questions to enable password recovery without email or SMS."}
              </p>
            </div>

            {currentSetup?.hasQuestions && !success && (
              <div className="auth-alert auth-alert--success" role="status" style={{ marginBottom: "1rem" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.78 5.78l-4.5 4.5a.75.75 0 01-1.06 0l-2-2a.75.75 0 111.06-1.06L6.75 9.69l3.97-3.97a.75.75 0 111.06 1.06z" fill="currentColor"/>
                </svg>
                Security questions are configured. You can update them below (re-enter answers to confirm).
              </div>
            )}

            {success && (
              <div className="auth-alert auth-alert--success" role="status">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.78 5.78l-4.5 4.5a.75.75 0 01-1.06 0l-2-2a.75.75 0 111.06-1.06L6.75 9.69l3.97-3.97a.75.75 0 111.06 1.06z" fill="currentColor"/>
                </svg>
                {success}
              </div>
            )}

            {error && (
              <div className="auth-alert auth-alert--error" role="alert">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a1 1 0 110-2 1 1 0 010 2z" fill="currentColor"/>
                </svg>
                {error}
              </div>
            )}

            <div className="reset-info-note">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              Choose answers only you know. Avoid answers easily guessable from your social media. Answers are case-insensitive and trimmed.
            </div>

            {loadingStatus ? (
              <div style={{ textAlign: "center", padding: "2rem 0", color: "#94a3b8" }}>
                <span className="auth-spinner" aria-hidden="true" style={{ width: 28, height: 28, borderWidth: 3 }} />
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {selected.map((slot, idx) => (
                  <div key={idx} className="reset-question-block">
                    <p className="reset-question-label">Question {idx + 1}</p>

                    <div className="auth-field" style={{ marginBottom: "0.75rem" }}>
                      <select
                        className="auth-input"
                        value={slot.questionIndex}
                        onChange={(e) => updateQuestion(idx, e.target.value)}
                        style={{ cursor: "pointer" }}
                      >
                        {SECURITY_QUESTIONS.map((q, qi) => (
                          <option
                            key={qi}
                            value={qi}
                            disabled={usedIndices(idx).includes(qi)}
                          >
                            {q}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="auth-input-wrapper">
                      <input
                        type={showAnswers[idx] ? "text" : "password"}
                        className="auth-input auth-input--with-icon"
                        value={slot.answer}
                        onChange={(e) => updateAnswer(idx, e.target.value)}
                        placeholder={currentSetup?.hasQuestions ? "Re-enter your answer to update" : "Your answer"}
                        autoComplete="off"
                        required
                      />
                      <button
                        type="button"
                        className="auth-eye-btn"
                        onClick={() => toggleShow(idx)}
                        aria-label={showAnswers[idx] ? "Hide answer" : "Show answer"}
                        tabIndex={-1}
                      >
                        {showAnswers[idx] ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="submit"
                  className="auth-btn auth-btn--primary"
                  disabled={saving || selected.some((s) => s.answer.trim().length < 2)}
                >
                  {saving ? (
                    <><span className="auth-spinner" aria-hidden="true" /> Saving…</>
                  ) : currentSetup?.hasQuestions ? (
                    "Update Security Questions"
                  ) : (
                    "Save Security Questions"
                  )}
                </button>
              </form>
            )}

            <div className="auth-footer-link" style={{ marginTop: "1.25rem", textAlign: "center" }}>
              <button type="button" onClick={() => navigate(-1)}>← Back to Account</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
