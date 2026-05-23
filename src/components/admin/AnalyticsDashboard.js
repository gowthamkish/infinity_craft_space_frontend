import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import MuiCard from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import MuiTable from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import MuiAlert from "@mui/material/Alert";
import MuiButton from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import LinearProgress from "@mui/material/LinearProgress";






import { OrbitLoader } from "../Loader";




import AdminLayout from "./AdminLayout";
import api from "../../api/axios";
import SEOHead, { SEO_CONFIG } from "../SEOHead";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiPackage,
  FiRefreshCw,
  FiBarChart2,
  FiPieChart,
  FiCalendar,
  FiTarget,
  FiActivity,
} from "react-icons/fi";

// Fast KPI cards + recent orders (~100ms)
const useAnalyticsSummary = (period = 30) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/admin/analytics/summary?period=${period}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch analytics summary");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

// Heavy aggregation charts (1–5s, loads after summary)
const useAnalyticsCharts = (period = 30) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/admin/analytics/charts?period=${period}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch analytics charts");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

// Custom hook for fetching predictions data
const usePredictions = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/predictions");
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch predictions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return { data, loading, error, refetch: fetchPredictions };
};

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, subtitle, trend, color, prefix = "" }) => (
  <MuiCard
    elevation={1}
    sx={{
      borderRadius: 3,
      border: "1px solid #e7e5e4",
      height: "100%",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 24px rgba(0,0,0,0.1)" },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={800} sx={{ color: "#1e293b", mb: 0.25 }}>
            {prefix}{typeof value === "number" ? value.toLocaleString("en-IN") : value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 48, height: 48, borderRadius: 2,
            background: `linear-gradient(135deg, ${color}20, ${color}40)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Icon size={24} style={{ color }} />
        </Box>
      </Stack>
      {trend !== undefined && (
        <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 1 }}>
          {trend >= 0 ? (
            <FiTrendingUp size={16} color="#059669" />
          ) : (
            <FiTrendingDown size={16} color="#dc2626" />
          )}
          <Typography variant="caption" sx={{ color: trend >= 0 ? "#059669" : "#dc2626", fontWeight: 600 }}>
            {trend >= 0 ? "+" : ""}{trend}%
          </Typography>
          <Typography variant="caption" color="text.secondary">vs last month</Typography>
        </Stack>
      )}
    </CardContent>
  </MuiCard>
);

const formatRupee = (d) => {
  if (d >= 100000) return `₹${(d / 100000).toFixed(0)}L`;
  if (d >= 1000) return `₹${(d / 1000).toFixed(0)}K`;
  return `₹${d}`;
};

// Recharts Bar Chart (replaces C3BarChart)
const C3BarChart = ({
  data,
  dataKey,
  nameKey,
  color = "#10b981",
  height = 250,
}) => {
  if (!data || data.length === 0) {
    return <p className="text-muted text-center py-4">No data available</p>;
  }

  const chartData = data.map((item) => {
    const name = item[nameKey] || "";
    const label = name.match(/^\d{4}-\d{2}-\d{2}$/)
      ? new Date(name).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
      : name.length > 8 ? name.slice(0, 8) + "…" : name;
    return { name: label, value: item[dataKey] || 0 };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 40, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" interval={0} />
        <YAxis tickFormatter={formatRupee} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => [`₹${v?.toLocaleString("en-IN")}`, "Revenue"]} />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Recharts Donut Chart (replaces C3DonutChart)
const C3DonutChart = ({ data, nameKey, valueKey, colors, height = 280 }) => {
  const defaultColors = {
    confirmed: "#10b981",
    processing: "#3b82f6",
    shipped: "#8b5cf6",
    pending: "#f59e0b",
    cancelled: "#ef4444",
    delivered: "#059669",
  };

  if (!data || data.length === 0) {
    return <p className="text-muted text-center py-4">No data available</p>;
  }

  const chartData = data.map((item) => ({
    name: item[nameKey] || "Unknown",
    value: item[valueKey] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="75%"
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
          labelLine={false}
        >
          {chartData.map((entry, i) => (
            <Cell
              key={entry.name}
              fill={colors?.[i] || defaultColors[entry.name] || `hsl(${i * 60}, 70%, 50%)`}
            />
          ))}
        </Pie>
        <Tooltip formatter={(v, name) => [`${v} (${((v / chartData.reduce((s, d) => s + d.value, 0)) * 100).toFixed(1)}%)`, name]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Recharts Horizontal Bar Chart (replaces C3CategoryChart)
const C3CategoryChart = ({
  data,
  dataKey,
  nameKey,
  color = "#3b82f6",
  height = 200,
}) => {
  if (!data || data.length === 0) {
    return <p className="text-muted text-center py-4">No data available</p>;
  }

  const chartData = data.map((item) => {
    const name = item[nameKey] || "Unknown";
    return { name: name.length > 12 ? name.slice(0, 12) + "…" : name, value: item[dataKey] || 0 };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 90 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={formatRupee} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
        <Tooltip formatter={(v) => [`₹${v?.toLocaleString("en-IN")}`, "Revenue"]} />
        <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Recharts Grouped Bar Chart (replaces C3PredictionChart)
const C3PredictionChart = ({ data, height = 350 }) => {
  if (!data || data.length === 0) {
    return <p className="text-muted text-center py-4">No prediction data available</p>;
  }

  const chartData = data.map((item) => {
    const name = item.productName || "Unknown";
    return {
      name: name.length > 15 ? name.slice(0, 15) + "…" : name,
      "Last Month": item.lastMonthQuantity || 0,
      Predicted: item.predictedQuantity || 0,
      "Current (So Far)": item.currentMonthQuantity || 0,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 60, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" interval={0} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(d) => Math.round(d)} />
        <Tooltip formatter={(v, name) => [`${v} units`, name]} />
        <Legend verticalAlign="top" />
        <Bar dataKey="Last Month" fill="#94a3b8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Predicted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Current (So Far)" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Recharts Donut Chart for category predictions (replaces C3CategoryPredictionChart)
const C3CategoryPredictionChart = ({ data, height = 280 }) => {
  const categoryColors = {
    Paintings: "#3b82f6",
    Sculptures: "#10b981",
    "Handmade Crafts": "#f59e0b",
    "Digital Art": "#8b5cf6",
    Textiles: "#ef4444",
    Jewelry: "#ec4899",
    Pottery: "#14b8a6",
    Woodwork: "#84cc16",
  };

  if (!data || data.length === 0) {
    return <p className="text-muted text-center py-4">No category data available</p>;
  }

  const chartData = data.slice(0, 6).map((item) => ({
    name: item.category || "Other",
    value: item.predictedQuantity || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius="50%"
          outerRadius="70%"
          dataKey="value"
        >
          {chartData.map((entry, i) => (
            <Cell
              key={entry.name}
              fill={categoryColors[entry.name] || `hsl(${i * 60}, 70%, 50%)`}
            />
          ))}
        </Pie>
        <Tooltip formatter={(v, name) => [`${v} units`, name]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState(30);
  const { data: summaryData, loading: summaryLoading, error: summaryError, refetch: refetchSummary } = useAnalyticsSummary(period);
  const { data: chartsData, loading: chartsLoading, refetch: refetchCharts } = useAnalyticsCharts(period);
  const {
    data: predictionsData,
    loading: predictionsLoading,
    refetch: refetchPredictions,
  } = usePredictions();

  const refetch = useCallback(() => { refetchSummary(); refetchCharts(); }, [refetchSummary, refetchCharts]);

  const formatCurrency = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value?.toLocaleString("en-IN") || 0}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: "success",
      processing: "info",
      shipped: "primary",
      delivered: "success",
      pending: "warning",
      cancelled: "danger",
    };
    return colors[status] || "secondary";
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <SEOHead
        title={`Analytics Dashboard - ${SEO_CONFIG.SITE_NAME}`}
        description="View sales analytics, revenue trends, and business insights."
        noindex={true}
        nofollow={true}
      />
      <AdminLayout>

            {/* Header */}
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} gap={2} sx={{ mb: 3 }}>
              <Box>
                <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 0.5 }}>
                  <FiBarChart2 size={22} color="#8B1A4A" />
                  <Typography variant="h4" fontWeight={800} sx={{ color: "#1c1917", letterSpacing: "-0.025em" }}>
                    Analytics Dashboard
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Track your store performance and insights
                </Typography>
              </Box>
              <Stack direction="row" gap={1} flexWrap="wrap">
                <ButtonGroup size="small">
                  {[7, 30, 90].map((days) => (
                    <MuiButton
                      key={days}
                      variant={period === days ? "contained" : "outlined"}
                      onClick={() => setPeriod(days)}
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                      {days}D
                    </MuiButton>
                  ))}
                </ButtonGroup>
                <MuiButton variant="outlined" size="small" onClick={refetch} disabled={summaryLoading}>
                  <FiRefreshCw size={16} style={{ animation: summaryLoading ? "spin 0.8s linear infinite" : "none" }} />
                </MuiButton>
              </Stack>
            </Stack>

            {summaryLoading && !summaryData ? (
              <Stack alignItems="center" gap={2} sx={{ py: 8 }}>
                <OrbitLoader size="lg" />
                <Typography variant="body2" color="text.secondary">Loading analytics…</Typography>
              </Stack>
            ) : summaryError ? (
              <MuiAlert
                severity="error"
                action={
                  <MuiButton color="inherit" size="small" onClick={refetch}>
                    Retry
                  </MuiButton>
                }
              >
                <strong>Error loading analytics</strong> — {summaryError}
              </MuiAlert>
            ) : summaryData ? (
              <>
                {/* Summary Stats — renders immediately (~100ms) */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                      icon={FiDollarSign}
                      title="Total Revenue"
                      value={formatCurrency(summaryData.summary?.totalRevenue || 0)}
                      subtitle={`${summaryData.summary?.totalOrders || 0} total orders`}
                      color="#10b981"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                      icon={FiShoppingCart}
                      title={`Orders (${period}D)`}
                      value={summaryData.summary?.ordersInPeriod || 0}
                      subtitle={formatCurrency(summaryData.summary?.revenueInPeriod || 0)}
                      trend={summaryData.summary?.revenueGrowth}
                      color="#3b82f6"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                      icon={FiUsers}
                      title="Total Users"
                      value={summaryData.summary?.totalUsers || 0}
                      subtitle={`+${summaryData.summary?.newUsersInPeriod || 0} new this period`}
                      color="#8b5cf6"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                      icon={FiPackage}
                      title="Avg Order Value"
                      value={formatCurrency(summaryData.summary?.avgOrderValue || 0)}
                      subtitle={`${summaryData.summary?.totalProducts || 0} products`}
                      color="#f59e0b"
                    />
                  </Grid>
                </Grid>

                {/* Charts — progressive load (1–5s) */}
                {chartsLoading ? (
                  <Stack alignItems="center" gap={2} sx={{ py: 6, mb: 3 }}>
                    <OrbitLoader />
                    <Typography variant="body2" color="text.secondary">Loading charts…</Typography>
                  </Stack>
                ) : chartsData ? (
                  <>

                {/* Charts Row */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {/* Revenue Chart */}
                  <Grid item xs={12}>
                    <MuiCard elevation={1} sx={{ borderRadius: 3, border: "1px solid #e7e5e4" }}>
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                          <Box>
                            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.25 }}>
                              <FiTrendingUp size={18} color="#10b981" />
                              <Typography variant="subtitle1" fontWeight={700}>Revenue Trend</Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              Daily revenue for last {period} days
                            </Typography>
                          </Box>
                          <Chip label={formatCurrency(summaryData.summary?.revenueInPeriod || 0)} size="small" />
                        </Stack>
                        <C3BarChart
                          data={chartsData.charts?.dailyData || []}
                          dataKey="revenue"
                          nameKey="date"
                          color="#10b981"
                          height={280}
                        />
                      </CardContent>
                    </MuiCard>
                  </Grid>

                  {/* Order Status Distribution */}
                  <Grid item xs={12}>
                    <MuiCard
                      elevation={1} sx={{ borderRadius: 3, border: "1px solid #e7e5e4", height: "100%" }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}><FiPieChart size={20} color="#8b5cf6" /><Typography variant="subtitle1" fontWeight={700}>Order Status</Typography></Stack>
                        <C3DonutChart
                          data={chartsData.charts?.orderStatusDistribution || []}
                          nameKey="status"
                          valueKey="count"
                          height={320}
                        />
                      </CardContent>
                    </MuiCard>
                  </Grid>
                </Grid>

                {/* Second Charts Row */}
                <Grid container spacing={2} sx={{}}>
                  {/* Top Products */}
                  <Grid item xs={12}>
                    <MuiCard
                      elevation={1} sx={{ borderRadius: 3, border: "1px solid #e7e5e4", height: "100%" }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}><FiPackage size={20} color="#f59e0b" /><Typography variant="subtitle1" fontWeight={700}>Top Selling Products</Typography></Stack>
                        {chartsData.charts?.topProducts?.length > 0 ? (
                          <div>
                            {chartsData.charts.topProducts
                              .slice(0, 5)
                              .map((product, i) => {
                                const maxQty =
                                  chartsData.charts.topProducts[0]?.quantity || 1;
                                const percent =
                                  (product.quantity / maxQty) * 100;
                                return (
                                  <Box key={i} sx={{ mb: 2 }}>
                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: "60%" }}>
                                        {product.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {product.quantity} sold · {formatCurrency(product.revenue)}
                                      </Typography>
                                    </Stack>
                                    <LinearProgress variant="determinate" value={percent} />
                                  </Box>
                                );
                              })}
                          </div>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No product data available
                          </Typography>
                        )}
                      </CardContent>
                    </MuiCard>
                  </Grid>

                  {/* Revenue by Category */}
                  <Grid item xs={12}>
                    <MuiCard
                      elevation={1} sx={{ borderRadius: 3, border: "1px solid #e7e5e4", height: "100%" }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}><FiBarChart2 size={20} color="#3b82f6" /><Typography variant="subtitle1" fontWeight={700}>Revenue by Category</Typography></Stack>
                        <C3CategoryChart
                          data={chartsData.charts?.revenueByCategory || []}
                          dataKey="revenue"
                          nameKey="category"
                          color="#3b82f6"
                          height={220}
                        />
                      </CardContent>
                    </MuiCard>
                  </Grid>
                </Grid>

                {/* Weekly Pattern */}
                <Grid container spacing={2} sx={{}}>
                  <Grid item xs={12}>
                    <MuiCard
                      elevation={1} sx={{ borderRadius: 3, border: "1px solid #e7e5e4" }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}><FiCalendar size={20} color="#8b5cf6" /><Typography variant="subtitle1" fontWeight={700}>Orders by Day of Week</Typography></Stack>
                        <Grid container spacing={1.5}>
                          {(chartsData.charts?.weeklyData || []).map((day, i) => (
                            <Grid item xs={6} sm={4} md={3} lg={12 / 7} key={day.day || i}>
                              <Box
                                sx={{
                                  p: 2, borderRadius: 2, textAlign: "center",
                                  background: i === 0 || i === 6 ? "#f5f5f4" : "#fff",
                                  border: "1px solid #e7e5e4",
                                }}
                              >
                                <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>{day.day}</Typography>
                                <Typography variant="h5" fontWeight={800} sx={{ color: "#3b82f6" }}>
                                  {day.orders}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">orders</Typography>
                                <Typography variant="caption" sx={{ display: "block", color: "#059669", fontWeight: 600, mt: 0.5 }}>
                                  {formatCurrency(day.revenue)}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </MuiCard>
                  </Grid>
                </Grid>
                  </>
                ) : null}

                {/* Recent Orders Table — from summary (fast) */}
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <MuiCard
                      elevation={1} sx={{ borderRadius: 3, border: "1px solid #e7e5e4" }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}><FiShoppingCart size={20} color="#10b981" /><Typography variant="subtitle1" fontWeight={700}>Recent Orders</Typography></Stack>
                        <div className="table-responsive">
                          <MuiTable>
                            <TableHead style={{ backgroundColor: "#f8fafc" }}>
                              <TableRow>
                                <TableCell component="th">Order ID</TableCell>
                                <TableCell component="th">Customer</TableCell>
                                <TableCell component="th">Items</TableCell>
                                <TableCell component="th">Total</TableCell>
                                <TableCell component="th">Status</TableCell>
                                <TableCell component="th">Date</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {summaryData.recentOrders?.length > 0 ? (
                                summaryData.recentOrders.map((order) => (
                                  <TableRow key={order._id}>
                                    <TableCell>
                                      <code style={{ fontSize: "0.75rem" }}>
                                        {order.orderId?.substring(0, 12) ||
                                          order._id?.substring(0, 12)}
                                        ...
                                      </code>
                                    </TableCell>
                                    <TableCell>{order.customer}</TableCell>
                                    <TableCell>
                                      <Chip label={`${order.itemCount} items`} size="small" />
                                    </TableCell>
                                    <TableCell className="fw-bold">
                                      {formatCurrency(order.total)}
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={order.status}
                                        size="small"
                                        color={
                                          order.status === "confirmed" || order.status === "delivered" ? "success" :
                                          order.status === "processing" ? "info" :
                                          order.status === "shipped" ? "primary" :
                                          order.status === "pending" ? "warning" :
                                          order.status === "cancelled" ? "error" : "default"
                                        }
                                        sx={{ textTransform: "capitalize" }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="caption" color="text.secondary">
                                        {formatDate(order.date)}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell
                                    colSpan={6}
                                    className="text-center text-muted py-4"
                                  >
                                    No recent orders
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </MuiTable>
                        </div>
                      </CardContent>
                    </MuiCard>
                  </Grid>
                </Grid>

                {/* Product Predictions Section */}
                <Grid container spacing={2} sx={{}}>
                  <Grid item xs={12}>
                    <MuiCard
                      elevation={1} sx={{ borderRadius: 3, border: "1px solid #e7e5e4" }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={2} sx={{ mb: 3 }}>
                          <Box>
                            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
                              <FiTarget size={20} color="#8b5cf6" />
                              <Typography variant="subtitle1" fontWeight={700}>Product Order Predictions</Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              AI-powered predictions for current month based on historical order patterns
                            </Typography>
                          </Box>
                          <MuiButton variant="contained"
                            size="small"
                            onClick={refetchPredictions}
                            disabled={predictionsLoading}
                          >
                            <FiRefreshCw
                              size={16}
                              style={{ marginRight: 4, animation: predictionsLoading ? "spin 0.8s linear infinite" : "none" }}
                            />
                            Refresh
                          </MuiButton>
                        </Stack>

                        {predictionsLoading ? (
                          <Stack alignItems="center" gap={2} sx={{ py: 6 }}>
                            <OrbitLoader />
                            <Typography variant="body2" color="text.secondary">
                              Analyzing order patterns…
                            </Typography>
                          </Stack>
                        ) : predictionsData?.predictions?.length > 0 ? (
                          <>
                            {/* Prediction Summary Cards */}
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              <Grid item xs={6} sm={3}>
                                <Box sx={{ p: 2, borderRadius: 2, textAlign: "center", background: "linear-gradient(135deg, #8b5cf620, #8b5cf640)", border: "1px solid #8b5cf630" }}>
                                  <FiActivity size={24} style={{ color: "#8b5cf6" }} />
                                  <Typography variant="h6" fontWeight={800} sx={{ color: "#8b5cf6", mt: 1 }}>
                                    {predictionsData.metadata?.summary?.totalProductsAnalyzed || 0}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">Products Analyzed</Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Box sx={{ p: 2, borderRadius: 2, textAlign: "center", background: "linear-gradient(135deg, #94a3b820, #94a3b840)", border: "1px solid #94a3b830" }}>
                                  <FiPackage size={24} style={{ color: "#64748b" }} />
                                  <Typography variant="h6" fontWeight={800} sx={{ color: "#64748b", mt: 1 }}>
                                    {predictionsData.metadata?.summary?.totalLastMonthOrders || 0}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">Last Month Orders</Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Box sx={{ p: 2, borderRadius: 2, textAlign: "center", background: "linear-gradient(135deg, #3b82f620, #3b82f640)", border: "1px solid #3b82f630" }}>
                                  <FiTarget size={24} style={{ color: "#3b82f6" }} />
                                  <Typography variant="h6" fontWeight={800} sx={{ color: "#3b82f6", mt: 1 }}>
                                    {predictionsData.metadata?.summary?.totalPredictedThisMonth || 0}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">Predicted This Month</Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Box sx={{ p: 2, borderRadius: 2, textAlign: "center", background: "linear-gradient(135deg, #10b98120, #10b98140)", border: "1px solid #10b98130" }}>
                                  <FiTrendingUp size={24} style={{ color: "#10b981" }} />
                                  <Typography variant="h6" fontWeight={800} sx={{ color: "#10b981", mt: 1 }}>
                                    {predictionsData.metadata?.currentMonthProgress?.percentComplete || 0}%
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">Month Progress</Typography>
                                </Box>
                              </Grid>
                            </Grid>

                            <Grid container spacing={2} sx={{}}>
                              {/* Main Prediction Chart */}
                              <Grid item xs={12}>
                                <MuiCard
                                  className="border-0 h-100"
                                  style={{
                                    borderRadius: "12px",
                                    background: "#f8fafc",
                                  }}
                                >
                                  <CardContent sx={{ p: 2 }}>
                                    <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}><FiBarChart2 size={18} color="#3b82f6" /><Typography variant="subtitle2" fontWeight={700}>Top 10 Product Predictions</Typography></Stack>
                                    <C3PredictionChart
                                      data={predictionsData.predictions}
                                      height={380}
                                    />
                                    <div className="d-flex justify-content-center gap-4 mt-2">
                                      <div className="d-flex align-items-center">
                                        <div
                                          className="me-2"
                                          style={{
                                            width: "12px",
                                            height: "12px",
                                            borderRadius: "3px",
                                            backgroundColor: "#94a3b8",
                                          }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                          Last Month Actual
                                        </Typography>
                                      </div>
                                      <div className="d-flex align-items-center">
                                        <div
                                          className="me-2"
                                          style={{
                                            width: "12px",
                                            height: "12px",
                                            borderRadius: "3px",
                                            backgroundColor: "#3b82f6",
                                          }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                          Predicted
                                        </Typography>
                                      </div>
                                      <div className="d-flex align-items-center">
                                        <div
                                          className="me-2"
                                          style={{
                                            width: "12px",
                                            height: "12px",
                                            borderRadius: "3px",
                                            backgroundColor: "#10b981",
                                          }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                          Current Month (So Far)
                                        </Typography>
                                      </div>
                                    </div>
                                  </CardContent>
                                </MuiCard>
                              </Grid>

                              {/* Category Prediction Donut */}
                              <Grid item xs={12}>
                                <MuiCard
                                  className="border-0 h-100"
                                  style={{
                                    borderRadius: "12px",
                                    background: "#f8fafc",
                                  }}
                                >
                                  <CardContent sx={{ p: 2 }}>
                                    <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}><FiPieChart size={18} color="#8b5cf6" /><Typography variant="subtitle2" fontWeight={700}>Predictions by Category</Typography></Stack>
                                    <C3CategoryPredictionChart
                                      data={predictionsData.categoryPredictions}
                                      height={300}
                                    />
                                  </CardContent>
                                </MuiCard>
                              </Grid>
                            </Grid>

                            {/* Detailed Predictions Table */}
                            <MuiCard
                              className="border-0 mt-4"
                              style={{
                                borderRadius: "12px",
                                background: "#f8fafc",
                              }}
                            >
                              <CardContent sx={{ p: 2 }}>
                                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}><FiPackage size={18} color="#f59e0b" /><Typography variant="subtitle2" fontWeight={700}>Detailed Product Predictions</Typography></Stack>
                                <div className="table-responsive">
                                  <MuiTable>
                                    <TableHead
                                      style={{ backgroundColor: "#e2e8f0" }}
                                    >
                                      <TableRow>
                                        <TableCell component="th">Product</TableCell>
                                        <TableCell component="th">Category</TableCell>
                                        <TableCell component="th" className="text-center">
                                          Last Month
                                        </TableCell>
                                        <TableCell component="th" className="text-center">
                                          Predicted
                                        </TableCell>
                                        <TableCell component="th" className="text-center">Current</TableCell>
                                        <TableCell component="th" className="text-center">Trend</TableCell>
                                        <TableCell component="th" className="text-center">
                                          Confidence
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {predictionsData.predictions.map(
                                        (item, index) => (
                                          <TableRow key={index}>
                                            <TableCell>
                                              <span
                                                className="fw-medium"
                                                title={item.productName}
                                              >
                                                {item.productName?.length > 25
                                                  ? item.productName.substring(
                                                      0,
                                                      25,
                                                    ) + "..."
                                                  : item.productName}
                                              </span>
                                            </TableCell>
                                            <TableCell>
                                              <Chip label={item.category} size="small" />
                                            </TableCell>
                                            <TableCell className="text-center">
                                              <span className="text-muted">
                                                {item.lastMonthQuantity}
                                              </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                              <span className="fw-bold text-primary">
                                                {item.predictedQuantity}
                                              </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                              <span className="text-success">
                                                {item.currentMonthQuantity}
                                              </span>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>
                                              {item.trendPercentage >= 0 ? (
                                                <Chip
                                                  icon={<FiTrendingUp size={12} />}
                                                  label={`+${item.trendPercentage}%`}
                                                  size="small"
                                                  color="success"
                                                />
                                              ) : (
                                                <Chip
                                                  icon={<FiTrendingDown size={12} />}
                                                  label={`${item.trendPercentage}%`}
                                                  size="small"
                                                  color="error"
                                                />
                                              )}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>
                                              <Chip
                                                label={item.confidence}
                                                size="small"
                                                color={
                                                  item.confidence === "High" ? "success" :
                                                  item.confidence === "Medium" ? "warning" : "default"
                                                }
                                              />
                                            </TableCell>
                                          </TableRow>
                                        ),
                                      )}
                                    </TableBody>
                                  </MuiTable>
                                </div>
                              </CardContent>
                            </MuiCard>
                          </>
                        ) : (
                          <div className="text-center py-5">
                            <FiTarget size={48} className="text-muted mb-3" />
                            <Typography variant="body2" color="text.secondary">
                              No prediction data available. Predictions require
                              order history from previous months.
                            </Typography>
                          </div>
                        )}
                      </CardContent>
                    </MuiCard>
                  </Grid>
                </Grid>
              </>
            ) : null}
      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* C3 Chart Customizations */
        .c3-chart-arc path {
          stroke: white;
          stroke-width: 2px;
        }
        
        .c3-chart-arc text {
          fill: white;
          font-weight: 600;
          font-size: 12px;
        }
        
        .c3-bar {
          stroke: none;
        }
        
        .c3-axis-x .tick text {
          font-size: 11px;
        }
        
        .c3-axis-y .tick text {
          font-size: 11px;
        }
        
        .c3-tooltip {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .c3-tooltip th {
          background-color: #1e293b;
          color: white;
          padding: 8px 12px;
          border-radius: 8px 8px 0 0;
        }
        
        .c3-tooltip td {
          padding: 8px 12px;
        }
        
        .c3-legend-item text {
          font-size: 12px;
        }
        
        .c3 svg {
          font-family: inherit;
        }
        
        .c3-grid line {
          stroke: #e2e8f0;
        }
      `}</style>
      </AdminLayout>
    </>
  );
}
