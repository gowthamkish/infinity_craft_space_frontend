import React, { useState, useEffect, useCallback, useRef } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ProgressBar from "react-bootstrap/ProgressBar";
import Header from "../header";
import api from "../../api/axios";
import SEOHead, { SEO_CONFIG } from "../SEOHead";
import c3 from "c3";
import "c3/c3.css";
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

// Custom hook for fetching analytics data
const useAnalytics = (period = 30) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/api/admin/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, error, refetch: fetchAnalytics };
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
      const token = localStorage.getItem("token");
      const res = await api.get("/api/admin/predictions", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  color,
  prefix = "",
}) => (
  <Card
    className="h-100 border-0 shadow-sm"
    style={{
      borderRadius: "16px",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
    }}
  >
    <Card.Body className="p-4">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <p className="text-muted mb-1" style={{ fontSize: "0.875rem" }}>
            {title}
          </p>
          <h3 className="mb-0 fw-bold" style={{ color: "#1e293b" }}>
            {prefix}
            {typeof value === "number" ? value.toLocaleString("en-IN") : value}
          </h3>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${color}20, ${color}40)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={24} style={{ color }} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 d-flex align-items-center">
          {trend >= 0 ? (
            <FiTrendingUp size={16} className="text-success me-1" />
          ) : (
            <FiTrendingDown size={16} className="text-danger me-1" />
          )}
          <span className={trend >= 0 ? "text-success" : "text-danger"}>
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
          <span className="text-muted ms-1" style={{ fontSize: "0.75rem" }}>
            vs last month
          </span>
        </div>
      )}
    </Card.Body>
  </Card>
);

// C3 Bar Chart Component
const C3BarChart = ({
  data,
  dataKey,
  nameKey,
  color = "#10b981",
  height = 250,
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !chartRef.current) return;

    // Prepare data for C3
    const categories = data.map((item) => {
      const name = item[nameKey] || "";
      // Format date if it looks like a date
      if (name.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const date = new Date(name);
        return date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        });
      }
      return name.length > 8 ? name.substring(0, 8) + "..." : name;
    });
    const values = ["Revenue", ...data.map((item) => item[dataKey] || 0)];

    // Destroy existing chart safely
    if (chartInstance.current) {
      try {
        chartInstance.current.destroy();
      } catch (e) {
        // Ignore destroy errors
      }
      chartInstance.current = null;
    }

    // Create new chart
    const chart = c3.generate({
      bindto: chartRef.current,
      data: {
        columns: [values],
        type: "bar",
        colors: {
          Revenue: color,
        },
      },
      bar: {
        width: {
          ratio: 0.6,
        },
      },
      axis: {
        x: {
          type: "category",
          categories: categories,
          tick: {
            rotate: -45,
            multiline: false,
          },
          height: 60,
        },
        y: {
          tick: {
            format: (d) => {
              if (d >= 100000) return `₹${(d / 100000).toFixed(0)}L`;
              if (d >= 1000) return `₹${(d / 1000).toFixed(0)}K`;
              return `₹${d}`;
            },
          },
        },
      },
      legend: {
        show: false,
      },
      tooltip: {
        format: {
          value: (value) => `₹${value?.toLocaleString("en-IN") || 0}`,
        },
      },
      size: {
        height: height,
      },
      padding: {
        bottom: 10,
        right: 20,
      },
      grid: {
        y: {
          show: true,
        },
      },
    });
    chartInstance.current = chart;

    return () => {
      if (chart) {
        try {
          chart.destroy();
        } catch (e) {
          // Ignore destroy errors
        }
      }
    };
  }, [data, dataKey, nameKey, color, height]);

  if (!data || data.length === 0) {
    return <p className="text-muted text-center py-4">No data available</p>;
  }

  return <div ref={chartRef} />;
};

