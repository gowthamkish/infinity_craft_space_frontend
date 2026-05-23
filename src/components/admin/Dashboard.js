import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import {
  FiUsers,
  FiPackage,
  FiTrendingUp,
  FiPlus,
  FiBarChart2,
  FiShoppingCart,
  FiTag,
} from "react-icons/fi";
import AdminLayout from "./AdminLayout";
import { useDashboardCounts } from "../../hooks/useSmartFetch";
import SEOHead, { SEO_CONFIG } from "../SEOHead";

const STAT_COLORS = {
  blue:  { bg: "rgba(37,99,235,0.10)",  icon: "#8B1A4A", gradient: "linear-gradient(135deg,#C9A84C,#7a1640)" },
  green: { bg: "rgba(16,185,129,0.10)", icon: "#10b981", gradient: "linear-gradient(135deg,#10b981,#059669)" },
  amber: { bg: "rgba(245,158,11,0.10)", icon: "#f59e0b", gradient: "linear-gradient(135deg,#f59e0b,#d97706)" },
};

const STAT_CARDS = [
  { key: "userCount",    label: "Total Users",    hint: "Registered accounts", icon: FiUsers,        color: "blue",  path: "/admin/users"    },
  { key: "productCount", label: "Total Products", hint: "Active listings",     icon: FiPackage,      color: "green", path: "/admin/products" },
  { key: "orderCount",   label: "Total Orders",   hint: "All-time orders",     icon: FiShoppingCart, color: "amber", path: "/admin/orders"   },
];

const QUICK_ACTIONS = [
  { label: "Add Product",       icon: FiPlus,         path: "/admin/addProduct" },
  { label: "Manage Users",      icon: FiUsers,        path: "/admin/users"      },
  { label: "View Orders",       icon: FiShoppingCart, path: "/admin/orders"     },
  { label: "Manage Categories", icon: FiTag,          path: "/admin/categories" },
  { label: "View Analytics",    icon: FiBarChart2,    path: "/admin/analytics"  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: counts, loading } = useDashboardCounts();

  return (
    <>
      <SEOHead
        title={`Admin Dashboard · ${SEO_CONFIG.SITE_NAME}`}
        description="Administrative dashboard for managing craft supplies store."
        noindex={true}
        nofollow={true}
        canonical={`${SEO_CONFIG.SITE_URL}/admin/dashboard`}
      />

      <AdminLayout>
        {/* Page header */}
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 0.5 }}>
              <FiBarChart2 size={22} color="#8B1A4A" />
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#1c1917", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
                Dashboard
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "#57534e" }}>
              Welcome back — manage your store from here.
            </Typography>
          </Box>
          <Chip
            label="Live"
            color="success"
            size="small"
            sx={{ fontWeight: 700, fontSize: "0.75rem" }}
          />
        </Stack>

        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 2 }}>
            <CircularProgress sx={{ color: "#8B1A4A" }} />
            <Typography variant="body2" color="text.secondary">Loading dashboard data…</Typography>
          </Box>
        ) : (
          <>
            {/* Stat cards */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              {STAT_CARDS.map(({ key, label, hint, icon: Icon, color, path }) => {
                const c = STAT_COLORS[color];
                return (
                  <Grid item xs={12} sm={6} md={4} key={key} sx={{ display: "flex" }}>
                    <Card
                      onClick={() => navigate(path)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && navigate(path)}
                      aria-label={`Navigate to ${label}`}
                      elevation={1}
                      sx={{
                        cursor: "pointer",
                        borderRadius: 3,
                        flex: 1,
                        border: "1px solid #e7e5e4",
                        transition: "box-shadow 150ms ease, transform 150ms ease",
                        "&:hover": {
                          boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
                          transform: "translateY(-2px)",
                        },
                        "&:focus-visible": {
                          outline: "2px solid #8B1A4A",
                          outlineOffset: 2,
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                        {/* Icon row */}
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              bgcolor: c.bg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: c.icon,
                            }}
                          >
                            <Icon size={22} />
                          </Box>
                          <FiTrendingUp size={16} color="#a8a29e" />
                        </Stack>

                        <Typography variant="h3" sx={{ fontWeight: 800, color: "#1c1917", lineHeight: 1, mb: 0.5, fontSize: { xs: "2rem", sm: "2.25rem" } }}>
                          {counts?.[key] ?? 0}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#1c1917", fontWeight: 600, mb: 0.5 }}>
                          {label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#a8a29e" }}>
                          {hint}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* Quick actions */}
            <Card elevation={1} sx={{ borderRadius: 3, border: "1px solid #e7e5e4" }}>
              <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #e7e5e4" }}>
                <Typography variant="body1" sx={{ fontWeight: 700, color: "#1c1917" }}>
                  Quick Actions
                </Typography>
              </Box>
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Grid container spacing={1.5}>
                  {QUICK_ACTIONS.map(({ label, icon: Icon, path }) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={label}>
                      <Button
                        variant="outlined"
                        startIcon={<Icon size={15} />}
                        onClick={() => navigate(path)}
                        fullWidth
                        sx={{
                          borderColor: "#e7e5e4",
                          color: "#57534e",
                          fontWeight: 600,
                          fontSize: "0.8125rem",
                          py: 1.125,
                          borderRadius: 2,
                          textTransform: "none",
                          justifyContent: "flex-start",
                          "&:hover": {
                            borderColor: "#8B1A4A",
                            color: "#8B1A4A",
                            bgcolor: "rgba(139,26,74,0.08)",
                            transform: "translateY(-1px)",
                          },
                          transition: "all 150ms ease",
                        }}
                      >
                        {label}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </>
        )}
      </AdminLayout>
    </>
  );
}
