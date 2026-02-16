// Wrapper for Spinner/Badge components
import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import MuiChip from "@mui/material/Chip";

/**
 * Spinner wrapper - maps React-Bootstrap Spinner to MUI CircularProgress
 *
 * Props mapping:
 *   animation="border" -> default (circular spinner)
 *   size="sm" -> size={20}
 *
 * Usage:
 *   <Spinner animation="border" />
 *   <Spinner animation="border" size="sm" />
 */
export function Spinner({
  animation,
  size,
  variant,
  className,
  style,
  ...props
}) {
  const sizeValue = size === "sm" ? 20 : 40;

  return (
    <CircularProgress
      size={sizeValue}
      className={className}
      style={style}
      {...props}
    />
  );
}

/**
 * Badge wrapper - maps React-Bootstrap Badge to MUI Chip
 *
 * Props mapping:
 *   bg="success" -> color="success"
 *   bg="danger" -> color="error"
 *   bg="warning" -> color="warning"
 *   bg="primary" -> color="primary"
 *
 * Usage:
 *   <Badge bg="success">Active</Badge>
 *   <Badge bg="danger">Error</Badge>
 */
export function Badge({
  bg = "default",
  children,
  className,
  style,
  ...props
}) {
  const colorMap = {
    primary: "primary",
    secondary: "secondary",
    success: "success",
    danger: "error",
    warning: "warning",
    info: "info",
    light: "default",
    dark: "default",
  };

  const color = colorMap[bg] || "default";

  return (
    <MuiChip
      label={children}
      color={color}
      size="small"
      className={className}
      style={style}
      {...props}
    />
  );
}
