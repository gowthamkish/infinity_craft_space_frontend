import React from "react";
import {
  FiShoppingCart,
  FiSearch,
  FiBox,
  FiHeart,
  FiAlertCircle,
} from "react-icons/fi";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actions = [],
  type = "default",
}) => {
  // Default icons for common types
  const iconMap = {
    cart: FiShoppingCart,
    search: FiSearch,
    wishlist: FiHeart,
    products: FiBox,
    error: FiAlertCircle,
    default: FiBox,
  };

  const IconComponent = Icon || iconMap[type];

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <IconComponent />
      </div>

      <h3 className="empty-state-title">{title}</h3>

      {description && <p className="empty-state-description">{description}</p>}

      {actions && actions.length > 0 && (
        <div className="empty-state-actions">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`btn ${action.className || "btn-primary"}`}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Pre-built empty states
export const EmptyCart = ({ onShop }) => (
  <EmptyState
    type="cart"
    title="Your cart is empty"
    description="Add some products to get started"
    actions={[
      { label: "Continue Shopping", onClick: onShop, className: "btn-primary" },
    ]}
  />
);

export const EmptyWishlist = ({ onShop }) => (
  <EmptyState
    type="wishlist"
    title="No items in wishlist"
    description="Save your favorite products for later"
    actions={[
      { label: "Browse Products", onClick: onShop, className: "btn-primary" },
    ]}
  />
);

export const NoSearchResults = ({ query, onSearch }) => (
  <EmptyState
    type="search"
    title="No results found"
    description={`We couldn't find anything matching "${query}"`}
    actions={[
      { label: "Clear search", onClick: onSearch, className: "btn-secondary" },
    ]}
  />
);

export const NoProducts = ({ onAdd }) => (
  <EmptyState
    type="products"
    title="No products yet"
    description="Start by adding your first product"
    actions={[
      { label: "Add Product", onClick: onAdd, className: "btn-primary" },
    ]}
  />
);

export const EmptyOrders = ({ onShop }) => (
  <EmptyState
    type="products"
    title="No orders yet"
    description="You haven't placed any orders"
    actions={[
      { label: "Start Shopping", onClick: onShop, className: "btn-primary" },
    ]}
  />
);

export const ErrorState = ({
  title = "Something went wrong",
  description = "",
  onRetry,
}) => (
  <EmptyState
    type="error"
    title={title}
    description={description || "Please try again later"}
    actions={
      onRetry
        ? [{ label: "Try Again", onClick: onRetry, className: "btn-primary" }]
        : []
    }
  />
);

export default EmptyState;
