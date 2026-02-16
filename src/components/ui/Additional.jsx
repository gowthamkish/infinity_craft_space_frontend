// Additional wrapper components for less common Bootstrap components
import React from "react";
import MuiPagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

/**
 * Pagination wrapper
 * Maps React-Bootstrap Pagination to MUI Pagination
 *
 * Note: Bootstrap's Pagination uses Pagination.Item structure,
 * while MUI uses a simpler page number approach.
 * This wrapper provides basic pagination.
 */
export function Pagination({ children, ...props }) {
  return <MuiPagination {...props} />;
}

Pagination.Item = PaginationItem;

/**
 * Toast wrapper
 * Maps React-Bootstrap Toast to MUI Snackbar + Alert
 *
 * Props mapping:
 *   show -> open
 *   onClose -> onClose
 *   autohide -> autoHideDuration
 *
 * Usage:
 *   <Toast show={show} onClose={handleClose} autohide delay={3000}>
 *     <Toast.Body>Message</Toast.Body>
 *   </Toast>
 */
export function Toast({
  show,
  onClose,
  autohide,
  delay = 3000,
  bg,
  children,
  ...props
}) {
  // Extract message from Toast.Body if present
  const message = React.Children.toArray(children).find(
    (child) => child.type === Toast.Body,
  );

  const severity =
    bg === "success"
      ? "success"
      : bg === "danger"
        ? "error"
        : bg === "warning"
          ? "warning"
          : "info";

  return (
    <Snackbar
      open={!!show}
      onClose={onClose}
      autoHideDuration={autohide ? delay : null}
      {...props}
    >
      <MuiAlert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {message ? message.props.children : children}
      </MuiAlert>
    </Snackbar>
  );
}

Toast.Body = function ToastBody({ children }) {
  return <>{children}</>;
};

Toast.Header = function ToastHeader({ children, closeButton, ...props }) {
  return null; // MUI Alert has built-in close button
};

/**
 * ToastContainer wrapper
 * Maps React-Bootstrap ToastContainer to positioned container
 */
export function ToastContainer({ position = "top-end", children, ...props }) {
  const positionMap = {
    "top-start": { vertical: "top", horizontal: "left" },
    "top-center": { vertical: "top", horizontal: "center" },
    "top-end": { vertical: "top", horizontal: "right" },
    "middle-start": { vertical: "center", horizontal: "left" },
    "middle-center": { vertical: "center", horizontal: "center" },
    "middle-end": { vertical: "center", horizontal: "right" },
    "bottom-start": { vertical: "bottom", horizontal: "left" },
    "bottom-center": { vertical: "bottom", horizontal: "center" },
    "bottom-end": { vertical: "bottom", horizontal: "right" },
  };

  const anchorOrigin = positionMap[position] || positionMap["top-end"];

  return (
    <div style={{ position: "fixed", zIndex: 9999 }}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { anchorOrigin }),
      )}
    </div>
  );
}

/**
 * Offcanvas wrapper
 * Maps React-Bootstrap Offcanvas to MUI Drawer
 *
 * Props mapping:
 *   show -> open
 *   onHide -> onClose
 *   placement -> anchor (start->left, end->right)
 *
 * Usage:
 *   <Offcanvas show={show} onHide={handleClose} placement="end">
 *     <Offcanvas.Header closeButton>
 *       <Offcanvas.Title>Title</Offcanvas.Title>
 *     </Offcanvas.Header>
 *     <Offcanvas.Body>Content</Offcanvas.Body>
 *   </Offcanvas>
 */
export function Offcanvas({
  show,
  onHide,
  placement = "start",
  children,
  ...props
}) {
  const anchor =
    placement === "end"
      ? "right"
      : placement === "start"
        ? "left"
        : placement === "top"
          ? "top"
          : "bottom";

  return (
    <Drawer open={!!show} onClose={onHide} anchor={anchor} {...props}>
      {children}
    </Drawer>
  );
}

Offcanvas.Header = function OffcanvasHeader({
  closeButton,
  children,
  ...props
}) {
  return (
    <div style={{ padding: "16px", borderBottom: "1px solid #e0e0e0" }}>
      {children}
    </div>
  );
};

Offcanvas.Title = function OffcanvasTitle({ children, ...props }) {
  return <h5 {...props}>{children}</h5>;
};

Offcanvas.Body = function OffcanvasBody({ children, ...props }) {
  return (
    <div style={{ padding: "16px" }} {...props}>
      {children}
    </div>
  );
};

/**
 * ListGroup wrapper
 * Maps React-Bootstrap ListGroup to MUI List
 *
 * Usage:
 *   <ListGroup>
 *     <ListGroup.Item>Item 1</ListGroup.Item>
 *     <ListGroup.Item action onClick={handler}>Item 2</ListGroup.Item>
 *   </ListGroup>
 */
export function ListGroup({ variant, children, ...props }) {
  return (
    <List
      sx={{
        border: variant === "flush" ? "none" : "1px solid",
        borderColor: "divider",
        borderRadius: 1,
      }}
      {...props}
    >
      {children}
    </List>
  );
}

ListGroup.Item = function ListGroupItem({
  action,
  active,
  variant,
  children,
  ...props
}) {
  if (action) {
    return (
      <ListItemButton selected={active} {...props}>
        <ListItemText primary={children} />
      </ListItemButton>
    );
  }

  return (
    <ListItem
      sx={{
        backgroundColor: active ? "action.selected" : "transparent",
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-child": { borderBottom: "none" },
      }}
      {...props}
    >
      <ListItemText primary={children} />
    </ListItem>
  );
};

/**
 * InputGroup wrapper
 * Maps React-Bootstrap InputGroup to TextField with InputAdornment
 *
 * Usage:
 *   <InputGroup>
 *     <InputGroup.Text>@</InputGroup.Text>
 *     <Form.Control type="text" />
 *   </InputGroup>
 */
export function InputGroup({ children, size, ...props }) {
  // This is a simplified wrapper - in practice, you may need to
  // compose InputAdornment with TextField directly in components
  return <div {...props}>{children}</div>;
}

InputGroup.Text = function InputGroupText({ children, ...props }) {
  return (
    <InputAdornment position="start" {...props}>
      {children}
    </InputAdornment>
  );
};
