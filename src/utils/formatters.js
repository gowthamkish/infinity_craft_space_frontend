/**
 * Formats a date string for user-facing display (Indian locale, long month).
 * Example: "12 January 2024, 02:30 PM"
 */
export const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Formats a date string for admin display (short month, US locale).
 * Example: "Jan 12, 2024, 02:30 PM"
 */
export const formatDateShort = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Formats a number as Indian Rupee currency.
 * Example: ₹1,234.56
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount ?? 0);
};

/**
 * Formats a number as a plain rupee string without Intl formatting.
 * Example: "₹1234.56"
 */
export const formatPrice = (amount) => {
  return `₹${Number(amount ?? 0).toFixed(2)}`;
};

/**
 * Truncates a MongoDB ObjectId to show only the last 8 characters with a # prefix.
 * Example: "#abc12345"
 */
export const formatOrderId = (id) => {
  if (!id) return "—";
  return `#${String(id).slice(-8)}`;
};
