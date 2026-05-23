import { useDispatch } from "react-redux";
import { register } from "../features/authSlice";
import { validateRegister } from "../utils/validation";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import { SECURITY_QUESTIONS } from "../constants/securityQuestions";
import {
  Box,
  Button,
  TextField,
  Alert,
  Typography,
  Divider,
  Link,
  IconButton,
  InputAdornment,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { FiEye, FiEyeOff, FiCheck } from "react-icons/fi";

// ── Brand panel (same as Login) ──────────────────────────────────────────────
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
          sx={{ width: 80, height: 80, borderRadius: "20px", objectFit: "cover", mb: 2.5, boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}
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
                  width: 36, height: 36, borderRadius: "10px",
                  background: "rgba(255,255,255,0.10)", backdropFilter: "blur(4px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", flexShrink: 0,
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

// ── Password strength helpers ────────────────────────────────────────────────
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
  if (met <= 1) return { level: "weak",   label: "Weak",   color: "#ef4444", pct: "20%" };
  if (met === 2) return { level: "fair",   label: "Fair",   color: "#f59e0b", pct: "40%" };
  if (met === 3) return { level: "good",   label: "Good",   color: "#3b82f6", pct: "70%" };
  return           { level: "strong", label: "Strong", color: "#10b981", pct: "100%" };
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = ["Account info", "Security questions"];
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
      {steps.map((label, i) => {
        const s = i + 1;
        const done = step > s;
        const active = step === s;
        return (
          <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box
                sx={{
                  width: 28, height: 28, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.8rem", fontWeight: 700,
                  background: done || active ? "linear-gradient(135deg,#10b981,#059669)" : "#e5e7eb",
                  color: done || active ? "white" : "#9ca3af",
                  transition: "all 0.2s",
                }}
              >
                {done ? <FiCheck size={13} /> : s}
              </Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: done || active ? "#065f46" : "#9ca3af" }}
              >
                {label}
              </Typography>
            </Box>
            {i < steps.length - 1 && (
              <Box sx={{ width: 32, height: 2, background: step > s ? "#10b981" : "#e5e7eb", borderRadius: 1 }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ── Register page ────────────────────────────────────────────────────────────
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

  const handleNextStep = (e) => {
    e.preventDefault();
    setTouched({ username: true, email: true, password: true });
    setError("");
    const errors = validateRegister(form);
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setStep(2);
  };

  const validateSQ = () => {
    const errs = sq.map((q) => {
      if (q.questionIndex === "") return "Please select a question.";
      if (!q.answer || q.answer.trim().length < 2) return "Answer must be at least 2 characters.";
      return "";
    });
    if (sq[0].questionIndex !== "" && sq[0].questionIndex === sq[1].questionIndex) {
      errs[1] = "Please choose a different question.";
    }
    setSqErrors(errs);
    return errs.every((e) => e === "");
  };

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

      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        <BrandPanel
          title="Join our creative community"
          subtitle="Get access to thousands of premium craft products and exclusive member perks."
          perks={[
            { icon: "🎁", text: "Exclusive member offers" },
            { icon: "📦", text: "Order tracking & history" },
            { icon: "❤️", text: "Save to wishlist" },
            { icon: "⭐", text: "Leave product reviews" },
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
            <StepIndicator step={step} />

            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              {step === 1 ? "Create your account" : "Set up account recovery"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              {step === 1
                ? "Join Infinity Craft Space — it's free"
                : "Choose 2 security questions to recover your password if you ever forget it."}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* ── Step 1: account info ───────────────────────────────── */}
            {step === 1 && (
              <Box component="form" onSubmit={handleNextStep} noValidate>
                <TextField
                  label="Username"
                  type="text"
                  fullWidth
                  required
                  autoComplete="username"
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={(e) => { setForm({ ...form, username: e.target.value }); clearFieldError("username"); }}
                  onBlur={() => setTouched((p) => ({ ...p, username: true }))}
                  error={!!(touched.username && validationErrors.username)}
                  helperText={touched.username && validationErrors.username ? validationErrors.username : ""}
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Email address"
                  type="email"
                  fullWidth
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); clearFieldError("email"); }}
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
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); clearFieldError("password"); }}
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

                {/* Password strength */}
                {form.password && strength && (
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ height: 4, borderRadius: 1, bgcolor: "#e5e7eb", overflow: "hidden", mb: 0.5 }}>
                      <Box
                        sx={{
                          height: "100%",
                          width: strength.pct,
                          bgcolor: strength.color,
                          borderRadius: 1,
                          transition: "width 300ms ease, background-color 300ms ease",
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: strength.color, fontWeight: 500 }}>
                      Password strength: {strength.label}
                    </Typography>
                  </Box>
                )}

                {/* Requirements checklist */}
                {form.password && (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.3rem 0.5rem",
                      mb: 2,
                      p: 1.25,
                      bgcolor: "grey.50",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {PW_RULES.map((rule) => {
                      const met = rule.test(form.password);
                      return (
                        <Box key={rule.key} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Box
                            sx={{
                              width: 14, height: 14, borderRadius: "50%",
                              border: "1.5px solid",
                              borderColor: met ? "#10b981" : "grey.400",
                              bgcolor: met ? "#10b981" : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0,
                              transition: "all 200ms ease",
                            }}
                          >
                            {met && <FiCheck size={8} color="white" />}
                          </Box>
                          <Typography variant="caption" sx={{ color: met ? "#10b981" : "text.secondary" }}>
                            {rule.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  disabled={!form.username || !form.email || !form.password}
                  sx={{ height: 52, fontWeight: 700, fontSize: "0.9375rem", mb: 1.5, borderRadius: "12px" }}
                >
                  Continue →
                </Button>

                <Divider sx={{ my: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">or</Typography>
                </Divider>

                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => navigate("/login")}
                  sx={{ height: 52, fontWeight: 600, fontSize: "0.9375rem", borderRadius: "12px" }}
                >
                  Sign in to existing account
                </Button>

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
            )}

            {/* ── Step 2: security questions ─────────────────────────── */}
            {step === 2 && (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Alert
                  severity="info"
                  icon="🔒"
                  sx={{
                    mb: 2.5,
                    background: "linear-gradient(135deg,#ecfdf5,#d1fae5)",
                    border: "1.5px solid #a7f3d0",
                    color: "#065f46",
                    borderRadius: 2,
                    "& .MuiAlert-icon": { color: "#065f46" },
                  }}
                >
                  These answers will be used to verify your identity if you need to reset your password. Stored securely and encrypted.
                </Alert>

                {[0, 1].map((i) => (
                  <Box key={i} sx={{ mb: 2.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5, color: "text.primary" }}>
                      Security question {i + 1}
                    </Typography>

                    <TextField
                      select
                      fullWidth
                      value={sq[i].questionIndex}
                      onChange={(e) => {
                        const next = [...sq];
                        next[i] = { ...next[i], questionIndex: e.target.value };
                        setSq(next);
                        const errs = [...sqErrors];
                        errs[i] = "";
                        setSqErrors(errs);
                      }}
                      error={!!(sqErrors[i] && sq[i].questionIndex === "")}
                      sx={{ mb: 1 }}
                    >
                      <MenuItem value="">— Select a question —</MenuItem>
                      {SECURITY_QUESTIONS.map((q, idx) => (
                        <MenuItem
                          key={idx}
                          value={idx}
                          disabled={usedIndices.includes(String(idx)) && String(sq[i].questionIndex) !== String(idx)}
                        >
                          {q}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      fullWidth
                      placeholder="Type your answer"
                      value={sq[i].answer}
                      onChange={(e) => {
                        const next = [...sq];
                        next[i] = { ...next[i], answer: e.target.value.toLowerCase() };
                        setSq(next);
                        const errs = [...sqErrors];
                        errs[i] = "";
                        setSqErrors(errs);
                      }}
                      error={!!(sqErrors[i] && sq[i].answer.trim().length < 2)}
                      helperText={sqErrors[i] || ""}
                      autoComplete="off"
                      slotProps={{ htmlInput: { autoCapitalize: "none", autoCorrect: "off" } }}
                    />
                  </Box>
                ))}

                <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    color="primary"
                    onClick={() => { setStep(1); setError(""); }}
                    disabled={loading}
                    sx={{ height: 52, fontWeight: 600, borderRadius: "12px", flexShrink: 0, px: 3 }}
                  >
                    ← Back
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    fullWidth
                    disabled={loading}
                    sx={{ height: 52, fontWeight: 700, fontSize: "0.9375rem", borderRadius: "12px" }}
                  >
                    {loading ? (
                      <><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />Creating account…</>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}
