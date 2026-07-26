import { Link, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MuiLink from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiShoppingBag,
  FiFileText,
  FiRefreshCcw,
  FiMessageCircle,
  FiTruck,
  FiShield,
  FiAward,
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiLinkedin,
} from "react-icons/fi";
import { BRAND } from "../theme/muiTheme";

const QUICK_LINKS = [
  { label: "Shop All Products",  to: "/",                    icon: FiShoppingBag  },
  { label: "Return Policy",      to: "/return-policy",       icon: FiRefreshCcw   },
  { label: "Terms & Conditions", to: "/terms-and-conditions",icon: FiFileText     },
  { label: "Contact Us",         to: "/contact-us",          icon: FiMessageCircle},
];

const TRUST_ITEMS = [
  { icon: FiTruck,  label: "Free Shipping",   sub: "On orders above ₹999",  color: "#10b981" },
  { icon: FiShield, label: "Secure Payments", sub: "100% safe checkout",    color: "#8B1A4A" },
  { icon: FiAward,  label: "Quality Promise", sub: "Curated craft supplies", color: "#f59e0b" },
];

const SOCIAL_LINKS = [
  { icon: FiFacebook,  label: "Facebook",  url: "#" },
  { icon: FiInstagram, label: "Instagram", url: "#" },
  { icon: FiTwitter,   label: "Twitter",   url: "#" },
  { icon: FiLinkedin,  label: "LinkedIn",  url: "#" },
];

const BUSINESS_HOURS = [
  { day: "Monday – Friday", time: "9 AM – 7 PM",  isOpen: true  },
  { day: "Saturday",        time: "10 AM – 5 PM", isOpen: true  },
  { day: "Sunday",          time: "Closed",        isOpen: false },
];

const DARK_BG = "#2D0B1F";
const DARK_SURFACE = "#3D1A2A";
const DARK_TEXT = "#F5E6EE";
const DARK_MUTED = "#C9A8B8";
const DARK_BORDER = "rgba(255,255,255,0.1)";

