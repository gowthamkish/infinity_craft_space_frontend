import React from "react";
import { Link } from "react-router-dom";

const Breadcrumbs = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        {items.map((item, index) => (
          <li
            key={index}
            className={`breadcrumb-item ${item.current ? "active" : ""}`}
          >
            {item.current ? (
              <span>{item.label}</span>
            ) : item.href ? (
              <Link to={item.href}>{item.label}</Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Helper function to generate breadcrumb items
export const generateProductBreadcrumbs = (
  category,
  subCategory,
  productName,
) => {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
  ];

  if (category) {
    breadcrumbs.push({
      label: category,
      href: `/products?category=${encodeURIComponent(category)}`,
    });
  }

  if (subCategory) {
    breadcrumbs.push({
      label: subCategory,
      href: `/products?category=${encodeURIComponent(category)}&subCategory=${encodeURIComponent(subCategory)}`,
    });
  }

  if (productName) {
    breadcrumbs.push({
      label: productName,
      current: true,
    });
  }

  return breadcrumbs;
};

export const generateCategoryBreadcrumbs = (category) => {
  return [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: category, current: true },
  ];
};

export default Breadcrumbs;