// C3 Donut Chart Component
const C3DonutChart = ({ data, nameKey, valueKey, colors, height = 280 }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const defaultColors = {
    confirmed: "#10b981",
    processing: "#3b82f6",
    shipped: "#8b5cf6",
    pending: "#f59e0b",
    cancelled: "#ef4444",
    delivered: "#059669",
  };

  useEffect(() => {
    if (!data || data.length === 0 || !chartRef.current) return;

    // Prepare data for C3
    const columns = data.map((item) => [
      item[nameKey] || "Unknown",
      item[valueKey] || 0,
    ]);

    // Prepare color pattern
    const colorPattern = {};
    data.forEach((item, i) => {
      const name = item[nameKey] || "Unknown";
      colorPattern[name] =
        colors?.[i] || defaultColors[name] || `hsl(${i * 60}, 70%, 50%)`;
    });

    // Destroy existing chart safely
    if (chartInstance.current) {
      try {
        chartInstance.current.destroy();
      } catch (e) {
        // Ignore destroy errors
      }
      chartInstance.current = null;
    }

    // Create new chart
    const chart = c3.generate({
      bindto: chartRef.current,
      data: {
        columns: columns,
        type: "donut",
        colors: colorPattern,
      },
      donut: {
        title: "Orders",
        width: 40,
        label: {
          format: (value) => value,
        },
      },
      legend: {
        position: "right",
      },
      tooltip: {
        format: {
          value: (value, ratio) => `${value} (${(ratio * 100).toFixed(1)}%)`,
        },
      },
      size: {
        height: height,
      },
    });
    chartInstance.current = chart;

    return () => {
      if (chart) {
        try {
          chart.destroy();
        } catch (e) {
          // Ignore destroy errors
        }
      }
    };
  }, [data, nameKey, valueKey, colors, height]);

  if (!data || data.length === 0) {
    return <p className="text-muted text-center py-4">No data available</p>;
  }

  return <div ref={chartRef} />;
};

// C3 Horizontal Bar Chart for Categories
const C3CategoryChart = ({
  data,
  dataKey,
  nameKey,
  color = "#3b82f6",
  height = 200,
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !chartRef.current) return;

    // Prepare data for C3 - horizontal bar chart
    const categories = data.map((item) => {
      const name = item[nameKey] || "Unknown";
      return name.length > 12 ? name.substring(0, 12) + "..." : name;
    });
    const values = ["Revenue", ...data.map((item) => item[dataKey] || 0)];

    // Destroy existing chart safely
    if (chartInstance.current) {
      try {
        chartInstance.current.destroy();
      } catch (e) {
        // Ignore destroy errors
      }
      chartInstance.current = null;
    }

    // Create new chart
    const chart = c3.generate({
      bindto: chartRef.current,
      data: {
        columns: [values],
        type: "bar",
        colors: {
          Revenue: color,
        },
      },
      bar: {
        width: {
          ratio: 0.7,
        },
      },
      axis: {
        rotated: true,
        x: {
          type: "category",
          categories: categories,
        },
        y: {
          tick: {
            format: (d) => {
              if (d >= 100000) return `₹${(d / 100000).toFixed(0)}L`;
              if (d >= 1000) return `₹${(d / 1000).toFixed(0)}K`;
              return `₹${d}`;
            },
          },
        },
      },
      legend: {
        show: false,
      },
      tooltip: {
        format: {
          value: (value) => `₹${value?.toLocaleString("en-IN") || 0}`,
        },
      },
      size: {
        height: height,
      },
      padding: {
        left: 100,
      },
    });
    chartInstance.current = chart;

    return () => {
      if (chart) {
        try {
          chart.destroy();
        } catch (e) {
          // Ignore destroy errors
        }
      }
    };
  }, [data, dataKey, nameKey, color, height]);

  if (!data || data.length === 0) {
    return <p className="text-muted text-center py-4">No data available</p>;
  }

  return <div ref={chartRef} />;
};

