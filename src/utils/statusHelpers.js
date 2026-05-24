import Chip from "@mui/material/Chip";
import {
  FiClock,
  FiCheck,
  FiPackage,
  FiTruck,
  FiX,
} from "react-icons/fi";

/**
 * Returns the Bootstrap Badge variant string for an order status.
 * Used in the user-facing Orders page.
 */
export const getStatusBadgeVariant = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "warning";
    case "confirmed":
      return "info";
    case "processing":
      return "info";
    case "shipped":
      return "primary";
    case "delivered":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "secondary";
  }
};

/**
 * Returns a hex color string for an order status.
 * Used in the admin Orders management view.
 */
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "#f59e0b";
    case "confirmed":
      return "#3b82f6";
    case "processing":
      return "#8b5cf6";
    case "shipped":
      return "#10b981";
    case "delivered":
      return "#059669";
    case "cancelled":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};

/**
 * Returns a React icon element for an order status.
 */
export const getStatusIcon = (status, size = 14) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return <FiClock size={size} />;
    case "confirmed":
      return <FiCheck size={size} />;
    case "processing":
      return <FiPackage size={size} />;
    case "shipped":
      return <FiTruck size={size} />;
    case "delivered":
      return <FiCheck size={size} />;
    case "cancelled":
      return <FiX size={size} />;
    default:
      return <FiClock size={size} />;
  }
};

/**
 * Returns a styled Bootstrap Badge element for an order status.
 * Used in the admin Orders management view.
 */
export const getStatusBadge = (status) => {
  const color = getStatusColor(status);
  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";
  return (
    <Chip
      icon={<span style={{ color: "white", display: "flex", alignItems: "center" }}>{getStatusIcon(status)}</span>}
      label={label}
      size="small"
      sx={{
        backgroundColor: color,
        color: "white",
        fontWeight: 600,
        fontSize: "0.75rem",
        borderRadius: "8px",
        "& .MuiChip-icon": { color: "white", ml: 0.5 },
      }}
    />
  );
};

/**
 * Capitalizes the first letter of a status string.
 */
export const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
};
