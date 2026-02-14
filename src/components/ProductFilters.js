import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import { FiFilter, FiX, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { fetchPublicCategories } from "../features/categoriesSlice";

export default function ProductFilters({
  products,
  onFiltersChange,
  activeFilters,
  onClearFilters,
}) {
  const dispatch = useDispatch();
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Get categories from Redux state
  const {
    publicCategories: categories,
    publicCategoriesLoading: categoriesLoading,
    publicCategoriesError: categoriesError,
  } = useSelector((state) => state.categories);

  // Fetch categories on component mount
  useEffect(() => {
    console.log("Fetching public categories...");
    dispatch(fetchPublicCategories());
  }, [dispatch]);

  // Debug categories data
  useEffect(() => {
    console.log("Categories data:", categories);
    console.log("Categories loading:", categoriesLoading);
    console.log("Categories error:", categoriesError);
  }, [categories, categoriesLoading, categoriesError]);

  // Sync local state with active filters
  useEffect(() => {
    setSearchTerm(activeFilters.searchTerm || "");
    setSortBy(activeFilters.sortBy || "");
    if (activeFilters.priceRange) {
      setPriceRange({
        min: activeFilters.priceRange.min || "",
        max:
          activeFilters.priceRange.max === Infinity
            ? ""
            : activeFilters.priceRange.max || "",
      });
    } else {
      setPriceRange({ min: "", max: "" });
    }
  }, [activeFilters]);

  // Calculate price range from products
  const prices = products.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const toggleCategoryExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryChange = (categoryName, checked) => {
    const currentCategories = activeFilters.categories || [];
    const updatedCategories = checked
      ? [...currentCategories, categoryName]
      : currentCategories.filter((c) => c !== categoryName);

    onFiltersChange({
      ...activeFilters,
      categories: updatedCategories,
    });
  };

  const handleSubcategoryChange = (subcategoryName, checked) => {
    const currentCategories = activeFilters.categories || [];
    const updatedCategories = checked
      ? [...currentCategories, subcategoryName]
      : currentCategories.filter((c) => c !== subcategoryName);

    onFiltersChange({
      ...activeFilters,
      categories: updatedCategories,
    });
  };

  const handlePriceRangeChange = () => {
    const min = parseFloat(priceRange.min) || 0;
    const max = parseFloat(priceRange.max) || Infinity;

    onFiltersChange({
      ...activeFilters,
      priceRange: { min, max },
    });
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    onFiltersChange({
      ...activeFilters,
      searchTerm: value,
    });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    onFiltersChange({
      ...activeFilters,
      sortBy: value,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (activeFilters.categories?.length > 0) count++;
    if (activeFilters.priceRange) count++;
    if (activeFilters.searchTerm) count++;
    if (activeFilters.sortBy) count++;
    return count;
  };

  return (
    <Card
      className="h-100"
      style={{
        border: "none",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
        borderRadius: "20px",
        backgroundColor: "white",
        overflow: "hidden",
      }}
    >
      <Card.Header
        className="d-flex justify-content-between align-items-center"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: "0",
          padding: "1.25rem 1.5rem",
          borderBottom: "none",
        }}
      >
        <div className="d-flex align-items-center">
          <div
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              padding: "8px",
              marginRight: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiFilter size={20} strokeWidth={2.5} />
          </div>
          <strong
            style={{
              fontSize: "1.25rem",
              fontWeight: "800",
              letterSpacing: "-0.01em",
            }}
          >
            Filters
          </strong>
        </div>
        {getActiveFiltersCount() > 0 && (
          <div className="d-flex align-items-center gap-2">
            <Badge
              style={{
                fontSize: "0.85rem",
                padding: "6px 12px",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.25)",
                color: "white",
                fontWeight: "700",
                border: "2px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              {getActiveFiltersCount()}
            </Badge>
            <Button
              variant="outline-light"
              size="sm"
              onClick={onClearFilters}
              className="hover-scale"
              style={{
                border: "2px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "12px",
                padding: "6px 12px",
                color: "white",
                background: "rgba(255, 255, 255, 0.1)",
                fontWeight: "700",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }}
            >
              <FiX size={16} strokeWidth={2.5} />
            </Button>
          </div>
        )}
      </Card.Header>
      <Card.Body style={{ padding: "1.75rem" }}>
        {/* Search */}
        <div className="mb-4">
          <Form.Label
            className="fw-bold text-start d-block"
            style={{
              color: "#1f2937",
              marginBottom: "0.75rem",
              fontSize: "1rem",
              fontWeight: "700",
            }}
          >
            Search Products
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{
              borderRadius: "14px",
              border: "2px solid #e5e7eb",
              padding: "12px 16px",
              fontSize: "0.95rem",
              transition: "all 0.3s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#667eea";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(102, 126, 234, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Sort */}
        <div className="mb-4">
          <Form.Label
            className="fw-bold text-start d-block"
            style={{
              color: "#1f2937",
              marginBottom: "0.75rem",
              fontSize: "1rem",
              fontWeight: "700",
            }}
          >
            Sort By
          </Form.Label>
          <Form.Select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            style={{
              borderRadius: "14px",
              border: "2px solid #e5e7eb",
              padding: "12px 16px",
              fontSize: "0.95rem",
              transition: "all 0.3s",
              cursor: "pointer",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#667eea";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(102, 126, 234, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <option value="">Default</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </Form.Select>
        </div>

        {/* Categories */}
        <div className="mb-4">
          <Form.Label
            className="fw-bold text-start d-block"
            style={{
              color: "#1f2937",
              marginBottom: "0.75rem",
              fontSize: "1rem",
              fontWeight: "700",
            }}
          >
            Categories
          </Form.Label>

          {categoriesLoading ? (
            <div
              className="text-center py-4"
              style={{ background: "#f9fafb", borderRadius: "14px" }}
            >
              <Spinner
                animation="border"
                size="sm"
                style={{ color: "#667eea" }}
              />
              <div
                className="small mt-2"
                style={{ color: "#6b7280", fontWeight: "600" }}
              >
                Loading categories...
              </div>
            </div>
          ) : categoriesError ? (
            <div
              className="text-center py-4 small"
              style={{
                color: "#ef4444",
                background: "#fef2f2",
                borderRadius: "14px",
                fontWeight: "600",
              }}
            >
              Failed to load categories
            </div>
          ) : categories && categories.length > 0 ? (
            <div
              style={{
                maxHeight: "320px",
                overflowY: "auto",
                background: "#f9fafb",
                padding: "1rem",
                borderRadius: "14px",
                border: "2px solid #e5e7eb",
              }}
              className="custom-scrollbar"
            >
              {categories.map((category) => (
                <div
                  key={category._id}
                  style={{
                    marginBottom: "0.75rem",
                    background: "white",
                    padding: "0.75rem",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#667eea";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(102, 126, 234, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Main Category */}
                  <div className="d-flex align-items-center">
                    {category.subcategories &&
                      category.subcategories.length > 0 && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => toggleCategoryExpansion(category._id)}
                          className="p-0 me-2"
                          style={{
                            color: "#667eea",
                            textDecoration: "none",
                            minWidth: "22px",
                            height: "22px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            background: "#f3f4f6",
                            borderRadius: "8px",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#e5e7eb";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#f3f4f6";
                          }}
                        >
                          {expandedCategories.has(category._id) ? (
                            <FiChevronDown size={16} strokeWidth={2.5} />
                          ) : (
                            <FiChevronRight size={16} strokeWidth={2.5} />
                          )}
                        </Button>
                      )}
                    {!category.subcategories ||
                    category.subcategories.length === 0 ? (
                      <div
                        style={{ minWidth: "22px", marginRight: "0.5rem" }}
                      ></div>
                    ) : null}
                    <Form.Check
                      type="checkbox"
                      id={`category-${category._id}`}
                      label={
                        <span
                          style={{
                            fontWeight: "700",
                            fontSize: "0.95rem",
                            color: "#1f2937",
                          }}
                        >
                          {category.name}
                        </span>
                      }
                      checked={
                        activeFilters.categories?.includes(category.name) ||
                        false
                      }
                      onChange={(e) =>
                        handleCategoryChange(category.name, e.target.checked)
                      }
                      className="text-start mb-0 flex-grow-1"
                      style={{
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>

                  {/* Subcategories */}
                  {expandedCategories.has(category._id) &&
                    category.subcategories &&
                    category.subcategories.length > 0 && (
                      <div
                        style={{
                          marginTop: "0.75rem",
                          marginLeft: "2.25rem",
                          borderLeft: "3px solid #667eea",
                          paddingLeft: "1rem",
                          background: "#faf5ff",
                          borderRadius: "0 8px 8px 0",
                          padding: "0.75rem 0 0.75rem 1rem",
                        }}
                      >
                        {category.subcategories
                          .filter((sub) => sub.isActive)
                          .map((subcategory, index) => (
                            <Form.Check
                              key={subcategory._id}
                              type="checkbox"
                              id={`subcategory-${subcategory._id}`}
                              label={
                                <span
                                  style={{
                                    fontWeight: "600",
                                    fontSize: "0.9rem",
                                    color: "#4b5563",
                                  }}
                                >
                                  {subcategory.name}
                                </span>
                              }
                              checked={
                                activeFilters.categories?.includes(
                                  subcategory.name,
                                ) || false
                              }
                              onChange={(e) =>
                                handleSubcategoryChange(
                                  subcategory.name,
                                  e.target.checked,
                                )
                              }
                              className="text-start"
                              style={{
                                fontSize: "0.9rem",
                                marginBottom:
                                  index <
                                  category.subcategories.filter(
                                    (sub) => sub.isActive,
                                  ).length -
                                    1
                                    ? "0.5rem"
                                    : "0rem",
                              }}
                            />
                          ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-4 small"
              style={{
                color: "#6b7280",
                background: "#f9fafb",
                borderRadius: "14px",
                fontWeight: "600",
              }}
            >
              No categories available
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="mb-4">
          <Form.Label
            className="fw-bold text-start d-block"
            style={{
              color: "#1f2937",
              marginBottom: "0.75rem",
              fontSize: "1rem",
              fontWeight: "700",
            }}
          >
            Price Range
          </Form.Label>
          <div
            className="small mb-3"
            style={{
              color: "#1f2937",
              background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
              padding: "12px 16px",
              borderRadius: "14px",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "0.95rem",
              border: "2px solid #bbf7d0",
            }}
          >
            ₹{minPrice} - ₹{maxPrice}
          </div>
          <div className="d-flex gap-2 mb-3">
            <Form.Control
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange({ ...priceRange, min: e.target.value })
              }
              min={minPrice}
              max={maxPrice}
              style={{
                borderRadius: "14px",
                border: "2px solid #e5e7eb",
                fontSize: "0.95rem",
                padding: "12px 16px",
                transition: "all 0.3s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <Form.Control
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange({ ...priceRange, max: e.target.value })
              }
              min={minPrice}
              max={maxPrice}
              style={{
                borderRadius: "14px",
                border: "2px solid #e5e7eb",
                fontSize: "0.95rem",
                padding: "12px 16px",
                transition: "all 0.3s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePriceRangeChange}
            disabled={!priceRange.min && !priceRange.max}
            className="w-100 hover-scale"
            style={{
              borderRadius: "14px",
              fontWeight: "700",
              padding: "12px 16px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              border: "none",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              transition: "all 0.3s",
              fontSize: "0.95rem",
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(102, 126, 234, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(102, 126, 234, 0.3)";
            }}
          >
            Apply Price Filter
          </Button>
        </div>

        {/* Active Filters Summary */}
        {getActiveFiltersCount() > 0 && (
          <div
            className="mt-4 pt-4"
            style={{
              borderTop: "2px dashed #e5e7eb",
              background: "#f9fafb",
              margin: "0 -1.75rem",
              padding: "1.25rem 1.75rem",
              borderRadius: "0 0 20px 20px",
            }}
          >
            <div
              className="fw-bold mb-3"
              style={{ color: "#1f2937", fontSize: "1rem", fontWeight: "700" }}
            >
              Active Filters:
            </div>
            <div className="d-flex flex-wrap gap-2">
              {activeFilters.categories?.map((category) => (
                <Badge
                  key={category}
                  style={{
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    color: "white",
                    fontSize: "0.8rem",
                    padding: "8px 14px",
                    borderRadius: "16px",
                    fontWeight: "700",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.25)",
                  }}
                >
                  {category}
                </Badge>
              ))}
              {activeFilters.priceRange && (
                <Badge
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "white",
                    fontSize: "0.8rem",
                    padding: "8px 14px",
                    borderRadius: "16px",
                    fontWeight: "700",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
                  }}
                >
                  ₹{activeFilters.priceRange.min} - ₹
                  {activeFilters.priceRange.max === Infinity
                    ? "Max"
                    : activeFilters.priceRange.max}
                </Badge>
              )}
              {activeFilters.searchTerm && (
                <Badge
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    color: "white",
                    fontSize: "0.8rem",
                    padding: "8px 14px",
                    borderRadius: "16px",
                    fontWeight: "700",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(245, 158, 11, 0.25)",
                  }}
                >
                  Search: "{activeFilters.searchTerm}"
                </Badge>
              )}
              {activeFilters.sortBy && (
                <Badge
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                    color: "white",
                    fontSize: "0.8rem",
                    padding: "8px 14px",
                    borderRadius: "16px",
                    fontWeight: "700",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(139, 92, 246, 0.25)",
                  }}
                >
                  {activeFilters.sortBy
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
