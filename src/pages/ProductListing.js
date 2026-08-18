import React, {
  useState, useMemo, useCallback, lazy, Suspense, useEffect, useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart, removeFromCart } from "../features/cartSlice";
import { useProducts } from "../hooks/useSmartFetch";
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
import { fetchPublicCategories } from "../features/categoriesSlice";
import api from "../api/axios";
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
  const { data: products, loading, error, fetchPage, pagination } = useProducts();

  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  const [filters, setFilters] = useState({ categories: [], priceRange: null, searchTerm: "", sortBy: "" });

  // Popovers for horizontal filter strip
  const [sortAnchor,    setSortAnchor]   = useState(null);
  const [priceAnchor,   setPriceAnchor]  = useState(null);
  const [catPopover,    setCatPopover]   = useState({ anchor: null, cat: null }); // { anchor, cat: categoryObj }
  const [priceMin,      setPriceMin]     = useState("");
  const [priceMax,      setPriceMax]     = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg]   = useState("");
  const [toastType, setToastType] = useState("success");
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const cartItems       = useSelector((s) => s.cart.items);
  const isAuthenticated = useSelector((s) => !!s.auth.user);
  const publicCategories = useSelector((s) => s.categories.publicCategories || []);

  useEffect(() => { dispatch(fetchPublicCategories()); }, [dispatch]);

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

  useEffect(() => {
    const pr = filters.priceRange;
    setPriceMin(pr ? String(pr.min || "") : "");
    setPriceMax(pr && pr.max !== Infinity ? String(pr.max) : "");
  }, [filters.priceRange]);

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

      {/* ── Sticky search bar ───────────────────────────────────── */}
      <Box sx={{ position: "sticky", top: 0, zIndex: 100, bgcolor: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e7e5e4", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", px: { xs: 2, sm: 3, md: 4, lg: 5 }, py: 1.25 }}>
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
      </Box>

      {/* ── Horizontal filter strip ─────────────────────────────── */}
      <Box sx={{
        position: "sticky", top: 56, zIndex: 99,
        bgcolor: "rgba(253,246,236,0.97)", backdropFilter: "blur(8px)",
        borderBottom: "1px solid #e7e5e4",
        px: { xs: 2, sm: 3, md: 4, lg: 5 }, py: 1,
      }}>
        <Box sx={{
          overflowX: "auto",
          "&::-webkit-scrollbar": { display: "none" },
          msOverflowStyle: "none", scrollbarWidth: "none",
        }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ width: "max-content", minWidth: "100%", py: 0.5 }}>

            {/* ── Sort pill ── */}
            {(() => {
              const active = SORT_OPTIONS.find((o) => o.value === filters.sortBy);
              const isActive = !!filters.sortBy;
              return (
                <Box
                  component="button"
                  onClick={(e) => setSortAnchor(e.currentTarget)}
                  aria-label="Sort options"
                  sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.625,
                    px: 1.5, py: 0.625, borderRadius: "20px",
                    border: `1.5px solid ${isActive ? ROSE : "rgba(0,0,0,0.15)"}`,
                    bgcolor: isActive ? ROSE : "#fff",
                    color: isActive ? "#fff" : "#44403c",
                    cursor: "pointer", whiteSpace: "nowrap",
                    fontSize: "0.8125rem", fontWeight: isActive ? 700 : 500,
                    fontFamily: "inherit",
                    transition: "all 140ms",
                    "&:hover": { borderColor: ROSE, bgcolor: isActive ? "#7a1640" : "rgba(139,26,74,0.06)", color: isActive ? "#fff" : ROSE },
                  }}
                >
                  <FiArrowUp size={12} />
                  {isActive ? active?.label : "Sort"}
                  <FiChevronDown size={11} style={{ opacity: 0.7 }} />
                </Box>
              );
            })()}

            {/* ── Divider ── */}
            <Box sx={{ width: "1px", height: 24, bgcolor: "rgba(0,0,0,0.12)", flexShrink: 0 }} />

            {/* ── Category pills ── */}
            {publicCategories.filter((c) => c.isActive !== false).map((cat) => {
              const allNames = [cat.name, ...(cat.subcategories?.filter((s) => s.isActive !== false).map((s) => s.name) || [])];
              const selectedInCat = allNames.filter((n) => filters.categories.includes(n));
              const isActive = selectedInCat.length > 0;
              const hasSubs = cat.subcategories?.some((s) => s.isActive !== false);

              const handleCatClick = (e) => {
                if (hasSubs) {
                  setCatPopover({ anchor: e.currentTarget, cat });
                } else {
                  // No subs — direct toggle
                  const next = filters.categories.includes(cat.name)
                    ? filters.categories.filter((c) => c !== cat.name)
                    : [...filters.categories, cat.name];
                  handleFiltersChange({ ...filters, categories: next });
                }
              };

              return (
                <Box
                  key={cat._id}
                  component="button"
                  onClick={handleCatClick}
                  sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.625,
                    px: 1.5, py: 0.625, borderRadius: "20px",
                    border: `1.5px solid ${isActive ? ROSE : "rgba(0,0,0,0.15)"}`,
                    bgcolor: isActive ? ROSE : "#fff",
                    color: isActive ? "#fff" : "#44403c",
                    cursor: "pointer", whiteSpace: "nowrap",
                    fontSize: "0.8125rem", fontWeight: isActive ? 700 : 500,
                    fontFamily: "inherit",
                    transition: "all 140ms",
                    "&:hover": { borderColor: ROSE, bgcolor: isActive ? "#7a1640" : "rgba(139,26,74,0.06)", color: isActive ? "#fff" : ROSE },
                  }}
                >
                  {cat.name}
                  {isActive && selectedInCat.length > 0 && (
                    <Box sx={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 16, height: 16, borderRadius: "50%",
                      bgcolor: "rgba(255,255,255,0.3)", fontSize: "0.6rem", fontWeight: 800,
                    }}>
                      {selectedInCat.length}
                    </Box>
                  )}
                  {hasSubs && <FiChevronDown size={11} style={{ opacity: 0.7 }} />}
                </Box>
              );
            })}

            {/* ── Divider ── */}
            <Box sx={{ width: "1px", height: 24, bgcolor: "rgba(0,0,0,0.12)", flexShrink: 0 }} />

            {/* ── Price pill ── */}
            {(() => {
              const isActive = !!filters.priceRange;
              const label = isActive
                ? `₹${filters.priceRange.min.toLocaleString()} – ${filters.priceRange.max === Infinity ? "Max" : `₹${filters.priceRange.max.toLocaleString()}`}`
                : "Price";
              return (
                <Box
                  component="button"
                  onClick={(e) => setPriceAnchor(e.currentTarget)}
                  sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.625,
                    px: 1.5, py: 0.625, borderRadius: "20px",
                    border: `1.5px solid ${isActive ? ROSE : "rgba(0,0,0,0.15)"}`,
                    bgcolor: isActive ? ROSE : "#fff",
                    color: isActive ? "#fff" : "#44403c",
                    cursor: "pointer", whiteSpace: "nowrap",
                    fontSize: "0.8125rem", fontWeight: isActive ? 700 : 500,
                    fontFamily: "inherit",
                    transition: "all 140ms",
                    "&:hover": { borderColor: ROSE, bgcolor: isActive ? "#7a1640" : "rgba(139,26,74,0.06)", color: isActive ? "#fff" : ROSE },
                  }}
                >
                  <FiTag size={12} />
                  {label}
                  <FiChevronDown size={11} style={{ opacity: 0.7 }} />
                </Box>
              );
            })()}

            {/* ── Clear all ── */}
            {activeFilterCount > 0 && (
              <>
                <Box sx={{ width: 1, height: 24, bgcolor: "rgba(0,0,0,0.1)", flexShrink: 0 }} />
                <Box
                  component="button"
                  onClick={handleClearFilters}
                  sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.5,
                    px: 1.5, py: 0.625, borderRadius: "20px",
                    border: "1.5px solid rgba(0,0,0,0.12)",
                    bgcolor: "transparent", color: "#78716c",
                    cursor: "pointer", whiteSpace: "nowrap",
                    fontSize: "0.8125rem", fontWeight: 500, fontFamily: "inherit",
                    transition: "all 140ms",
                    "&:hover": { borderColor: "#ef4444", color: "#ef4444", bgcolor: "rgba(239,68,68,0.05)" },
                  }}
                >
                  <FiX size={11} />
                  Clear all
                </Box>
              </>
            )}
          </Stack>
        </Box>
      </Box>

      {/* ── Sort popover ──────────────────────────────────────────── */}
      <Popover
        open={Boolean(sortAnchor)}
        anchorEl={sortAnchor}
        onClose={() => setSortAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{ sx: { mt: 0.75, borderRadius: 2.5, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.07)", p: 0.75, minWidth: 210 } }}
      >
        {SORT_OPTIONS.map((opt) => {
          const active = filters.sortBy === opt.value;
          const Icon = opt.icon;
          return (
            <Box
              key={opt.value}
              component="button"
              onClick={() => { handleFiltersChange({ ...filters, sortBy: opt.value }); setSortAnchor(null); }}
              sx={{
                display: "flex", alignItems: "center", gap: 1.25,
                width: "100%", px: 1.5, py: 1, borderRadius: "10px",
                border: "none", cursor: "pointer", textAlign: "left",
                bgcolor: active ? "rgba(139,26,74,0.08)" : "transparent",
                color: active ? ROSE : "#44403c",
                fontFamily: "inherit", fontSize: "0.875rem", fontWeight: active ? 700 : 400,
                transition: "all 120ms",
                "&:hover": { bgcolor: "rgba(139,26,74,0.06)", color: ROSE },
              }}
            >
              {Icon && <Icon size={14} />}
              {!Icon && <Box sx={{ width: 14 }} />}
              {opt.label}
              {active && <Box sx={{ ml: "auto", width: 7, height: 7, borderRadius: "50%", bgcolor: ROSE }} />}
            </Box>
          );
        })}
      </Popover>

      {/* ── Category popover (subcategories) ─────────────────────── */}
      <Popover
        open={Boolean(catPopover.anchor)}
        anchorEl={catPopover.anchor}
        onClose={() => setCatPopover({ anchor: null, cat: null })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{ sx: { mt: 0.75, borderRadius: 2.5, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.07)", py: 1, px: 0.75, minWidth: 200, maxWidth: 280 } }}
      >
        {catPopover.cat && (() => {
          const cat = catPopover.cat;
          const activeSubs = cat.subcategories?.filter((s) => s.isActive !== false) || [];
          const catSelected = filters.categories.includes(cat.name);

          const toggleName = (name) => {
            const next = filters.categories.includes(name)
              ? filters.categories.filter((c) => c !== name)
              : [...filters.categories, name];
            handleFiltersChange({ ...filters, categories: next });
          };

          const rowSx = (active) => ({
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", px: 1.25, py: 0.75, borderRadius: "8px",
            border: "none", cursor: "pointer", textAlign: "left", transition: "all 100ms",
            fontFamily: "inherit",
            bgcolor: active ? "rgba(139,26,74,0.08)" : "transparent",
            color: active ? ROSE : "#44403c",
            fontWeight: active ? 600 : 400,
            "&:hover": { bgcolor: "rgba(139,26,74,0.06)", color: ROSE },
          });

          return (
            <Box>
              {/* Category label */}
              <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.disabled", px: 1.25, mb: 0.5 }}>
                {cat.name}
              </Typography>

              {/* Parent "All" row */}
              <Box component="button" onClick={() => toggleName(cat.name)} sx={{ ...rowSx(catSelected), fontSize: "0.875rem" }}>
                All {cat.name}
                {catSelected && <FiCheck size={13} />}
              </Box>

              {/* Subcategories */}
              {activeSubs.length > 0 && (
                <>
                  <Box sx={{ height: "1px", bgcolor: "rgba(0,0,0,0.07)", mx: 1.25, my: 0.625 }} />
                  <Typography sx={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.disabled", px: 1.25, mb: 0.375 }}>
                    Subcategories
                  </Typography>
                  {activeSubs.map((sub) => {
                    const subSelected = filters.categories.includes(sub.name);
                    return (
                      <Box
                        key={sub._id}
                        component="button"
                        onClick={() => toggleName(sub.name)}
                        sx={{ ...rowSx(subSelected), fontSize: "0.8125rem" }}
                      >
                        {sub.name}
                        {subSelected && <FiCheck size={12} />}
                      </Box>
                    );
                  })}
                </>
              )}
            </Box>
          );
        })()}
      </Popover>

      {/* ── Price popover ─────────────────────────────────────────── */}
      <Popover
        open={Boolean(priceAnchor)}
        anchorEl={priceAnchor}
        onClose={() => setPriceAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{ sx: { mt: 0.75, borderRadius: 2.5, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.07)", p: 2, minWidth: 240 } }}
      >
        <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.disabled", mb: 1.5 }}>
          Price Range
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <TextField
            size="small" type="number" placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: "0.8rem", color: "text.disabled" }}>₹</Typography></InputAdornment> } }}
            sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
          />
          <Typography color="text.disabled">–</Typography>
          <TextField
            size="small" type="number" placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: "0.8rem", color: "text.disabled" }}>₹</Typography></InputAdornment> } }}
            sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          {filters.priceRange && (
            <Button size="small" variant="outlined" fullWidth onClick={() => { handleFiltersChange({ ...filters, priceRange: null }); setPriceAnchor(null); }}
              sx={{ textTransform: "none", borderRadius: "10px", fontWeight: 600, borderColor: "rgba(0,0,0,0.15)", color: "#78716c", "&:hover": { borderColor: "#ef4444", color: "#ef4444" } }}>
              Clear
            </Button>
          )}
          <Button
            size="small" variant="contained" fullWidth
            disabled={!priceMin && !priceMax}
            onClick={() => {
              const min = parseFloat(priceMin) || 0;
              const max = parseFloat(priceMax) || Infinity;
              handleFiltersChange({ ...filters, priceRange: { min, max } });
              setPriceAnchor(null);
            }}
            sx={{
              textTransform: "none", borderRadius: "10px", fontWeight: 700,
              background: `linear-gradient(135deg, ${ROSE}, #7a1640)`,
              boxShadow: "none",
              "&:hover": { background: "linear-gradient(135deg, #7a1640, #5e1232)" },
              "&.Mui-disabled": { opacity: 0.4 },
            }}
          >
            Apply
          </Button>
        </Stack>
      </Popover>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, py: 3 }}>
        {/* ── products area ── */}
        <Box sx={{ minWidth: 0 }}>

        {/* Page heading row */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: "rgba(139,26,74,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: ROSE }}>
              <FiGrid size={17} />
            </Box>
            <Box>
              <Typography variant="h5" component="h1" fontWeight={800} color="#1c1917" sx={{ lineHeight: 1 }}>
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
