import { useDispatch } from "react-redux";
import { register } from "../features/authSlice";
import { validateRegister } from "../utils/validation";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import "./auth.css";

// Password strength helpers
const PW_RULES = [
  { key: "length",  label: "8+ characters",  test: (p) => p.length >= 8 },
  { key: "upper",   label: "Uppercase",       test: (p) => /[A-Z]/.test(p) },
  { key: "lower",   label: "Lowercase",       test: (p) => /[a-z]/.test(p) },
  { key: "number",  label: "Number",          test: (p) => /\d/.test(p) },
  { key: "special", label: "Special char",    test: (p) => /[@$!%*?&]/.test(p) },
];

function getStrength(password) {
  if (!password) return null;
  const met = PW_RULES.filter((r) => r.test(password)).length;
  if (met <= 1) return { level: "weak",   label: "Weak" };
  if (met === 2) return { level: "fair",   label: "Fair" };
  if (met === 3) return { level: "good",   label: "Good" };
  return { level: "strong", label: "Strong" };
}

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched]           = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const strength = getStrength(form.password);

  const clearFieldError = (field) =>
    setValidationErrors((prev) => ({ ...prev, [field]: "" }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, email: true, password: true });
    setError("");

    const errors = validateRegister(form);
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      // Use unwrap() — throws on rejection so we can catch it cleanly
      await dispatch(register(form)).unwrap();
      // Success: user object (no token) is now in the payload
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
      } else {
        setError(err?.error || "Registration failed. Please try again.");
      }
    }
  };

  const isDisabled = loading || !form.username || !form.email || !form.password;

  return (
    <>
      <SEOHead
        title={`Create account · ${SEO_CONFIG.SITE_NAME}`}
        description="Join Infinity Craft Space to access premium craft supplies and more."
        noindex={true}
        canonical={`${SEO_CONFIG.SITE_URL}/register`}
      />

      <div className="auth-page">
        {/* Left panel — brand */}
        <div className="auth-brand-panel" aria-hidden="true">
          <div className="auth-brand-content">
            <img src="/ICS_Logo.jpeg" alt="Infinity Craft Space" className="auth-brand-logo" />
            <h2 className="auth-brand-title">Join our creative community</h2>
            <p className="auth-brand-subtitle">
              Get access to thousands of premium craft products and exclusive member perks.
            </p>
            <ul className="auth-brand-perks">
              <li><span className="perk-icon">🎁</span> Exclusive member offers</li>
              <li><span className="perk-icon">📦</span> Order tracking & history</li>
              <li><span className="perk-icon">❤️</span> Save to wishlist</li>
              <li><span className="perk-icon">⭐</span> Leave product reviews</li>
            </ul>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-card-header">
              <h1 className="auth-title">Create your account</h1>
              <p className="auth-subtitle">Join Infinity Craft Space — it's free</p>
            </div>

            {error && (
              <div className="auth-alert auth-alert--error" role="alert">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a1 1 0 110-2 1 1 0 010 2z" fill="currentColor"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Full name */}
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

              {/* Email */}
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

              {/* Password */}
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
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>

                {/* Strength bar — shown when user starts typing */}
                {form.password && strength && (
                  <div className={`pw-strength pw-strength--${strength.level}`}>
                    <div className="pw-strength-bar">
                      <div className="pw-strength-fill" />
                    </div>
                    <span className="pw-strength-label">Password strength: {strength.label}</span>
                  </div>
                )}

                {/* Requirements checklist — visible while typing */}
                {(form.password || (touched.password && validationErrors.password)) && (
                  <div className="pw-requirements" aria-label="Password requirements">
                    {PW_RULES.map((rule) => {
                      const met = rule.test(form.password);
                      return (
                        <div key={rule.key} className={`pw-req${met ? " pw-req--met" : ""}`}>
                          <span className="pw-req-icon" aria-hidden="true">
                            {met ? "✓" : ""}
                          </span>
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

              {/* Primary CTA */}
              <button
                type="submit"
                className="auth-btn auth-btn--success"
                disabled={isDisabled}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner" aria-hidden="true" />
                    Creating account…
                  </>
                ) : "Create account"}
              </button>

              <div className="auth-divider"><span>or</span></div>

              <button
                type="button"
                className="auth-btn auth-btn--outline"
                onClick={() => navigate("/login")}
              >
                Sign in to existing account
              </button>
            </form>

            <div className="auth-footer-link">
              <button type="button" onClick={() => navigate("/")}>
                Continue browsing without an account →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
