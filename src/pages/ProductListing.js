import React, {
  useState, useMemo, useCallback, lazy, Suspense, useEffect, useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addToCart, removeFromCart } from "../features/cartSlice";
import { useProductFeedInfiniteQuery } from "../services/productsApi";
import { useGetPublicCategoriesQuery } from "../services/categoriesApi";
import {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "../services/accountApi";
import { errMsg } from "../app/baseApi";
import { onImgError, PLACEHOLDER_SRC } from "../utils/imageFallback";
import { buildCloudinaryUrl } from "../components/OptimizedImage";
import "./categoryCircles.css";
import {
  Box, Typography, TextField, InputAdornment, IconButton, Button,
  Chip, Skeleton, CircularProgress, Alert, Stack, Popover, Tooltip,
} from "@mui/material";
import { DotsLoader } from "../components/Loader";
import {
  FiGrid, FiShoppingCart, FiX, FiHeart, FiTrash2,
  FiSearch, FiPackage, FiCheck, FiAlertCircle, FiEye, FiStar,
  FiChevronDown, FiArrowUp, FiArrowDown, FiType, FiTag,
} from "react-icons/fi";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import { trackAddToCart, trackRemoveFromCart } from "../utils/analytics";

const Header             = lazy(() => import("../components/Header"));
const ImageCarouselModal = lazy(() => import("../components/ImageCarouselModal"));

const SORT_OPTIONS = [
  { value: "",               label: "Relevance" },
  { value: "price-low-high", label: "Price: Low → High", icon: FiArrowUp },
  { value: "price-high-low", label: "Price: High → Low", icon: FiArrowDown },
  { value: "name-asc",       label: "Name: A → Z",       icon: FiType },
  { value: "name-desc",      label: "Name: Z → A",       icon: FiType },
];

const PAGE_SIZE = 16;
// Shared collator: String#localeCompare builds a new collator on every call,
// which is the hot path of an O(n log n) sort
const nameCollator = new Intl.Collator();
const ROSE = "#d24e33";

function UtilCircle({ icon: Icon, label, active, onClick, ariaLabel, danger, expanded }) {
  return (
    <button type="button" className={`cc-item ${active ? "is-active" : ""} ${danger ? "is-danger" : ""}`} aria-label={ariaLabel || label} aria-pressed={active} aria-expanded={expanded} onClick={onClick}>
      <span className="cc-circle cc-circle--util"><Icon size={20} aria-hidden="true" /><i className="cc-check" aria-hidden="true">✓</i></span>
      <span className="cc-label">{label}</span>
    </button>
  );
}

/* ── Circular category filters ─────────────────────────────────────────────
   Square 1:1 crop → round, label underneath, ring + check badge when active,
   horizontal scroll-snap row (never wraps). Categories have no image of their own,
   so each circle shows the first product image found in that category. */
function CategoryCircles({ categories, products, selectedSet, expandedId, onSelect, onClear, lead, trail }) {
  const imageByName = useMemo(() => {
    const m = new Map();
    for (const p of products) {
      const url = p.images?.[0]?.url || p.image?.url || p.image;
      if (!url) continue;
      for (const k of [p.category, p.subCategory]) {
        const key = k?.toLowerCase();
        if (key && !m.has(key)) m.set(key, url);
      }
    }
    return m;
  }, [products]);

  const anySelected = selectedSet.size > 0;
  return (
    <div className="cc-row" role="group" aria-label="Filters">
      {lead}
      <button type="button" className={`cc-item ${!anySelected ? "is-active" : ""}`} aria-pressed={!anySelected} onClick={onClear}>
        <span className="cc-circle cc-circle--all"><span aria-hidden="true">✦</span><i className="cc-check" aria-hidden="true">✓</i></span>
        <span className="cc-label">All</span>
      </button>
      {categories.map((cat) => {
        const names = [cat.name, ...(cat.subcategories?.filter((s) => s.isActive !== false).map((s) => s.name) || [])];
        const count = names.filter((n) => selectedSet.has(n)).length;
        const raw = names.map((n) => imageByName.get(n.toLowerCase())).find(Boolean);
        const src = raw ? buildCloudinaryUrl(raw, 160) || raw : PLACEHOLDER_SRC;
        return (
          <button key={cat._id} type="button" className={`cc-item ${count ? "is-active" : ""}`} aria-pressed={count > 0} aria-expanded={expandedId === cat._id} onClick={() => onSelect(cat)}>
            <span className="cc-circle">
              <img src={src} alt="" loading="lazy" decoding="async" width="80" height="80" onError={onImgError} />
              <i className="cc-check" aria-hidden="true">✓</i>
              {count > 1 && <b className="cc-count">{count}</b>}
            </span>
            <span className="cc-label">{cat.name}</span>
          </button>
        );
      })}
      {trail}
    </div>
  );
}

/* ── Lazy Image ─────────────────────────────────────────────────────── */
function useLazyImage(src) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = imgRef.current;
    if (!el || typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); ob.disconnect(); } }, { rootMargin: "200px" });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return { imgRef, src: visible ? src : undefined, loaded, setLoaded };
}

