// Export all UI wrapper components
// These wrappers map React-Bootstrap API to MUI components
// allowing incremental migration without breaking existing code

export { default as Container } from "./Container";
export { Row, Col } from "./Grid";
export { default as Button } from "./Button";
export { default as Card } from "./Card";
export { default as Alert } from "./Alert";
export { Spinner, Badge } from "./Misc";
export { default as Breadcrumb } from "./Breadcrumb";
export { default as Modal } from "./Modal";
export { default as Form } from "./Form";
export { default as Table, thead, tbody, tr, td, th } from "./Table";
export {
  Pagination,
  Toast,
  ToastContainer,
  Offcanvas,
  ListGroup,
  InputGroup,
} from "./Additional";
export { default as Navbar } from "./Navbar";
export { Nav } from "./Navbar";

// Re-export MUI components that don't need wrappers
export { default as Typography } from "@mui/material/Typography";
export { default as Box } from "@mui/material/Box";
export { default as Stack } from "@mui/material/Stack";
export { default as Divider } from "@mui/material/Divider";
export { default as Link } from "@mui/material/Link";
