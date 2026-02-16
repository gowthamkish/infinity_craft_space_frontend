// Wrapper for Row/Col components - maps React-Bootstrap Row/Col to MUI Grid
import React from "react";
import MuiGrid from "@mui/material/Grid2"; // Using Grid2 (latest)

/**
 * Row wrapper component
 * Maps React-Bootstrap Row to MUI Grid container
 *
 * Usage:
 *   <Row> <Col>...</Col> </Row>
 *   <Row className="gy-4"> ... </Row>
 */
export function Row({ children, className, style, ...props }) {
  return (
    <MuiGrid
      container
      spacing={2} // Default spacing
      className={className}
      style={style}
      {...props}
    >
      {children}
    </MuiGrid>
  );
}

/**
 * Col wrapper component
 * Maps React-Bootstrap Col to MUI Grid item
 *
 * Props mapping:
 *   xs={12} -> size={{ xs: 12 }}
 *   md={6} -> size={{ md: 6 }}
 *   lg={4} -> size={{ lg: 4 }}
 *
 * Usage:
 *   <Col xs={12} md={6}> content </Col>
 *   <Col lg={4}> content </Col>
 */
export function Col({
  xs,
  sm,
  md,
  lg,
  xl,
  children,
  className,
  style,
  ...props
}) {
  // Build responsive size object from Bootstrap-style props
  const size = {};
  if (xs !== undefined) size.xs = xs;
  if (sm !== undefined) size.sm = sm;
  if (md !== undefined) size.md = md;
  if (lg !== undefined) size.lg = lg;
  if (xl !== undefined) size.xl = xl;

  // If no size props provided, default to flexible
  const sizeProps = Object.keys(size).length > 0 ? { size } : {};

  return (
    <MuiGrid {...sizeProps} className={className} style={style} {...props}>
      {children}
    </MuiGrid>
  );
}

export default Row;
