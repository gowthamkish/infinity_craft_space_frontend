import React, { Component } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import {
  FiAlertTriangle,
  FiRefreshCw,
  FiHome,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

/**
 * ErrorBoundary component to catch JavaScript errors in child component tree.
 * Displays a fallback UI when an error occurs.
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * Or with custom fallback:
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console (could be sent to error reporting service)
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Optional: Send error to external logging service
    // this.logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleRefreshPage = () => {
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState((prevState) => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { children, fallback, level = "page" } = this.props;

    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return fallback;
      }

      // Default error UI based on level
      if (level === "component") {
        return (
          <Alert severity="error" sx={{ m: 1, borderRadius: 2 }}
            action={
              <Button color="error" size="small" onClick={this.handleRetry}
                startIcon={<FiRefreshCw size={14} />}>
                Retry
              </Button>
            }
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FiAlertTriangle size={18} />
              Something went wrong loading this section.
            </Box>
          </Alert>
        );
      }

      return (
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center",
            alignItems: "center", minHeight: "70vh", p: 4 }}>
          <Card sx={{ maxWidth: 600, width: "100%", textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.12)", border: "none" }}>
            <CardContent sx={{ p: 5 }}>
              <Box sx={{ width: 80, height: 80, borderRadius: "50%",
                  background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  mx: "auto", mb: 3 }}>
                <FiAlertTriangle size={40} color="white" />
              </Box>

              <Typography variant="h5" fontWeight={700} sx={{ mb: 1.5, color: "#1e293b" }}>
                Oops! Something went wrong
              </Typography>

              <Typography color="text.secondary" sx={{ mb: 4 }}>
                We're sorry, but something unexpected happened. Don't worry, our
                team has been notified and we're working to fix it.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                <Button variant="contained" color="primary" onClick={this.handleRetry}
                  startIcon={<FiRefreshCw size={18} />}>
                  Try Again
                </Button>
                <Button variant="outlined" color="inherit" onClick={this.handleGoHome}
                  startIcon={<FiHome size={18} />}>
                  Go to Home
                </Button>
                <Button variant="outlined" color="inherit" onClick={this.handleRefreshPage}
                  startIcon={<FiRefreshCw size={18} />}>
                  Refresh Page
                </Button>
              </Stack>

              {process.env.NODE_ENV === "development" && error && (
                <Box sx={{ mt: 3 }}>
                  <Button variant="text" onClick={this.toggleDetails} size="small"
                    sx={{ color: "text.secondary", fontSize: "0.875rem" }}
                    startIcon={showDetails ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}>
                    {showDetails ? "Hide Error Details" : "Show Error Details"}
                  </Button>
                  {showDetails && (
                    <Alert severity="info" sx={{ mt: 2, textAlign: "left",
                        maxHeight: 200, overflow: "auto",
                        "& pre": { fontSize: "0.75rem", fontFamily: "monospace", whiteSpace: "pre-wrap", m: 0 } }}>
                      <pre>{error.toString()}</pre>
                      {errorInfo && <pre>{errorInfo.componentStack}</pre>}
                    </Alert>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      );
    }

    return children;
  }
}

/**
 * Higher-order component to wrap any component with ErrorBoundary
 */
export const withErrorBoundary = (
  WrappedComponent,
  errorBoundaryProps = {},
) => {
  const WithErrorBoundary = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `WithErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return WithErrorBoundary;
};

/**
 * Functional component wrapper for route-level error boundaries
 */
export const RouteErrorBoundary = ({ children }) => (
  <ErrorBoundary level="page">{children}</ErrorBoundary>
);

/**
 * Functional component wrapper for component-level error boundaries
 */
export const ComponentErrorBoundary = ({ children }) => (
  <ErrorBoundary level="component">{children}</ErrorBoundary>
);

export default ErrorBoundary;
