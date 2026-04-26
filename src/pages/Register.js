import { useDispatch } from "react-redux";
import { register } from "../features/authSlice";
import { validateRegister } from "../utils/validation";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import { SECURITY_QUESTIONS } from "../constants/securityQuestions";
import "./auth.css";

// Password strength helpers
const PW_RULES = [
  { key: "length", label: "8+ characters", test: (p) => p.length >= 8 },
  { key: "upper", label: "Uppercase", test: (p) => /[A-Z]/.test(p) },
  { key: "lower", label: "Lowercase", test: (p) => /[a-z]/.test(p) },
  { key: "number", label: "Number", test: (p) => /\d/.test(p) },
  { key: "special", label: "Special char", test: (p) => /[@$!%*?&]/.test(p) },
];

function getStrength(password) {
  if (!password) return null;
  const met = PW_RULES.filter((r) => r.test(password)).length;
  if (met <= 1) return { level: "weak", label: "Weak" };
  if (met === 2) return { level: "fair", label: "Fair" };
  if (met === 3) return { level: "good", label: "Good" };
  return { level: "strong", label: "Strong" };
}

export default function Register() {
  const [step, setStep] = useState(1);

  // Step 1 state
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Step 2 state — 2 security question slots
  const [sq, setSq] = useState([
    { questionIndex: "", answer: "" },
    { questionIndex: "", answer: "" },
  ]);
  const [sqErrors, setSqErrors] = useState(["", ""]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const strength = getStrength(form.password);

  const clearFieldError = (field) =>
    setValidationErrors((prev) => ({ ...prev, [field]: "" }));

  // ── Step 1 → Step 2 ─────────────────────────────────────────────
  const handleNextStep = (e) => {
    e.preventDefault();
    setTouched({ username: true, email: true, password: true });
    setError("");
    const errors = validateRegister(form);
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setStep(2);
  };

  // ── Validate security questions ─────────────────────────────────
  const validateSQ = () => {
    const errs = sq.map((q, i) => {
      if (q.questionIndex === "") return "Please select a question.";
      if (!q.answer || q.answer.trim().length < 2) return "Answer must be at least 2 characters.";
      return "";
    });
    // Duplicate question check
    if (sq[0].questionIndex !== "" && sq[0].questionIndex === sq[1].questionIndex) {
      errs[1] = "Please choose a different question.";
    }
    setSqErrors(errs);
    return errs.every((e) => e === "");
  };

  // ── Final submit ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateSQ()) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        securityQuestions: sq.map((q) => ({
          questionIndex: Number(q.questionIndex),
          answer: q.answer,
        })),
      };
      await dispatch(register(payload)).unwrap();
      localStorage.setItem(
        "registrationSuccess",
        "Account created! Please sign in with your new credentials.",
      );
      navigate("/login");
    } catch (err) {
      setLoading(false);
      if (typeof err === "string") {
        setError(err);
      } else if (err?.errors && Array.isArray(err.errors)) {
        const fieldErrors = {};
        err.errors.forEach((e) => { fieldErrors[e.field] = e.message; });
        setValidationErrors(fieldErrors);
        setError("Please fix the errors below.");
        setStep(1);
      } else {
        setError(err?.error || "Registration failed. Please try again.");
      }
    }
  };

  const usedIndices = sq.map((q) => String(q.questionIndex)).filter((v) => v !== "");

  return (
    <>
      <SEOHead
        title={`Create account · ${SEO_CONFIG.SITE_NAME}`}
        description="Join Infinity Craft Space to access premium craft supplies and more."
        noindex={true}
        canonical={`${SEO_CONFIG.SITE_URL}/register`}
      />

      <div className="auth-page">
        {/* Left panel */}
        <div className="auth-brand-panel" aria-hidden="true">
          <div className="auth-brand-content">
            <img src="/ICS_Logo.jpeg" alt="Infinity Craft Space" className="auth-brand-logo" />
            <h2 className="auth-brand-title">Join our creative community</h2>
            <p className="auth-brand-subtitle">
              Get access to thousands of premium craft products and exclusive member perks.
            </p>
            <ul className="auth-brand-perks">
              <li><span className="perk-icon">🎁</span> Exclusive member offers</li>
              <li><span className="perk-icon">📦</span> Order tracking &amp; history</li>
              <li><span className="perk-icon">❤️</span> Save to wishlist</li>
              <li><span className="perk-icon">⭐</span> Leave product reviews</li>
            </ul>
          </div>
        </div>

        {/* Right panel */}
        <div className="auth-form-panel">
          <div className="auth-card">
            {/* Step indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {[1, 2].map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "0.8rem", fontWeight: 700,
                    background: step >= s ? "linear-gradient(135deg,#10b981,#059669)" : "#e5e7eb",
                    color: step >= s ? "white" : "#9ca3af",
                    transition: "all 0.2s",
                  }}>
                    {step > s ? "✓" : s}
                  </div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: step >= s ? "#065f46" : "#9ca3af" }}>
                    {s === 1 ? "Account info" : "Security questions"}
                  </span>
                  {s < 2 && <div style={{ width: 32, height: 2, background: step > s ? "#10b981" : "#e5e7eb", borderRadius: 2 }} />}
                </div>
              ))}
            </div>

            <div className="auth-card-header">
              <h1 className="auth-title">
                {step === 1 ? "Create your account" : "Set up account recovery"}
              </h1>
              <p className="auth-subtitle">
                {step === 1
                  ? "Join Infinity Craft Space — it's free"
                  : "Choose 2 security questions to recover your password if you ever forget it."}
              </p>
            </div>

            {error && (
              <div className="auth-alert auth-alert--error" role="alert">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a1 1 0 110-2 1 1 0 010 2z" fill="currentColor" />
                </svg>
                {error}
              </div>
            )}

            {/* ── Step 1: account info ─────────────────────── */}
            {step === 1 && (
              <form onSubmit={handleNextStep} noValidate>
                <div className="auth-field">
                  <label htmlFor="reg-username" className="auth-label">Full name</label>
                  <input
                    id="reg-username"
                    type="text"
                    className={`auth-input ${touched.username && validationErrors.username ? "auth-input--error" : ""} ${touched.username && !validationErrors.username && form.username ? "auth-input--valid" : ""}`}
                    value={form.username}
                    onChange={(e) => { setForm({ ...form, username: e.target.value }); clearFieldError("username"); }}
                    onBlur={() => setTouched((p) => ({ ...p, username: true }))}
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                  />
                  {touched.username && validationErrors.username && (
                    <p className="auth-field-error" role="alert">{validationErrors.username}</p>
                  )}
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-email" className="auth-label">Email address</label>
                  <input
                    id="reg-email"
                    type="email"
                    className={`auth-input ${touched.email && validationErrors.email ? "auth-input--error" : ""} ${touched.email && !validationErrors.email && form.email ? "auth-input--valid" : ""}`}
                    value={form.email}
                    onChange={(e) => { setForm({ ...form, email: e.target.value }); clearFieldError("email"); }}
                    onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                  {touched.email && validationErrors.email && (
                    <p className="auth-field-error" role="alert">{validationErrors.email}</p>
                  )}
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-password" className="auth-label">Password</label>
                  <div className="auth-input-wrapper">
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      className={`auth-input auth-input--with-icon ${touched.password && validationErrors.password ? "auth-input--error" : ""} ${touched.password && !validationErrors.password && form.password ? "auth-input--valid" : ""}`}
                      value={form.password}
                      onChange={(e) => { setForm({ ...form, password: e.target.value }); clearFieldError("password"); }}
                      onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {form.password && strength && (
                    <div className={`pw-strength pw-strength--${strength.level}`}>
                      <div className="pw-strength-bar">
                        <div className="pw-strength-fill" />
                      </div>
                      <span className="pw-strength-label">Password strength: {strength.label}</span>
                    </div>
                  )}

                  {(form.password || (touched.password && validationErrors.password)) && (
                    <div className="pw-requirements" aria-label="Password requirements">
                      {PW_RULES.map((rule) => {
                        const met = rule.test(form.password);
                        return (
                          <div key={rule.key} className={`pw-req${met ? " pw-req--met" : ""}`}>
                            <span className="pw-req-icon" aria-hidden="true">{met ? "✓" : ""}</span>
                            {rule.label}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {touched.password && validationErrors.password && (
                    <p className="auth-field-error" role="alert">{validationErrors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="auth-btn auth-btn--success"
                  disabled={!form.username || !form.email || !form.password}
                >
                  Continue →
                </button>

                <div className="auth-divider"><span>or</span></div>

                <button type="button" className="auth-btn auth-btn--outline" onClick={() => navigate("/login")}>
                  Sign in to existing account
                </button>

                <div className="auth-footer-link">
                  <button type="button" onClick={() => navigate("/products")}>
                    Continue browsing without an account →
                  </button>
                </div>
              </form>
            )}

            {/* ── Step 2: security questions ───────────────── */}
            {step === 2 && (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{
                  background: "linear-gradient(135deg,#ecfdf5,#d1fae5)",
                  border: "1.5px solid #a7f3d0",
                  borderRadius: 12,
                  padding: "0.75rem 1rem",
                  marginBottom: "1.25rem",
                  fontSize: "0.82rem",
                  color: "#065f46",
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: "1rem", flexShrink: 0 }}>🔒</span>
                  <span>These answers will be used to verify your identity if you ever need to reset your password. Answers are case-insensitive and stored securely.</span>
                </div>

                {[0, 1].map((i) => (
                  <div key={i} className="auth-field">
                    <label className="auth-label">Security question {i + 1}</label>
                    <select
                      className={`auth-input ${sqErrors[i] && sq[i].questionIndex === "" ? "auth-input--error" : sq[i].questionIndex !== "" ? "auth-input--valid" : ""}`}
                      value={sq[i].questionIndex}
                      onChange={(e) => {
                        const next = [...sq];
                        next[i] = { ...next[i], questionIndex: e.target.value };
                        setSq(next);
                        const errs = [...sqErrors];
                        errs[i] = "";
                        setSqErrors(errs);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <option value="">— Select a question —</option>
                      {SECURITY_QUESTIONS.map((q, idx) => (
                        <option
                          key={idx}
                          value={idx}
                          disabled={usedIndices.includes(String(idx)) && String(sq[i].questionIndex) !== String(idx)}
                        >
                          {q}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      className={`auth-input ${sqErrors[i] && sq[i].answer.trim().length < 2 ? "auth-input--error" : sq[i].answer.trim().length >= 2 ? "auth-input--valid" : ""}`}
                      style={{ marginTop: "0.5rem" }}
                      placeholder="Your answer (case-insensitive)"
                      value={sq[i].answer}
                      onChange={(e) => {
                        const next = [...sq];
                        next[i] = { ...next[i], answer: e.target.value };
                        setSq(next);
                        const errs = [...sqErrors];
                        errs[i] = "";
                        setSqErrors(errs);
                      }}
                      autoComplete="off"
                    />

                    {sqErrors[i] && (
                      <p className="auth-field-error" role="alert">{sqErrors[i]}</p>
                    )}
                  </div>
                ))}

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    className="auth-btn auth-btn--outline"
                    style={{ flex: "0 0 auto", width: "auto", padding: "12px 20px" }}
                    onClick={() => { setStep(1); setError(""); }}
                    disabled={loading}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="auth-btn auth-btn--success"
                    style={{ flex: 1 }}
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className="auth-spinner" aria-hidden="true" /> Creating account…</>
                    ) : (
                      "Create account"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
