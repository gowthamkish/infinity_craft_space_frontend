import React, { Component } from "react";
import { Container, Button, Alert, Card } from "react-bootstrap";
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
        // Compact error for individual components
        return (
          <Alert variant="danger" className="m-2">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <FiAlertTriangle size={20} className="me-2" />
                <span>Something went wrong loading this section.</span>
              </div>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={this.handleRetry}
              >
                <FiRefreshCw size={14} className="me-1" />
                Retry
              </Button>
            </div>
          </Alert>
        );
      }

      // Full-page error UI
      return (
        <Container
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: "70vh", padding: "2rem" }}
        >
          <Card
            className="text-center shadow-lg border-0"
            style={{ maxWidth: "600px", width: "100%" }}
          >
            <Card.Body className="p-5">
              <div
                className="mb-4"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                }}
              >
                <FiAlertTriangle size={40} color="white" />
              </div>

              <h2 className="mb-3" style={{ color: "#2d3436" }}>
                Oops! Something went wrong
              </h2>

              <p className="text-muted mb-4">
                We're sorry, but something unexpected happened. Don't worry, our
                team has been notified and we're working to fix it.
              </p>

              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center mb-4">
                <Button
                  variant="primary"
                  onClick={this.handleRetry}
                  className="d-flex align-items-center justify-content-center"
                >
                  <FiRefreshCw size={18} className="me-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={this.handleGoHome}
                  className="d-flex align-items-center justify-content-center"
                >
                  <FiHome size={18} className="me-2" />
                  Go to Home
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={this.handleRefreshPage}
                  className="d-flex align-items-center justify-content-center"
                >
                  <FiRefreshCw size={18} className="me-2" />
                  Refresh Page
                </Button>
              </div>

              {/* Error details (collapsible, for debugging) */}
              {process.env.NODE_ENV === "development" && error && (
                <div className="mt-4">
                  <Button
                    variant="link"
                    onClick={this.toggleDetails}
                    className="text-muted p-0 d-flex align-items-center mx-auto"
                    style={{ fontSize: "0.875rem" }}
                  >
                    {showDetails ? (
                      <>
                        <FiChevronUp size={16} className="me-1" />
                        Hide Error Details
                      </>
                    ) : (
                      <>
                        <FiChevronDown size={16} className="me-1" />
                        Show Error Details
                      </>
                    )}
                  </Button>

                  {showDetails && (
                    <Alert
                      variant="light"
                      className="mt-3 text-start"
                      style={{
                        maxHeight: "200px",
                        overflow: "auto",
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                      }}
                    >
                      <strong>Error:</strong>
                      <pre className="mb-2" style={{ whiteSpace: "pre-wrap" }}>
                        {error.toString()}
                      </pre>
                      {errorInfo && (
                        <>
                          <strong>Component Stack:</strong>
                          <pre style={{ whiteSpace: "pre-wrap" }}>
                            {errorInfo.componentStack}
                          </pre>
                        </>
                      )}
                    </Alert>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Container>
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
