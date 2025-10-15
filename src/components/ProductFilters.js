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
  onClearFilters 
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
    publicCategoriesError: categoriesError
  } = useSelector(state => state.categories);

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchPublicCategories());
  }, [dispatch]);
  
  // Calculate price range from products
  const prices = products.map(p => p.price);
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
      : currentCategories.filter(c => c !== categoryName);
    
    onFiltersChange({
      ...activeFilters,
      categories: updatedCategories
    });
  };

  const handleSubcategoryChange = (subcategoryName, checked) => {
    const currentCategories = activeFilters.categories || [];
    const updatedCategories = checked 
      ? [...currentCategories, subcategoryName]
      : currentCategories.filter(c => c !== subcategoryName);
    
    onFiltersChange({
      ...activeFilters,
      categories: updatedCategories
    });
  };

  const handlePriceRangeChange = () => {
    const min = parseFloat(priceRange.min) || 0;
    const max = parseFloat(priceRange.max) || Infinity;
    
    onFiltersChange({
      ...activeFilters,
      priceRange: { min, max }
    });
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    onFiltersChange({
      ...activeFilters,
      searchTerm: value
    });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    onFiltersChange({
      ...activeFilters,
      sortBy: value
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
    <Card className="h-100" style={{ border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", borderRadius: "16px", backgroundColor: "white" }}>
      <Card.Header 
        className="d-flex justify-content-between align-items-center"
        style={{
          background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
          color: "#1e293b",
          borderRadius: "16px 16px 0 0",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid #e2e8f0"
        }}
      >
        <div className="d-flex align-items-center">
          <FiFilter size={18} className="me-2" />
          <strong style={{ fontSize: "1.1rem" }}>Filters</strong>
        </div>
        {getActiveFiltersCount() > 0 && (
          <div className="d-flex align-items-center gap-2">
            <Badge 
              style={{
                fontSize: "0.8rem",
                padding: "4px 8px",
                borderRadius: "12px",
                backgroundColor: "#3b82f6",
                color: "white"
              }}
            >
              {getActiveFiltersCount()}
            </Badge>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onClearFilters}
              className="hover-scale"
              style={{
                border: "2px solid #cbd5e1",
                borderRadius: "8px",
                padding: "4px 8px",
                color: "#64748b"
              }}
            >
              <FiX size={14} />
            </Button>
          </div>
        )}
      </Card.Header>
      <Card.Body style={{ padding: "1.5rem" }}>
        {/* Search */}
        <div className="mb-4">
          <Form.Label className="fw-bold text-start d-block" style={{ color: "var(--text-primary)", marginBottom: "0.75rem" }}>
            Search Products
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{
              borderRadius: "8px",
              border: "2px solid var(--border-color)",
              padding: "10px 12px",
              fontSize: "0.9rem"
            }}
          />
        </div>

        {/* Sort */}
        <div className="mb-4">
          <Form.Label className="fw-bold text-start d-block" style={{ color: "var(--text-primary)", marginBottom: "0.75rem" }}>
            Sort By
          </Form.Label>
          <Form.Select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            style={{
              borderRadius: "8px",
              border: "2px solid var(--border-color)",
              padding: "10px 12px",
              fontSize: "0.9rem"
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
          <Form.Label className="fw-bold text-start d-block" style={{ color: "var(--text-primary)", marginBottom: "0.75rem" }}>
            Categories
          </Form.Label>
          
          {categoriesLoading ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />
              <div className="small text-muted mt-2">Loading categories...</div>
            </div>
          ) : categoriesError ? (
            <div className="text-center py-3 text-danger small">
              Failed to load categories
            </div>
          ) : categories && categories.length > 0 ? (
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {categories.map((category) => (
                <div key={category._id} className="mb-3">
                  {/* Main Category */}
                  <div className="d-flex align-items-center">
                    {category.subcategories && category.subcategories.length > 0 && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => toggleCategoryExpansion(category._id)}
                        className="p-0 me-2"
                        style={{ 
                          color: "#6b7280",
                          textDecoration: "none",
                          minWidth: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        {expandedCategories.has(category._id) ? 
                          <FiChevronDown size={14} /> : 
                          <FiChevronRight size={14} />
                        }
                      </Button>
                    )}
                    <Form.Check
                      type="checkbox"
                      id={`category-${category._id}`}
                      label={category.name}
                      checked={activeFilters.categories?.includes(category.name) || false}
                      onChange={(e) => handleCategoryChange(category.name, e.target.checked)}
                      className="text-start mb-0 flex-grow-1"
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                        fontWeight: category.subcategories?.length > 0 ? "600" : "normal"
                      }}
                    />
                  </div>

                  {/* Subcategories */}
                  {expandedCategories.has(category._id) && category.subcategories && category.subcategories.length > 0 && (
                    <div className="ms-4 mt-2">
                      {category.subcategories
                        .filter(sub => sub.isActive)
                        .map((subcategory) => (
                          <Form.Check
                            key={subcategory._id}
                            type="checkbox"
                            id={`subcategory-${subcategory._id}`}
                            label={subcategory.name}
                            checked={activeFilters.categories?.includes(subcategory.name) || false}
                            onChange={(e) => handleSubcategoryChange(subcategory.name, e.target.checked)}
                            className="text-start mb-2"
                            style={{
                              fontSize: "0.85rem",
                              color: "#6b7280",
                              paddingLeft: "0.25rem"
                            }}
                          />
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3 text-muted small">
              No categories available
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="mb-4">
          <Form.Label className="fw-bold text-start d-block" style={{ color: "var(--text-primary)", marginBottom: "0.75rem" }}>
            Price Range
          </Form.Label>
          <div className="small mb-3" style={{ 
            color: "var(--text-secondary)",
            backgroundColor: "var(--bg-tertiary)",
            padding: "8px 12px",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            ₹{minPrice} - ₹{maxPrice}
          </div>
          <div className="d-flex gap-2 mb-3">
            <Form.Control
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              min={minPrice}
              max={maxPrice}
              style={{
                borderRadius: "8px",
                border: "2px solid var(--border-color)",
                fontSize: "0.9rem"
              }}
            />
            <Form.Control
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              min={minPrice}
              max={maxPrice}
              style={{
                borderRadius: "8px",
                border: "2px solid var(--border-color)",
                fontSize: "0.9rem"
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
              borderRadius: "8px",
              fontWeight: "500",
              padding: "8px 16px",
              background: "var(--primary-color)",
              border: "none"
            }}
          >
            Apply Price Filter
          </Button>
        </div>

        {/* Active Filters Summary */}
        {getActiveFiltersCount() > 0 && (
          <div className="mt-4 pt-3 border-top" style={{ borderTop: "1px solid #e2e8f0" }}>
            <div className="fw-bold mb-2" style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>
              Active Filters:
            </div>
            <div className="d-flex flex-wrap gap-1">
              {activeFilters.categories?.map(category => (
                <Badge 
                  key={category} 
                  style={{
                    backgroundColor: "#3b82f6",
                    color: "white",
                    fontSize: "0.75rem",
                    padding: "4px 8px",
                    borderRadius: "12px"
                  }}
                  className="me-1 mb-1"
                >
                  {category}
                </Badge>
              ))}
              {activeFilters.priceRange && (
                <Badge 
                  style={{
                    backgroundColor: "#10b981",
                    color: "white",
                    fontSize: "0.75rem",
                    padding: "4px 8px",
                    borderRadius: "12px"
                  }}
                  className="mb-1"
                >
                  ₹{activeFilters.priceRange.min} - ₹{activeFilters.priceRange.max === Infinity ? 'Max' : activeFilters.priceRange.max}
                </Badge>
              )}
              {activeFilters.searchTerm && (
                <Badge 
                  style={{
                    backgroundColor: "#f59e0b",
                    color: "white",
                    fontSize: "0.75rem",
                    padding: "4px 8px",
                    borderRadius: "12px"
                  }}
                  className="mb-1"
                >
                  Search: "{activeFilters.searchTerm}"
                </Badge>
              )}
              {activeFilters.sortBy && (
                <Badge 
                  style={{
                    backgroundColor: "#8b5cf6",
                    color: "white",
                    fontSize: "0.75rem",
                    padding: "4px 8px",
                    borderRadius: "12px"
                  }}
                  className="mb-1"
                >
                  {activeFilters.sortBy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}