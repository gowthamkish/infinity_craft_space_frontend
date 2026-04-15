import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spinner } from "react-bootstrap";
import { FiFilter, FiX, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { fetchPublicCategories } from "../features/categoriesSlice";
import "./ProductFilters.css";

export default function ProductFilters({
  products,
  onFiltersChange,
  activeFilters,
  onClearFilters,
}) {
  const dispatch = useDispatch();
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const {
    publicCategories: categories,
    publicCategoriesLoading: categoriesLoading,
    publicCategoriesError: categoriesError,
  } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchPublicCategories());
  }, [dispatch]);

  // Sync with external filter state
  useEffect(() => {
    setSortBy(activeFilters.sortBy || "");
    setPriceRange(
      activeFilters.priceRange
        ? {
            min: activeFilters.priceRange.min || "",
            max:
              activeFilters.priceRange.max === Infinity
                ? ""
                : activeFilters.priceRange.max || "",
          }
        : { min: "", max: "" },
    );
  }, [activeFilters]);

  const prices = products.map((p) => p.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const toggleExpand = (id) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCategoryChange = (name, checked) => {
    const cats = activeFilters.categories || [];
    onFiltersChange({
      ...activeFilters,
      categories: checked ? [...cats, name] : cats.filter((c) => c !== name),
    });
  };

  const handlePriceApply = () => {
    const min = parseFloat(priceRange.min) || 0;
    const max = parseFloat(priceRange.max) || Infinity;
    onFiltersChange({ ...activeFilters, priceRange: { min, max } });
  };

  const handleSort = (val) => {
    setSortBy(val);
    onFiltersChange({ ...activeFilters, sortBy: val });
  };

  const activeCount = [
    activeFilters.categories?.length > 0,
    !!activeFilters.priceRange,
    !!activeFilters.sortBy,
  ].filter(Boolean).length;

  return (
    <div className="pf-card card">
      {/* Body */}
      <div className="pf-body card-body">
        {/* Sort */}
        <div className="pf-section">
          <label className="pf-section-label">Sort by</label>
          <select
            className="pf-select form-select"
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
          >
            <option value="">Default</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>

        <hr className="pf-divider" />

        {/* Categories */}
        <div className="pf-section">
          <label className="pf-section-label">Categories</label>
          {categoriesLoading ? (
            <div className="pf-state text-center">
              <Spinner
                animation="border"
                size="sm"
                style={{ color: "var(--primary)" }}
              />
              <div className="mt-2" style={{ color: "var(--text-muted)" }}>
                Loading…
              </div>
            </div>
          ) : categoriesError ? (
            <div className="pf-state pf-state--error">
              Failed to load categories
            </div>
          ) : categories?.length > 0 ? (
            <div className="pf-categories">
              {categories.map((cat) => {
                const hasSubs = cat.subcategories?.length > 0;
                const isOpen = expandedCategories.has(cat._id);
                const checked =
                  activeFilters.categories?.includes(cat.name) || false;
                return (
                  <div key={cat._id} className="pf-cat-item">
                    <div className="pf-cat-row">
                      {hasSubs ? (
                        <button
                          className="pf-expand-btn"
                          onClick={() => toggleExpand(cat._id)}
                          aria-label={isOpen ? "Collapse" : "Expand"}
                        >
                          {isOpen ? (
                            <FiChevronDown size={13} />
                          ) : (
                            <FiChevronRight size={13} />
                          )}
                        </button>
                      ) : (
                        <span className="pf-expand-spacer" />
                      )}
                      <input
                        type="checkbox"
                        className="pf-checkbox"
                        id={`cat-${cat._id}`}
                        checked={checked}
                        onChange={(e) =>
                          handleCategoryChange(cat.name, e.target.checked)
                        }
                      />
                      <label
                        className="pf-cat-label"
                        htmlFor={`cat-${cat._id}`}
                      >
                        {cat.name}
                      </label>
                    </div>

                    {isOpen && hasSubs && (
                      <div className="pf-subcats">
                        {cat.subcategories
                          .filter((s) => s.isActive)
                          .map((sub) => (
                            <div key={sub._id} className="pf-subcat-row">
                              <input
                                type="checkbox"
                                className="pf-checkbox"
                                id={`sub-${sub._id}`}
                                checked={
                                  activeFilters.categories?.includes(
                                    sub.name,
                                  ) || false
                                }
                                onChange={(e) =>
                                  handleCategoryChange(
                                    sub.name,
                                    e.target.checked,
                                  )
                                }
                              />
                              <label
                                className="pf-subcat-label"
                                htmlFor={`sub-${sub._id}`}
                              >
                                {sub.name}
                              </label>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="pf-state pf-state--empty">
              No categories available
            </div>
          )}
        </div>

        <hr className="pf-divider" />

        {/* Price Range */}
        <div className="pf-section">
          <label className="pf-section-label">Price Range</label>
          {prices.length > 0 && (
            <div className="pf-price-hint">
              ₹{minPrice.toLocaleString()} – ₹{maxPrice.toLocaleString()}
            </div>
          )}
          <div className="pf-price-row">
            <input
              type="number"
              className="pf-input"
              placeholder="Min ₹"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange((p) => ({ ...p, min: e.target.value }))
              }
              min={minPrice}
              max={maxPrice}
            />
            <input
              type="number"
              className="pf-input"
              placeholder="Max ₹"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange((p) => ({ ...p, max: e.target.value }))
              }
              min={minPrice}
              max={maxPrice}
            />
          </div>
          <button
            className="pf-apply-btn"
            onClick={handlePriceApply}
            disabled={!priceRange.min && !priceRange.max}
          >
            Apply Price Filter
          </button>
        </div>

        {/* Active filter chips */}
        {activeCount > 0 && (
          <div className="pf-active-section">
            <div className="pf-active-title">Active filters</div>
            <div className="pf-chips">
              {activeFilters.categories?.map((c) => (
                <span key={c} className="pf-chip pf-chip--cat">
                  {c}
                </span>
              ))}
              {activeFilters.priceRange && (
                <span className="pf-chip pf-chip--price">
                  ₹{activeFilters.priceRange.min}–
                  {activeFilters.priceRange.max === Infinity
                    ? "Max"
                    : `₹${activeFilters.priceRange.max}`}
                </span>
              )}
              {activeFilters.sortBy && (
                <span className="pf-chip pf-chip--sort">
                  {activeFilters.sortBy
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
