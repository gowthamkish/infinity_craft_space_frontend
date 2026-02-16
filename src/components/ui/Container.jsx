// Wrapper for Container component - maps React-Bootstrap Container to MUI Container
import React from "react";
import MuiContainer from "@mui/material/Container";

/**
 * Container wrapper component
 * Maps React-Bootstrap Container props to MUI Container
 *
 * Usage:
 *   <Container> content </Container>
 *   <Container maxWidth="lg"> content </Container>
 *   <Container fluid> content </Container>
 */
export default function Container({
  fluid,
  children,
  className,
  style,
  ...props
}) {
  // Map 'fluid' prop to MUI's maxWidth={false}
  const maxWidth = fluid ? false : props.maxWidth || "lg";

  return (
    <MuiContainer
      maxWidth={maxWidth}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </MuiContainer>
  );
}
