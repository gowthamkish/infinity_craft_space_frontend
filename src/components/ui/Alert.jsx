// Wrapper for Alert component - maps React-Bootstrap Alert to MUI Alert
import React from "react";
import MuiAlert from "@mui/material/Alert";

/**
 * Alert wrapper component
 * Maps React-Bootstrap Alert to MUI Alert
 *
 * Props mapping:
 *   variant="success" -> severity="success"
 *   variant="danger" -> severity="error"
 *   variant="warning" -> severity="warning"
 *   variant="info" -> severity="info"
 *
 * Usage:
 *   <Alert variant="success">Success message</Alert>
 *   <Alert variant="danger">Error message</Alert>
 */
export default function Alert({
  variant = "info",
  children,
  className,
  style,
  ...props
}) {
  // Map Bootstrap variants to MUI severity
  const severityMap = {
    success: "success",
    danger: "error",
    warning: "warning",
    info: "info",
    primary: "info",
    secondary: "info",
  };

  const severity = severityMap[variant] || "info";

  return (
    <MuiAlert
      severity={severity}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </MuiAlert>
  );
}
