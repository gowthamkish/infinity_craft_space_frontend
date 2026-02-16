// Navbar and Nav wrappers - maps React-Bootstrap Navbar/Nav to MUI AppBar/Toolbar
import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";

/**
 * Navbar wrapper
 * Maps React-Bootstrap Navbar to MUI AppBar
 *
 * Props mapping:
 *   fixed -> position (fixed="top" becomes position="fixed")
 *   bg -> AppBar color (handled via style prop)
 *   expand -> responsive breakpoint
 *
 * Usage:
 *   <Navbar fixed="top" bg="dark">
 *     <Container>
 *       <Navbar.Brand>Brand</Navbar.Brand>
 *       <Nav>...</Nav>
 *     </Container>
 *   </Navbar>
 */
export default function Navbar({
  fixed,
  bg,
  expand,
  children,
  style,
  ...props
}) {
  const position = fixed ? "fixed" : "static";

  return (
    <AppBar
      position={position}
      sx={{
        ...style,
        background: style?.background || "white",
        boxShadow: style?.boxShadow || "0 2px 4px rgba(0,0,0,0.1)",
      }}
      {...props}
    >
      <Toolbar sx={{ padding: "0 !important" }}>
        <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
          {children}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

// Navbar.Brand subcomponent
Navbar.Brand = function NavbarBrand({ onClick, children, style, ...props }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        display: "flex",
        alignItems: "center",
        ...style,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Navbar.Toggle subcomponent (for mobile menu)
Navbar.Toggle = function NavbarToggle({ onClick, children, ...props }) {
  return (
    <Box
      onClick={onClick}
      sx={{ display: { sm: "none" }, cursor: "pointer" }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Navbar.Collapse subcomponent
Navbar.Collapse = function NavbarCollapse({ children, ...props }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", flex: 1 }} {...props}>
      {children}
    </Box>
  );
};

/**
 * Nav wrapper
 * Maps React-Bootstrap Nav to MUI Box with flex layout
 *
 * Usage:
 *   <Nav className="ms-auto">
 *     <Nav.Link onClick={handler}>Link</Nav.Link>
 *   </Nav>
 */
export function Nav({ className, children, style, ...props }) {
  return (
    <Box
      className={className}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        ...style,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

// Nav.Link subcomponent
Nav.Link = function NavLink({ active, onClick, children, style, ...props }) {
  return (
    <MuiLink
      onClick={onClick}
      sx={{
        cursor: "pointer",
        textDecoration: "none",
        color: active ? "primary.main" : "text.primary",
        fontWeight: active ? 600 : 400,
        "&:hover": {
          color: "primary.main",
        },
        ...style,
      }}
      {...props}
    >
      {children}
    </MuiLink>
  );
};
