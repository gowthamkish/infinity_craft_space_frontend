import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import api from "../api/axios";
import { ToastContext } from "../context/ToastContext";
import {
  Box,
  Button,
  TextField,
  Alert,
  Typography,
  Link,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { FiEye, FiEyeOff, FiCheck } from "react-icons/fi";

// ── Brand panel ──────────────────────────────────────────────────────────────
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
            fontWeight: 800, mb: 0.75,
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

// ── Step bar ─────────────────────────────────────────────────────────────────
const STEPS = ["Identify", "Verify", "Reset"];

function StepBar({ current }) {
  return (
    <Box aria-label="Progress" sx={{ display: "flex", alignItems: "center", mb: 3 }}>
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <Box key={label} sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
              <Box
                sx={{
                  width: 32, height: 32, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: "0.85rem",
                  background: done
                    ? "linear-gradient(135deg,#10b981,#059669)"
                    : active
                    ? "linear-gradient(135deg,#8B1A4A,#6b1238)"
                    : "#e5e7eb",
                  color: done || active ? "white" : "#9ca3af",
                  transition: "all 0.25s",
                }}
              >
                {done ? <FiCheck size={14} /> : i + 1}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: done ? "#059669" : active ? "#6b1238" : "#9ca3af",
                  fontSize: "0.72rem",
                }}
              >
                {label}
              </Typography>
            </Box>
            {i < STEPS.length - 1 && (
              <Box
                sx={{
                  width: 40, height: 2, mx: 0.5, mb: 2.5,
                  bgcolor: done ? "#10b981" : "#e5e7eb",
                  borderRadius: 1,
                  transition: "background-color 0.25s",
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ── Password strength analyser ───────────────────────────────────────────────
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

const STRENGTH_META = {
  weak:   { color: "#ef4444", label: "Weak",   pct: "20%" },
  fair:   { color: "#f59e0b", label: "Fair",   pct: "40%" },
  good:   { color: "#3b82f6", label: "Good",   pct: "70%" },
  strong: { color: "#10b981", label: "Strong", pct: "100%" },
};

function PasswordStrength({ password }) {
  if (!password) return null;
  const { reqs, score, level } = analysePassword(password);
  const meta = STRENGTH_META[level];
  return (
    <Box sx={{ mt: 1, mb: 1.5 }}>
      {/* Segmented bars */}
      <Box sx={{ display: "flex", gap: 0.5, mb: 0.75 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{
              flex: 1, height: 4, borderRadius: 1,
              bgcolor: i < score ? meta.color : "#e5e7eb",
              transition: "background-color 300ms ease",
            }}
          />
        ))}
      </Box>
      <Typography variant="caption" sx={{ color: meta.color, fontWeight: 500 }}>
        Password strength: {meta.label}
      </Typography>
      {/* Requirements list */}
      <Box
        component="ul"
        sx={{
          listStyle: "none", p: 1.25, m: 0, mt: 1,
          bgcolor: "grey.50", borderRadius: 2, border: "1px solid", borderColor: "divider",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.3rem 0.5rem",
        }}
      >
        {reqs.map((r) => (
          <Box component="li" key={r.label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box
              sx={{
                width: 10, height: 10, borderRadius: "50%",
                bgcolor: r.met ? "#10b981" : "#e5e7eb",
                flexShrink: 0, transition: "background-color 200ms ease",
              }}
            />
            <Typography variant="caption" sx={{ color: r.met ? "#10b981" : "text.secondary", fontSize: "0.7rem" }}>
              {r.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── ResetPassword page ────────────────────────────────────────────────────────
export default function ResetPassword() {
  const navigate = useNavigate();
  const { addSuccess } = useContext(ToastContext);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      addSuccess(
        "Your password has been reset. Please sign in with your new password.",
        "Password Reset Successful",
        { duration: 6000 },
      );
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          (err.response?.status === 429
            ? "Too many attempts. Please try again later."
            : "Password reset failed. Your link may have expired — please start over."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title={`Reset Password · ${SEO_CONFIG.SITE_NAME}`}
        description="Create a new secure password for your account."
        noindex={true}
      />

      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        <BrandPanel
          title="Infinity Craft Space"
          subtitle="Premium craft supplies for creative minds"
          perks={[
            { icon: "🔒", text: "Hashed with bcrypt-12" },
            { icon: "🔄", text: "All sessions invalidated on reset" },
            { icon: "🛡️", text: "Previous password blocked" },
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
            <StepBar current={2} />

            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              Create New Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Choose a strong password. Signing in from other devices will be required.
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                action={
                  error.includes("start over") ? (
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => navigate("/forgot-password")}
                    >
                      Start Over
                    </Button>
                  ) : undefined
                }
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* New password */}
              <TextField
                id="new-password"
                label="New password"
                type={showNew ? "text" : "password"}
                fullWidth
                required
                autoComplete="new-password"
                placeholder="Create a strong password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                error={!!(newPassword && !isStrong)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNew((s) => !s)}
                          aria-label={showNew ? "Hide" : "Show"}
                          edge="end"
                          tabIndex={-1}
                          size="small"
                        >
                          {showNew ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 0.5 }}
              />
              <PasswordStrength password={newPassword} />

              {/* Confirm password */}
              <TextField
                id="confirm-password"
                label="Confirm new password"
                type={showConfirm ? "text" : "password"}
                fullWidth
                required
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                error={!!mismatch}
                helperText={mismatch ? "Passwords do not match." : ""}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirm((s) => !s)}
                          aria-label={showConfirm ? "Hide" : "Show"}
                          edge="end"
                          tabIndex={-1}
                          size="small"
                        >
                          {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 2.5 }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading || !isStrong || !confirmPassword || !!mismatch}
                sx={{ height: 52, fontWeight: 700, fontSize: "0.9375rem", borderRadius: "12px" }}
              >
                {loading ? (
                  <><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />Resetting…</>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </Box>

            <Box sx={{ textAlign: "center", mt: 2.5 }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => navigate("/forgot-password")}
                sx={{ cursor: "pointer", fontWeight: 500 }}
              >
                ← Start Over
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