// C3 Prediction Chart Component - Grouped bar chart comparing last month vs predicted
const C3PredictionChart = ({ data, height = 350 }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !chartRef.current) return;

    // Prepare data for C3 - grouped bar chart
    const categories = data.map((item) => {
      const name = item.productName || "Unknown";
      return name.length > 15 ? name.substring(0, 15) + "..." : name;
    });

    const lastMonthData = [
      "Last Month",
      ...data.map((item) => item.lastMonthQuantity || 0),
    ];
    const predictedData = [
      "Predicted",
      ...data.map((item) => item.predictedQuantity || 0),
    ];
    const currentMonthData = [
      "Current (So Far)",
      ...data.map((item) => item.currentMonthQuantity || 0),
    ];

    // Destroy existing chart safely
    if (chartInstance.current) {
      try {
        chartInstance.current.destroy();
      } catch (e) {
        // Ignore destroy errors
      }
      chartInstance.current = null;
    }

    // Create new chart
    const chart = c3.generate({
      bindto: chartRef.current,
      data: {
        columns: [lastMonthData, predictedData, currentMonthData],
        type: "bar",
        colors: {
          "Last Month": "#94a3b8",
          Predicted: "#3b82f6",
          "Current (So Far)": "#10b981",
        },
        groups: [],
      },
      bar: {
        width: {
          ratio: 0.7,
        },
      },
      axis: {
        x: {
          type: "category",
          categories: categories,
          tick: {
            rotate: -45,
            multiline: false,
          },
          height: 80,
        },
        y: {
          label: {
            text: "Quantity",
            position: "outer-middle",
          },
          tick: {
            format: (d) => Math.round(d),
          },
        },
      },
      legend: {
        position: "top",
      },
      tooltip: {
        format: {
          value: (value) => `${value} units`,
        },
      },
      size: {
        height: height,
      },
      padding: {
        bottom: 20,
        right: 20,
      },
      grid: {
        y: {
          show: true,
        },
      },
    });
    chartInstance.current = chart;

    return () => {
      if (chart) {
        try {
          chart.destroy();
        } catch (e) {
          // Ignore destroy errors
        }
      }
    };
  }, [data, height]);

  if (!data || data.length === 0) {
    return (
      <p className="text-muted text-center py-4">
        No prediction data available
      </p>
    );
  }

  return <div ref={chartRef} />;
};

