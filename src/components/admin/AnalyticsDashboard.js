import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import { OrbitLoader } from "../Loader";
import AdminLayout from "./AdminLayout";
import api from "../../api/axios";
import SEOHead, { SEO_CONFIG } from "../SEOHead";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import {
  FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingCart,
  FiUsers, FiPackage, FiRefreshCw, FiBarChart2, FiPieChart,
  FiCalendar, FiTarget, FiActivity,
} from "react-icons/fi";

/* ── Design tokens ─────────────────────────────────────────────── */
const P      = "#8b2252";
const P_DARK = "#6b1238";
const BORDER = "rgba(0,0,0,0.07)";
const BG     = "#f8f9fc";

/* ── Data hooks ────────────────────────────────────────────────── */
const useAnalyticsSummary = (period = 30) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try { const res = await api.get(`/api/admin/analytics/summary?period=${period}`); setData(res.data); }
    catch (err) { setError(err.response?.data?.error || "Failed to fetch analytics summary"); }
    finally { setLoading(false); }
  }, [period]);
  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
};

const useAnalyticsCharts = (period = 30) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try { const res = await api.get(`/api/admin/analytics/charts?period=${period}`); setData(res.data); }
    catch (err) { setError(err.response?.data?.error || "Failed to fetch analytics charts"); }
    finally { setLoading(false); }
  }, [period]);
  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
};

const usePredictions = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchPredictions = useCallback(async () => {
    setLoading(true); setError(null);
    try { const res = await api.get("/api/admin/predictions"); setData(res.data); }
    catch (err) { setError(err.response?.data?.message || "Failed to fetch predictions"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchPredictions(); }, [fetchPredictions]);
  return { data, loading, error, refetch: fetchPredictions };
};

/* ── Helpers ───────────────────────────────────────────────────── */
const fmtRupee = (d) => {
  if (d >= 100000) return `₹${(d / 100000).toFixed(0)}L`;
  if (d >= 1000)   return `₹${(d / 1000).toFixed(0)}K`;
  return `₹${d}`;
};
const fmtCurrency = (v) => {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000)   return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v?.toLocaleString("en-IN") || 0}`;
};
const fmtDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const STATUS_COLORS = {
  confirmed: "#10b981", processing: "#3b82f6", shipped: "#8b5cf6",
  pending: "#f59e0b", cancelled: "#ef4444", delivered: "#059669",
};

/* ── Sub-components ────────────────────────────────────────────── */
function SectionCard({ title, subtitle, icon: Icon, iconColor = P, action, children, sx }) {
  return (
    <Card elevation={0} sx={{
      border: `1px solid ${BORDER}`, borderRadius: "16px", bgcolor: "#fff",
      overflow: "hidden", height: "100%", ...sx,
    }}>
      <Box sx={{ px: 3, pt: 2.5, pb: 0 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 38, height: 38, borderRadius: "10px",
              bgcolor: `${iconColor}15`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={18} style={{ color: iconColor }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a", lineHeight: 1.3 }}>{title}</Typography>
              {subtitle && <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", mt: 0.25 }}>{subtitle}</Typography>}
            </Box>
          </Stack>
          {action}
        </Stack>
      </Box>
      <Box sx={{ px: 3, pb: 3 }}>{children}</Box>
    </Card>
  );
}

function KpiCard({ icon: Icon, label, value, sub, trend, color }) {
  return (
    <Card elevation={0} sx={{
      border: `1px solid ${BORDER}`, borderRadius: "16px", bgcolor: "#fff",
      borderTop: `3px solid ${color}`,
      transition: "transform 0.22s, box-shadow 0.22s",
      "&:hover": { transform: "translateY(-4px)", boxShadow: `0 12px 32px rgba(0,0,0,0.09)` },
    }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8", mb: 1, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", lineHeight: 1, mb: sub ? 0.75 : 0, letterSpacing: "-0.03em" }}>
              {value}
            </Typography>
            {sub && <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>{sub}</Typography>}
          </Box>
          <Box sx={{
            width: 50, height: 50, borderRadius: "14px", flexShrink: 0,
            bgcolor: `${color}12`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon size={22} style={{ color }} />
          </Box>
        </Stack>
        {trend !== undefined && (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${BORDER}` }}>
            {trend >= 0
              ? <FiTrendingUp size={14} style={{ color: "#059669" }} />
              : <FiTrendingDown size={14} style={{ color: "#dc2626" }} />}
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: trend >= 0 ? "#059669" : "#dc2626" }}>
              {trend >= 0 ? "+" : ""}{trend}%
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#94a3b8" }}>vs last month</Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function ChartSkeleton({ height = 260 }) {
  return (
    <Box>
      <Skeleton variant="rectangular" height={height} sx={{ borderRadius: "10px" }} />
    </Box>
  );
}

