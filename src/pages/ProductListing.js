import React, {
  useState, useMemo, useCallback, lazy, Suspense, useEffect, useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart, removeFromCart } from "../features/cartSlice";
import { useProducts } from "../hooks/useSmartFetch";
import {
  Box, Typography, TextField, InputAdornment, IconButton, Button,
  Chip, Drawer, Skeleton, CircularProgress, Alert, Stack, Badge, Tooltip,
  useMediaQuery, useTheme, Divider,
} from "@mui/material";
import { DotsLoader, BarsLoader } from "../components/Loader";
import {
  FiGrid, FiSliders, FiShoppingCart, FiX, FiHeart, FiTrash2,
  FiSearch, FiPackage, FiCheck, FiAlertCircle, FiEye, FiStar,
  FiFilter,
} from "react-icons/fi";
import api from "../api/axios";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import { trackAddToCart, trackRemoveFromCart } from "../utils/analytics";

const Header        = lazy(() => import("../components/Header"));
const ProductFilters = lazy(() => import("../components/ProductFilters"));
const ImageCarouselModal = lazy(() => import("../components/ImageCarouselModal"));

const PAGE_SIZE = 16;
const ROSE = "#8B1A4A";

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
  onImageClick, onShowToast, isWishlisted, onWishlistToggle,
}) => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s) => !!s.auth.user);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const isOutOfStock = product.trackInventory !== false && product.stock <= 0;
  const isLowStock   = product.trackInventory !== false && product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
  const discountPct  = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
  const rawImageUrl  = product.images?.[0]?.url || product.image?.url || product.image || null;
  const imgCount     = product.images?.length || 0;
  const { imgRef, src: imageUrl, loaded: imgLoaded, setLoaded: setImgLoaded } = useLazyImage(rawImageUrl);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await api.delete(`/api/auth/wishlist/${product._id}`);
        onShowToast("Removed from wishlist", "success");
        onWishlistToggle?.(product._id, false);
      } else {
        await api.post("/api/auth/wishlist", { productId: product._id });
        onShowToast("Added to wishlist ♡", "success");
        onWishlistToggle?.(product._id, true);
      }
    } catch { onShowToast("Wishlist action failed", "error"); }
    finally { setWishlistLoading(false); }
  };

  const handleCart = async (fn) => {
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
          boxShadow: "0 12px 32px rgba(139,26,74,0.12)",
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
            onError={(e) => { e.target.src = "https://via.placeholder.com/400x400?text=No+Image"; setImgLoaded(true); }}
            className="card-img"
            sx={{
              width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block",
              opacity: imgLoaded ? 1 : 0, transition: "opacity 0.3s, transform 0.4s ease",
            }}
          />
        ) : (
          <Box sx={{ aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f8f5f0" }}>
            <FiPackage size={44} color="#c0a882" />
          </Box>
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
          fontWeight={600}
          onClick={() => navigate(`/product/${product._id}`)}
          sx={{
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
          <Stack direction="row" alignItems="center" spacing={0.4} sx={{ mt: 0.6 }}>
            <Box sx={{ display: "flex", color: "#f59e0b" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ fontSize: "0.78rem" }}>
                  {i < Math.round(product.averageRating) ? "★" : "☆"}
                </span>
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
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
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.75 }}>
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
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mt: "auto", pt: 1.25 }}>
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
            <Stack direction="row" alignItems="center" spacing={0.4}
              sx={{ bgcolor: "rgba(16,185,129,0.1)", border: "1px solid #86efac", borderRadius: "6px", px: 0.75, py: 0.375, flexShrink: 0 }}>
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
              startIcon={cartLoading ? null : <FiShoppingCart size={13} />}
              sx={{
                borderRadius: "8px", textTransform: "none", fontSize: "0.8rem", fontWeight: 700, py: 0.875,
                background: `linear-gradient(135deg, ${ROSE} 0%, #7a1640 100%)`,
                boxShadow: "0 3px 10px rgba(139,26,74,0.25)",
                "&:hover": { background: "linear-gradient(135deg, #7a1640 0%, #5e1232 100%)" },
              }}
            >
              {cartLoading ? <CircularProgress size={14} color="inherit" /> : "Add to Cart"}
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
  const theme      = useTheme();
  const isMobile   = useMediaQuery(theme.breakpoints.down("md"));
  const { data: products, loading, error, fetchPage, pagination } = useProducts();

  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  const [showFilters, setShowFilters]   = useState(false);
  const [filters, setFilters] = useState({ categories: [], priceRange: null, searchTerm: "", sortBy: "" });
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg]   = useState("");
  const [toastType, setToastType] = useState("success");
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const cartItems      = useSelector((s) => s.cart.items);
  const isAuthenticated = useSelector((s) => !!s.auth.user);

  const totalCartItems = useMemo(() => cartItems.reduce((s, i) => s + i.quantity, 0), [cartItems]);
  const cartItemsMap   = useMemo(() => { const m = new Map(); cartItems.forEach((i) => m.set(i.product._id, i.quantity)); return m; }, [cartItems]);
  const getQty = useCallback((id) => cartItemsMap.get(id) || 0, [cartItemsMap]);

  useEffect(() => {
    if (!isAuthenticated) { setWishlistIds(new Set()); return; }
    let mounted = true;
    api.get("/api/auth/wishlist").then((res) => { if (mounted) setWishlistIds(new Set((res.data.wishlist || []).map((p) => p._id))); }).catch(() => {});
    return () => { mounted = false; };
  }, [isAuthenticated]);

  useEffect(() => { setCurrentPage(1); }, [filters]);

  const hasMore = pagination ? currentPage < pagination.totalPages : false;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") return;
    const ob = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loadingMore && hasMore) {
        const next = currentPage + 1;
        setLoadingMore(true); setCurrentPage(next);
        fetchPage({ page: next, limit: PAGE_SIZE }).finally(() => setLoadingMore(false));
      }
    }, { rootMargin: "300px" });
    ob.observe(sentinel);
    return () => ob.disconnect();
  }, [loadingMore, hasMore, currentPage, fetchPage]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products) || !products.length) return [];
    let out = products;
    if (filters.searchTerm) { const re = new RegExp(filters.searchTerm, "i"); out = out.filter((p) => re.test(p.name) || re.test(p.description || "")); }
    if (filters.categories?.length) { const s = new Set(filters.categories.map((c) => c.toLowerCase())); out = out.filter((p) => s.has(p.category?.toLowerCase()) || s.has(p.subCategory?.toLowerCase())); }
    if (filters.priceRange) { const { min, max } = filters.priceRange; out = out.filter((p) => p.price >= min && p.price <= max); }
    if (filters.sortBy) {
      out = [...out];
      if (filters.sortBy === "price-low-high") out.sort((a, b) => a.price - b.price);
      else if (filters.sortBy === "price-high-low") out.sort((a, b) => b.price - a.price);
      else if (filters.sortBy === "name-asc") out.sort((a, b) => a.name.localeCompare(b.name));
      else if (filters.sortBy === "name-desc") out.sort((a, b) => b.name.localeCompare(a.name));
    }
    return out;
  }, [products, filters]);

  const handleFiltersChange = useCallback((f) => setFilters(f), []);
  const handleClearFilters  = useCallback(() => setFilters({ categories: [], priceRange: null, searchTerm: "", sortBy: "" }), []);
  const handleAddToCart     = useCallback((p) => { dispatch(addToCart({ product: p, quantity: 1 })); trackAddToCart(p, 1); }, [dispatch]);
  const handleRemoveFromCart = useCallback((p) => { dispatch(removeFromCart({ product: p })); trackRemoveFromCart(p, 1); }, [dispatch]);
  const handleCheckout = useCallback(() => { if (!isAuthenticated) { localStorage.setItem("redirectAfterLogin", "/checkout"); navigate("/login"); } else navigate("/checkout"); }, [isAuthenticated, navigate]);
  const handleImageClick = useCallback((p) => { setSelectedProduct(p); setShowImageModal(true); }, []);
  const handleShowToast  = useCallback((msg, type = "success") => { setToastMsg(msg); setToastType(type); setShowToast(true); setTimeout(() => setShowToast(false), 3000); }, []);
  const handleWishlistToggle = useCallback((id, added) => { setWishlistIds((prev) => { const s = new Set(prev); added ? s.add(id) : s.delete(id); return s; }); }, []);

  const activeFilterCount = [filters.categories.length > 0, !!filters.priceRange, !!filters.sortBy].filter(Boolean).length;
  const activeChips = [
    ...filters.categories.map((c) => ({ key: `cat-${c}`, label: c, onRemove: () => handleFiltersChange({ ...filters, categories: filters.categories.filter((x) => x !== c) }) })),
    ...(filters.priceRange ? [{ key: "price", label: `₹${filters.priceRange.min} – ${filters.priceRange.max === Infinity ? "Max" : `₹${filters.priceRange.max}`}`, onRemove: () => handleFiltersChange({ ...filters, priceRange: null }) }] : []),
    ...(filters.sortBy ? [{ key: "sort", label: filters.sortBy.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), onRemove: () => handleFiltersChange({ ...filters, sortBy: "" }) }] : []),
  ];

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
    <Box sx={{ minHeight: "100vh", bgcolor: "#fdf6ec" }}>
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

      {/* ── Sticky command bar ─────────────────────────────────── */}
      <Box sx={{ position: "sticky", top: 0, zIndex: 100, bgcolor: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e7e5e4", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", px: { xs: 2, md: 4 }, py: 1.25 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
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

          <Badge badgeContent={activeFilterCount || null} color="primary"
            sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", minWidth: 16, height: 16, background: ROSE } }}>
            <Button
              variant={activeFilterCount > 0 ? "contained" : "outlined"}
              size="small"
              onClick={() => setShowFilters(true)}
              startIcon={<FiSliders size={14} />}
              sx={{
                textTransform: "none", borderRadius: "10px", fontWeight: 600, px: 2, whiteSpace: "nowrap",
                ...(activeFilterCount > 0 && { background: `linear-gradient(135deg, ${ROSE}, #7a1640)`, boxShadow: "0 3px 10px rgba(139,26,74,0.25)" }),
              }}
            >
              Filters
            </Button>
          </Badge>

          {totalCartItems > 0 && (
            <Button
              variant="contained"
              size="small"
              onClick={handleCheckout}
              startIcon={<FiShoppingCart size={14} />}
              sx={{
                textTransform: "none", borderRadius: "10px", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0, px: 2,
                background: `linear-gradient(135deg, ${ROSE}, #7a1640)`,
                boxShadow: "0 3px 10px rgba(139,26,74,0.25)",
                "&:hover": { background: "linear-gradient(135deg, #7a1640, #5e1232)" },
              }}
            >
              Cart ({totalCartItems}) · Checkout
            </Button>
          )}

          {!loading && products?.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap", ml: "auto !important", display: { xs: "none", sm: "block" } }}>
              {filteredProducts.length}{filteredProducts.length !== (products?.length || 0) && ` of ${products?.length || 0}`} results
            </Typography>
          )}
        </Stack>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1.25 }} role="list" aria-label="Active filters">
            {activeChips.map((chip) => (
              <Chip
                key={chip.key}
                label={chip.label}
                size="small"
                onDelete={chip.onRemove}
                deleteIcon={<FiX size={11} />}
                role="listitem"
                sx={{ bgcolor: "rgba(139,26,74,0.07)", color: ROSE, fontWeight: 600, fontSize: "0.75rem", border: `1px solid rgba(139,26,74,0.2)`, "& .MuiChip-deleteIcon": { color: ROSE } }}
              />
            ))}
            <Button size="small" variant="text" onClick={handleClearFilters}
              sx={{ textTransform: "none", fontSize: "0.75rem", p: 0, color: "#94a3b8", minHeight: 0, "&:hover": { color: ROSE } }}>
              Clear all
            </Button>
          </Stack>
        )}
      </Box>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>

        {/* Page heading row */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: "rgba(139,26,74,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: ROSE }}>
              <FiGrid size={17} />
            </Box>
            <Box>
              <Typography variant="h5" component="h1" fontWeight={800} color="#1c1917" lineHeight={1}>
                Products
              </Typography>
              {!loading && products?.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {filteredProducts.length} item{filteredProducts.length !== 1 ? "s" : ""}
                </Typography>
              )}
            </Box>
          </Stack>
        </Stack>

        {/* Guest banner */}
        {!isAuthenticated && (
          <Alert severity="info" icon={<FiStar size={16} />}
            sx={{ mb: 2.5, borderRadius: 2.5, bgcolor: "rgba(139,26,74,0.05)", border: "1px solid rgba(139,26,74,0.15)", color: "#6b1238", "& .MuiAlert-icon": { color: ROSE } }}>
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
                <Box sx={{ width: 80, height: 80, borderRadius: "50%", bgcolor: "rgba(139,26,74,0.06)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                  <FiSearch size={32} color={ROSE} />
                </Box>
                <Typography variant="h6" fontWeight={700} color="#1c1917" sx={{ mb: 0.5 }}>No products found</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  {filters.searchTerm ? `No results for "${filters.searchTerm}"` : "Try adjusting your filters"}
                </Typography>
                <Button variant="outlined" onClick={handleClearFilters} startIcon={<FiX size={14} />}
                  sx={{ textTransform: "none", borderRadius: 2, borderColor: ROSE, color: ROSE, "&:hover": { bgcolor: "rgba(139,26,74,0.05)" } }}>
                  Clear filters
                </Button>
              </Box>
            )}

            {/* Empty store */}
            {(products?.length || 0) === 0 && !error && (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <Box sx={{ width: 80, height: 80, borderRadius: "50%", bgcolor: "rgba(139,26,74,0.06)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                  <FiPackage size={32} color={ROSE} />
                </Box>
                <Typography variant="h6" fontWeight={700} color="#1c1917" sx={{ mb: 0.5 }}>No products yet</Typography>
                <Typography color="text.secondary">Check back soon — new arrivals are on their way.</Typography>
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
                      onWishlistToggle={handleWishlistToggle}
                    />
                  ))}
                  {loadingMore && Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={`more-${i}`} />)}
                </Box>

                {hasMore && <Box ref={sentinelRef} sx={{ height: 1 }} aria-hidden="true" />}

                {!hasMore && filteredProducts.length > PAGE_SIZE && (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4, pb: 2 }}>
                    ✓ All {pagination?.total ?? filteredProducts.length} products shown
                  </Typography>
                )}
              </>
            )}
          </>
        )}
      </Box>

      {/* ── Filter Drawer ─────────────────────────────────────────── */}
      <Drawer
        open={showFilters}
        onClose={() => setShowFilters(false)}
        anchor={isMobile ? "bottom" : "left"}
        ModalProps={{ keepMounted: false }}
        PaperProps={{
          sx: isMobile
            ? {
                borderRadius: "20px 20px 0 0",
                maxHeight: "88vh",
                display: "flex",
                flexDirection: "column",
                bgcolor: "#fff",
              }
            : {
                width: 340,
                bgcolor: "#fff",
                display: "flex",
                flexDirection: "column",
                boxShadow: "8px 0 40px rgba(0,0,0,0.12)",
              },
        }}
        aria-labelledby="filters-drawer-title"
      >
        {/* ── Mobile drag handle ── */}
        {isMobile && (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 1.25, pb: 0.5, flexShrink: 0 }}>
            <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: "#e2e8f0" }} />
          </Box>
        )}

        {/* ── Header ── */}
        <Box sx={{
          px: 2.5, py: 2, flexShrink: 0,
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          background: "linear-gradient(135deg, #fff 0%, rgba(139,26,74,0.03) 100%)",
        }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{
                width: 38, height: 38, borderRadius: "12px",
                background: `linear-gradient(135deg, ${ROSE} 0%, #7a1640 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(139,26,74,0.3)",
              }}>
                <FiFilter size={16} color="#fff" />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={800} id="filters-drawer-title" sx={{ lineHeight: 1.2, color: "#1c1917" }}>
                  Filters
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 500 }}>
                  {activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount !== 1 ? "s" : ""} applied` : "Refine your results"}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              {activeFilterCount > 0 && (
                <Chip
                  label={activeFilterCount}
                  size="small"
                  sx={{
                    height: 22, fontSize: "0.7rem", fontWeight: 800,
                    bgcolor: ROSE, color: "#fff",
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              )}
              <IconButton
                onClick={() => setShowFilters(false)}
                size="small"
                aria-label="Close filters"
                sx={{
                  bgcolor: "#f8fafc", border: "1px solid #e2e8f0",
                  color: "#64748b", width: 34, height: 34,
                  "&:hover": { bgcolor: "#f1f5f9", color: "#1c1917", borderColor: "#cbd5e1" },
                }}
              >
                <FiX size={16} />
              </IconButton>
            </Stack>
          </Stack>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <Stack direction="row" flexWrap="wrap" gap={0.625} sx={{ mt: 1.5 }}>
              {activeChips.map((chip) => (
                <Chip
                  key={chip.key}
                  label={chip.label}
                  size="small"
                  onDelete={chip.onRemove}
                  deleteIcon={<FiX size={10} />}
                  sx={{
                    height: 24, fontSize: "0.72rem", fontWeight: 600,
                    bgcolor: "rgba(139,26,74,0.08)", color: ROSE,
                    border: "1px solid rgba(139,26,74,0.2)",
                    "& .MuiChip-deleteIcon": { color: ROSE, "&:hover": { color: "#7a1640" } },
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* ── Scrollable filter body ── */}
        <Box sx={{ overflowY: "auto", flexGrow: 1, px: 2.5, py: 2.5,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
          "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(139,26,74,0.2)", borderRadius: 4 },
        }}>
          <Suspense fallback={
            <Stack alignItems="center" py={5} spacing={1.5}>
              <CircularProgress size={26} sx={{ color: ROSE }} />
              <Typography sx={{ fontSize: "0.8125rem", color: "#94a3b8" }}>Loading filters…</Typography>
            </Stack>
          }>
            <ProductFilters
              products={products}
              onFiltersChange={handleFiltersChange}
              activeFilters={filters}
              onClearFilters={handleClearFilters}
            />
          </Suspense>
        </Box>

        {/* ── Sticky footer ── */}
        <Box sx={{
          px: 2.5, py: 2, flexShrink: 0,
          borderTop: "1px solid rgba(0,0,0,0.07)",
          bgcolor: "#fff",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
          pb: isMobile ? "calc(16px + env(safe-area-inset-bottom))" : 2,
        }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => setShowFilters(false)}
            sx={{
              borderRadius: "12px", textTransform: "none", fontWeight: 700,
              fontSize: "0.9375rem", py: 1.375,
              background: `linear-gradient(135deg, ${ROSE} 0%, #7a1640 100%)`,
              boxShadow: "0 4px 16px rgba(139,26,74,0.32)",
              "&:hover": {
                background: `linear-gradient(135deg, #7a1640 0%, #5e1232 100%)`,
                boxShadow: "0 6px 20px rgba(139,26,74,0.4)",
                transform: "translateY(-1px)",
              },
              transition: "all 180ms",
            }}
          >
            Show {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
          </Button>

          {activeFilterCount > 0 && (
            <Button
              variant="text"
              fullWidth
              onClick={() => { handleClearFilters(); setShowFilters(false); }}
              sx={{
                mt: 1, textTransform: "none", fontWeight: 600,
                fontSize: "0.875rem", color: "#94a3b8",
                "&:hover": { color: ROSE, bgcolor: "rgba(139,26,74,0.05)" },
                borderRadius: "10px",
              }}
            >
              Clear all filters
            </Button>
          )}
        </Box>
      </Drawer>

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
