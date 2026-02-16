// Wrapper for Button component - maps React-Bootstrap Button to MUI Button
import React from "react";
import MuiButton from "@mui/material/Button";

/**
 * Button wrapper component
 * Maps React-Bootstrap Button props to MUI Button
 *
 * Props mapping:
 *   variant="primary" -> variant="contained" color="primary"
 *   variant="outline-primary" -> variant="outlined" color="primary"
 *   variant="secondary" -> variant="contained" color="secondary"
 *   size="sm" -> size="small"
 *   size="lg" -> size="large"
 *
 * Usage:
 *   <Button variant="primary">Click me</Button>
 *   <Button variant="outline-secondary" size="sm">Small</Button>
 */
export default function Button({
  variant = "primary",
  size,
  children,
  className,
  disabled,
  onClick,
  type,
  style,
  ...props
}) {
  // Map Bootstrap variants to MUI variants and colors
  let muiVariant = "contained";
  let muiColor = "primary";

  if (variant) {
    if (variant.startsWith("outline-")) {
      muiVariant = "outlined";
      muiColor = variant.replace("outline-", "");
    } else if (variant === "link") {
      muiVariant = "text";
    } else {
      muiColor = variant;
    }
  }

  // Map color names
  const colorMap = {
    primary: "primary",
    secondary: "secondary",
    success: "success",
    danger: "error",
    warning: "warning",
    info: "info",
    light: "inherit",
    dark: "inherit",
  };

  const finalColor = colorMap[muiColor] || "primary";

  // Map size
  const sizeMap = {
    sm: "small",
    lg: "large",
  };
  const finalSize = size ? sizeMap[size] || size : "medium";

  return (
    <MuiButton
      variant={muiVariant}
      color={finalColor}
      size={finalSize}
      className={className}
      disabled={disabled}
      onClick={onClick}
      type={type}
      style={style}
      {...props}
    >
      {children}
    </MuiButton>
  );
}
