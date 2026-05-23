import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../features/authSlice";
import {
  fetchUserCart,
  mergeGuestCart,
  syncCartToBackend,
} from "../features/cartSlice";
import { validateLogin } from "../utils/validation";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContext } from "../context/ToastContext";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Typography,
  Divider,
  Link,
} from "@mui/material";
import { FiEye, FiEyeOff } from "react-icons/fi";

// ── Shared brand panel ───────────────────────────────────────────────────────
function BrandPanel({ title, subtitle, perks }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        display: { xs: "none", lg: "flex" },
        flex: "0 0 420px",
        background: "linear-gradient(135deg, #3D1A2A 0%, #5C2038 45%, #6b1238 100%)",
        alignItems: "center",
        justifyContent: "center",
        p: "3rem 2.5rem",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 30% 80%, rgba(201,168,76,0.20) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(244,167,185,0.18) 0%, transparent 50%)",
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1, color: "white" }}>
        <Box
          component="img"
          src="/ICS_Logo.jpeg"
          alt="Infinity Craft Space"
          sx={{
            width: 80,
            height: 80,
            borderRadius: "20px",
            objectFit: "cover",
            mb: 2.5,
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}
        />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            mb: 0.75,
            background: "linear-gradient(135deg, #fff 0%, #F4A7B9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {title}
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.70)", mb: 3, fontSize: "0.9375rem", lineHeight: 1.5 }}>
          {subtitle}
        </Typography>
        <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {perks.map(({ icon, text }) => (
            <Box component="li" key={text} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.10)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                  flexShrink: 0,
                }}
              >
                {icon}
              </Box>
              <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9375rem" }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

// ── Login page ───────────────────────────────────────────────────────────────
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addSuccess } = useContext(ToastContext);
  const { loading, error } = useSelector((state) => state.auth);
  const guestCartItems = useSelector((state) => state.cart.items);

  useEffect(() => {
    const msg = localStorage.getItem("registrationSuccess");
    if (msg) {
      localStorage.removeItem("registrationSuccess");
      addSuccess(msg, "Account Created");
    }
  }, [addSuccess]);

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
      sessionStorage.setItem("authLoginTime", String(Date.now()));
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
        navigate("/products");
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

      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        <BrandPanel
          title="Infinity Craft Space"
          subtitle="Premium craft supplies for creative minds"
          perks={[
            { icon: "🎨", text: "Exclusive craft collections" },
            { icon: "📦", text: "Fast, reliable delivery" },
            { icon: "⭐", text: "Curated quality products" },
            { icon: "🔒", text: "Secure checkout" },
          ]}
        />

        {/* Right: form panel */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: "2rem 1.25rem", sm: "2rem" },
            overflowY: "auto",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 420 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Sign in to continue shopping
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                label="Email address"
                type="email"
                fullWidth
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError("email");
                }}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                error={!!(touched.email && validationErrors.email)}
                helperText={touched.email && validationErrors.email ? validationErrors.email : ""}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError("password");
                }}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                error={!!(touched.password && validationErrors.password)}
                helperText={touched.password && validationErrors.password ? validationErrors.password : ""}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((s) => !s)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          edge="end"
                          tabIndex={-1}
                          size="small"
                        >
                          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 1 }}
              />

              <Box sx={{ textAlign: "right", mb: 2 }}>
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => navigate("/forgot-password")}
                  sx={{ fontWeight: 500, cursor: "pointer" }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isDisabled}
                sx={{
                  height: 52,
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  mb: 1.5,
                  borderRadius: "12px",
                }}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                ) : null}
                {loading ? "Signing in…" : "Sign in"}
              </Button>

              <Divider sx={{ my: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  or
                </Typography>
              </Divider>

              <Button
                type="button"
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={() => navigate("/register")}
                sx={{
                  height: 52,
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  borderRadius: "12px",
                }}
              >
                Create a new account
              </Button>
            </Box>

            <Box sx={{ textAlign: "center", mt: 2.5 }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => navigate("/products")}
                sx={{ cursor: "pointer", fontWeight: 500 }}
              >
                Continue browsing without an account →
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
