import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContext } from "../context/ToastContext";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import api from "../api/axios";
import {
  Box,
  Button,
  TextField,
  Alert,
  Typography,
  Link,
  CircularProgress,
} from "@mui/material";
import { FiCheck } from "react-icons/fi";

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
    <Box
      aria-label="Progress"
      sx={{ display: "flex", alignItems: "center", mb: 3 }}
    >
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

// ── ForgotPassword page ───────────────────────────────────────────────────────
export default function ForgotPassword() {
  const navigate = useNavigate();
  const { addError } = useContext(ToastContext);
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
      sessionStorage.setItem("reset_vtoken", data.verificationToken || "");
      navigate("/verify-security");
    } catch (err) {
      const msg =
        err.response?.status === 429
          ? "Too many attempts. Please try again in 15 minutes."
          : "Something went wrong. Please try again.";
      setError(msg);
      addError(msg, "Request Failed");
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

      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        <BrandPanel
          title="Infinity Craft Space"
          subtitle="Premium craft supplies for creative minds"
          perks={[
            { icon: "🔒", text: "Secure account recovery" },
            { icon: "🛡️", text: "No email required" },
            { icon: "⏱️", text: "Done in 3 simple steps" },
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
            <StepBar current={0} />

            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              Forgot Password?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Enter your registered email or username to begin recovery.
            </Typography>

            <Alert
              severity="info"
              sx={{
                mb: 2.5,
                borderRadius: 2,
                fontSize: "0.85rem",
              }}
            >
              You'll answer the security questions you set up to verify your identity — no email or SMS needed.
            </Alert>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                id="identifier"
                label="Email address or username"
                type="text"
                fullWidth
                required
                autoFocus
                autoComplete="username email"
                placeholder="you@example.com or your username"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError(""); }}
                sx={{ mb: 2.5 }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading || !identifier.trim()}
                sx={{ height: 52, fontWeight: 700, fontSize: "0.9375rem", borderRadius: "12px" }}
              >
                {loading ? (
                  <><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />Checking…</>
                ) : (
                  "Continue to Verification →"
                )}
              </Button>
            </Box>

            <Box sx={{ textAlign: "center", mt: 2.5 }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => navigate("/login")}
                sx={{ cursor: "pointer", fontWeight: 500 }}
              >
                ← Back to Sign In
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
