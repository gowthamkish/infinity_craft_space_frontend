// Wrapper for Breadcrumb component - maps React-Bootstrap Breadcrumb to MUI Breadcrumbs
import React from "react";
import MuiBreadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

/**
 * Breadcrumb wrapper component
 * Maps React-Bootstrap Breadcrumb to MUI Breadcrumbs
 *
 * Usage:
 *   <Breadcrumb>
 *     <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
 *     <Breadcrumb.Item active>Current</Breadcrumb.Item>
 *   </Breadcrumb>
 */
export default function Breadcrumb({ children, className, style, ...props }) {
  return (
    <MuiBreadcrumbs className={className} style={style} {...props}>
      {children}
    </MuiBreadcrumbs>
  );
}

// Breadcrumb.Item subcomponent
Breadcrumb.Item = function BreadcrumbItem({
  children,
  href,
  onClick,
  active,
  className,
  style,
  ...props
}) {
  const navigate = useNavigate();

  // If active, render as Typography (no link)
  if (active) {
    return (
      <Typography color="text.primary" className={className} style={style}>
        {children}
      </Typography>
    );
  }

  // Handle click event
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (href) {
      e.preventDefault();
      navigate(href);
    }
  };

  // Render as clickable link
  return (
    <MuiLink
      component="a"
      href={href || "#"}
      onClick={handleClick}
      underline="hover"
      color="inherit"
      className={className}
      style={{ cursor: "pointer", ...style }}
      {...props}
    >
      {children}
    </MuiLink>
  );
};
