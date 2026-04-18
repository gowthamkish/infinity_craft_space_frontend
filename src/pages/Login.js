import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../features/authSlice";
import { fetchUserCart, mergeGuestCart, syncCartToBackend } from "../features/cartSlice";
import { validateLogin } from "../utils/validation";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import "./auth.css";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});

  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const guestCartItems = useSelector((state) => state.cart.items);

  useEffect(() => {
    const msg = localStorage.getItem("registrationSuccess");
    if (msg) {
      setSuccessMessage(msg);
      localStorage.removeItem("registrationSuccess");
      const t = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(t);
    }
  }, []);

  const clearFieldError = (field) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    dispatch(clearError());

    const errors = validateLogin({ email, password });
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const preLoginCart = [...guestCartItems];
      const data = await dispatch(loginUser({ email, password })).unwrap();
      await dispatch(fetchUserCart());
      if (preLoginCart.length > 0) {
        dispatch(mergeGuestCart(preLoginCart));
        dispatch(syncCartToBackend());
      }
      const redirect = localStorage.getItem("redirectAfterLogin");
      if (data?.user?.isAdmin) {
        navigate("/admin/dashboard");
      } else if (redirect) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirect);
      } else {
        navigate("/");
      }
    } catch {
      // error handled by Redux state (authSlice.error)
    }
  };

  const isDisabled = loading || !email || !password;

  return (
    <>
      <SEOHead
        title={`Login · ${SEO_CONFIG.SITE_NAME}`}
        description="Sign in to your Infinity Craft Space account."
        noindex={true}
        canonical={`${SEO_CONFIG.SITE_URL}/login`}
      />

      <div className="auth-page">
        {/* Left panel — brand */}
        <div className="auth-brand-panel" aria-hidden="true">
          <div className="auth-brand-content">
            <img src="/ICS_Logo.jpeg" alt="Infinity Craft Space" className="auth-brand-logo" />
            <h2 className="auth-brand-title">Infinity Craft Space</h2>
            <p className="auth-brand-subtitle">
              Premium craft supplies for creative minds
            </p>
            <ul className="auth-brand-perks">
              <li><span className="perk-icon">🎨</span> Exclusive craft collections</li>
              <li><span className="perk-icon">📦</span> Fast, reliable delivery</li>
              <li><span className="perk-icon">⭐</span> Curated quality products</li>
              <li><span className="perk-icon">🔒</span> Secure checkout</li>
            </ul>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-card-header">
              <h1 className="auth-title">Welcome back</h1>
              <p className="auth-subtitle">Sign in to continue shopping</p>
            </div>

            {successMessage && (
              <div className="auth-alert auth-alert--success" role="alert">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.78 5.78l-4.5 4.5a.75.75 0 01-1.06 0l-2-2a.75.75 0 111.06-1.06L6.75 9.69l3.97-3.97a.75.75 0 111.06 1.06z" fill="currentColor"/>
                </svg>
                {successMessage}
                <button className="auth-alert-close" onClick={() => setSuccessMessage("")} aria-label="Dismiss">×</button>
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

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="auth-field">
                <label htmlFor="login-email" className="auth-label">
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  className={`auth-input ${touched.email && validationErrors.email ? "auth-input--error" : ""} ${touched.email && !validationErrors.email && email ? "auth-input--valid" : ""}`}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
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
                <label htmlFor="login-password" className="auth-label">
                  Password
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className={`auth-input auth-input--with-icon ${touched.password && validationErrors.password ? "auth-input--error" : ""} ${touched.password && !validationErrors.password && password ? "auth-input--valid" : ""}`}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                    placeholder="Enter your password"
                    autoComplete="current-password"
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
                {touched.password && validationErrors.password && (
                  <p className="auth-field-error" role="alert">{validationErrors.password}</p>
                )}
              </div>

              {/* Primary CTA */}
              <button
                type="submit"
                className="auth-btn auth-btn--primary"
                disabled={isDisabled}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner" aria-hidden="true" />
                    Signing in…
                  </>
                ) : "Sign in"}
              </button>

              <div className="auth-divider"><span>or</span></div>

              {/* Secondary CTA */}
              <button
                type="button"
                className="auth-btn auth-btn--outline"
                onClick={() => navigate("/register")}
              >
                Create a new account
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
