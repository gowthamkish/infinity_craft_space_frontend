import { useState, useEffect, lazy, Suspense, useRef, useContext } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { DotsLoader, PageLoader } from "../components/Loader";
import {
  FiShoppingCart,
  FiHeart,
  FiShare2,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiPackage,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiPlus,
  FiMinus,
  FiZoomIn,
  FiBox,
  FiBell,
  FiStar,
} from "react-icons/fi";
import { addToCart } from "../features/cartSlice";
import { StarRating } from "../components/reviews/StarRating";
import api from "../api/axios";
import SEOHead, {
  generateProductStructuredData,
  generateBreadcrumbStructuredData,
  getBaseUrl,
} from "../components/SEOHead";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { useLazySection } from "../hooks/useLazySection";
import DeliveryEstimator from "../components/DeliveryEstimator";
import { ToastContext } from "../context/ToastContext";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";

const ProductRecommendations = lazy(() => import("../components/ProductRecommendations"));
const ProductQnA = lazy(() => import("../components/ProductQnA"));
const Header = lazy(() => import("../components/Header"));
const ReviewList = lazy(() => import("../components/reviews/ReviewList"));
const ImageCarouselModal = lazy(() => import("../components/ImageCarouselModal"));

// ─── Design tokens ──────────────────────────────────────────────────────────
const PRIMARY      = "#8B1A4A";
const PRIMARY_DARK = "#6b1238";
const PRIMARY_BG   = "rgba(139,26,74,0.07)";
const SUCCESS      = "#059669";
const SUCCESS_BG   = "#d1fae5";
const WARNING      = "#d97706";
const WARNING_BG   = "#fef3c7";
const DANGER       = "#dc2626";
const DANGER_BG    = "#fee2e2";
const BORDER       = "rgba(0,0,0,0.08)";

// ─── Type-scale helpers ──────────────────────────────────────────────────────
const T = {
  label:      { fontSize: "0.8125rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.secondary" },
  body:       { fontSize: "0.875rem",  lineHeight: 1.7, color: "text.secondary" },
  supporting: { fontSize: "0.75rem",   color: "text.disabled" },
  badge:      { fontSize: "0.6875rem" },
};

const TRUST_ITEMS = [
  { icon: <FiTruck  size={20} />, label: "Free Shipping",    sub: "Orders above ₹999"      },
  { icon: <FiShield size={20} />, label: "Secure Payment",   sub: "100% Safe Checkout"     },
  { icon: <FiRefreshCw size={20} />, label: "Easy Returns",  sub: "7-Day Return Policy"    },
  { icon: <FiCheck  size={20} />, label: "Quality Assured",  sub: "Handcrafted with care"  },
];

// ─── TabPanel ────────────────────────────────────────────────────────────────
function TabPanel({ children, value, index }) {
  return (
    <Box role="tabpanel" hidden={value !== index} id={`pdp-tabpanel-${index}`} aria-labelledby={`pdp-tab-${index}`}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </Box>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function PDPSkeleton() {
  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={4} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 7 }}>
          <Skeleton variant="rectangular" width="100%" sx={{ aspectRatio: "4/5", borderRadius: "12px" }} />
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rectangular" width={68} height={68} sx={{ borderRadius: "8px", flexShrink: 0 }} />
            ))}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>
            <Skeleton variant="rounded" width={90} height={22} sx={{ borderRadius: 9999 }} />
            <Skeleton variant="text" width="85%" height={36} />
            <Skeleton variant="text" width="50%" height={44} />
            <Skeleton variant="text" width={110} height={26} />
            <Skeleton variant="text" width="100%" height={1} />
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="90%" height={16} />
            <Skeleton variant="text" width="70%" height={16} />
            <Skeleton variant="rounded" width="100%" height={48} sx={{ borderRadius: "12px", mt: 1 }} />
            <Skeleton variant="rounded" width="100%" height={48} sx={{ borderRadius: "12px" }} />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

// ─── Breadcrumb ──────────────────────────────────────────────────────────────
function PDPBreadcrumb({ category, subCategory, productName }) {
  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3, "& .MuiBreadcrumbs-separator": { color: "text.disabled" } }}>
      <MuiLink component={RouterLink} to="/" underline="hover"
        sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>Home</MuiLink>
      <MuiLink component={RouterLink} to="/products" underline="hover"
        sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>Products</MuiLink>
      {category && (
        <MuiLink component={RouterLink} to={`/products?category=${encodeURIComponent(category)}`} underline="hover"
          sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>{category}</MuiLink>
      )}
      {subCategory && (
        <MuiLink component={RouterLink} to={`/products?category=${encodeURIComponent(category)}&subCategory=${encodeURIComponent(subCategory)}`} underline="hover"
          sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>{subCategory}</MuiLink>
      )}
      {productName && (
        <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500, color: "text.primary", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {productName}
        </Typography>
      )}
    </Breadcrumbs>
  );
}