// C3 Category Prediction Donut Chart
const C3CategoryPredictionChart = ({ data, height = 280 }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

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

  useEffect(() => {
    if (!data || data.length === 0 || !chartRef.current) return;

    // Prepare data for C3
    const columns = data
      .slice(0, 6)
      .map((item) => [item.category || "Other", item.predictedQuantity || 0]);

    // Prepare color pattern
    const colorPattern = {};
    data.slice(0, 6).forEach((item, i) => {
      const name = item.category || "Other";
      colorPattern[name] = categoryColors[name] || `hsl(${i * 60}, 70%, 50%)`;
    });

    // Destroy existing chart safely
    if (chartInstance.current) {
      try {
        chartInstance.current.destroy();
      } catch (e) {
        // Ignore destroy errors
      }
      chartInstance.current = null;
    }

    // Create new chart
    const chart = c3.generate({
      bindto: chartRef.current,
      data: {
        columns: columns,
        type: "donut",
        colors: colorPattern,
      },
      donut: {
        title: "Predicted",
        width: 40,
        label: {
          format: (value) => value,
        },
      },
      legend: {
        position: "right",
      },
      tooltip: {
        format: {
          value: (value, ratio) =>
            `${value} units (${(ratio * 100).toFixed(1)}%)`,
        },
      },
      size: {
        height: height,
      },
    });
    chartInstance.current = chart;

    return () => {
      if (chart) {
        try {
          chart.destroy();
        } catch (e) {
          // Ignore destroy errors
        }
      }
    };
  }, [data, height]);

  if (!data || data.length === 0) {
    return (
      <p className="text-muted text-center py-4">No category data available</p>
    );
  }

  return <div ref={chartRef} />;
};

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState(30);
  const { data, loading, error, refetch } = useAnalytics(period);
  const {
    data: predictionsData,
    loading: predictionsLoading,
    refetch: refetchPredictions,
  } = usePredictions();

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
      <div className="App">
        <Header />
        <div
          className="main-container"
          style={{
            backgroundColor: "#f8fafc",
            minHeight: "100vh",
            paddingTop: "110px",
          }}
        >
          <Container fluid className="px-3 px-md-4 pb-5">
            {/* Header */}
            <Row className="mb-4">
              <Col>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                  <div>
                    <h1
                      className="mb-2"
                      style={{
                        fontSize: "clamp(1.5rem, 4vw, 2rem)",
                        fontWeight: "700",
                        color: "#1e293b",
                      }}
                    >
                      <FiBarChart2
                        size={32}
                        className="me-2"
                        style={{ color: "#3b82f6" }}
                      />
                      Analytics Dashboard
                    </h1>
                    <p className="text-muted mb-0">
                      Track your store performance and insights
                    </p>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <ButtonGroup size="sm">
                      {[7, 30, 90].map((days) => (
                        <Button
                          key={days}
                          variant={
                            period === days ? "primary" : "outline-primary"
                          }
                          onClick={() => setPeriod(days)}
                        >
                          {days}D
                        </Button>
                      ))}
                    </ButtonGroup>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={refetch}
                      disabled={loading}
                    >
                      <FiRefreshCw
                        size={16}
                        className={loading ? "spin" : ""}
                      />
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>

            {loading && !data ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading analytics...</p>
              </div>
            ) : error ? (
              <Alert variant="danger">
                <Alert.Heading>Error loading analytics</Alert.Heading>
                <p>{error}</p>
                <Button variant="outline-danger" onClick={refetch}>
                  Retry
                </Button>
              </Alert>
            ) : data ? (
              <>
                {/* Summary Stats */}
                <Row className="g-4 mb-4">
                  <Col xs={12} sm={6} lg={3}>
                    <StatCard
                      icon={FiDollarSign}
                      title="Total Revenue"
                      value={formatCurrency(data.summary?.totalRevenue || 0)}
                      subtitle={`${data.summary?.totalOrders || 0} total orders`}
                      color="#10b981"
                    />
                  </Col>
                  <Col xs={12} sm={6} lg={3}>
                    <StatCard
                      icon={FiShoppingCart}
                      title={`Orders (${period}D)`}
                      value={data.summary?.ordersInPeriod || 0}
                      subtitle={formatCurrency(
                        data.summary?.revenueInPeriod || 0,
                      )}
                      trend={data.summary?.revenueGrowth}
                      color="#3b82f6"
                    />
                  </Col>
                  <Col xs={12} sm={6} lg={3}>
                    <StatCard
                      icon={FiUsers}
                      title="Total Users"
                      value={data.summary?.totalUsers || 0}
                      subtitle={`+${data.summary?.newUsersInPeriod || 0} new this period`}
                      color="#8b5cf6"
                    />
                  </Col>
                  <Col xs={12} sm={6} lg={3}>
                    <StatCard
                      icon={FiPackage}
                      title="Avg Order Value"
                      value={formatCurrency(data.summary?.avgOrderValue || 0)}
                      subtitle={`${data.summary?.totalProducts || 0} products`}
                      color="#f59e0b"
                    />
                  </Col>
                </Row>

                {/* Charts Row */}
                <Row className="g-4 mb-4">
                  {/* Revenue Chart */}
                  <Col xs={12} lg={8}>
                    <Card
                      className="border-0 shadow-sm h-100"
                      style={{ borderRadius: "16px" }}
                    >
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <h5 className="mb-1 fw-bold">
                              <FiTrendingUp
                                size={20}
                                className="me-2"
                                style={{ color: "#10b981" }}
                              />
                              Revenue Trend
                            </h5>
                            <small className="text-muted">
                              Daily revenue for last {period} days
                            </small>
                          </div>
                          <Badge bg="success" className="px-3 py-2">
                            {formatCurrency(data.summary?.revenueInPeriod || 0)}
                          </Badge>
                        </div>
                        <C3BarChart
                          data={data.charts?.dailyData || []}
                          dataKey="revenue"
                          nameKey="date"
                          color="#10b981"
                          height={280}
                        />
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Order Status Distribution */}
                  <Col xs={12} lg={4}>
                    <Card
                      className="border-0 shadow-sm h-100"
                      style={{ borderRadius: "16px" }}
                    >
                      <Card.Body className="p-4">
                        <h5 className="mb-3 fw-bold">
                          <FiPieChart
                            size={20}
                            className="me-2"
                            style={{ color: "#8b5cf6" }}
                          />
                          Order Status
                        </h5>
                        <C3DonutChart
                          data={data.charts?.orderStatusDistribution || []}
                          nameKey="status"
                          valueKey="count"
                          height={320}
                        />
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Second Charts Row */}
                <Row className="g-4 mb-4">
                  {/* Top Products */}
                  <Col xs={12} lg={6}>
                    <Card
                      className="border-0 shadow-sm h-100"
                      style={{ borderRadius: "16px" }}
                    >
                      <Card.Body className="p-4">
                        <h5 className="mb-3 fw-bold">
                          <FiPackage
                            size={20}
                            className="me-2"
                            style={{ color: "#f59e0b" }}
                          />
                          Top Selling Products
                        </h5>
                        {data.charts?.topProducts?.length > 0 ? (
                          <div>
                            {data.charts.topProducts
                              .slice(0, 5)
                              .map((product, i) => {
                                const maxQty =
                                  data.charts.topProducts[0]?.quantity || 1;
                                const percent =
                                  (product.quantity / maxQty) * 100;
                                return (
                                  <div key={i} className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                      <small
                                        className="fw-medium text-truncate"
                                        style={{ maxWidth: "60%" }}
                                      >
                                        {product.name}
                                      </small>
                                      <small className="text-muted">
                                        {product.quantity} sold •{" "}
                                        {formatCurrency(product.revenue)}
                                      </small>
                                    </div>
                                    <ProgressBar
                                      now={percent}
                                      variant={
                                        i === 0
                                          ? "success"
                                          : i === 1
                                            ? "info"
                                            : "primary"
                                      }
                                      style={{
                                        height: "8px",
                                        borderRadius: "4px",
                                      }}
                                    />
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <p className="text-muted">
                            No product data available
                          </p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Revenue by Category */}
                  <Col xs={12} lg={6}>
                    <Card
                      className="border-0 shadow-sm h-100"
                      style={{ borderRadius: "16px" }}
                    >
                      <Card.Body className="p-4">
                        <h5 className="mb-3 fw-bold">
                          <FiBarChart2
                            size={20}
                            className="me-2"
                            style={{ color: "#3b82f6" }}
                          />
                          Revenue by Category
                        </h5>
                        <C3CategoryChart
                          data={data.charts?.revenueByCategory || []}
                          dataKey="revenue"
                          nameKey="category"
                          color="#3b82f6"
                          height={220}
                        />
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Weekly Pattern */}
                <Row className="g-4 mb-4">
                  <Col xs={12}>
                    <Card
                      className="border-0 shadow-sm"
                      style={{ borderRadius: "16px" }}
                    >
                      <Card.Body className="p-4">
                        <h5 className="mb-3 fw-bold">
                          <FiCalendar
                            size={20}
                            className="me-2"
                            style={{ color: "#8b5cf6" }}
                          />
                          Orders by Day of Week
                        </h5>
                        <Row>
                          {(data.charts?.weeklyData || []).map((day, i) => (
                            <Col key={i} className="text-center mb-3 mb-md-0">
                              <div
                                className="p-3 rounded-3"
                                style={{
                                  background:
                                    i === 0 || i === 6 ? "#f1f5f9" : "#fff",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <h6 className="fw-bold mb-1">{day.day}</h6>
                                <div
                                  className="fs-4 fw-bold"
                                  style={{ color: "#3b82f6" }}
                                >
                                  {day.orders}
                                </div>
                                <small className="text-muted">orders</small>
                                <div className="mt-1">
                                  <small className="text-success">
                                    {formatCurrency(day.revenue)}
                                  </small>
                                </div>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Recent Orders Table */}
                <Row>
                  <Col>
                    <Card
                      className="border-0 shadow-sm"
                      style={{ borderRadius: "16px" }}
                    >
                      <Card.Body className="p-4">
                        <h5 className="mb-3 fw-bold">
                          <FiShoppingCart
                            size={20}
                            className="me-2"
                            style={{ color: "#10b981" }}
                          />
                          Recent Orders
                        </h5>
                        <div className="table-responsive">
                          <Table hover className="mb-0">
                            <thead style={{ backgroundColor: "#f8fafc" }}>
                              <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.recentOrders?.length > 0 ? (
                                data.recentOrders.map((order) => (
                                  <tr key={order._id}>
                                    <td>
                                      <code style={{ fontSize: "0.75rem" }}>
                                        {order.orderId?.substring(0, 12) ||
                                          order._id?.substring(0, 12)}
                                        ...
                                      </code>
                                    </td>
                                    <td>{order.customer}</td>
                                    <td>
                                      <Badge bg="secondary">
                                        {order.itemCount} items
                                      </Badge>
                                    </td>
                                    <td className="fw-bold">
                                      {formatCurrency(order.total)}
                                    </td>
                                    <td>
                                      <Badge
                                        bg={getStatusColor(order.status)}
                                        className="text-capitalize"
                                      >
                                        {order.status}
                                      </Badge>
                                    </td>
                                    <td>
                                      <small className="text-muted">
                                        {formatDate(order.date)}
                                      </small>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className="text-center text-muted py-4"
                                  >
                                    No recent orders
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Product Predictions Section */}
                <Row className="g-4 mb-4 mt-2">
                  <Col xs={12}>
                    <Card
                      className="border-0 shadow-sm"
                      style={{ borderRadius: "16px" }}
                    >
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <div>
                            <h4 className="mb-1 fw-bold">
                              <FiTarget
                                size={24}
                                className="me-2"
                                style={{ color: "#8b5cf6" }}
                              />
                              Product Order Predictions
                            </h4>
                            <p className="text-muted mb-0">
                              AI-powered predictions for current month based on
                              historical order patterns
                            </p>
                          </div>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={refetchPredictions}
                            disabled={predictionsLoading}
                          >
                            <FiRefreshCw
                              size={16}
                              className={
                                predictionsLoading ? "spin me-1" : "me-1"
                              }
                            />
                            Refresh
                          </Button>
                        </div>

                        {predictionsLoading ? (
                          <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3 text-muted">
                              Analyzing order patterns...
                            </p>
                          </div>
                        ) : predictionsData?.predictions?.length > 0 ? (
                          <>
                            {/* Prediction Summary Cards */}
                            <Row className="g-3 mb-4">
                              <Col xs={12} sm={6} md={3}>
                                <div
                                  className="p-3 rounded-3 text-center"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #8b5cf620, #8b5cf640)",
                                    border: "1px solid #8b5cf630",
                                  }}
                                >
                                  <FiActivity
                                    size={24}
                                    style={{ color: "#8b5cf6" }}
                                  />
                                  <h5
                                    className="mt-2 mb-0 fw-bold"
                                    style={{ color: "#8b5cf6" }}
                                  >
                                    {predictionsData.metadata?.summary
                                      ?.totalProductsAnalyzed || 0}
                                  </h5>
                                  <small className="text-muted">
                                    Products Analyzed
                                  </small>
                                </div>
                              </Col>
                              <Col xs={12} sm={6} md={3}>
                                <div
                                  className="p-3 rounded-3 text-center"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #94a3b820, #94a3b840)",
                                    border: "1px solid #94a3b830",
                                  }}
                                >
                                  <FiPackage
                                    size={24}
                                    style={{ color: "#64748b" }}
                                  />
                                  <h5
                                    className="mt-2 mb-0 fw-bold"
                                    style={{ color: "#64748b" }}
                                  >
                                    {predictionsData.metadata?.summary
                                      ?.totalLastMonthOrders || 0}
                                  </h5>
                                  <small className="text-muted">
                                    Last Month Orders
                                  </small>
                                </div>
                              </Col>
                              <Col xs={12} sm={6} md={3}>
                                <div
                                  className="p-3 rounded-3 text-center"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #3b82f620, #3b82f640)",
                                    border: "1px solid #3b82f630",
                                  }}
                                >
                                  <FiTarget
                                    size={24}
                                    style={{ color: "#3b82f6" }}
                                  />
                                  <h5
                                    className="mt-2 mb-0 fw-bold"
                                    style={{ color: "#3b82f6" }}
                                  >
                                    {predictionsData.metadata?.summary
                                      ?.totalPredictedThisMonth || 0}
                                  </h5>
                                  <small className="text-muted">
                                    Predicted This Month
                                  </small>
                                </div>
                              </Col>
                              <Col xs={12} sm={6} md={3}>
                                <div
                                  className="p-3 rounded-3 text-center"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #10b98120, #10b98140)",
                                    border: "1px solid #10b98130",
                                  }}
                                >
                                  <FiTrendingUp
                                    size={24}
                                    style={{ color: "#10b981" }}
                                  />
                                  <h5
                                    className="mt-2 mb-0 fw-bold"
                                    style={{ color: "#10b981" }}
                                  >
                                    {predictionsData.metadata
                                      ?.currentMonthProgress?.percentComplete ||
                                      0}
                                    %
                                  </h5>
                                  <small className="text-muted">
                                    Month Progress
                                  </small>
                                </div>
                              </Col>
                            </Row>

                            <Row className="g-4">
                              {/* Main Prediction Chart */}
                              <Col xs={12} lg={8}>
                                <Card
                                  className="border-0 h-100"
                                  style={{
                                    borderRadius: "12px",
                                    background: "#f8fafc",
                                  }}
                                >
                                  <Card.Body className="p-3">
                                    <h6 className="mb-3 fw-bold">
                                      <FiBarChart2
                                        size={18}
                                        className="me-2"
                                        style={{ color: "#3b82f6" }}
                                      />
                                      Top 10 Product Predictions
                                    </h6>
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
                                        <small className="text-muted">
                                          Last Month Actual
                                        </small>
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
                                        <small className="text-muted">
                                          Predicted
                                        </small>
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
                                        <small className="text-muted">
                                          Current Month (So Far)
                                        </small>
                                      </div>
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Col>

                              {/* Category Prediction Donut */}
                              <Col xs={12} lg={4}>
                                <Card
                                  className="border-0 h-100"
                                  style={{
                                    borderRadius: "12px",
                                    background: "#f8fafc",
                                  }}
                                >
                                  <Card.Body className="p-3">
                                    <h6 className="mb-3 fw-bold">
                                      <FiPieChart
                                        size={18}
                                        className="me-2"
                                        style={{ color: "#8b5cf6" }}
                                      />
                                      Predictions by Category
                                    </h6>
                                    <C3CategoryPredictionChart
                                      data={predictionsData.categoryPredictions}
                                      height={300}
                                    />
                                  </Card.Body>
                                </Card>
                              </Col>
                            </Row>

                            {/* Detailed Predictions Table */}
                            <Card
                              className="border-0 mt-4"
                              style={{
                                borderRadius: "12px",
                                background: "#f8fafc",
                              }}
                            >
                              <Card.Body className="p-3">
                                <h6 className="mb-3 fw-bold">
                                  <FiPackage
                                    size={18}
                                    className="me-2"
                                    style={{ color: "#f59e0b" }}
                                  />
                                  Detailed Product Predictions
                                </h6>
                                <div className="table-responsive">
                                  <Table hover className="mb-0" size="sm">
                                    <thead
                                      style={{ backgroundColor: "#e2e8f0" }}
                                    >
                                      <tr>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th className="text-center">
                                          Last Month
                                        </th>
                                        <th className="text-center">
                                          Predicted
                                        </th>
                                        <th className="text-center">Current</th>
                                        <th className="text-center">Trend</th>
                                        <th className="text-center">
                                          Confidence
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {predictionsData.predictions.map(
                                        (item, index) => (
                                          <tr key={index}>
                                            <td>
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
                                            </td>
                                            <td>
                                              <Badge
                                                bg="light"
                                                text="dark"
                                                className="fw-normal"
                                              >
                                                {item.category}
                                              </Badge>
                                            </td>
                                            <td className="text-center">
                                              <span className="text-muted">
                                                {item.lastMonthQuantity}
                                              </span>
                                            </td>
                                            <td className="text-center">
                                              <span className="fw-bold text-primary">
                                                {item.predictedQuantity}
                                              </span>
                                            </td>
                                            <td className="text-center">
                                              <span className="text-success">
                                                {item.currentMonthQuantity}
                                              </span>
                                            </td>
                                            <td className="text-center">
                                              {item.trendPercentage >= 0 ? (
                                                <Badge
                                                  bg="success"
                                                  className="d-inline-flex align-items-center"
                                                >
                                                  <FiTrendingUp
                                                    size={12}
                                                    className="me-1"
                                                  />
                                                  +{item.trendPercentage}%
                                                </Badge>
                                              ) : (
                                                <Badge
                                                  bg="danger"
                                                  className="d-inline-flex align-items-center"
                                                >
                                                  <FiTrendingDown
                                                    size={12}
                                                    className="me-1"
                                                  />
                                                  {item.trendPercentage}%
                                                </Badge>
                                              )}
                                            </td>
                                            <td className="text-center">
                                              <Badge
                                                bg={
                                                  item.confidence === "High"
                                                    ? "success"
                                                    : item.confidence ===
                                                        "Medium"
                                                      ? "warning"
                                                      : "secondary"
                                                }
                                              >
                                                {item.confidence}
                                              </Badge>
                                            </td>
                                          </tr>
                                        ),
                                      )}
                                    </tbody>
                                  </Table>
                                </div>
                              </Card.Body>
                            </Card>
                          </>
                        ) : (
                          <div className="text-center py-5">
                            <FiTarget size={48} className="text-muted mb-3" />
                            <p className="text-muted">
                              No prediction data available. Predictions require
                              order history from previous months.
                            </p>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </>
            ) : null}
          </Container>
        </div>
      </div>

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
    </>
  );
}