function EmptyState({ icon: Icon = FiBarChart2, message }) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ py: 6 }}>
      <Box sx={{ width: 52, height: 52, borderRadius: "50%", bgcolor: "#f1f5f9",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={22} style={{ color: "#94a3b8" }} />
      </Box>
      <Typography sx={{ fontSize: "0.875rem", color: "#94a3b8", textAlign: "center" }}>{message || "No data available"}</Typography>
    </Stack>
  );
}

/* ── Chart components ──────────────────────────────────────────── */
function RevenueBarChart({ data, height = 260 }) {
  if (!data?.length) return <EmptyState message="No revenue data for this period" />;
  const chartData = data.map((item) => {
    const name = item.date || "";
    const label = name.match(/^\d{4}-\d{2}-\d{2}$/)
      ? new Date(name).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
      : name.length > 8 ? name.slice(0, 8) + "…" : name;
    return { name: label, value: item.revenue || 0 };
  });
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 40, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} angle={-40} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmtRupee} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v) => [`₹${v?.toLocaleString("en-IN")}`, "Revenue"]}
          contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: "0.8125rem" }}
        />
        <Bar dataKey="value" fill={P} radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function OrderDonutChart({ data, height = 300 }) {
  const DEFAULT_COLORS = { confirmed: "#10b981", processing: "#3b82f6", shipped: "#8b5cf6", pending: "#f59e0b", cancelled: "#ef4444", delivered: "#059669" };
  if (!data?.length) return <EmptyState message="No order status data" />;
  const chartData = data.map((item) => ({ name: item.status || "Unknown", value: item.count || 0 }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius="50%" outerRadius="72%" dataKey="value" paddingAngle={3}>
          {chartData.map((entry, i) => (
            <Cell key={entry.name} fill={DEFAULT_COLORS[entry.name] || `hsl(${i * 60}, 65%, 55%)`} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v, name) => [`${v} orders (${((v / chartData.reduce((s, d) => s + d.value, 0)) * 100).toFixed(1)}%)`, name]}
          contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: "0.8125rem" }}
        />
        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: "0.8rem" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function CategoryHorizontalChart({ data, height = 220 }) {
  if (!data?.length) return <EmptyState message="No category revenue data" />;
  const chartData = data.map((item) => {
    const name = item.category || "Unknown";
    return { name: name.length > 14 ? name.slice(0, 14) + "…" : name, value: item.revenue || 0 };
  });
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 90 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis type="number" tickFormatter={fmtRupee} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} width={90} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v) => [`₹${v?.toLocaleString("en-IN")}`, "Revenue"]}
          contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: "0.8125rem" }}
        />
        <Bar dataKey="value" fill="#3b82f6" radius={[0, 5, 5, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function PredictionGroupedChart({ data, height = 360 }) {
  if (!data?.length) return <EmptyState icon={FiTarget} message="No prediction data" />;
  const chartData = data.map((item) => ({
    name: (item.productName || "Unknown").slice(0, 14) + (item.productName?.length > 14 ? "…" : ""),
    "Last Month": item.lastMonthQuantity || 0,
    Predicted: item.predictedQuantity || 0,
    "Current": item.currentMonthQuantity || 0,
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 60, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} angle={-40} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={Math.round} axisLine={false} tickLine={false} />
        <Tooltip formatter={(v, name) => [`${v} units`, name]}
          contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: "0.8125rem" }} />
        <Legend verticalAlign="top" iconType="circle" iconSize={9} wrapperStyle={{ fontSize: "0.8rem" }} />
        <Bar dataKey="Last Month" fill="#94a3b8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Predicted"  fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Current"    fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function CategoryPredictionDonut({ data, height = 280 }) {
  const CAT_COLORS = { Paintings: "#3b82f6", Sculptures: "#10b981", "Handmade Crafts": "#f59e0b",
    "Digital Art": "#8b5cf6", Textiles: "#ef4444", Jewelry: "#ec4899", Pottery: "#14b8a6", Woodwork: "#84cc16" };
  if (!data?.length) return <EmptyState message="No category data" />;
  const chartData = data.slice(0, 6).map((item) => ({ name: item.category || "Other", value: item.predictedQuantity || 0 }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius="45%" outerRadius="68%" dataKey="value" paddingAngle={3}>
          {chartData.map((entry, i) => (
            <Cell key={entry.name} fill={CAT_COLORS[entry.name] || `hsl(${i * 60}, 65%, 55%)`} />
          ))}
        </Pie>
        <Tooltip formatter={(v, name) => [`${v} units`, name]}
          contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: "0.8125rem" }} />
        <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: "0.8rem" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

const STATUS_CHIP_COLORS = {
  confirmed: { bg: "#f0fdf4", color: "#059669", border: "#bbf7d0" },
  delivered:  { bg: "#f0fdf4", color: "#059669", border: "#bbf7d0" },
  processing: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  shipped:    { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  pending:    { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  cancelled:  { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

function StatusBadge({ status }) {
  const c = STATUS_CHIP_COLORS[status] || { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" };
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center",
      px: 1.25, height: 24, borderRadius: "20px",
      bgcolor: c.bg, border: `1px solid ${c.border}`,
    }}>
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: c.color, textTransform: "capitalize" }}>
        {status}
      </Typography>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════════════ */
export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState(30);
  const { data: summaryData, loading: summaryLoading, error: summaryError, refetch: refetchSummary } = useAnalyticsSummary(period);
  const { data: chartsData,  loading: chartsLoading,  refetch: refetchCharts }  = useAnalyticsCharts(period);
  const { data: predictionsData, loading: predictionsLoading, refetch: refetchPredictions } = usePredictions();

  const refetch = useCallback(() => { refetchSummary(); refetchCharts(); }, [refetchSummary, refetchCharts]);

  return (
    <>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
      <SEOHead
        title={`Analytics Dashboard - ${SEO_CONFIG.SITE_NAME}`}
        description="View sales analytics, revenue trends, and business insights."
        noindex={true} nofollow={true}
      />
      <AdminLayout>
        <Box sx={{ bgcolor: BG, minHeight: "100vh", p: { xs: 2, md: 3 } }}>

          {/* ── Page header ─────────────────────────────────────────── */}
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ mb: 3.5 }}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 0.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: `${P}15`,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FiBarChart2 size={18} style={{ color: P }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: "1.375rem", color: "#0f172a", letterSpacing: "-0.025em" }}>
                  Analytics Dashboard
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: "0.875rem", color: "#94a3b8", pl: 0.5 }}>
                Track your store performance and insights
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.25} alignItems="center">
              {/* Period pills */}
              <Stack direction="row" spacing={0.5} sx={{
                bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "10px", p: 0.5,
              }}>
                {[7, 30, 90].map((d) => (
                  <Button key={d} size="small" onClick={() => setPeriod(d)}
                    sx={{
                      minWidth: 48, height: 32, borderRadius: "8px", fontWeight: 700, fontSize: "0.8rem",
                      textTransform: "none",
                      bgcolor: period === d ? P : "transparent",
                      color:   period === d ? "#fff" : "#64748b",
                      "&:hover": { bgcolor: period === d ? P : "#f1f5f9" },
                      transition: "all 0.18s",
                    }}>
                    {d}D
                  </Button>
                ))}
              </Stack>

              <Button size="small" onClick={refetch} disabled={summaryLoading}
                sx={{
                  width: 40, height: 40, minWidth: 0, borderRadius: "10px",
                  border: `1px solid ${BORDER}`, bgcolor: "#fff", color: "#64748b",
                  "&:hover": { bgcolor: "#f8fafc", color: P },
                }}>
                <FiRefreshCw size={15} style={{ animation: summaryLoading ? "spin 0.8s linear infinite" : "none" }} />
              </Button>
            </Stack>
          </Stack>

          {/* ── Loading / error states ─────────────────────────────── */}
          {summaryLoading && !summaryData ? (
            <>
              <Grid container spacing={2.5} sx={{ mb: 3 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: "16px", p: 3 }}>
                      <Skeleton height={20} width="50%" sx={{ mb: 1.5 }} />
                      <Skeleton height={36} width="70%" sx={{ mb: 1 }} />
                      <Skeleton height={16} width="40%" />
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Stack alignItems="center" gap={2} sx={{ py: 8 }}>
                <OrbitLoader size="lg" />
                <Typography sx={{ fontSize: "0.875rem", color: "#94a3b8" }}>Loading analytics…</Typography>
              </Stack>
            </>
          ) : summaryError ? (
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={refetch}>Retry</Button>}
              sx={{ borderRadius: "12px", mb: 3 }}>
              <strong>Error loading analytics</strong> — {summaryError}
            </Alert>
          ) : summaryData ? (
            <Stack spacing={3}>

              {/* ── KPI Row ───────────────────────────────────────────── */}
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <KpiCard icon={FiDollarSign} label="Total Revenue" color="#10b981"
                    value={fmtCurrency(summaryData.summary?.totalRevenue || 0)}
                    sub={`${summaryData.summary?.totalOrders || 0} total orders`} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <KpiCard icon={FiShoppingCart} label={`Orders (${period}D)`} color="#3b82f6"
                    value={summaryData.summary?.ordersInPeriod || 0}
                    sub={fmtCurrency(summaryData.summary?.revenueInPeriod || 0)}
                    trend={summaryData.summary?.revenueGrowth} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <KpiCard icon={FiUsers} label="Total Users" color="#8b5cf6"
                    value={summaryData.summary?.totalUsers || 0}
                    sub={`+${summaryData.summary?.newUsersInPeriod || 0} new this period`} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <KpiCard icon={FiPackage} label="Avg Order Value" color="#f59e0b"
                    value={fmtCurrency(summaryData.summary?.avgOrderValue || 0)}
                    sub={`${summaryData.summary?.totalProducts || 0} products`} />
                </Grid>
              </Grid>

              {/* ── Charts: Revenue + Order Status ───────────────────── */}
              {chartsLoading ? (
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: "16px", p: 3 }}>
                      <Skeleton height={22} width="40%" sx={{ mb: 2 }} />
                      <ChartSkeleton height={280} />
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: "16px", p: 3 }}>
                      <Skeleton height={22} width="40%" sx={{ mb: 2 }} />
                      <ChartSkeleton height={280} />
                    </Card>
                  </Grid>
                </Grid>
              ) : chartsData ? (
                <>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, md: 8 }}>
                      <SectionCard title="Revenue Trend" subtitle={`Daily revenue for last ${period} days`}
                        icon={FiTrendingUp} iconColor="#10b981"
                        action={
                          <Box sx={{ px: 1.5, height: 28, display: "flex", alignItems: "center",
                            bgcolor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "20px" }}>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#059669" }}>
                              {fmtCurrency(summaryData.summary?.revenueInPeriod || 0)}
                            </Typography>
                          </Box>
                        }>
                        <RevenueBarChart data={chartsData.charts?.dailyData || []} height={280} />
                      </SectionCard>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <SectionCard title="Order Status" subtitle="Distribution by status" icon={FiPieChart} iconColor="#8b5cf6">
                        <OrderDonutChart data={chartsData.charts?.orderStatusDistribution || []} height={300} />
                      </SectionCard>
                    </Grid>
                  </Grid>

                  {/* ── Top Products + Revenue by Category ─────────────── */}
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <SectionCard title="Top Selling Products" subtitle="By quantity sold" icon={FiPackage} iconColor="#f59e0b">
                        {chartsData.charts?.topProducts?.length > 0 ? (
                          <Stack spacing={2}>
                            {chartsData.charts.topProducts.slice(0, 5).map((product, i) => {
                              const maxQty = chartsData.charts.topProducts[0]?.quantity || 1;
                              const pct = (product.quantity / maxQty) * 100;
                              return (
                                <Box key={i}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                                    <Stack direction="row" alignItems="center" spacing={1.25}>
                                      <Box sx={{
                                        width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                                        bgcolor: i === 0 ? "#fef9ec" : "#f8fafc",
                                        border: `1.5px solid ${i === 0 ? "#fcd34d" : "#e2e8f0"}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                      }}>
                                        <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, color: i === 0 ? "#d97706" : "#94a3b8" }}>
                                          {i + 1}
                                        </Typography>
                                      </Box>
                                      <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#0f172a",
                                        maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {product.name}
                                      </Typography>
                                    </Stack>
                                    <Typography sx={{ fontSize: "0.78rem", color: "#64748b", flexShrink: 0 }}>
                                      {product.quantity} · {fmtCurrency(product.revenue)}
                                    </Typography>
                                  </Stack>
                                  <LinearProgress variant="determinate" value={pct}
                                    sx={{
                                      height: 6, borderRadius: "4px", bgcolor: "#f1f5f9",
                                      "& .MuiLinearProgress-bar": { bgcolor: i === 0 ? "#f59e0b" : P, borderRadius: "4px" },
                                    }} />
                                </Box>
                              );
                            })}
                          </Stack>
                        ) : <EmptyState message="No product data available" />}
                      </SectionCard>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <SectionCard title="Revenue by Category" subtitle="Top categories" icon={FiBarChart2} iconColor="#3b82f6">
                        <CategoryHorizontalChart data={chartsData.charts?.revenueByCategory || []} height={240} />
                      </SectionCard>
                    </Grid>
                  </Grid>

                  {/* ── Orders by Day of Week ───────────────────────────── */}
                  <SectionCard title="Orders by Day of Week" subtitle="Weekly sales pattern" icon={FiCalendar} iconColor="#8b5cf6">
                    {(chartsData.charts?.weeklyData || []).length > 0 ? (
                      <Grid container spacing={1.5}>
                        {chartsData.charts.weeklyData.map((day, i) => {
                          const maxOrders = Math.max(...chartsData.charts.weeklyData.map((d) => d.orders || 0), 1);
                          const pct = ((day.orders || 0) / maxOrders) * 100;
                          const isWeekend = i === 0 || i === 6;
                          return (
                            <Grid key={day.day || i} size={{ xs: 12 / 4, sm: 12 / 7 }}>
                              <Box sx={{
                                p: 2, borderRadius: "12px", textAlign: "center",
                                bgcolor: isWeekend ? "#fdf8f5" : "#fff",
                                border: `1px solid ${isWeekend ? "rgba(139,34,82,0.12)" : BORDER}`,
                                transition: "all 0.22s",
                                "&:hover": { borderColor: P, boxShadow: `0 4px 16px rgba(139,34,82,0.1)` },
                              }}>
                                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: isWeekend ? P : "#94a3b8",
                                  mb: 1, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                  {(day.day || "").slice(0, 3)}
                                </Typography>
                                {/* Mini bar */}
                                <Box sx={{ height: 40, display: "flex", alignItems: "flex-end", justifyContent: "center", mb: 1 }}>
                                  <Box sx={{
                                    width: 16, borderRadius: "4px 4px 0 0",
                                    bgcolor: pct > 0 ? P : "#e2e8f0",
                                    height: `${Math.max(pct, 6)}%`,
                                    minHeight: 4, transition: "height 0.5s",
                                  }} />
                                </Box>
                                <Typography sx={{ fontSize: "1.125rem", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>
                                  {day.orders}
                                </Typography>
                                <Typography sx={{ fontSize: "0.65rem", color: "#94a3b8", mb: 0.5 }}>orders</Typography>
                                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#059669" }}>
                                  {fmtCurrency(day.revenue)}
                                </Typography>
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    ) : <EmptyState message="No weekly data available" />}
                  </SectionCard>
                </>
              ) : null}

              {/* ── Recent Orders ──────────────────────────────────────── */}
              <SectionCard title="Recent Orders" subtitle="Latest transactions" icon={FiShoppingCart} iconColor="#10b981">
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small" sx={{ minWidth: 600 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        {["Order ID", "Customer", "Items", "Total", "Status", "Date"].map((h) => (
                          <TableCell key={h} sx={{
                            fontWeight: 700, fontSize: "0.75rem", color: "#64748b",
                            textTransform: "uppercase", letterSpacing: "0.06em",
                            borderBottom: `1px solid ${BORDER}`, py: 1.25, px: 2,
                          }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {summaryData.recentOrders?.length > 0 ? (
                        summaryData.recentOrders.map((order) => (
                          <TableRow key={order._id} sx={{ "&:hover": { bgcolor: "#fafafa" }, "&:last-child td": { borderBottom: "none" } }}>
                            <TableCell sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                              <Box sx={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#64748b",
                                bgcolor: "#f8fafc", px: 1, py: 0.25, borderRadius: "6px", display: "inline-block" }}>
                                {(order.orderId || order._id || "").substring(0, 12)}…
                              </Box>
                            </TableCell>
                            <TableCell sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                              <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#0f172a" }}>{order.customer}</Typography>
                            </TableCell>
                            <TableCell sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                              <Box sx={{ display: "inline-flex", alignItems: "center", px: 1.25, height: 24,
                                bgcolor: "#f1f5f9", borderRadius: "20px" }}>
                                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569" }}>
                                  {order.itemCount} items
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                              <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
                                {fmtCurrency(order.total)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                              <StatusBadge status={order.status} />
                            </TableCell>
                            <TableCell sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                              <Typography sx={{ fontSize: "0.78rem", color: "#94a3b8" }}>{fmtDate(order.date)}</Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ borderBottom: "none", py: 0 }}>
                            <EmptyState icon={FiShoppingCart} message="No recent orders" />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </SectionCard>

              {/* ── AI Predictions ─────────────────────────────────────── */}
              <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: "16px", bgcolor: "#fff", overflow: "hidden" }}>
                {/* Header with gradient accent */}
                <Box sx={{
                  px: 3, pt: 2.5, pb: 2.5,
                  borderBottom: `1px solid ${BORDER}`,
                  background: "linear-gradient(135deg,#fdf8f5 0%,#fff 100%)",
                }}>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between"
                    alignItems={{ sm: "center" }} spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "rgba(139,34,82,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FiTarget size={18} style={{ color: P }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a" }}>
                          Product Order Predictions
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          AI-powered predictions based on historical order patterns
                        </Typography>
                      </Box>
                    </Stack>
                    <Button size="small" onClick={refetchPredictions} disabled={predictionsLoading}
                      startIcon={<FiRefreshCw size={14} style={{ animation: predictionsLoading ? "spin 0.8s linear infinite" : "none" }} />}
                      sx={{
                        bgcolor: P, color: "#fff", fontWeight: 700, borderRadius: "10px",
                        textTransform: "none", px: 2, height: 36, fontSize: "0.8125rem",
                        "&:hover": { bgcolor: P_DARK }, "&:disabled": { opacity: 0.6 },
                      }}>
                      Refresh
                    </Button>
                  </Stack>
                </Box>

                <Box sx={{ p: 3 }}>
                  {predictionsLoading ? (
                    <Stack alignItems="center" gap={2} sx={{ py: 6 }}>
                      <OrbitLoader />
                      <Typography sx={{ fontSize: "0.875rem", color: "#94a3b8" }}>Analyzing order patterns…</Typography>
                    </Stack>
                  ) : predictionsData?.predictions?.length > 0 ? (
                    <Stack spacing={3}>
                      {/* Summary mini-KPIs */}
                      <Grid container spacing={2}>
                        {[
                          { icon: FiActivity, color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.15)",
                            val: predictionsData.metadata?.summary?.totalProductsAnalyzed || 0, label: "Products Analyzed" },
                          { icon: FiPackage, color: "#64748b", bg: "#f8fafc", border: BORDER,
                            val: predictionsData.metadata?.summary?.totalLastMonthOrders || 0, label: "Last Month Orders" },
                          { icon: FiTarget, color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.15)",
                            val: predictionsData.metadata?.summary?.totalPredictedThisMonth || 0, label: "Predicted This Month" },
                          { icon: FiTrendingUp, color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)",
                            val: `${predictionsData.metadata?.currentMonthProgress?.percentComplete || 0}%`, label: "Month Progress" },
                        ].map(({ icon: Icon, color, bg, border, val, label }, i) => (
                          <Grid key={i} size={{ xs: 6, sm: 3 }}>
                            <Box sx={{ p: 2.5, borderRadius: "14px", textAlign: "center", bgcolor: bg, border: `1px solid ${border}` }}>
                              <Icon size={22} style={{ color }} />
                              <Typography sx={{ fontSize: "1.375rem", fontWeight: 900, color, mt: 1, mb: 0.25 }}>{val}</Typography>
                              <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>{label}</Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>

                      {/* Charts */}
                      <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, md: 8 }}>
                          <Box sx={{ bgcolor: "#fafbfc", border: `1px solid ${BORDER}`, borderRadius: "14px", p: 2.5 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                              <FiBarChart2 size={16} style={{ color: "#3b82f6" }} />
                              <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
                                Top 10 Product Predictions
                              </Typography>
                            </Stack>
                            <PredictionGroupedChart data={predictionsData.predictions} height={380} />
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ bgcolor: "#fafbfc", border: `1px solid ${BORDER}`, borderRadius: "14px", p: 2.5, height: "100%" }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                              <FiPieChart size={16} style={{ color: "#8b5cf6" }} />
                              <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
                                By Category
                              </Typography>
                            </Stack>
                            <CategoryPredictionDonut data={predictionsData.categoryPredictions} height={300} />
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Prediction detail table */}
                      <Box sx={{ bgcolor: "#fafbfc", border: `1px solid ${BORDER}`, borderRadius: "14px", overflow: "hidden" }}>
                        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${BORDER}` }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <FiPackage size={16} style={{ color: "#f59e0b" }} />
                            <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
                              Detailed Product Predictions
                            </Typography>
                          </Stack>
                        </Box>
                        <Box sx={{ overflowX: "auto" }}>
                          <Table size="small" sx={{ minWidth: 640 }}>
                            <TableHead>
                              <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                                {["Product", "Category", "Last Month", "Predicted", "Current", "Trend", "Confidence"].map((h) => (
                                  <TableCell key={h} sx={{
                                    fontWeight: 700, fontSize: "0.72rem", color: "#64748b",
                                    textTransform: "uppercase", letterSpacing: "0.06em",
                                    borderBottom: `1px solid ${BORDER}`, py: 1.25,
                                    textAlign: ["Last Month","Predicted","Current","Trend","Confidence"].includes(h) ? "center" : "left",
                                  }}>{h}</TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {predictionsData.predictions.map((item, idx) => (
                                <TableRow key={idx} sx={{ "&:hover": { bgcolor: "#fff" }, "&:last-child td": { borderBottom: "none" } }}>
                                  <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: "0.8125rem", color: "#0f172a" }}
                                      title={item.productName}>
                                      {item.productName?.length > 28 ? item.productName.slice(0, 28) + "…" : item.productName}
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                                    <Box sx={{ display: "inline-flex", alignItems: "center", px: 1.25, height: 22,
                                      bgcolor: "#f1f5f9", borderRadius: "20px" }}>
                                      <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#475569" }}>{item.category}</Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center", py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                                    <Typography sx={{ fontSize: "0.875rem", color: "#64748b" }}>{item.lastMonthQuantity}</Typography>
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center", py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 800, color: "#3b82f6" }}>{item.predictedQuantity}</Typography>
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center", py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#059669" }}>{item.currentMonthQuantity}</Typography>
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center", py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                                      {item.trendPercentage >= 0
                                        ? <FiTrendingUp size={13} style={{ color: "#059669" }} />
                                        : <FiTrendingDown size={13} style={{ color: "#dc2626" }} />}
                                      <Typography sx={{ fontSize: "0.8rem", fontWeight: 700,
                                        color: item.trendPercentage >= 0 ? "#059669" : "#dc2626" }}>
                                        {item.trendPercentage >= 0 ? "+" : ""}{item.trendPercentage}%
                                      </Typography>
                                    </Stack>
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center", py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                                    <Box sx={{
                                      display: "inline-flex", alignItems: "center", px: 1.25, height: 22, borderRadius: "20px",
                                      bgcolor: item.confidence === "High" ? "#f0fdf4" : item.confidence === "Medium" ? "#fffbeb" : "#f8fafc",
                                      border: `1px solid ${item.confidence === "High" ? "#bbf7d0" : item.confidence === "Medium" ? "#fde68a" : "#e2e8f0"}`,
                                    }}>
                                      <Typography sx={{ fontSize: "0.7rem", fontWeight: 700,
                                        color: item.confidence === "High" ? "#059669" : item.confidence === "Medium" ? "#d97706" : "#64748b" }}>
                                        {item.confidence}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Box>
                    </Stack>
                  ) : (
                    <EmptyState icon={FiTarget}
                      message="No prediction data available. Predictions require order history from previous months." />
                  )}
                </Box>
              </Card>

            </Stack>
          ) : null}
        </Box>
      </AdminLayout>
    </>
  );
}