// ─── Quantity Selector ───────────────────────────────────────────────────────
function QuantitySelector({ value, onChange, min = 1, max = 99 }) {
  return (
    <Stack
      direction="row" alignItems="center" role="group" aria-label="Quantity"
      sx={{
        border: `1px solid ${BORDER}`,
        borderRadius: "10px",
        overflow: "hidden",
        bgcolor: "#fff",
        display: "inline-flex",
        height: 36,
      }}
    >
      <IconButton size="small" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
        aria-label="Decrease quantity"
        sx={{ borderRadius: 0, width: 36, height: 36, color: "text.secondary",
          "&:hover": { bgcolor: PRIMARY_BG, color: PRIMARY },
          "&.Mui-disabled": { opacity: 0.35 } }}>
        <FiMinus size={13} />
      </IconButton>
      <Box aria-live="polite"
        sx={{ minWidth: 40, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 600, fontSize: "0.9375rem", color: "text.primary",
          borderLeft: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`,
          fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Box>
      <IconButton size="small" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
        aria-label="Increase quantity"
        sx={{ borderRadius: 0, width: 36, height: 36, color: "text.secondary",
          "&:hover": { bgcolor: PRIMARY_BG, color: PRIMARY },
          "&.Mui-disabled": { opacity: 0.35 } }}>
        <FiPlus size={13} />
      </IconButton>
    </Stack>
  );
}

// ─── Trust badge card ────────────────────────────────────────────────────────
function TrustGrid() {
  return (
    <Paper elevation={0} sx={{ border: `0.5px solid ${BORDER}`, borderRadius: "12px", overflow: "hidden", bgcolor: "#fff" }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {TRUST_ITEMS.map((item, i) => (
          <Box key={item.label} sx={{
            p: 1.75,
            display: "flex", alignItems: "flex-start", gap: 1.25,
            borderRight: i % 2 === 0 ? `0.5px solid ${BORDER}` : "none",
            borderBottom: i < 2 ? `0.5px solid ${BORDER}` : "none",
          }}>
            <Box sx={{ color: PRIMARY, flexShrink: 0, mt: 0.125 }}>{item.icon}</Box>
            <Box>
              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "text.primary", lineHeight: 1.3, mb: 0.25 }}>
                {item.label}
              </Typography>
              <Typography sx={T.supporting}>{item.sub}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addProduct } = useRecentlyViewed();
  const { ref: qnaRef, inView: qnaInView } = useLazySection();
  const { ref: recoRef, inView: recoInView } = useLazySection();
  const { addSuccess, addError } = useContext(ToastContext);

  const isAuthenticated = useSelector((state) => !!state.auth.user);
  const cartItems = useSelector((state) => state.cart.items);
  const userName = useSelector((state) => state.auth.user?.name || state.auth.user?.email || "Customer");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [ratingStats, setRatingStats] = useState(null);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyStatus, setNotifyStatus] = useState(null);
  const [customNote, setCustomNote] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [descExpanded, setDescExpanded] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const thumbsRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/products/${id}`);
        const productData = response.data.product || response.data;
        setProduct(productData);
        setError(null);
        addProduct(productData);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchRatingSummary = async () => {
      try {
        const response = await api.get(`/api/reviews/product/${id}/summary`);
        setRatingStats(response.data);
      } catch {
        setRatingStats({ averageRating: 0, reviewCount: 0, ratingBreakdown: {} });
      }
    };
    fetchRatingSummary();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || !product) return;
    const checkWishlist = async () => {
      try {
        const response = await api.get("/api/auth/wishlist");
        const ids = (response.data.wishlist || []).map((item) =>
          typeof item === "object" ? item._id : item
        );
        setIsWishlisted(ids.includes(product._id));
      } catch { /* silent */ }
    };
    checkWishlist();
  }, [isAuthenticated, product]);

  useEffect(() => {
    if (!product?.showColorPickerToUsers || !product?.colors?.length) return;
    const first = product.colors.find((c) => c.visibleToUsers);
    if (first) setSelectedColor(first);
  }, [product]);

  useEffect(() => {
    if (!thumbsRef.current) return;
    const active = thumbsRef.current.querySelector("[data-active='true']");
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [selectedImageIndex]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      dispatch(addToCart({ product, quantity, customNote: customNote.trim() || undefined }));
      addSuccess(`${product.name} added to cart!`, "Added to Cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/checkout");
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await api.delete(`/api/auth/wishlist/${product._id}`);
        setIsWishlisted(false);
        addSuccess("Removed from wishlist", "Wishlist");
      } else {
        await api.post("/api/auth/wishlist", { productId: product._id });
        setIsWishlisted(true);
        addSuccess("Saved to wishlist!", "Wishlist");
      }
    } catch {
      addError("Could not update wishlist. Try again.", "Error");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleNotifyMe = async (e) => {
    e.preventDefault();
    if (!notifyEmail) return;
    setNotifyStatus("loading");
    try {
      await api.post(`/api/products/${id}/notify`, { email: notifyEmail });
      setNotifyStatus("success");
    } catch {
      setNotifyStatus("error");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: product.name, text: product.description, url: window.location.href }); }
      catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      addSuccess("Link copied to clipboard!", "Shared");
    }
  };

  const getImages = () => {
    if (product?.images?.length > 0) return product.images;
    if (product?.image?.url) return [product.image];
    return [];
  };

  const handleKeyNav = (e) => {
    const imgs = getImages();
    if (e.key === "ArrowLeft") setSelectedImageIndex((p) => (p > 0 ? p - 1 : imgs.length - 1));
    if (e.key === "ArrowRight") setSelectedImageIndex((p) => (p < imgs.length - 1 ? p + 1 : 0));
  };

  // ── Loading ──
  if (loading) {
    return (
      <>
        <Suspense fallback={null}><Header /></Suspense>
        <Box sx={{ bgcolor: "#fafaf9", minHeight: "100vh", pb: 5 }}>
          <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 12 }, pb: 10 }}>
            <PDPSkeleton />
          </Container>
        </Box>
      </>
    );
  }

  // ── Error / Not Found ──
  if (error || !product) {
    return (
      <>
        <Suspense fallback={null}><Header /></Suspense>
        <Box sx={{ bgcolor: "#fafaf9", minHeight: "100vh" }}>
          <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 12 } }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              textAlign: "center", py: 12, minHeight: "50vh" }}>
              <Box sx={{ width: 80, height: 80, bgcolor: PRIMARY_BG, color: PRIMARY, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
                <FiBox size={40} />
              </Box>
              <Typography variant="h5" fontWeight={700} mb={1.5}>
                {error ? "Couldn't load product" : "Product not found"}
              </Typography>
              <Typography sx={{ ...T.body, maxWidth: 400, mb: 4 }}>
                {error || "The product you're looking for doesn't exist or has been removed."}
              </Typography>
              <Button variant="contained" size="large" onClick={() => navigate("/products")}
                sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: PRIMARY_DARK }, borderRadius: "10px", fontWeight: 600, px: 4 }}>
                Browse Products
              </Button>
            </Box>
          </Container>
        </Box>
      </>
    );
  }

  const images = getImages();
  const quantityInCart = cartItems.find((item) => item.product._id === id)?.quantity || 0;
  const isOutOfStock = product.trackInventory !== false && product.stock <= 0;
  const isLowStock = product.trackInventory !== false && product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
  const DESC_LIMIT = 280;
  const isLongDesc = (product.description || "").length > DESC_LIMIT;

  return (
    <>
      <SEOHead
        title={`${product.name} - Infinity Craft Space`}
        description={product.seoDescription || product.description}
        type="product"
        price={product.price}
        availability={isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"}
        rating={ratingStats?.averageRating}
        reviewCount={ratingStats?.reviewCount}
        image={images[0]?.url}
        url={`${getBaseUrl()}/product/${product.slug || product._id}`}
        canonical={`${getBaseUrl()}/product/${product.slug || product._id}`}
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [
            {
              ...generateProductStructuredData(product, []),
              aggregateRating: ratingStats?.reviewCount > 0 ? {
                "@type": "AggregateRating",
                ratingValue: ratingStats.averageRating,
                reviewCount: ratingStats.reviewCount,
                bestRating: 5,
                worstRating: 1,
              } : undefined,
            },
            generateBreadcrumbStructuredData([
              { name: "Home", url: getBaseUrl() },
              { name: "Products", url: `${getBaseUrl()}/products` },
              ...(product.category ? [{ name: product.category, url: `${getBaseUrl()}/products?category=${encodeURIComponent(product.category)}` }] : []),
              { name: product.name, url: `${getBaseUrl()}/product/${product.slug || product._id}` },
            ]),
          ],
        }}
      />

      <Suspense fallback={null}><Header /></Suspense>

      <Box sx={{ bgcolor: "#fafaf9", minHeight: "100vh", pb: { xs: 12, md: 10 } }}>
        <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 12 } }}>

          <PDPBreadcrumb category={product.category} subCategory={product.subCategory} productName={product.name} />

          {/* ══ HERO: Gallery + Info ══════════════════════════════════════════ */}
          <Grid container spacing={4} alignItems="flex-start">

            {/* ── IMAGE GALLERY (left ~55%) ────────────────────────────────── */}
            <Grid size={{ xs: 12, md: 7 }} onKeyDown={handleKeyNav} tabIndex={-1} sx={{ outline: "none" }}>

              {/* Main image */}
              <Paper
                elevation={0}
                onClick={() => images.length > 0 && setShowImageModal(true)}
                role="button" tabIndex={0} aria-label="Open full-screen image viewer"
                onKeyDown={(e) => e.key === "Enter" && setShowImageModal(true)}
                sx={{
                  position: "relative",
                  aspectRatio: "4/5",
                  borderRadius: "12px",
                  bgcolor: "#fff",
                  overflow: "hidden",
                  cursor: images.length > 0 ? "zoom-in" : "default",
                  border: `0.5px solid ${BORDER}`,
                  outline: "none",
                  "&:hover .gallery-img": { transform: "scale(1.05)" },
                  "&:hover .zoom-hint": { opacity: 1, transform: "translateY(0)" },
                  "&:hover .gallery-arrow": { opacity: 1, transform: "translateY(-50%) scale(1)" },
                  transition: "box-shadow 200ms",
                  "&:hover": { boxShadow: "0 8px 32px rgba(0,0,0,0.10)" },
                }}
              >
                {images.length > 0 ? (
                  <Box component="img" className="gallery-img"
                    src={images[selectedImageIndex]?.url}
                    alt={`${product.name} — image ${selectedImageIndex + 1}`}
                    fetchPriority={selectedImageIndex === 0 ? "high" : "auto"}
                    loading={selectedImageIndex === 0 ? "eager" : "lazy"}
                    sx={{ width: "100%", height: "100%", objectFit: "contain", p: 3,
                      transition: "transform 400ms cubic-bezier(0.25,0.46,0.45,0.94)" }}
                  />
                ) : (
                  <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 1.5, color: "text.disabled" }}>
                    <FiPackage size={56} />
                    <Typography sx={T.body}>No image available</Typography>
                  </Box>
                )}

                {/* Zoom hint */}
                {images.length > 0 && (
                  <Box className="zoom-hint" aria-hidden="true"
                    sx={{ position: "absolute", bottom: 14, right: 14,
                      bgcolor: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)",
                      px: 1.25, py: 0.625, borderRadius: "8px",
                      display: "flex", alignItems: "center", gap: 0.75,
                      pointerEvents: "none", opacity: 0, transform: "translateY(4px)",
                      transition: "opacity 120ms, transform 120ms",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}>
                    <FiZoomIn size={13} />
                    <Typography sx={{ ...T.supporting, color: "text.secondary" }}>Full screen</Typography>
                  </Box>
                )}

                {/* Stock overlay */}
                {isOutOfStock && (
                  <Chip label="Out of Stock" size="small"
                    sx={{ position: "absolute", top: 14, left: 14, bgcolor: DANGER, color: "#fff",
                      fontWeight: 600, ...T.badge, pointerEvents: "none", borderRadius: "8px" }} />
                )}
                {!isOutOfStock && isLowStock && (
                  <Chip label={`Only ${product.stock} left`} size="small"
                    sx={{ position: "absolute", top: 14, left: 14, bgcolor: WARNING, color: "#fff",
                      fontWeight: 600, ...T.badge, pointerEvents: "none", borderRadius: "8px" }} />
                )}

                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <IconButton className="gallery-arrow"
                      onClick={(e) => { e.stopPropagation(); setSelectedImageIndex((p) => (p > 0 ? p - 1 : images.length - 1)); }}
                      aria-label="Previous image" size="small"
                      sx={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%) scale(0.9)",
                        bgcolor: "rgba(255,255,255,0.95)", border: `0.5px solid ${BORDER}`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.10)", opacity: 0, transition: "all 120ms", zIndex: 2,
                        width: 38, height: 38, "&:hover": { bgcolor: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,0.14)" } }}>
                      <FiChevronLeft size={17} />
                    </IconButton>
                    <IconButton className="gallery-arrow"
                      onClick={(e) => { e.stopPropagation(); setSelectedImageIndex((p) => (p < images.length - 1 ? p + 1 : 0)); }}
                      aria-label="Next image" size="small"
                      sx={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%) scale(0.9)",
                        bgcolor: "rgba(255,255,255,0.95)", border: `0.5px solid ${BORDER}`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.10)", opacity: 0, transition: "all 120ms", zIndex: 2,
                        width: 38, height: 38, "&:hover": { bgcolor: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,0.14)" } }}>
                      <FiChevronRight size={17} />
                    </IconButton>
                  </>
                )}

                {/* Dot indicators */}
                {images.length > 1 && (
                  <Stack direction="row" spacing={0.75} aria-label="Image navigation"
                    sx={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", zIndex: 2 }}>
                    {images.map((_, i) => (
                      <Box key={i} component="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(i); }}
                        aria-label={`Image ${i + 1}`} aria-pressed={i === selectedImageIndex}
                        sx={{ width: i === selectedImageIndex ? 18 : 6, height: 6,
                          borderRadius: i === selectedImageIndex ? "3px" : "50%",
                          bgcolor: i === selectedImageIndex ? PRIMARY : "rgba(0,0,0,0.22)",
                          border: "none", cursor: "pointer", p: 0,
                          transition: "all 120ms",
                          "&:hover": { bgcolor: i === selectedImageIndex ? PRIMARY : "rgba(0,0,0,0.45)" } }}
                      />
                    ))}
                  </Stack>
                )}
              </Paper>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <Stack direction="row" spacing={1} ref={thumbsRef} role="list"
                  sx={{ mt: 1.5, overflowX: "auto", pb: 0.25, "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}>
                  {images.map((image, index) => (
                    <Paper key={index} role="listitem" component="button" data-active={index === selectedImageIndex}
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={`View image ${index + 1}`} aria-pressed={index === selectedImageIndex}
                      elevation={0}
                      sx={{
                        width: 68, height: 68, flexShrink: 0, borderRadius: "8px",
                        border: "2px solid",
                        borderColor: index === selectedImageIndex ? PRIMARY : "transparent",
                        bgcolor: "#fff", cursor: "pointer", p: 0.5, overflow: "hidden", outline: "none",
                        boxShadow: index === selectedImageIndex
                          ? `0 0 0 1px ${PRIMARY}`
                          : `0 0 0 1px ${BORDER}`,
                        transition: "all 120ms",
                        "&:hover": { borderColor: index === selectedImageIndex ? PRIMARY : "#bbb", transform: "translateY(-1px)" },
                      }}>
                      <Box component="img" src={image.url} alt={`${product.name} thumbnail ${index + 1}`} loading="lazy"
                        sx={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "4px" }} />
                    </Paper>
                  ))}
                </Stack>
              )}
            </Grid>

            {/* ── INFO PANEL (right ~45%, sticky) ─────────────────────────── */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ position: { md: "sticky" }, top: { md: "24px" } }}>
                <Stack spacing={0}>

                  {/* ── GROUP 1: Identity ─────────────────────────────────── */}
                  {/* Category pills */}
                  <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 1.5 }}>
                    {product.category && (
                      <Chip label={product.category} size="small"
                        component={RouterLink} to={`/products?category=${encodeURIComponent(product.category)}`} clickable
                        sx={{ bgcolor: PRIMARY_BG, color: PRIMARY, border: `1px solid rgba(139,26,74,0.2)`,
                          fontWeight: 500, ...T.badge, "&:hover": { bgcolor: "rgba(139,26,74,0.12)", color: PRIMARY_DARK } }} />
                    )}
                    {product.subCategory && (
                      <Chip label={product.subCategory} size="small"
                        component={RouterLink} to={`/products?category=${encodeURIComponent(product.category)}&subCategory=${encodeURIComponent(product.subCategory)}`} clickable
                        sx={{ bgcolor: "#fafaf9", color: "text.secondary", border: `1px solid ${BORDER}`,
                          fontWeight: 500, ...T.badge, "&:hover": { borderColor: PRIMARY, color: PRIMARY, bgcolor: PRIMARY_BG } }} />
                    )}
                    {product.isCustomizable && (
                      <Chip label="✦ Customizable" size="small"
                        sx={{ bgcolor: PRIMARY_BG, color: PRIMARY, border: `1px solid rgba(139,26,74,0.25)`,
                          fontWeight: 500, ...T.badge }} />
                    )}
                  </Stack>

                  {/* Product name */}
                  <Typography component="h1"
                    sx={{ fontSize: { xs: "1.4rem", md: "1.5rem" }, fontWeight: 600, color: "text.primary",
                      lineHeight: 1.3, mb: 1.25 }}>
                    {product.name}
                  </Typography>

                  {/* Rating */}
                  {ratingStats?.reviewCount > 0 && (
                    <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 1.75 }}>
                      <StarRating rating={ratingStats.averageRating} size="0.875rem" showValue />
                      <Typography sx={{ ...T.supporting, color: "text.secondary" }}>
                        · {ratingStats.reviewCount} {ratingStats.reviewCount === 1 ? "review" : "reviews"}
                      </Typography>
                    </Stack>
                  )}

                  {/* Price block */}
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1.25} sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontSize: "1.875rem", fontWeight: 700, color: PRIMARY,
                        lineHeight: 1, letterSpacing: "-0.02em" }}>
                        ₹{product.price.toLocaleString("en-IN")}
                      </Typography>
                      {product.compareAtPrice > product.price && (
                        <>
                          <Typography sx={{ fontSize: "1.0625rem", fontWeight: 400, color: "#94a3b8",
                            textDecoration: "line-through", lineHeight: 1 }}>
                            ₹{product.compareAtPrice.toLocaleString("en-IN")}
                          </Typography>
                          <Box sx={{ display: "inline-flex", alignItems: "center", bgcolor: DANGER,
                            color: "#fff", fontSize: "0.72rem", fontWeight: 700,
                            px: 0.875, py: 0.25, borderRadius: "6px", lineHeight: 1.4 }}>
                            {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
                          </Box>
                        </>
                      )}
                    </Stack>
                    <Typography sx={{ ...T.supporting, color: "text.disabled" }}>
                      Inclusive of all taxes
                    </Typography>
                  </Box>

                  {/* Stock badge */}
                  {product.trackInventory !== false && (
                    <Box sx={{ mb: 2.5 }}>
                      {isOutOfStock ? (
                        <Chip icon={<FiPackage size={12} />} label="Out of Stock" size="small"
                          sx={{ bgcolor: DANGER_BG, color: DANGER, fontWeight: 600, ...T.badge, borderRadius: 9999 }} />
                      ) : isLowStock ? (
                        <Chip label={`🔥 Only ${product.stock} left`} size="small"
                          sx={{ bgcolor: WARNING_BG, color: WARNING, fontWeight: 600, ...T.badge, borderRadius: 9999 }} />
                      ) : (
                        <Chip icon={<FiCheck size={12} />} label="In Stock" size="small"
                          sx={{ bgcolor: SUCCESS_BG, color: SUCCESS, fontWeight: 600, ...T.badge, borderRadius: 9999 }} />
                      )}
                    </Box>
                  )}

                  <Divider sx={{ borderColor: BORDER, mb: 2.5 }} />

                  {/* ── GROUP 2: Description ──────────────────────────────── */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography sx={{
                      ...T.body,
                      ...(isLongDesc && !descExpanded
                        ? { display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden" }
                        : {}),
                    }}>
                      {product.description}
                    </Typography>
                    {isLongDesc && (
                      <Box component="button" onClick={() => setDescExpanded((v) => !v)}
                        sx={{ mt: 0.75, background: "none", border: "none", cursor: "pointer",
                          color: PRIMARY, fontSize: "0.8125rem", fontWeight: 600, p: 0,
                          "&:hover": { color: PRIMARY_DARK } }}>
                        {descExpanded ? "Show less ↑" : "Read more ↓"}
                      </Box>
                    )}
                  </Box>

                  {/* ── GROUP 3: Options (colors, customization, bulk) ────── */}

                  {/* Color selector */}
                  {product.showColorPickerToUsers && (() => {
                    const visibleColors = (product.colors || []).filter((c) => c.visibleToUsers);
                    if (!visibleColors.length) return null;
                    return (
                      <Box sx={{ mb: 2.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "text.secondary" }}>
                            Colour
                          </Typography>
                          {selectedColor && (
                            <Stack direction="row" alignItems="center" spacing={0.75}>
                              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: selectedColor.hex,
                                border: "1px solid rgba(0,0,0,0.12)", flexShrink: 0 }} />
                              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "text.primary" }}>
                                {selectedColor.name}
                              </Typography>
                            </Stack>
                          )}
                        </Box>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                          {visibleColors.map((c, i) => (
                            <Tooltip key={c._id || c.id || i} title={c.name} arrow>
                              <Box component="button" onClick={() => setSelectedColor(c)}
                                aria-label={`Select color ${c.name}`} aria-pressed={selectedColor?.hex === c.hex}
                                sx={{
                                  width: 32, height: 32, borderRadius: "50%", bgcolor: c.hex,
                                  border: selectedColor?.hex === c.hex ? `3px solid ${PRIMARY}` : "2px solid rgba(0,0,0,0.12)",
                                  boxShadow: selectedColor?.hex === c.hex ? `0 0 0 2px rgba(139,26,74,0.2)` : "0 1px 3px rgba(0,0,0,0.10)",
                                  cursor: "pointer", p: 0, flexShrink: 0, transition: "all 140ms",
                                  "&:hover": { transform: "scale(1.15)", boxShadow: "0 2px 10px rgba(0,0,0,0.2)" },
                                }} />
                            </Tooltip>
                          ))}
                        </Stack>
                        {selectedColor?.stock !== undefined && selectedColor?.stock !== "" && (
                          <Typography sx={{ mt: 0.75, fontSize: "0.75rem", color: "text.disabled" }}>
                            {Number(selectedColor.stock) > 0
                              ? `${selectedColor.stock} available` : "Out of stock in this color"}
                          </Typography>
                        )}
                      </Box>
                    );
                  })()}

                  {/* Bulk discounts */}
                  {product.bulkDiscounts?.length > 0 && (
                    <Paper elevation={0} sx={{ bgcolor: "#f0fdf4", border: "0.5px solid #a7f3d0",
                      borderRadius: "12px", p: 2, mb: 2.5 }}>
                      <Stack direction="row" alignItems="center" spacing={0.75} mb={1.25}>
                        <FiStar size={13} color="#065f46" />
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#065f46" }}>
                          Buy more, save more
                        </Typography>
                      </Stack>
                      <Stack divider={<Divider sx={{ borderColor: "#d1fae5" }} />}>
                        {product.bulkDiscounts.map((bd) => (
                          <Box key={bd.minQuantity}
                            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.75 }}>
                            <Typography sx={T.body}>Buy {bd.minQuantity}{bd.maxQuantity ? `–${bd.maxQuantity}` : "+"} units</Typography>
                            <Chip label={`Save ${bd.discount}%`} size="small"
                              sx={{ bgcolor: "#d1fae5", color: "#059669", fontWeight: 700, ...T.badge }} />
                          </Box>
                        ))}
                      </Stack>
                    </Paper>
                  )}

                  {/* Customization textarea */}
                  {product.isCustomizable && (
                    <Paper elevation={0} sx={{ bgcolor: "#fdf8f2", border: "0.5px solid #EAD9C5",
                      borderRadius: "12px", p: 2, mb: 2.5 }}>
                      <Stack direction="row" alignItems="flex-start" spacing={1.25} mb={1.5}>
                        <Typography sx={{ fontSize: "1rem", color: PRIMARY, lineHeight: 1.4, flexShrink: 0 }}>✦</Typography>
                        <Box>
                          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: PRIMARY, mb: 0.25 }}>
                            Personalize This Item
                          </Typography>
                          <Typography sx={T.supporting}>
                            Add a name, date, or message — we'll craft it just for you.
                          </Typography>
                        </Box>
                      </Stack>
                      <TextField multiline rows={3} fullWidth
                        slotProps={{ htmlInput: { maxLength: 300 } }}
                        placeholder={`e.g. "For Priya, with love ❤️" · Anniversary date · Initials…`}
                        value={customNote} onChange={(e) => setCustomNote(e.target.value)}
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#fff",
                            "& fieldset": { borderColor: "#EAD9C5" },
                            "&:hover fieldset": { borderColor: PRIMARY },
                            "&.Mui-focused fieldset": { borderColor: PRIMARY } },
                        }} />
                      <Typography sx={{ ...T.supporting, textAlign: "right", mt: 0.5 }}>
                        {customNote.length}/300
                      </Typography>
                    </Paper>
                  )}

                  <Divider sx={{ borderColor: BORDER, mb: 2.5 }} />

                  {/* ── GROUP 4: Purchase actions ─────────────────────────── */}
                  {isOutOfStock ? (
                    <Box>
                      {notifyStatus === "success" ? (
                        <Alert severity="success" icon={<FiCheck size={16} />} sx={{ borderRadius: "12px" }}>
                          <strong>You're on the list!</strong><br />
                          We'll notify you at <strong>{notifyEmail}</strong> when this is back.
                        </Alert>
                      ) : (
                        <>
                          <Stack direction="row" alignItems="center" spacing={0.75} mb={1.25}>
                            <FiBell size={14} />
                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.secondary" }}>
                              Get notified when available
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} component="form" onSubmit={handleNotifyMe} flexWrap="wrap">
                            <TextField type="email" placeholder="your@email.com"
                              value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)}
                              required size="small"
                              sx={{ flex: 1, minWidth: 180,
                                "& .MuiOutlinedInput-root": { borderRadius: "10px",
                                  "&.Mui-focused fieldset": { borderColor: PRIMARY } } }} />
                            <Button type="submit" variant="contained" disabled={notifyStatus === "loading"}
                              sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: PRIMARY_DARK }, borderRadius: "10px",
                                fontWeight: 600, flexShrink: 0 }}>
                              {notifyStatus === "loading" ? <DotsLoader size="sm" /> : "Notify Me"}
                            </Button>
                          </Stack>
                          {notifyStatus === "error" && (
                            <Typography sx={{ fontSize: "0.8125rem", color: "error.main", mt: 0.75 }}>
                              Something went wrong. Please try again.
                            </Typography>
                          )}
                        </>
                      )}
                    </Box>
                  ) : (
                    <Stack spacing={1.75}>
                      {/* Quantity row */}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.secondary" }}>
                          Quantity
                        </Typography>
                        <Stack direction="row" alignItems="center" gap={1.25}>
                          <QuantitySelector
                            value={quantity} onChange={setQuantity}
                            max={product.trackInventory !== false ? product.stock : 99} />
                          {quantityInCart > 0 && (
                            <Chip icon={<FiShoppingCart size={11} />}
                              label={`${quantityInCart} in cart`} size="small"
                              sx={{ bgcolor: PRIMARY_BG, color: PRIMARY, border: `1px solid rgba(139,26,74,0.18)`,
                                fontWeight: 600, flexShrink: 0, ...T.badge }} />
                          )}
                        </Stack>
                      </Box>

                      {/* Primary CTAs */}
                      <Stack spacing={1.25}>
                        <Button variant="contained" fullWidth size="large"
                          startIcon={addingToCart ? null : <FiShoppingCart size={17} />}
                          onClick={handleAddToCart} disabled={addingToCart}
                          sx={{
                            height: 50, bgcolor: PRIMARY,
                            background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
                            "&:hover": { background: `linear-gradient(135deg, ${PRIMARY_DARK} 0%, #4c0d28 100%)`,
                              transform: "translateY(-1px)", boxShadow: "0 6px 20px rgba(139,26,74,0.32)" },
                            boxShadow: "0 4px 14px rgba(139,26,74,0.22)",
                            borderRadius: "12px", fontWeight: 600, fontSize: "0.9375rem",
                            textTransform: "none", transition: "all 180ms",
                          }}>
                          {addingToCart ? <DotsLoader size="sm" /> : (quantityInCart > 0 ? "Add More to Cart" : "Add to Cart")}
                        </Button>
                        <Button variant="outlined" fullWidth size="large"
                          onClick={handleBuyNow} disabled={addingToCart}
                          sx={{
                            height: 50, color: PRIMARY, borderColor: PRIMARY, borderRadius: "12px",
                            fontWeight: 600, fontSize: "0.9375rem", textTransform: "none",
                            "&:hover": { bgcolor: PRIMARY_BG, borderColor: PRIMARY_DARK, transform: "translateY(-1px)" },
                            transition: "all 180ms",
                          }}>
                          Buy Now
                        </Button>
                      </Stack>

                      {/* Save + Share */}
                      <Stack direction="row" spacing={0.75}>
                        <Button variant="text" size="small" fullWidth
                          startIcon={<FiHeart size={14} style={{ fill: isWishlisted ? "currentColor" : "none" }} />}
                          onClick={handleWishlistToggle} disabled={wishlistLoading}
                          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                          sx={{
                            color: isWishlisted ? DANGER : "text.secondary",
                            fontSize: "0.8125rem", fontWeight: 500, borderRadius: "8px", textTransform: "none",
                            border: `1px solid ${BORDER}`,
                            "&:hover": { bgcolor: isWishlisted ? DANGER_BG : PRIMARY_BG,
                              color: isWishlisted ? DANGER : PRIMARY, borderColor: "transparent" },
                          }}>
                          {wishlistLoading ? <DotsLoader size="sm" /> : (isWishlisted ? "Saved" : "Save")}
                        </Button>
                        <Button variant="text" size="small" fullWidth
                          startIcon={<FiShare2 size={14} />}
                          onClick={handleShare} aria-label="Share product"
                          sx={{
                            color: "text.secondary", fontSize: "0.8125rem", fontWeight: 500,
                            borderRadius: "8px", textTransform: "none", border: `1px solid ${BORDER}`,
                            "&:hover": { bgcolor: PRIMARY_BG, color: PRIMARY, borderColor: "transparent" },
                          }}>
                          {linkCopied ? "Copied!" : "Share"}
                        </Button>
                      </Stack>
                    </Stack>
                  )}

                  <Box sx={{ mt: 2.5 }}>
                    <Divider sx={{ borderColor: BORDER, mb: 2.5 }} />
                  </Box>

                  {/* ── GROUP 5: Delivery + Trust ─────────────────────────── */}
                  <Stack spacing={2}>
                    <Paper elevation={0}
                      sx={{ border: `0.5px solid ${BORDER}`, borderRadius: "12px", p: 2, bgcolor: "#fff" }}>
                      <DeliveryEstimator
                        productId={product._id}
                        isCustomizable={product.isCustomizable}
                        processingDaysMin={product.processingDaysMin}
                        processingDaysMax={product.processingDaysMax}
                      />
                    </Paper>

                    <TrustGrid />

                    {/* Product meta */}
                    {(product.sku || product.category) && (
                      <Stack direction="row" flexWrap="wrap" gap={2} sx={{ pt: 0.5 }}>
                        {product.sku && (
                          <Typography sx={T.supporting}>
                            <Box component="span" sx={{ fontWeight: 600, color: "text.secondary" }}>SKU:</Box>{" "}{product.sku}
                          </Typography>
                        )}
                        {product.category && (
                          <Typography sx={T.supporting}>
                            <Box component="span" sx={{ fontWeight: 600, color: "text.secondary" }}>Category:</Box>{" "}{product.category}
                          </Typography>
                        )}
                      </Stack>
                    )}
                  </Stack>

                </Stack>
              </Box>
            </Grid>
          </Grid>

          {/* ══ REVIEWS + Q&A ════════════════════════════════════════════════ */}
          <Paper elevation={0}
            sx={{ mt: 6, borderRadius: "12px", border: `0.5px solid ${BORDER}`, bgcolor: "#fff", overflow: "hidden" }}>

            {/* Tab header */}
            <Box sx={{
              px: 3, pt: 3, pb: 0,
              display: "flex", alignItems: "flex-end", justifyContent: "space-between",
              borderBottom: `1px solid ${BORDER}`,
            }}>
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} aria-label="Product details tabs"
                sx={{
                  minHeight: 44,
                  "& .MuiTab-root": {
                    ...T.label, textTransform: "uppercase", minHeight: 44, py: 1.25, px: 0, mr: 3,
                    color: "text.secondary", minWidth: "unset",
                    "&.Mui-selected": { color: PRIMARY },
                  },
                  "& .MuiTabs-indicator": { bgcolor: PRIMARY, height: 2 },
                }}>
                <Tab
                  label={`Reviews${ratingStats?.reviewCount ? ` (${ratingStats.reviewCount})` : ""}`}
                  id="pdp-tab-0" aria-controls="pdp-tabpanel-0" />
                <Tab label="Questions & Answers" id="pdp-tab-1" aria-controls="pdp-tabpanel-1" />
              </Tabs>
            </Box>

            <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <TabPanel value={activeTab} index={0}>
                <Suspense fallback={<PageLoader variant="card" label="Loading reviews…" />}>
                  <ReviewList productId={id} productName={product.name} />
                </Suspense>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <Box ref={qnaRef}>
                  {qnaInView && (
                    <Suspense fallback={<PageLoader variant="card" label="Loading Q&A…" />}>
                      <ProductQnA productId={id} isAuthenticated={isAuthenticated} userName={userName} />
                    </Suspense>
                  )}
                </Box>
              </TabPanel>
            </Box>
          </Paper>

          {/* ══ RECOMMENDATIONS ══════════════════════════════════════════════ */}
          <Box mt={5} ref={recoRef} aria-label="You may also like">
            {recoInView && (
              <Suspense fallback={<PageLoader variant="card" label="Loading recommendations…" />}>
                <ProductRecommendations productId={id} currentProductCategory={product.category} />
              </Suspense>
            )}
          </Box>

        </Container>
      </Box>

      {/* ── Sticky mobile CTA bar ──────────────────────────────────────────── */}
      {!isOutOfStock && (
        <Paper elevation={0} aria-label="Quick add to cart"
          sx={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
            display: { xs: "flex", md: "none" },
            alignItems: "center", gap: 1.5, px: 2, py: 1.25,
            pb: "calc(10px + env(safe-area-inset-bottom))",
            bgcolor: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 -1px 0 rgba(0,0,0,0.06), 0 -8px 24px rgba(0,0,0,0.07)",
            borderTop: `1px solid ${BORDER}`,
          }}>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
            {images[0]?.url && (
              <Box component="img" src={images[0].url} alt={product.name}
                sx={{ width: 44, height: 44, objectFit: "contain", borderRadius: "8px",
                  border: `0.5px solid ${BORDER}`, bgcolor: "#fff", flexShrink: 0, p: 0.4 }} />
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500, color: "text.primary",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {product.name}
              </Typography>
              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: PRIMARY, letterSpacing: "-0.02em" }}>
                ₹{product.price.toLocaleString("en-IN")}
              </Typography>
            </Box>
          </Stack>
          <Button variant="contained" size="medium"
            startIcon={addingToCart ? null : <FiShoppingCart size={15} />}
            onClick={handleAddToCart} disabled={addingToCart}
            sx={{
              bgcolor: PRIMARY,
              background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
              "&:hover": { background: `linear-gradient(135deg, ${PRIMARY_DARK} 0%, #4c0d28 100%)` },
              borderRadius: "10px", fontWeight: 600, fontSize: "0.875rem",
              flexShrink: 0, minHeight: 44, px: 2.5,
            }}>
            {addingToCart ? <DotsLoader size="sm" /> : (quantityInCart > 0 ? `Add More (${quantityInCart})` : "Add to Cart")}
          </Button>
        </Paper>
      )}

      {/* ── Image modal ─────────────────────────────────────────────────────── */}
      {showImageModal && images.length > 0 && (
        <Suspense fallback={null}>
          <ImageCarouselModal
            show={showImageModal} onHide={() => setShowImageModal(false)}
            images={images} productName={product.name} initialIndex={selectedImageIndex} />
        </Suspense>
      )}
    </>
  );
};

export default ProductDetail;
