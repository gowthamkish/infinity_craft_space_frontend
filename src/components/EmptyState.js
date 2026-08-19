import React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import {
  FiShoppingCart, FiSearch, FiBox, FiHeart, FiAlertCircle,
} from "react-icons/fi";

const P = "#8B1A4A";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actions = [],
  type = "default",
}) => {
  const iconMap = {
    cart:     FiShoppingCart,
    search:   FiSearch,
    wishlist: FiHeart,
    products: FiBox,
    error:    FiAlertCircle,
    default:  FiBox,
  };

  const IconComponent = Icon || iconMap[type];
  const isError = type === "error";

  return (
    <Box sx={{ textAlign: "center", py: { xs: 6, md: 8 }, px: 3 }}>
      <Box
        sx={{
          width: 72, height: 72, borderRadius: "50%", mx: "auto", mb: 2.5,
          bgcolor: isError ? "rgba(220,38,38,0.08)" : "rgba(139,26,74,0.07)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: isError ? "#dc2626" : P,
        }}
      >
        <IconComponent size={32} />
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 700, color: "#1c1917", mb: description ? 0.75 : 2 }}>
        {title}
      </Typography>

      {description && (
        <Typography variant="body2" sx={{ color: "#6b7280", mb: 2.5, maxWidth: 360, mx: "auto", lineHeight: 1.65 }}>
          {description}
        </Typography>
      )}

      {actions.length > 0 && (
        <Stack direction="row" gap={1.25} justifyContent="center" flexWrap="wrap">
          {actions.map((action, i) => {
            const isSecondary = action.className?.includes("secondary");
            return (
              <Button
                key={i}
                variant={isSecondary ? "outlined" : "contained"}
                onClick={action.onClick}
                disabled={action.disabled}
                sx={{
                  textTransform: "none", fontWeight: 600, borderRadius: "10px",
                  px: 2.5, py: 0.875,
                  ...(isSecondary
                    ? { borderColor: "#d4d4d4", color: "#57534e", "&:hover": { borderColor: P, color: P } }
                    : { bgcolor: P, "&:hover": { bgcolor: "#6b1238" }, boxShadow: "none" }),
                }}
              >
                {action.label}
              </Button>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export const EmptyCart = ({ onShop }) => (
  <EmptyState
    type="cart"
    title="Your cart is empty"
    description="Discover 100+ unique handcrafted items — from resin art to personalised gifts."
    actions={[{ label: "Discover handmade gifts →", onClick: onShop }]}
  />
);

export const EmptyWishlist = ({ onShop }) => (
  <EmptyState
    type="wishlist"
    title="No items in wishlist"
    description="Save your favorite products for later"
    actions={[{ label: "Browse Products", onClick: onShop }]}
  />
);

export const NoSearchResults = ({ query, onSearch }) => (
  <EmptyState
    type="search"
    title="No results found"
    description={`We couldn't find anything matching "${query}"`}
    actions={[{ label: "Clear search", onClick: onSearch, className: "btn-secondary" }]}
  />
);

export const NoProducts = ({ onAdd }) => (
  <EmptyState
    type="products"
    title="No products yet"
    description="Start by adding your first product"
    actions={[{ label: "Add Product", onClick: onAdd }]}
  />
);

export const EmptyOrders = ({ onShop }) => (
  <EmptyState
    type="products"
    title="No orders yet"
    description="You haven't placed any orders"
    actions={[{ label: "Start Shopping", onClick: onShop }]}
  />
);

export const ErrorState = ({ title = "Something went wrong", description = "", onRetry }) => (
  <EmptyState
    type="error"
    title={title}
    description={description || "Please try again later"}
    actions={onRetry ? [{ label: "Try Again", onClick: onRetry }] : []}
  />
);

export default EmptyState;