/* ── Skeleton Card ───────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <Box sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #e7e5e4", bgcolor: "#fff" }}>
    <Skeleton variant="rectangular" width="100%" sx={{ aspectRatio: "1/1" }} />
    <Box sx={{ p: 1.75 }}>
      <Skeleton width="35%" height={14} sx={{ mb: 0.75 }} />
      <Skeleton width="85%" height={18} sx={{ mb: 0.5 }} />
      <Skeleton width="60%" height={18} sx={{ mb: 1.25 }} />
      <Skeleton width="45%" height={22} sx={{ mb: 1.25 }} />
      <Skeleton width="100%" height={34} sx={{ borderRadius: 2 }} />
    </Box>
  </Box>
);

/* ── Product Card ────────────────────────────────────────────────────── */
const ProductCard = React.memo(({
  product, quantityInCart, onAddToCart, onRemoveFromCart,
  onImageClick, onShowToast, isWishlisted,
}) => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s) => !!s.auth.user);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  // Optimistic: the heart flips instantly via the shared wishlist cache; rolled back on failure.
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const isOutOfStock = product.trackInventory !== false && product.stock <= 0;
  const isLowStock   = product.trackInventory !== false && product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
  const discountPct  = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;

  // Products that need the detail page to make a selection before buying
  const requiresOptionSelection =
    (product.showHoopSizePicker && product.hoopSizes?.length > 0) ||
    (product.showColorPickerToUsers && (product.colors || []).some((c) => c.visibleToUsers)) ||
    product.isCustomizable;
  const rawImageUrl  = product.images?.[0]?.url || product.image?.url || product.image || null;
  const imgCount     = product.images?.length || 0;
  const { imgRef, src: imageUrl, loaded: imgLoaded, setLoaded: setImgLoaded } = useLazyImage(rawImageUrl);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id).unwrap();
        onShowToast("Removed from wishlist", "success");
      } else {
        await addToWishlist({ product }).unwrap();
        onShowToast("Added to wishlist ♡", "success");
      }
    } catch { onShowToast("Wishlist action failed", "error"); }
    finally { setWishlistLoading(false); }
  };

  const handleCart = async (fn) => {
    if (requiresOptionSelection) {
      navigate(`/product/${product._id}`);
      return;
    }
    setCartLoading(true);
    try { await Promise.resolve(fn(product)); } catch { /* ignore */ }
    finally { setCartLoading(false); }
  };

  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid #e7e5e4",
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.22s ease, transform 0.22s ease",
        "&:hover": {
          boxShadow: "0 12px 32px rgba(210, 78, 51,0.12)",
          transform: "translateY(-3px)",
          "& .card-img": { transform: "scale(1.05)" },
          "& .card-overlay": { opacity: 1 },
        },
      }}
    >
      {/* ── Image ── */}
      <Box sx={{ position: "relative", overflow: "hidden", cursor: "pointer", flexShrink: 0 }}>
        {rawImageUrl ? (
          <Box
            component="img"
            ref={imgRef}
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={(e) => { onImgError(e); setImgLoaded(true); }}
            className="card-img"
            sx={{
              width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block",
              opacity: imgLoaded ? 1 : 0, transition: "opacity 0.3s, transform 0.4s ease",
            }}
          />
        ) : (
          <Box component="img" src={PLACEHOLDER_SRC} alt={product.name} loading="lazy"
            sx={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }} />
        )}

        {/* Hover overlay */}
        <Box
          className="card-overlay"
          onClick={() => onImageClick?.(product)}
          sx={{
            position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.36)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: 0, transition: "opacity 0.22s", cursor: "pointer",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, bgcolor: "rgba(255,255,255,0.92)", px: 1.5, py: 0.625, borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700, color: "#1c1917" }}>
            <FiEye size={14} /> Quick view
          </Box>
        </Box>

        {/* Wishlist button — top right */}
        <Tooltip title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"} arrow>
          <IconButton
            size="small"
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            sx={{
              position: "absolute", top: 8, right: 8,
              width: 32, height: 32,
              bgcolor: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(4px)",
              border: `1.5px solid ${isWishlisted ? "#e11d48" : "transparent"}`,
              color: isWishlisted ? "#e11d48" : "#57534e",
              transition: "all 0.18s",
              "&:hover": { bgcolor: "#fff", color: "#e11d48", borderColor: "#e11d48", transform: "scale(1.1)" },
            }}
          >
            {wishlistLoading
              ? <CircularProgress size={13} color="inherit" />
              : <FiHeart size={14} fill={isWishlisted ? "currentColor" : "none"} />}
          </IconButton>
        </Tooltip>

        {/* Status / discount badges — top left */}
        <Stack spacing={0.5} sx={{ position: "absolute", top: 10, left: 10, zIndex: 2 }}>
          {discountPct > 0 && (
            <Box sx={{ display: "inline-flex", alignItems: "center", bgcolor: "#dc2626", color: "#fff", fontSize: "0.68rem", fontWeight: 700, px: 1, py: 0.3, borderRadius: "6px", letterSpacing: "0.03em" }}>
              {discountPct}% OFF
            </Box>
          )}
          {isOutOfStock && (
            <Box sx={{ display: "inline-flex", alignItems: "center", bgcolor: "#dc2626", color: "#fff", fontSize: "0.68rem", fontWeight: 700, px: 1, py: 0.3, borderRadius: "6px" }}>
              Out of Stock
            </Box>
          )}
          {!isOutOfStock && isLowStock && (
            <Box sx={{ display: "inline-flex", alignItems: "center", bgcolor: "#f59e0b", color: "#fff", fontSize: "0.68rem", fontWeight: 700, px: 1, py: 0.3, borderRadius: "6px" }}>
              Only {product.stock} left
            </Box>
          )}
          {!isOutOfStock && product.isCustomizable && (
            <Box sx={{ display: "inline-flex", alignItems: "center", bgcolor: ROSE, color: "#fff", fontSize: "0.68rem", fontWeight: 700, px: 1, py: 0.3, borderRadius: "6px" }}>
              ✦ Custom
            </Box>
          )}
        </Stack>

        {/* Photo count */}
        {imgCount > 1 && (
          <Box sx={{ position: "absolute", bottom: 8, right: 8, bgcolor: "rgba(0,0,0,0.55)", color: "#fff", fontSize: "0.68rem", fontWeight: 600, px: 0.9, py: 0.25, borderRadius: "6px", backdropFilter: "blur(2px)" }}>
            +{imgCount - 1}
          </Box>
        )}
      </Box>

      {/* ── Body ── */}
      <Box sx={{ p: 1.75, display: "flex", flexDirection: "column", flexGrow: 1 }}>
        {/* Category */}
        {product.category && (
          <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: ROSE, textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.4 }}>
            {product.category}
          </Typography>
        )}

        {/* Name */}
        <Typography
          variant="body2"
          onClick={() => navigate(`/product/${product._id}`)}
          sx={{ fontWeight: 600,
            cursor: "pointer", lineHeight: 1.4, color: "#1c1917",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            "&:hover": { color: ROSE },
            transition: "color 0.15s",
          }}
          title={product.name}
        >
          {product.name}
        </Typography>

        {/* Rating */}
        {product.averageRating > 0 && (
          <Stack direction="row" spacing={0.4} sx={{ alignItems: "center", mt: 0.6 }}>
            <Box sx={{ display: "flex", color: "#f59e0b" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ fontSize: "0.78rem" }}>
                  {i < Math.round(product.averageRating) ? "★" : "☆"}
                </span>
              ))}
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
              {product.averageRating.toFixed(1)}
              {product.ratingCount > 0 && ` (${product.ratingCount})`}
            </Typography>
          </Stack>
        )}

        {/* Color swatches */}
        {product.showColorPickerToUsers && (() => {
          const visibleColors = (product.colors || []).filter((c) => c.visibleToUsers);
          if (!visibleColors.length) return null;
          const shown = visibleColors.slice(0, 7);
          const overflow = visibleColors.length - 7;
          return (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", mt: 0.75 }}>
              {shown.map((c, i) => (
                <Tooltip key={c._id || c.id || i} title={c.name} arrow>
                  <Box sx={{
                    width: 14, height: 14, borderRadius: "50%", bgcolor: c.hex, flexShrink: 0,
                    border: "1.5px solid rgba(0,0,0,0.14)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                  }} />
                </Tooltip>
              ))}
              {overflow > 0 && (
                <Typography sx={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700, lineHeight: 1 }}>
                  +{overflow}
                </Typography>
              )}
            </Stack>
          );
        })()}

        {/* Price row */}
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", mt: "auto", pt: 1.25 }}>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
            <Typography component="div" sx={{ fontSize: "1.05rem", fontWeight: 800, color: "#1c1917", lineHeight: 1.4 }}>
              ₹{product.price?.toLocaleString()}
            </Typography>
            {discountPct > 0 && (
              <Typography component="span" sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#94a3b8", textDecoration: "line-through", lineHeight: 1.4 }}>
                ₹{product.compareAtPrice?.toLocaleString()}
              </Typography>
            )}
          </Box>
          {quantityInCart > 0 && (
            <Stack direction="row" spacing={0.4}
              sx={{ alignItems: "center", bgcolor: "rgba(16,185,129,0.1)", border: "1px solid #86efac", borderRadius: "6px", px: 0.75, py: 0.375, flexShrink: 0 }}>
              <FiShoppingCart size={11} color="#15803d" style={{ display: "block" }} />
              <Typography component="span" sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#15803d", lineHeight: 1 }}>
                {quantityInCart}
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* CTA buttons */}
        <Stack direction="row" spacing={0.75} sx={{ mt: 1.25 }}>
          {isOutOfStock ? (
            <Button variant="outlined" disabled fullWidth size="small"
              sx={{ borderRadius: "8px", textTransform: "none", fontSize: "0.8rem", fontWeight: 600, py: 0.875 }}>
              Out of Stock
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={() => handleCart(onAddToCart)}
              disabled={cartLoading}
              startIcon={cartLoading ? null : requiresOptionSelection ? <FiEye size={13} /> : <FiShoppingCart size={13} />}
              sx={{
                borderRadius: "8px", textTransform: "none", fontSize: "0.8rem", fontWeight: 700, py: 0.875,
                background: `linear-gradient(135deg, ${ROSE} 0%, #b8412a 100%)`,
                boxShadow: "0 3px 10px rgba(210, 78, 51,0.25)",
                "&:hover": { background: "linear-gradient(135deg, #b8412a 0%, #a63c27 100%)" },
              }}
            >
              {cartLoading ? <CircularProgress size={14} color="inherit" /> : requiresOptionSelection ? "Select Options" : "Add to Cart"}
            </Button>
          )}

          {quantityInCart > 0 && !isOutOfStock && (
            <Tooltip title="Remove from cart" arrow>
              <IconButton
                size="small"
                onClick={() => handleCart(onRemoveFromCart)}
                disabled={cartLoading}
                sx={{ border: "1.5px solid #fecaca", borderRadius: "8px", color: "#dc2626", width: 34, height: 34, flexShrink: 0, "&:hover": { bgcolor: "#fef2f2", borderColor: "#dc2626" } }}
              >
                <FiTrash2 size={13} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {/* View details link */}
        <Typography
          onClick={() => navigate(`/product/${product._id}`)}
          sx={{ mt: 1, fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", cursor: "pointer", textAlign: "center", "&:hover": { color: ROSE } }}
        >
          View details →
        </Typography>
      </Box>
    </Box>
  );
});

/* ══════════════════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════════════════ */
const ProductListing = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  // Infinite scroll: all fetched pages live in the RTK Query cache (no hand-rolled append reducer);
  // identical requests from other components are de-duplicated and re-visits are instant.
  const {
    data: productPages,
    isLoading: loading,
    error: productsError,
    fetchNextPage,
    hasNextPage: hasMore,
    isFetchingNextPage: loadingMore,
  } = useProductFeedInfiniteQuery({ limit: PAGE_SIZE });
  const products = useMemo(() => productPages?.pages.flatMap((p) => p.products) ?? [], [productPages]);
  const totalProducts = productPages?.pages[0]?.total;
  const error = productsError ? errMsg(productsError, "Failed to fetch products") : null;
  const sentinelRef = useRef(null);

  // Deep links (?q=Diwali, ?category=Jewellery, ?customizable=true) pre-apply filters — used by the
  // home page's category / occasion cards and festival banner.
  const [searchParams] = useSearchParams();
  const filtersFromUrl = useCallback(
    () => ({
      categories: searchParams.get("category") ? [searchParams.get("category")] : [],
      priceRange: null,
      searchTerm: searchParams.get("q") || "",
      sortBy: "",
      customizable: searchParams.get("customizable") === "true",
    }),
    [searchParams],
  );
  const [filters, setFilters] = useState(filtersFromUrl);
  const urlKey = searchParams.toString();
  const lastUrlKey = useRef(urlKey);
  useEffect(() => {
    if (lastUrlKey.current === urlKey) return; // first render already used the URL
    lastUrlKey.current = urlKey;
    setFilters(filtersFromUrl());
  }, [urlKey, filtersFromUrl]);

  // Popovers for horizontal filter strip
  const [priceAnchor,   setPriceAnchor]  = useState(null);
  const [sortOpen, setSortOpen] = useState(false); // sort chips row under the circles
  const [expandedCatId, setExpandedCatId] = useState(null); // category whose subcategory pills are showing
  const [priceMin,      setPriceMin]     = useState("");
  const [priceMax,      setPriceMax]     = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg]   = useState("");
  const [toastType, setToastType] = useState("success");

  const cartItems       = useSelector((s) => s.cart.items);
  const isAuthenticated = useSelector((s) => !!s.auth.user);
  const { data: publicCategories = [] } = useGetPublicCategoriesQuery();

  const totalCartItems = useMemo(() => cartItems.reduce((s, i) => s + i.quantity, 0), [cartItems]);
  const cartItemsMap   = useMemo(() => { const m = new Map(); cartItems.forEach((i) => m.set(i.product._id, i.quantity)); return m; }, [cartItems]);
  const getQty = useCallback((id) => cartItemsMap.get(id) || 0, [cartItemsMap]);

  // One shared wishlist query for every card (previously one fetch per page visit)
  const { data: wishlist } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const wishlistIds = useMemo(() => new Set((wishlist || []).map((p) => (typeof p === "object" ? p._id : p))), [wishlist]);

  useEffect(() => {
    const pr = filters.priceRange;
    setPriceMin(pr ? String(pr.min || "") : "");
    setPriceMax(pr && pr.max !== Infinity ? String(pr.max) : "");
  }, [filters.priceRange]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") return;
    const ob = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loadingMore && hasMore) fetchNextPage();
    }, { rootMargin: "300px" });
    ob.observe(sentinel);
    return () => ob.disconnect();
  }, [loadingMore, hasMore, fetchNextPage]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products) || !products.length) return [];
    let out = products;
    // Plain case-insensitive substring match. (Was `new RegExp(searchTerm)`, which
    // threw — and crashed the page — on input like "(" or "*", since user text
    // was parsed as a regex.)
    if (filters.searchTerm) { const q = filters.searchTerm.toLowerCase(); out = out.filter((p) => (p.name || "").toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)); }
    if (filters.categories?.length) { const s = new Set(filters.categories.map((c) => c.toLowerCase())); out = out.filter((p) => s.has(p.category?.toLowerCase()) || s.has(p.subCategory?.toLowerCase())); }
    if (filters.priceRange) { const { min, max } = filters.priceRange; out = out.filter((p) => p.price >= min && p.price <= max); }
    if (filters.customizable) out = out.filter((p) => p.isCustomizable);
    if (filters.sortBy) {
      out = [...out];
      if (filters.sortBy === "price-low-high") out.sort((a, b) => a.price - b.price);
      else if (filters.sortBy === "price-high-low") out.sort((a, b) => b.price - a.price);
      else if (filters.sortBy === "name-asc") out.sort((a, b) => nameCollator.compare(a.name, b.name));
      else if (filters.sortBy === "name-desc") out.sort((a, b) => nameCollator.compare(b.name, a.name));
    }
    return out;
  }, [products, filters]);

  const handleFiltersChange = useCallback((f) => setFilters(f), []);
  const handleClearFilters  = useCallback(() => setFilters({ categories: [], priceRange: null, searchTerm: "", sortBy: "", customizable: false }), []);
  const handleAddToCart     = useCallback((p) => { dispatch(addToCart({ product: p, quantity: 1 })); trackAddToCart(p, 1); }, [dispatch]);
  const handleRemoveFromCart = useCallback((p) => { dispatch(removeFromCart({ product: p })); trackRemoveFromCart(p, 1); }, [dispatch]);
  const handleCheckout = useCallback(() => { if (!isAuthenticated) { localStorage.setItem("redirectAfterLogin", "/checkout"); navigate("/login"); } else navigate("/checkout"); }, [isAuthenticated, navigate]);
  const handleImageClick = useCallback((p) => { setSelectedProduct(p); setShowImageModal(true); }, []);
  const handleShowToast  = useCallback((msg, type = "success") => { setToastMsg(msg); setToastType(type); setShowToast(true); setTimeout(() => setShowToast(false), 3000); }, []);

  // O(1) membership for the category pills (checked for every category + subcategory)
  const selectedCategorySet = useMemo(() => new Set(filters.categories), [filters.categories]);

  const activeCategories = useMemo(() => publicCategories.filter((c) => c.isActive !== false), [publicCategories]);
  const expandedCat = useMemo(() => activeCategories.find((c) => c._id === expandedCatId) || null, [activeCategories, expandedCatId]);
  const expandedSubs = useMemo(() => expandedCat?.subcategories?.filter((s) => s.isActive !== false) || [], [expandedCat]);
  const namesOf = (cat) => [cat.name, ...(cat.subcategories?.map((s) => s.name) || [])];

  // Tap a circle: no subcategories → plain toggle. With subcategories → select the whole category and
  // reveal its pills; tapping the open circle again collapses it and clears that category.
  const handleCircleSelect = (cat) => {
    const own = new Set(namesOf(cat));
    const rest = filters.categories.filter((n) => !own.has(n));
    const hasSubs = cat.subcategories?.some((s) => s.isActive !== false);
    const selected = filters.categories.some((n) => own.has(n));
    if (!hasSubs) { setExpandedCatId(null); handleFiltersChange({ ...filters, categories: selected ? rest : [...rest, cat.name] }); return; }
    if (expandedCatId === cat._id) { setExpandedCatId(null); handleFiltersChange({ ...filters, categories: rest }); return; }
    setSortOpen(false);
    setExpandedCatId(cat._id);
    if (!selected) handleFiltersChange({ ...filters, categories: [...rest, cat.name] });
  };

  // Pill tap: null = "All <category>"; otherwise toggle a subcategory (parent name dropped while subs are picked).
  const setSubSelection = (cat, subName) => {
    const own = new Set(namesOf(cat));
    const rest = filters.categories.filter((n) => !own.has(n));
    let mine = filters.categories.filter((n) => own.has(n) && n !== cat.name);
    if (subName == null) mine = [cat.name];
    else {
      mine = mine.includes(subName) ? mine.filter((n) => n !== subName) : [...mine, subName];
      if (!mine.length) mine = [cat.name];
    }
    handleFiltersChange({ ...filters, categories: [...rest, ...mine] });
  };

  const activeFilterCount = [filters.categories.length > 0, !!filters.priceRange, !!filters.sortBy, !!filters.customizable].filter(Boolean).length;

  const activeCategory = filters.categories?.[0] || null;
  const seoTitle = filters.searchTerm
    ? `${filters.searchTerm} — Craft Supplies | ${SEO_CONFIG.SITE_NAME}`
    : activeCategory
    ? `${activeCategory} — Handcrafted Products | ${SEO_CONFIG.SITE_NAME}`
    : `Premium Craft Supplies & Handmade Products | ${SEO_CONFIG.SITE_NAME}`;

  const seoDescription = filters.searchTerm
    ? `Shop ${filters.searchTerm} craft supplies at Infinity Craft Space. Handmade, artisan-crafted products delivered across India.`
    : activeCategory
    ? `Explore our ${activeCategory} collection — handcrafted, artisan-made products at Infinity Craft Space. Free delivery options across India.`
    : "Browse 100+ handcrafted products at Infinity Craft Space — jewellery, resin art, custom gifts, pottery supplies and more. Delivered across India.";

  const ogImage = filteredProducts[0]?.images?.[0]?.url
    || filteredProducts[0]?.image?.url
    || null;

  const collectionStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seoTitle,
    description: seoDescription,
    url: `${SEO_CONFIG.SITE_URL}/products`,
    provider: { "@type": "Organization", name: "Infinity Craft Space", url: SEO_CONFIG.SITE_URL },
    ...(filteredProducts.length > 0 && {
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: filteredProducts.length,
        itemListElement: filteredProducts.slice(0, 10).map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SEO_CONFIG.SITE_URL}/product/${p.slug || p._id}`,
          name: p.name,
        })),
      },
    }),
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f7f4ee" }}>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        url={`${SEO_CONFIG.SITE_URL}/products`}
        canonical={`${SEO_CONFIG.SITE_URL}/products`}
        image={ogImage}
        type="website"
        structuredData={collectionStructuredData}
      />
      <Suspense fallback={<Box sx={{ height: 70 }} />}><Header /></Suspense>

      {/* ── Sticky search bar ───────────────────────────────────── */}
      <Box sx={{ position: "sticky", top: 0, zIndex: 100, bgcolor: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e7e5e4", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", px: { xs: 2, sm: 3, md: 4, lg: 5 }, py: 1.25 }}>
        <Stack direction="row" sx={{ alignItems: "center" }} spacing={1.5}>
          <TextField
            size="small"
            placeholder="Search products…"
            value={filters.searchTerm}
            onChange={(e) => handleFiltersChange({ ...filters, searchTerm: e.target.value })}
            slotProps={{
              htmlInput: { "aria-label": "Search products" },
              input: {
                startAdornment: <InputAdornment position="start"><FiSearch size={15} color="#94a3b8" /></InputAdornment>,
                endAdornment: filters.searchTerm
                  ? <InputAdornment position="end"><IconButton size="small" onClick={() => handleFiltersChange({ ...filters, searchTerm: "" })} aria-label="Clear search"><FiX size={14} /></IconButton></InputAdornment>
                  : null,
              },
            }}
            sx={{
              flexGrow: 1, maxWidth: 440,
              "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#f8fafc" },
            }}
          />
          {totalCartItems > 0 && (
            <Button
              variant="contained"
              size="small"
              onClick={handleCheckout}
              startIcon={<FiShoppingCart size={14} />}
              sx={{
                textTransform: "none", borderRadius: "10px", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0, px: 2,
                background: `linear-gradient(135deg, ${ROSE}, #b8412a)`,
                boxShadow: "0 3px 10px rgba(210, 78, 51,0.25)",
                "&:hover": { background: "linear-gradient(135deg, #b8412a, #a63c27)" },
              }}
            >
              Cart ({totalCartItems}) · Checkout
            </Button>
          )}
          {!loading && products?.length > 0 && (
            <Typography variant="caption" sx={{ color: "text.secondary", whiteSpace: "nowrap", ml: "auto !important", display: { xs: "none", sm: "block" } }}>
              {filteredProducts.length}{filteredProducts.length !== (products?.length || 0) && ` of ${products?.length || 0}`} results
            </Typography>
          )}
        </Stack>
      </Box>

      {/* ── Horizontal filter strip ─────────────────────────────── */}
      <Box sx={{
        position: "sticky", top: 56, zIndex: 99,
        bgcolor: "rgba(253,246,236,0.97)", backdropFilter: "blur(8px)",
        borderBottom: "1px solid #e7e5e4",
        px: { xs: 2, sm: 3, md: 4, lg: 5 }, py: 1,
      }}>
        <CategoryCircles
          categories={activeCategories}
          products={products}
          selectedSet={selectedCategorySet}
          expandedId={expandedCatId}
          onClear={() => { setExpandedCatId(null); handleFiltersChange({ ...filters, categories: [] }); }}
          onSelect={handleCircleSelect}
          lead={(() => {
            const sortOpt = SORT_OPTIONS.find((o) => o.value === filters.sortBy);
            const price = filters.priceRange;
            const priceLabel = price ? `₹${price.min.toLocaleString()}–${price.max === Infinity ? "Max" : price.max.toLocaleString()}` : "Price";
            return (
              <>
                <UtilCircle icon={FiArrowUp} label={sortOpt ? sortOpt.label.replace(/^(Price|Name): /, "") : "Sort"} active={!!filters.sortBy || sortOpen} ariaLabel="Sort options" expanded={sortOpen} onClick={() => { setSortOpen((v) => !v); setExpandedCatId(null); }} />
                <UtilCircle icon={FiTag} label={priceLabel} active={!!price} ariaLabel="Price range" onClick={(e) => setPriceAnchor(e.currentTarget)} />
                <span className="cc-sep" aria-hidden="true" />
              </>
            );
          })()}
          trail={activeFilterCount > 0 ? <UtilCircle icon={FiX} label="Clear" danger onClick={handleClearFilters} ariaLabel="Clear all filters" /> : null}
        />
        {sortOpen && (
          <div className="cc-subs" role="radiogroup" aria-label="Sort by">
            {SORT_OPTIONS.map((opt) => {
              const on = filters.sortBy === opt.value;
              return (
                <button key={opt.value || "relevance"} type="button" role="radio" aria-checked={on} className={`cc-pill ${on ? "is-active" : ""}`} onClick={() => handleFiltersChange({ ...filters, sortBy: opt.value })}>
                  {on && <FiCheck size={12} aria-hidden="true" />}{opt.label}
                </button>
              );
            })}
          </div>
        )}
        {expandedCat && !sortOpen && (
          <div className="cc-subs" role="group" aria-label={`${expandedCat.name} subcategories`}>
            <button type="button" className={`cc-pill ${selectedCategorySet.has(expandedCat.name) ? "is-active" : ""}`} aria-pressed={selectedCategorySet.has(expandedCat.name)} onClick={() => setSubSelection(expandedCat, null)}>
              All {expandedCat.name}
            </button>
            {expandedSubs.map((sub) => {
              const on = selectedCategorySet.has(sub.name);
              return (
                <button key={sub._id || sub.name} type="button" className={`cc-pill ${on ? "is-active" : ""}`} aria-pressed={on} onClick={() => setSubSelection(expandedCat, sub.name)}>
                  {on && <FiCheck size={12} aria-hidden="true" />}{sub.name}
                </button>
              );
            })}
          </div>
        )}
      </Box>

      {/* ── Price popover ─────────────────────────────────────────── */}
      <Popover
        open={Boolean(priceAnchor)}
        anchorEl={priceAnchor}
        onClose={() => setPriceAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { mt: 1, borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", border: "1px solid rgba(0,0,0,0.07)", p: 2.5, width: 320, maxWidth: "calc(100vw - 32px)", bgcolor: "#fff" } } }}
      >
        <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.disabled", mb: 2 }}>
          Price Range
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
          <TextField
            size="small" type="number" placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: "0.8rem", color: "text.disabled" }}>₹</Typography></InputAdornment> } }}
            sx={{ flex: 1, minWidth: 0, "& .MuiOutlinedInput-root": { borderRadius: "10px", pl: 1.5 }, "& input": { py: 1.25, pl: 0.5 } }}
          />
          <Typography sx={{ color: "text.disabled", flexShrink: 0 }}>–</Typography>
          <TextField
            size="small" type="number" placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: "0.8rem", color: "text.disabled" }}>₹</Typography></InputAdornment> } }}
            sx={{ flex: 1, minWidth: 0, "& .MuiOutlinedInput-root": { borderRadius: "10px", pl: 1.5 }, "& input": { py: 1.25, pl: 0.5 } }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          {filters.priceRange && (
            <Button variant="outlined" fullWidth onClick={() => { handleFiltersChange({ ...filters, priceRange: null }); setPriceAnchor(null); }}
              sx={{ textTransform: "none", borderRadius: "10px", fontWeight: 600, borderColor: "rgba(0,0,0,0.15)", color: "#78716c", "&:hover": { borderColor: "#ef4444", color: "#ef4444" } }}>
              Clear
            </Button>
          )}
          <Button
            variant="contained" fullWidth
            disabled={!priceMin && !priceMax}
            onClick={() => {
              const min = parseFloat(priceMin) || 0;
              const max = parseFloat(priceMax) || Infinity;
              handleFiltersChange({ ...filters, priceRange: { min, max } });
              setPriceAnchor(null);
            }}
            sx={{
              textTransform: "none", borderRadius: "10px", fontWeight: 700,
              background: `linear-gradient(135deg, ${ROSE}, #b8412a)`,
              boxShadow: "none",
              "&:hover": { background: "linear-gradient(135deg, #b8412a, #a63c27)" },
              "&.Mui-disabled": { opacity: 0.4 },
            }}
          >
            Apply
          </Button>
        </Box>
      </Popover>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, py: 3 }}>
        {/* ── products area ── */}
        <Box sx={{ minWidth: 0 }}>

        {/* Page heading row */}
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1.25}>
            <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: "rgba(210, 78, 51,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: ROSE }}>
              <FiGrid size={17} />
            </Box>
            <Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: "#1c1917", lineHeight: 1 }}>
                Products
              </Typography>
              {!loading && products?.length > 0 && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {filteredProducts.length} item{filteredProducts.length !== 1 ? "s" : ""}
                </Typography>
              )}
            </Box>
          </Stack>
        </Stack>

        {/* Guest banner */}
        {!isAuthenticated && (
          <Alert severity="info" icon={<FiStar size={16} />}
            sx={{ mb: 2.5, borderRadius: 2.5, bgcolor: "rgba(210, 78, 51,0.05)", border: "1px solid rgba(210, 78, 51,0.15)", color: "#b8412a", "& .MuiAlert-icon": { color: ROSE } }}>
            Browse freely —{" "}
            <Box component="a" href="/login" sx={{ color: ROSE, fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
              sign in
            </Box>{" "}
            to save your wishlist and complete checkout.
          </Alert>
        )}

        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}

        {/* ── Product Grid ── */}
        {loading ? (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,1fr)", sm: "repeat(3,1fr)", md: "repeat(4,1fr)", lg: "repeat(5,1fr)" }, gap: { xs: 1.5, md: 2 } }} aria-busy="true">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </Box>
        ) : (
          <>
            {/* No filter results */}
            {filteredProducts.length === 0 && (products?.length || 0) > 0 && (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <Box sx={{ width: 80, height: 80, borderRadius: "50%", bgcolor: "rgba(210, 78, 51,0.06)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                  <FiSearch size={32} color={ROSE} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1c1917", mb: 0.5 }}>No products found</Typography>
                <Typography sx={{ color: "text.secondary", mb: 3 }}>
                  {filters.searchTerm ? `No results for "${filters.searchTerm}"` : "Try adjusting your filters"}
                </Typography>
                <Button variant="outlined" onClick={handleClearFilters} startIcon={<FiX size={14} />}
                  sx={{ textTransform: "none", borderRadius: 2, borderColor: ROSE, color: ROSE, "&:hover": { bgcolor: "rgba(210, 78, 51,0.05)" } }}>
                  Clear filters
                </Button>
              </Box>
            )}

            {/* Empty store */}
            {(products?.length || 0) === 0 && !error && (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <Box sx={{ width: 80, height: 80, borderRadius: "50%", bgcolor: "rgba(210, 78, 51,0.06)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                  <FiPackage size={32} color={ROSE} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1c1917", mb: 0.5 }}>No products yet</Typography>
                <Typography sx={{ color: "text.secondary" }}>Check back soon — new arrivals are on their way.</Typography>
              </Box>
            )}

            {/* Grid */}
            {filteredProducts.length > 0 && (
              <>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,1fr)", sm: "repeat(3,1fr)", md: "repeat(4,1fr)", lg: "repeat(5,1fr)" }, gap: { xs: 1.5, md: 2 } }}>
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      quantityInCart={getQty(product._id)}
                      onAddToCart={handleAddToCart}
                      onRemoveFromCart={handleRemoveFromCart}
                      onImageClick={handleImageClick}
                      onShowToast={handleShowToast}
                      isWishlisted={wishlistIds.has(product._id)}
                    />
                  ))}
                  {loadingMore && Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={`more-${i}`} />)}
                </Box>

                {hasMore && <Box ref={sentinelRef} sx={{ height: 1 }} aria-hidden="true" />}

                {!hasMore && filteredProducts.length > PAGE_SIZE && (
                  <Typography variant="body2" align="center" sx={{ color: "text.secondary", mt: 4, pb: 2 }}>
                    ✓ All {totalProducts ?? filteredProducts.length} products shown
                  </Typography>
                )}
              </>
            )}
          </>
        )}
        </Box>
      </Box>

      {/* ── Image Modal ────────────────────────────────────────────── */}
      <Suspense fallback={null}>
        <ImageCarouselModal
          show={showImageModal}
          onHide={() => { setShowImageModal(false); setSelectedProduct(null); }}
          images={selectedProduct?.images || (selectedProduct?.image ? [selectedProduct.image] : [])}
          productName={selectedProduct?.name || "Product Images"}
          initialIndex={0}
        />
      </Suspense>

      {/* ── Toast notification ─────────────────────────────────────── */}
      {showToast && (
        <Box role="status" aria-live="polite"
          sx={{
            position: "fixed", bottom: 24, right: 24, zIndex: 9999,
            display: "flex", alignItems: "center", gap: 1.25,
            px: 2, py: 1.25, borderRadius: 2.5,
            bgcolor: toastType === "success" ? "#1c1917" : "#7f1d1d",
            color: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            minWidth: 220, maxWidth: 320,
            animation: "slideUp 0.25s ease",
            "@keyframes slideUp": { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "translateY(0)" } },
          }}>
          <Box sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: toastType === "success" ? "#10b981" : "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {toastType === "success" ? <FiCheck size={12} strokeWidth={3} /> : <FiAlertCircle size={12} />}
          </Box>
          <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>{toastMsg}</Typography>
          <IconButton size="small" onClick={() => setShowToast(false)} aria-label="Dismiss" sx={{ color: "rgba(255,255,255,0.6)", p: 0.25, "&:hover": { color: "#fff" } }}>
            <FiX size={14} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(ProductListing);