export default function Footer() {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <Box component="footer">
      {/* ── Trust Bar ─────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{ bgcolor: "#FDF6EC", borderRadius: 0, borderTop: "1px solid #EAD9C5", borderBottom: "1px solid #EAD9C5" }}
      >
        <Box sx={{ px: { xs: 3, sm: 6, md: 10, lg: 14 }, py: { xs: 3, md: 4 } }}>
          <Grid container spacing={3} justifyContent="center">
            {TRUST_ITEMS.map(({ icon: Icon, label, sub, color }) => (
              <Grid item xs={12} sm={4} key={label}>
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={2}
                  justifyContent={{ xs: "center", sm: "center" }}
                  role="region"
                  aria-label={label}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: `${color}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color,
                    }}
                  >
                    <Icon size={22} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#2C2C2C", lineHeight: 1.3, fontSize: "0.9rem" }}>
                      {label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#78614F", fontSize: "0.8rem" }}>
                      {sub}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

      {/* ── Main Footer ───────────────────────────────────────────── */}
      <Box sx={{ bgcolor: DARK_BG }}>
        <Grid
          container
          spacing={{ xs: 5, md: 6 }}
          sx={{ px: { xs: 3, sm: 6, md: 10, lg: 14 }, pt: { xs: 5, md: 8 }, pb: { xs: 5, md: 7 } }}
        >
          {/* Brand column */}
          <Grid item xs={12} md={4.5}>
            <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                <img
                  src="/ICS_Logo.jpeg"
                  alt="Infinity Craft Space Logo"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              </Box>
              <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
                Infinity Craft Space
              </Typography>
            </Stack>

            <Typography variant="body2" sx={{ color: DARK_MUTED, lineHeight: 1.8, mb: 3.5, maxWidth: 340, fontSize: "0.875rem" }}>
              Curated craft supplies, premium materials &amp; tools for every creative mind.
            </Typography>

            {/* Contact */}
            <Typography variant="overline" sx={{ color: DARK_MUTED, fontSize: "0.65rem", letterSpacing: "0.1em", display: "block", mb: 1.5 }}>
              Get In Touch
            </Typography>
            <Stack gap={1.25} sx={{ mb: 3 }}>
              <MuiLink
                href="mailto:infinitycraftspacejsag@gmail.com"
                aria-label="Email us"
                sx={{
                  display: "flex", alignItems: "center", gap: 1,
                  color: DARK_MUTED, textDecoration: "none", fontSize: "0.8125rem",
                  "&:hover": { color: "#C9A84C" }, transition: "color 150ms ease",
                }}
              >
                <FiMail size={15} style={{ flexShrink: 0 }} />
                infinitycraftspacejsag@gmail.com
              </MuiLink>
              <MuiLink
                href="tel:+918925083167"
                aria-label="Call us"
                sx={{
                  display: "flex", alignItems: "center", gap: 1,
                  color: DARK_MUTED, textDecoration: "none", fontSize: "0.8125rem",
                  "&:hover": { color: "#C9A84C" }, transition: "color 150ms ease",
                }}
              >
                <FiPhone size={15} style={{ flexShrink: 0 }} />
                +91 (892) 508-3167
              </MuiLink>
              <Stack direction="row" alignItems="flex-start" gap={1}>
                <FiMapPin size={15} color={DARK_MUTED} style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: DARK_MUTED, fontSize: "0.8125rem" }}>
                  Bangalore, Karnataka, India
                </Typography>
              </Stack>
            </Stack>

            {/* Social */}
            <Typography variant="overline" sx={{ color: DARK_MUTED, fontSize: "0.65rem", letterSpacing: "0.1em", display: "block", mb: 1 }}>
              Follow Us
            </Typography>
            <Stack direction="row" gap={0.75}>
              {SOCIAL_LINKS.map(({ icon: Icon, label, url }) => (
                <IconButton
                  key={label}
                  component="a"
                  href={url}
                  aria-label={label}
                  size="small"
                  sx={{
                    color: DARK_MUTED,
                    border: `1px solid ${DARK_BORDER}`,
                    borderRadius: 1.5,
                    p: 0.875,
                    "&:hover": { bgcolor: "rgba(201,168,76,0.15)", color: "#C9A84C", borderColor: "#C9A84C" },
                    transition: "all 150ms ease",
                  }}
                >
                  <Icon size={16} />
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* Quick Links column */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="overline" sx={{ color: "#fff", fontSize: "0.7rem", letterSpacing: "0.1em", fontWeight: 700, display: "block", mb: 2 }}>
              Quick Links
            </Typography>
            <Stack component="nav" aria-label="Footer quick links" gap={0.75}>
              {QUICK_LINKS.map(({ label, to, icon: Icon }) => (
                <MuiLink
                  key={to}
                  component={Link}
                  to={to}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1,
                    color: DARK_MUTED, textDecoration: "none", fontSize: "0.8125rem",
                    py: 0.375,
                    "&:hover": { color: "#C9A84C", pl: 0.5 },
                    transition: "all 150ms ease",
                  }}
                >
                  <Icon size={14} style={{ flexShrink: 0 }} />
                  {label}
                </MuiLink>
              ))}
            </Stack>
          </Grid>

          {/* Business Hours column */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="overline" sx={{ color: "#fff", fontSize: "0.7rem", letterSpacing: "0.1em", fontWeight: 700, display: "block", mb: 2 }}>
              Business Hours
            </Typography>
            <Stack gap={1.25}>
              {BUSINESS_HOURS.map(({ day, time, isOpen }) => (
                <Box key={day}>
                  <Typography variant="caption" sx={{ color: DARK_MUTED, display: "block", mb: 0.25, fontSize: "0.75rem" }}>
                    {day}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: isOpen ? "#10b981" : "#ef4444",
                    }}
                  >
                    {time}
                  </Typography>
                </Box>
              ))}
              <Typography variant="caption" sx={{ color: "#475569", fontSize: "0.7rem", mt: 0.5 }}>
                All times in IST (GMT+5:30)
              </Typography>
            </Stack>
          </Grid>

          {/* Newsletter column */}
          <Grid item xs={12} md={3.5}>
            <Typography variant="overline" sx={{ color: "#fff", fontSize: "0.7rem", letterSpacing: "0.1em", fontWeight: 700, display: "block", mb: 2 }}>
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ color: DARK_MUTED, mb: 2, fontSize: "0.8125rem", lineHeight: 1.6 }}>
              Subscribe to get special offers &amp; updates!
            </Typography>
            <Box component="form" onSubmit={(e) => e.preventDefault()}>
              <TextField
                type="email"
                placeholder="Enter your email"
                aria-label="Email for newsletter"
                size="small"
                fullWidth
                variant="outlined"
                sx={{
                  mb: 1.25,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(255,255,255,0.06)",
                    borderRadius: 2,
                    color: DARK_TEXT,
                    "& fieldset": { borderColor: DARK_BORDER },
                    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                    "&.Mui-focused fieldset": { borderColor: "#C9A84C" },
                  },
                  "& input::placeholder": { color: DARK_MUTED, opacity: 1 },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                aria-label="Subscribe"
                sx={{
                  bgcolor: BRAND.rose[800],
                  color: "#fff",
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": { bgcolor: BRAND.rose[900] },
                  mb: 1,
                }}
              >
                Subscribe
              </Button>
              <Typography variant="caption" sx={{ color: "#475569", fontSize: "0.7rem" }}>
                No spam, ever. Unsubscribe anytime.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* ── Bottom Bar ────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: "#1A0610", borderTop: `1px solid ${DARK_BORDER}` }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          justifyContent="space-between"
          gap={1.5}
          sx={{ px: { xs: 3, sm: 6, md: 10, lg: 14 }, py: 2.5 }}
        >
          <Typography variant="caption" sx={{ color: "#475569", fontSize: "0.8rem" }}>
            © {new Date().getFullYear()}{" "}
            <Box component="strong" sx={{ color: DARK_MUTED }}>
              Infinity Craft Space
            </Box>
            . All rights reserved.
          </Typography>

          <Stack
            component="nav"
            direction="row"
            aria-label="Footer legal links"
            divider={<Box sx={{ width: 1, height: 12, bgcolor: "#334155", borderRadius: 1 }} />}
            gap={1.5}
            alignItems="center"
          >
            {[
              { label: "Terms",   to: "/terms-and-conditions", component: Link },
              { label: "Returns", to: "/return-policy",        component: Link },
              { label: "Support", to: "/contact-us",           component: Link },
              { label: "Privacy", href: "#privacy" },
            ].map(({ label, to, href, component }) => (
              <MuiLink
                key={label}
                component={component || "a"}
                {...(to ? { to } : { href })}
                sx={{
                  color: "#475569",
                  textDecoration: "none",
                  fontSize: "0.75rem",
                  "&:hover": { color: BRAND.rose[800] },
                  transition: "color 150ms ease",
                }}
              >
                {label}
              </MuiLink>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
