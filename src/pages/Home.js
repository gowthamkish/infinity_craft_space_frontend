import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Header from "../components/Header";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import { useProducts } from "../hooks/useSmartFetch";
import RecentlyViewed from "../components/RecentlyViewed";
import { buildCloudinaryUrl } from "../components/OptimizedImage";
import { optimisticAddToCart } from "../features/cartSlice";
import api from "../api/axios";
import {
  FiShoppingCart,
  FiHeart,
  FiStar,
  FiTruck,
  FiRefreshCw,
  FiLock,
  FiAward,
  FiArrowRight,
  FiCheck,
  FiPackage,
  FiSmartphone,
  FiGift,
  FiZap,
} from "react-icons/fi";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

/* ─── Theme constants ──────────────────────────────────────────────────── */
const PRIMARY = "#8B1A4A";
const PRIMARY_DARK = "#6b1238";
const PRIMARY_LIGHT = "#fce7ef";
const SECONDARY = "#C9A84C";
const TEXT_MUTED = "#64748b";
const BORDER = "#f1f5f9";

/* ─── Festival data ────────────────────────────────────────────────────── */

const FESTIVALS = [
  { name: "Mother's Day",       emoji: "💐", query: "Mother",      date: new Date(2026, 4, 10) },
  { name: "Buddha Purnima",     emoji: "🙏", query: "Buddha Purnima", date: new Date(2026, 4, 23) },
  { name: "Eid al-Adha",        emoji: "🌙", query: "Eid",         date: new Date(2026, 5, 6) },
  { name: "Father's Day",       emoji: "👔", query: "Father",      date: new Date(2026, 5, 21) },
  { name: "Raksha Bandhan",     emoji: "🪢", query: "Rakhi",       date: new Date(2026, 7, 9) },
  { name: "Independence Day",   emoji: "🇮🇳", query: "Independence", date: new Date(2026, 7, 15) },
  { name: "Ganesh Chaturthi",   emoji: "🐘", query: "Ganesh",      date: new Date(2026, 8, 14) },
  { name: "Dussehra",           emoji: "🏹", query: "Dussehra",    date: new Date(2026, 9, 2) },
  { name: "Diwali",             emoji: "🪔", query: "Diwali",      date: new Date(2026, 9, 20) },
  { name: "Christmas",          emoji: "🎄", query: "Christmas",   date: new Date(2026, 11, 25) },
];

function getUpcomingFestival() {
  const now = new Date();
  const upcoming = FESTIVALS.filter((f) => f.date > now).sort((a, b) => a.date - b.date)[0];
  if (!upcoming) return null;
  const days = Math.ceil((upcoming.date - now) / (1000 * 60 * 60 * 24));
  return days <= 45 ? { ...upcoming, days } : null;
}

/* ─── Static data ──────────────────────────────────────────────────────── */

const STATS = [
  { value: 1200, suffix: "+", label: "Happy Customers",   icon: "😊" },
  { value: 500,  suffix: "+", label: "Handmade Products", icon: "🎨" },
  { value: 28000,suffix: "+", label: "Pincodes Served",   icon: "📦" },
  { value: 4.9,  suffix: "/5", label: "Avg. Rating",      icon: "⭐" },
];

const OCCASIONS = [
  { emoji: "🎂", label: "Birthday",    query: "Birthday" },
  { emoji: "💕", label: "Anniversary", query: "Anniversary" },
  { emoji: "💍", label: "Wedding",     query: "Wedding" },
  { emoji: "🪔", label: "Diwali",      query: "Diwali" },
  { emoji: "💼", label: "Corporate",   query: "Corporate" },
  { emoji: "🍼", label: "Baby Shower", query: "Baby" },
];

const TRUST_ITEMS = [
  { Icon: FiTruck,     title: "Free Shipping",   desc: "On orders above ₹999",    color: PRIMARY },
  { Icon: FiRefreshCw, title: "Easy Returns",    desc: "7-day hassle-free returns", color: "#059669" },
  { Icon: FiLock,      title: "Secure Payment",  desc: "100% encrypted checkout",  color: "#0284c7" },
  { Icon: FiAward,     title: "Handcrafted",     desc: "Made with love & care",    color: "#f59e0b" },
];

const PROCESS_STEPS = [
  { Icon: FiPackage,    step: "01", title: "Browse & Discover",    desc: "Explore 500+ unique handcrafted products across every category — from resin art to custom jewelry." },
  { Icon: FiGift,       step: "02", title: "Personalize It",        desc: "Add names, dates, or a heartfelt message. Make every gift uniquely yours." },
  { Icon: FiSmartphone, step: "03", title: "Delivered with Love",   desc: "Crafted just for you and shipped in premium packaging to your doorstep." },
];

const TESTIMONIALS = [
  { name: "Priya S.",  location: "Mumbai",    rating: 5, verified: true, text: "The resin coasters I ordered were absolutely stunning. Quality far exceeded my expectations — everyone who sees them wants one!" },
  { name: "Rahul M.", location: "Bangalore", rating: 5, verified: true, text: "Ordered a personalized gift hamper for Diwali — my entire team was in awe. The packaging alone made it feel luxurious." },
  { name: "Ananya K.",location: "Chennai",   rating: 5, verified: true, text: "Fast delivery, beautiful packaging, and the customization was exactly what I envisioned. Will be a repeat customer for sure!" },
  { name: "Meera T.", location: "Delhi",     rating: 5, verified: true, text: "Gifted an embroidery hoop to my mom for her birthday — she cried happy tears. The artistry and detail is unmatched." },
];

const FLOATING_ELEMENTS = ["🌸", "✨", "🎨", "💎", "🌿", "🎁"];

/* ─── Hooks ────────────────────────────────────────────────────────────── */

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * target).toFixed(target < 10 ? 1 : 0)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─── Sub-components ───────────────────────────────────────────────────── */

function StarRow({ count }) {
  return (
    <Stack direction="row" spacing={0.25} alignItems="center">
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar
          key={i}
          style={{
            width: 13, height: 13,
            color: i < count ? "#f59e0b" : "#e2e8f0",
            fill: i < count ? "#f59e0b" : "none",
          }}
        />
      ))}
    </Stack>
  );
}

function StatCounter({ value, suffix, label, icon, animate }) {
  const count = useCountUp(value, 2200, animate);
  return (
    <Box
      sx={{
        flex: 1, textAlign: "center", py: 3, px: 2,
        borderRight: `1px solid ${BORDER}`,
        "&:last-child": { borderRight: "none" },
        "&:hover": { bgcolor: PRIMARY_LIGHT },
        transition: "background 0.25s",
      }}
    >
      <Typography sx={{ fontSize: "1.6rem", mb: 0.5 }}>{icon}</Typography>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 900, lineHeight: 1.1, mb: 0.5, letterSpacing: "-0.03em",
          background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}
      >
        {typeof count === "number" && count < 10 ? count.toFixed(1) : count.toLocaleString()}{suffix}
      </Typography>
      <Typography variant="caption" sx={{ color: TEXT_MUTED, fontWeight: 600, letterSpacing: "0.03em" }}>
        {label}
      </Typography>
    </Box>
  );
}

function WishlistButton({ productId }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const isAuthenticated = useSelector((s) => !!s.auth.user);

  const toggle = useCallback(
    async (e) => {
      e.stopPropagation();
      if (!isAuthenticated) { window.location.href = "/login"; return; }
      setLoading(true);
      try {
        if (wishlisted) {
          await api.delete(`/api/auth/wishlist/${productId}`);
          setWishlisted(false);
        } else {
          await api.post("/api/auth/wishlist", { productId });
          setWishlisted(true);
        }
      } catch { /* silent */ } finally { setLoading(false); }
    },
    [wishlisted, productId, isAuthenticated],
  );

  return (
    <Tooltip title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}>
      <IconButton
        size="small"
        onClick={toggle}
        disabled={loading}
        sx={{
          position: "absolute", top: 8, right: 8, zIndex: 5,
          bgcolor: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)",
          border: wishlisted ? "1.5px solid #ec4899" : "1.5px solid rgba(255,255,255,0.8)",
          opacity: 0, transition: "opacity 0.2s, background 0.2s",
          ".MuiCard-root:hover &": { opacity: 1 },
          "&:hover": { bgcolor: "#fdf2f8" },
        }}
      >
        <FiHeart
          style={{
            width: 16, height: 16,
            color: wishlisted ? "#ec4899" : "#94a3b8",
            fill: wishlisted ? "#ec4899" : "none",
          }}
        />
      </IconButton>
    </Tooltip>
  );
}

function ProductCard({ product, index }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const imgSrc =
    buildCloudinaryUrl(product.images?.[0]?.url || product.image?.url || product.image, 480) ||
    "https://placehold.co/480x480?text=No+Image";

  const isLowStock   = product.trackInventory && product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
  const isOutOfStock = product.trackInventory && product.stock === 0;
  const discountPct  = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  const handleAddToCart = useCallback(
    async (e) => {
      e.stopPropagation();
      if (isOutOfStock || adding) return;
      setAdding(true);
      await dispatch(optimisticAddToCart({ product, quantity: 1 }));
      setAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    },
    [dispatch, product, isOutOfStock, adding],
  );

  return (
    <Card
      onClick={() => navigate("/products")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate("/products")}
      sx={{
        cursor: "pointer", position: "relative", border: `1.5px solid ${BORDER}`,
        borderRadius: "16px", overflow: "hidden",
        animation: `cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both`,
        animationDelay: `${index * 0.07}s`,
        transition: "transform 0.25s, box-shadow 0.25s, border-color 0.25s",
        "@keyframes cardIn": {
          from: { opacity: 0, transform: "translateY(20px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
          borderColor: "#e0d7f8",
          "& .product-hover-overlay": { opacity: 1 },
          "& .product-img": { transform: "scale(1.07)" },
        },
        boxShadow: "none",
      }}
    >
      {/* Image area */}
      <Box sx={{ position: "relative", aspectRatio: "1/1", overflow: "hidden", bgcolor: "#f8fafc" }}>
        <CardMedia
          component="img"
          image={imgSrc}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="product-img"
          sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)" }}
        />

        {/* Badges top-left */}
        <Stack direction="column" spacing={0.5} sx={{ position: "absolute", top: 8, left: 8, zIndex: 2 }}>
          {discountPct > 0 && (
            <Chip label={`${discountPct}% OFF`} size="small"
              sx={{ bgcolor: "#dc2626", color: "#fff", fontWeight: 800, fontSize: "0.6rem", height: 20 }} />
          )}
          {product.isCustomizable && (
            <Chip label="✦ Custom" size="small"
              sx={{ bgcolor: PRIMARY, color: "#fff", fontWeight: 800, fontSize: "0.6rem", height: 20 }} />
          )}
        </Stack>

        {/* Low stock badge */}
        {isLowStock && (
          <Chip
            label={`Only ${product.stock} left!`} size="small"
            sx={{
              position: "absolute", bottom: 8, left: 8, zIndex: 2,
              bgcolor: "rgba(245,158,11,0.92)", color: "#fff",
              fontWeight: 800, fontSize: "0.6rem", height: 20,
            }}
          />
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <Box sx={{
            position: "absolute", inset: 0,
            bgcolor: "rgba(255,255,255,0.75)", backdropFilter: "blur(2px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3,
          }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: TEXT_MUTED, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Sold Out
            </Typography>
          </Box>
        )}

        {/* Hover quick-add overlay */}
        <Box
          className="product-hover-overlay"
          sx={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "flex-end", justifyContent: "center", pb: 1.5,
            opacity: 0, transition: "opacity 0.25s ease", zIndex: 4,
            background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%)",
          }}
        >
          <Button
            size="small"
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            startIcon={added ? <FiCheck /> : adding ? null : <FiShoppingCart />}
            sx={{
              bgcolor: added ? "#059669" : "rgba(255,255,255,0.95)",
              color: added ? "#fff" : PRIMARY,
              fontWeight: 700, fontSize: "0.82rem",
              borderRadius: "10px", px: 2, py: 0.75,
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              transform: "translateY(6px)",
              transition: "all 0.25s",
              "&:hover": { bgcolor: added ? "#059669" : PRIMARY, color: "#fff", transform: "translateY(0)" },
              "&:disabled": { opacity: 0.6 },
              ".MuiCard-root:hover &": { transform: "translateY(0)" },
            }}
          >
            {added ? "Added!" : adding ? "Adding…" : "Add to Cart"}
          </Button>
        </Box>

        <WishlistButton productId={product._id} />
      </Box>

      {/* Info */}
      <CardContent sx={{ p: "1rem 1rem 0.5rem" }}>
        {product.averageRating > 0 && (
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
            <StarRow count={Math.round(product.averageRating)} />
            <Typography variant="caption" sx={{ color: TEXT_MUTED }}>
              ({product.ratingCount || 0})
            </Typography>
          </Stack>
        )}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700, color: "#0f172a", mb: 0.5, lineHeight: 1.35,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {product.name}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Typography sx={{ fontWeight: 800, color: SECONDARY, fontSize: "1.05rem" }}>
            ₹{product.price?.toLocaleString()}
          </Typography>
          {product.originalPrice > product.price && (
            <Typography variant="caption" sx={{ color: TEXT_MUTED, textDecoration: "line-through" }}>
              ₹{product.originalPrice?.toLocaleString()}
            </Typography>
          )}
        </Stack>
        {product.isCustomizable && (
          <Chip label="✦ Personalizable" size="small"
            sx={{ mt: 0.5, bgcolor: PRIMARY_LIGHT, color: PRIMARY, fontWeight: 700, fontSize: "0.65rem", height: 18 }} />
        )}
      </CardContent>
      <CardActions sx={{ p: "0 1rem 1rem", pt: 0 }} />
    </Card>
  );
}

function ProductSkeleton() {
  return (
    <Card sx={{ borderRadius: "16px", border: `1.5px solid ${BORDER}`, boxShadow: "none" }}>
      <Skeleton variant="rectangular" sx={{ aspectRatio: "1/1", width: "100%" }} />
      <CardContent>
        <Skeleton variant="text" width="60%" sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="40%" />
      </CardContent>
    </Card>
  );
}

function PopularSection({ navigate }) {
  const [popularProducts, setPopularProducts] = useState([]);
  useEffect(() => {
    api.get("/api/products/popular/list")
      .then((res) => { setPopularProducts((res.data.products || res.data || []).slice(0, 4)); })
      .catch(() => {});
  }, []);

  if (!popularProducts.length) return null;

  return (
    <Box sx={{ bgcolor: "#fafaf9", py: 8 }}>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="overline" sx={{ color: PRIMARY, fontWeight: 700, letterSpacing: "0.1em" }}>
              Flying off the shelves
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.02em", color: "#0f172a" }}>
              🔥 Currently Popular
            </Typography>
          </Box>
          <Button
            endIcon={<FiArrowRight />}
            onClick={() => navigate("/products")}
            sx={{ color: PRIMARY, fontWeight: 700, "&:hover": { bgcolor: PRIMARY_LIGHT } }}
          >
            View all
          </Button>
        </Stack>
        <Grid container spacing={2}>
          {popularProducts.map((product, i) => (
            <Grid key={product._id} size={{ xs: 6, sm: 4, md: 3 }}>
              <Box sx={{ position: "relative" }}>
                {product.ratingCount > 0 && (
                  <Chip
                    label={`🔥 ${product.ratingCount}+ bought this`}
                    size="small"
                    sx={{
                      position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                      zIndex: 10, bgcolor: "linear-gradient(135deg,#ef4444,#f97316)",
                      background: "linear-gradient(135deg,#ef4444,#f97316)",
                      color: "#fff", fontWeight: 800, fontSize: "0.6rem",
                      boxShadow: "0 2px 8px rgba(239,68,68,0.35)",
                    }}
                  />
                )}
                <ProductCard product={product} index={i} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────── */

export default function Home() {
  const navigate = useNavigate();
  const { data: products = [], loading } = useProducts();
  const user = useSelector((state) => state.auth.user);

  const [statsRef, statsInView] = useInView(0.3);
  const [emailValue, setEmailValue] = useState("");

  const categories = useMemo(() => {
    if (!products.length) return [];
    const catMap = new Map();
    products.forEach((p) => {
      if (p.category && !catMap.has(p.category)) {
        const imgSrc = p.images?.[0]?.url || p.image?.url || p.image;
        const count = products.filter((x) => x.category === p.category).length;
        catMap.set(p.category, { name: p.category, img: imgSrc, count });
      }
    });
    return [...catMap.values()].slice(0, 6);
  }, [products]);

  const bestsellers = useMemo(
    () =>
      [...products]
        .filter((p) => p.averageRating > 0 && p.stock !== 0)
        .sort((a, b) => b.averageRating - a.averageRating || b.ratingCount - a.ratingCount)
        .slice(0, 8),
    [products],
  );

  const featured = bestsellers.length ? bestsellers : products.slice(0, 8);
  const festival = getUpcomingFestival();

  /* ── Keyframe styles injected once ── */
  const floatKeyframes = `
    @keyframes hpFloat {
      0%,100% { transform: translateY(0) rotate(0deg); }
      33%      { transform: translateY(-14px) rotate(5deg); }
      66%      { transform: translateY(-6px) rotate(-3deg); }
    }
    @keyframes hpPulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(139,26,74,0.4); }
      50%      { box-shadow: 0 0 0 6px rgba(139,26,74,0); }
    }
    @keyframes hpScrollLeft {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    @keyframes hpBlobMorph {
      0%   { border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%; }
      25%  { border-radius: 40% 60% 30% 70% / 60% 40% 60% 40%; }
      50%  { border-radius: 50% 50% 60% 40% / 40% 70% 30% 60%; }
      75%  { border-radius: 70% 30% 50% 50% / 30% 50% 70% 50%; }
      100% { border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%; }
    }
    @keyframes hpBlobRotate {
      from { transform: translate(-50%,-50%) rotate(0deg); }
      to   { transform: translate(-50%,-50%) rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{floatKeyframes}</style>
      <SEOHead
        title={`${SEO_CONFIG.SITE_NAME} — Handcrafted Gifts & Custom Products`}
        description="Discover premium handcrafted products at InfinityCraftSpace. Custom resin art, personalized gifts, craft supplies and more — delivered across India."
        url={SEO_CONFIG.SITE_URL}
        canonical={SEO_CONFIG.SITE_URL}
      />
      <Box className="App">
        <Header />

        {/* ══ FESTIVAL BANNER ══════════════════════════════════════════ */}
        {festival && (
          <Box
            role="banner"
            sx={{
              display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap",
              background: "linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%)",
              borderTop: "3px solid #f59e0b", borderBottom: "1px solid #fde68a",
              px: 3, py: 1,
            }}
          >
            <Typography sx={{ fontSize: "1.4rem", flexShrink: 0 }}>{festival.emoji}</Typography>
            <Typography variant="body2" sx={{ flex: 1, minWidth: 200, color: "#78350f", lineHeight: 1.4 }}>
              <strong>
                {festival.days === 1 ? "Tomorrow is" : festival.days <= 7 ? `${festival.days} days to` : "Coming up —"}{" "}
                {festival.name}
              </strong>
              {" · "}Find the perfect handcrafted gift
            </Typography>
            <Button
              size="small"
              endIcon={<FiArrowRight size={13} />}
              onClick={() => navigate(`/products?q=${encodeURIComponent(festival.query)}`)}
              sx={{
                bgcolor: "#f59e0b", color: "#fff", fontWeight: 700, fontSize: "0.82rem",
                borderRadius: "8px", flexShrink: 0,
                "&:hover": { bgcolor: "#d97706" },
              }}
            >
              Shop Gifts
            </Button>
          </Box>
        )}

        <Box component="main" sx={{ bgcolor: "#fafaf9", minHeight: "100vh", overflowX: "hidden" }}>

          {/* ══ HERO ══════════════════════════════════════════════════════ */}
          <Box
            component="section"
            aria-label="Hero"
            sx={{
              position: "relative",
              background: "linear-gradient(150deg,#2D0B1F 0%,#4A1030 40%,#6b1238 70%,#4A1030 100%)",
              pt: { xs: 7, md: 10 }, pb: { xs: 5, md: 8 },
              px: { xs: 2, md: 3 }, overflow: "hidden",
            }}
          >
            {/* Floating decorative elements */}
            <Box aria-hidden="true" sx={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
              {FLOATING_ELEMENTS.map((el, i) => (
                <Box
                  key={i}
                  component="span"
                  sx={{
                    position: "absolute", fontSize: "1.8rem", opacity: 0.25, filter: "blur(0.3px)",
                    animation: `hpFloat linear infinite`,
                    animationDuration: `${5.5 + i * 0.8}s`,
                    animationDelay: `${i * 0.6}s`,
                    ...[
                      { top: "8%",  left: "6%"  },
                      { top: "15%", right: "8%" },
                      { top: "55%", left: "3%"  },
                      { top: "70%", right: "5%" },
                      { top: "35%", left: "48%" },
                      { top: "80%", left: "25%" },
                    ][i],
                  }}
                >
                  {el}
                </Box>
              ))}
            </Box>

            <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
              <Grid container spacing={6} alignItems="center">
                {/* Left — Content */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both",
                      "@keyframes fadeUp": {
                        from: { opacity: 0, transform: "translateY(28px)" },
                        to:   { opacity: 1, transform: "translateY(0)" },
                      },
                    }}
                  >
                    {/* Eyebrow pill */}
                    <Chip
                      label="✦ Handmade with Love in India"
                      sx={{
                        mb: 3,
                        bgcolor: "rgba(201,168,76,0.15)",
                        color: "#C9A84C",
                        fontWeight: 800, fontSize: "0.75rem",
                        letterSpacing: "0.08em", textTransform: "uppercase",
                        border: "1px solid rgba(201,168,76,0.35)",
                        "& .MuiChip-label": { px: 1.5 },
                      }}
                    />

                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: { xs: "2.4rem", md: "3.6rem" },
                        fontWeight: 900, lineHeight: 1.08, mb: 2.5, letterSpacing: "-0.03em",
                        color: "#fff",
                      }}
                    >
                      Gifts that carry
                      <br />
                      <Box
                        component="span"
                        sx={{
                          background: "linear-gradient(135deg,#C9A84C,#F4A7B9)",
                          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                        }}
                      >
                        a lifetime
                      </Box>{" "}
                      of
                      <br />
                      memories
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, mb: 4, maxWidth: 480, fontSize: "1.05rem" }}
                    >
                      Personalized resin art, custom jewelry, embroidery hoops & thoughtful gifting hampers
                      — each piece crafted by hand, delivered with care.
                    </Typography>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 4 }}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<FiGift />}
                        onClick={() => navigate("/products")}
                        sx={{
                          bgcolor: PRIMARY, fontWeight: 700, px: 4, py: 1.5, borderRadius: "12px",
                          boxShadow: `0 4px 20px rgba(139,26,74,0.4)`,
                          "&:hover": { bgcolor: PRIMARY_DARK, transform: "translateY(-2px)", boxShadow: `0 8px 28px rgba(139,26,74,0.5)` },
                          transition: "all 0.25s",
                        }}
                      >
                        Explore Collection
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        endIcon={<FiArrowRight />}
                        onClick={() => navigate("/products?customizable=true")}
                        sx={{
                          color: "#fff", borderColor: "rgba(255,255,255,0.4)", fontWeight: 700, px: 4, py: 1.5, borderRadius: "12px",
                          "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)", transform: "translateY(-2px)" },
                          transition: "all 0.25s",
                        }}
                      >
                        Browse Categories
                      </Button>
                    </Stack>

                    {/* Social proof */}
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Stack direction="row">
                        {["P","R","A","K","M"].map((l, i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 36, height: 36, borderRadius: "50%",
                              background: `linear-gradient(135deg,#8B1A4A,#C9A84C)`,
                              color: "#fff", fontSize: "0.72rem", fontWeight: 800,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              border: "2.5px solid rgba(255,255,255,0.2)",
                              ml: i === 0 ? 0 : "-10px",
                              boxShadow: "0 2px 8px rgba(139,26,74,0.3)",
                            }}
                          >
                            {l}
                          </Box>
                        ))}
                      </Stack>
                      <Box>
                        <Stack direction="row" spacing={0.25} sx={{ mb: 0.25 }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FiStar key={i} style={{ width: 13, height: 13, color: "#f59e0b", fill: "#f59e0b" }} />
                          ))}
                        </Stack>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                          <strong style={{ color: "rgba(255,255,255,0.9)" }}>1,200+ happy customers</strong> across India
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>

                {/* Right — Visual blob */}
                <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", justifyContent: "center" }}>
                  <Box sx={{ position: "relative", width: 320, height: 320 }}>
                    {/* Blob */}
                    <Box
                      sx={{
                        width: "100%", height: "100%",
                        borderRadius: "60% 40% 70% 30% / 50% 60% 40% 50%",
                        background: "linear-gradient(135deg,rgba(139,26,74,0.3),rgba(201,168,76,0.2))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        animation: "hpBlobMorph 10s ease-in-out infinite alternate",
                        overflow: "hidden",
                      }}
                    >
                      {featured[0] ? (
                        <Box
                          component="img"
                          src={buildCloudinaryUrl(featured[0].images?.[0]?.url || featured[0].image?.url || featured[0].image, 480)}
                          alt={featured[0]?.name}
                          loading="eager"
                          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <Typography sx={{ fontSize: "7rem" }}>🎁</Typography>
                      )}
                    </Box>

                    {/* Dashed rings */}
                    {[{ size: 360, dur: "20s", dir: "normal", color: "rgba(201,168,76,0.2)" },
                      { size: 420, dur: "30s", dir: "reverse", color: "rgba(244,167,185,0.15)" }].map((r, i) => (
                      <Box key={i} sx={{
                        position: "absolute", borderRadius: "50%",
                        border: `2px dashed ${r.color}`,
                        width: r.size, height: r.size,
                        top: "50%", left: "50%",
                        animation: `hpBlobRotate ${r.dur} linear infinite`,
                        animationDirection: r.dir,
                      }} />
                    ))}

                    {/* Mini thumbnails */}
                    {featured[1] && (
                      <Box sx={{
                        position: "absolute", top: "2%", left: -10,
                        width: 72, height: 72, borderRadius: "10px", overflow: "hidden",
                        border: "3px solid rgba(255,255,255,0.3)", boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                        animation: "hpFloat 5.5s ease-in-out infinite", animationDelay: "0.5s",
                      }}>
                        <Box component="img" src={buildCloudinaryUrl(featured[1].images?.[0]?.url || featured[1].image?.url || featured[1].image, 160)}
                          alt={featured[1]?.name} loading="eager"
                          sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </Box>
                    )}
                    {featured[2] && (
                      <Box sx={{
                        position: "absolute", bottom: "5%", right: -10,
                        width: 72, height: 72, borderRadius: "10px", overflow: "hidden",
                        border: "3px solid rgba(255,255,255,0.3)", boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                        animation: "hpFloat 6.5s ease-in-out infinite", animationDelay: "1.2s",
                      }}>
                        <Box component="img" src={buildCloudinaryUrl(featured[2].images?.[0]?.url || featured[2].image?.url || featured[2].image, 160)}
                          alt={featured[2]?.name} loading="eager"
                          sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </Box>
                    )}

                    {/* Floating stat cards */}
                    {[
                      { top: "5%", right: -20, emoji: "⭐", val: "4.9/5",    lbl: "Average Rating",     dur: "5s", delay: "0.5s" },
                      { bottom: "8%", left: -20, emoji: "🚀", val: "2–5 Days", lbl: "Pan-India Delivery", dur: "6s", delay: "1.5s" },
                    ].map((card, i) => (
                      <Box key={i} aria-hidden="true"
                        sx={{
                          position: "absolute", ...card,
                          display: "flex", alignItems: "center", gap: 1,
                          bgcolor: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255,255,255,0.2)", borderRadius: "16px",
                          px: 1.5, py: 1, boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                          animation: `hpFloat ${card.dur} ease-in-out infinite`, animationDelay: card.delay,
                        }}
                      >
                        <Typography sx={{ fontSize: "1.4rem" }}>{card.emoji}</Typography>
                        <Box>
                          <Typography sx={{ fontSize: "0.9rem", fontWeight: 800, color: "#fff" }}>{card.val}</Typography>
                          <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.7)" }}>{card.lbl}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Container>

            {/* Stats row */}
            <Container maxWidth="lg" sx={{ mt: 6, position: "relative", zIndex: 1 }}>
              <Box
                ref={statsRef}
                sx={{
                  display: "flex", flexWrap: "wrap",
                  borderRadius: "24px",
                  bgcolor: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                  overflow: "hidden",
                }}
              >
                {STATS.map((stat) => (
                  <StatCounter key={stat.label} {...stat} animate={statsInView} />
                ))}
              </Box>
            </Container>
          </Box>

          {/* ══ TRUST STRIP ═══════════════════════════════════════════════ */}
          <Box component="section" aria-label="Why shop with us"
            sx={{ bgcolor: "#fff", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}
          >
            <Grid container sx={{ maxWidth: 1240, mx: "auto" }}>
              {TRUST_ITEMS.map(({ Icon, title, desc, color }, i) => (
                <Grid key={title} size={{ xs: 6, md: 3 }}>
                  <Stack
                    direction="row" alignItems="center" spacing={1.5}
                    sx={{
                      p: { xs: 2, md: 2.5 },
                      borderRight: { xs: i % 2 === 0 ? `1px solid ${BORDER}` : "none", md: i < 3 ? `1px solid ${BORDER}` : "none" },
                      borderBottom: { xs: i < 2 ? `1px solid ${BORDER}` : "none", md: "none" },
                      transition: "background 0.25s",
                      "&:hover": { bgcolor: "#fafaf9" },
                      "&:hover .trust-icon": { transform: "scale(1.1)" },
                    }}
                  >
                    <Box
                      className="trust-icon"
                      sx={{
                        width: 44, height: 44, borderRadius: "10px", flexShrink: 0,
                        bgcolor: `${color}1f`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "transform 0.25s",
                      }}
                    >
                      <Icon style={{ width: 20, height: 20, color }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a", mb: 0.15 }}>{title}</Typography>
                      <Typography variant="caption" sx={{ color: TEXT_MUTED }}>{desc}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* ══ OCCASIONS ═════════════════════════════════════════════════ */}
          <Box component="section" sx={{ py: 8 }}>
            <Container maxWidth="lg">
              <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mb: 4 }}>
                <Box>
                  <Typography variant="overline" sx={{ color: PRIMARY, fontWeight: 700, letterSpacing: "0.1em" }}>
                    Find the perfect gift
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.02em", color: "#0f172a" }}>
                    Shop by Occasion
                  </Typography>
                </Box>
                <Button endIcon={<FiArrowRight />} onClick={() => navigate("/products")}
                  sx={{ color: PRIMARY, fontWeight: 700, "&:hover": { bgcolor: PRIMARY_LIGHT } }}>
                  View all
                </Button>
              </Stack>
              <Grid container spacing={1.5}>
                {OCCASIONS.map((occ, i) => (
                  <Grid key={occ.label} size={{ xs: 4, sm: 2 }}>
                    <Box
                      component="button"
                      onClick={() => navigate(`/products?q=${encodeURIComponent(occ.query)}`)}
                      aria-label={`Shop ${occ.label} gifts`}
                      sx={{
                        width: "100%", display: "flex", flexDirection: "column",
                        alignItems: "center", gap: 1, py: 2.5, px: 1,
                        bgcolor: "#fff", border: `1.5px solid ${BORDER}`, borderRadius: "16px",
                        cursor: "pointer", transition: "all 0.25s",
                        animation: "cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both",
                        animationDelay: `${i * 0.08}s`,
                        "@keyframes cardIn": { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
                        "&:hover": {
                          borderColor: PRIMARY, bgcolor: PRIMARY_LIGHT,
                          transform: "translateY(-5px)", boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                          "& .occ-label": { color: PRIMARY },
                        },
                      }}
                    >
                      <Typography sx={{ fontSize: "2.2rem", lineHeight: 1 }}>{occ.emoji}</Typography>
                      <Typography className="occ-label" variant="caption"
                        sx={{ fontWeight: 700, color: "#0f172a", textAlign: "center", transition: "color 0.2s" }}>
                        {occ.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          {/* ══ CATEGORIES ════════════════════════════════════════════════ */}
          {categories.length > 0 && (
            <Box component="section" sx={{ py: 8, bgcolor: "#fff" }}>
              <Container maxWidth="lg">
                <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mb: 4 }}>
                  <Box>
                    <Typography variant="overline" sx={{ color: PRIMARY, fontWeight: 700, letterSpacing: "0.1em" }}>
                      Explore our collections
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.02em", color: "#0f172a" }}>
                      Shop by Category
                    </Typography>
                  </Box>
                  <Button endIcon={<FiArrowRight />} onClick={() => navigate("/products")}
                    sx={{ color: PRIMARY, fontWeight: 700, "&:hover": { bgcolor: PRIMARY_LIGHT } }}>
                    See all
                  </Button>
                </Stack>
                <Grid container spacing={1.5}>
                  {categories.map((cat, i) => (
                    <Grid key={cat.name} size={{ xs: i === 0 ? 12 : 6, sm: i === 0 ? 8 : 4, md: i === 0 ? 8 : 4 }}>
                      <Box
                        component="button"
                        onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                        aria-label={`Browse ${cat.name}`}
                        sx={{
                          position: "relative", width: "100%", border: "none", cursor: "pointer",
                          borderRadius: "24px", overflow: "hidden",
                          aspectRatio: i === 0 ? "16/9" : "4/3",
                          p: 0, display: "block",
                          transition: "transform 0.25s, box-shadow 0.25s",
                          "&:hover": {
                            transform: "scale(1.02)", boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
                            "& .cat-img": { transform: "scale(1.08)" },
                            "& .cat-overlay": { background: "linear-gradient(to top, rgba(124,58,237,0.85) 0%, rgba(15,23,42,0.2) 60%, transparent 100%)" },
                            "& .cat-cta": { color: "#fff", gap: "0.5rem" },
                          },
                        }}
                      >
                        <Box sx={{ position: "relative", width: "100%", height: "100%", bgcolor: "#e2e8f0" }}>
                          {cat.img ? (
                            <Box
                              component="img"
                              className="cat-img"
                              src={buildCloudinaryUrl(cat.img, 600) || cat.img}
                              alt={cat.name}
                              loading="lazy" decoding="async"
                              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)" }}
                            />
                          ) : (
                            <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem" }}>🎁</Box>
                          )}
                          <Box
                            className="cat-overlay"
                            sx={{
                              position: "absolute", inset: 0, transition: "background 0.25s",
                              background: "linear-gradient(to top,rgba(15,23,42,0.75) 0%,rgba(15,23,42,0.2) 50%,transparent 100%)",
                            }}
                          />
                          <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: 2.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1rem", textTransform: "capitalize", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>
                              {cat.name}
                            </Typography>
                            <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.78rem" }}>{cat.count} products</Typography>
                            <Stack direction="row" alignItems="center" className="cat-cta" spacing={0.5}
                              sx={{ color: "transparent", fontSize: "0.8rem", fontWeight: 700, transition: "all 0.25s" }}>
                              <span>Explore</span><FiArrowRight size={13} />
                            </Stack>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Container>
            </Box>
          )}

          {/* ══ CURRENTLY POPULAR ════════════════════════════════════════ */}
          <PopularSection navigate={navigate} />

          {/* ══ BESTSELLERS / FEATURED PRODUCTS ══════════════════════════ */}
          <Box component="section" sx={{ py: 8 }}>
            <Container maxWidth="lg">
              <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mb: 4 }}>
                <Box>
                  <Typography variant="overline" sx={{ color: PRIMARY, fontWeight: 700, letterSpacing: "0.1em" }}>
                    {bestsellers.length ? "Customer favourites" : "Handpicked for you"}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.02em", color: "#0f172a" }}>
                    {bestsellers.length ? "⭐ Bestsellers" : "Featured Products"}
                  </Typography>
                </Box>
                <Button endIcon={<FiArrowRight />} onClick={() => navigate("/products")}
                  sx={{ color: PRIMARY, fontWeight: 700, "&:hover": { bgcolor: PRIMARY_LIGHT } }}>
                  View all
                </Button>
              </Stack>

              <Grid container spacing={2}>
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
                        <ProductSkeleton />
                      </Grid>
                    ))
                  : featured.length === 0
                  ? (
                      <Grid size={12}>
                        <Box sx={{ textAlign: "center", py: 8 }}>
                          <Typography sx={{ fontSize: "3rem", mb: 2 }}>🎨</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}>No products yet</Typography>
                          <Typography sx={{ color: TEXT_MUTED }}>Check back soon for handcrafted treasures!</Typography>
                        </Box>
                      </Grid>
                    )
                  : featured.map((product, i) => (
                      <Grid key={product._id} size={{ xs: 6, sm: 4, md: 3 }}>
                        <ProductCard product={product} index={i} />
                      </Grid>
                    ))
                }
              </Grid>

              {!loading && featured.length > 0 && (
                <Box sx={{ textAlign: "center", mt: 5 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    endIcon={<FiArrowRight />}
                    onClick={() => navigate("/products")}
                    sx={{
                      borderColor: "#d1d5db", color: "#0f172a", fontWeight: 700, px: 4, py: 1.5, borderRadius: "12px",
                      "&:hover": { borderColor: PRIMARY, color: PRIMARY, bgcolor: PRIMARY_LIGHT, transform: "translateY(-2px)" },
                      transition: "all 0.25s",
                    }}
                  >
                    Browse All Products
                  </Button>
                </Box>
              )}
            </Container>
          </Box>

          {/* ══ STORYTELLING ══════════════════════════════════════════════ */}
          <Box component="section" sx={{ background: "linear-gradient(135deg,#fdf4ff 0%,#fff 60%)", py: { xs: 7, md: 10 }, px: 2 }}>
            <Container maxWidth="lg">
              <Grid container spacing={8} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
                    <Box
                      sx={{
                        width: 280, height: 280,
                        borderRadius: "40% 60% 70% 30% / 60% 40% 60% 40%",
                        background: "linear-gradient(135deg,rgba(139,26,74,0.12),rgba(245,158,11,0.18))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        animation: "hpBlobMorph 12s ease-in-out infinite alternate",
                      }}
                    >
                      <Typography sx={{ fontSize: "7rem", animation: "hpFloat 5s ease-in-out infinite" }}>🖌️</Typography>
                    </Box>
                    <Chip
                      icon={<FiCheck style={{ color: SECONDARY }} />}
                      label="100% Handcrafted"
                      sx={{
                        position: "absolute", bottom: "10%", right: "5%",
                        bgcolor: "#fff", border: `1.5px solid #e0d7f8`, color: PRIMARY,
                        fontWeight: 700, fontSize: "0.82rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                      }}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="overline" sx={{ color: PRIMARY, fontWeight: 700, letterSpacing: "0.1em" }}>Our Story</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.02em", color: "#0f172a", mt: 0.5, mb: 2, lineHeight: 1.2 }}>
                    Crafted with Love,<br />Made to Last Forever
                  </Typography>
                  <Typography sx={{ color: TEXT_MUTED, lineHeight: 1.75, mb: 2 }}>
                    Every product at InfinityCraftSpace begins as an idea — then becomes something you can hold, feel, and treasure.
                    Our artisans pour hours of skill and heart into each piece, ensuring it carries emotions that mass-produced items never can.
                  </Typography>
                  <Typography sx={{ color: TEXT_MUTED, lineHeight: 1.75, mb: 3 }}>
                    From a personalized resin coaster for your best friend's kitchen, to a hand-embroidered hoop commemorating your wedding
                    date — we believe gifts should tell stories, not just fill boxes.
                  </Typography>
                  <Stack spacing={1.5} sx={{ mb: 4 }}>
                    {[
                      { icon: "🌿", text: "Sustainably sourced materials" },
                      { icon: "✋", text: "Every piece individually handcrafted" },
                      { icon: "📦", text: "Premium gifting-ready packaging" },
                    ].map((p) => (
                      <Stack key={p.text} direction="row" alignItems="center" spacing={1.5}>
                        <Typography sx={{ fontSize: "1.2rem" }}>{p.icon}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>{p.text}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Button
                    variant="contained"
                    endIcon={<FiArrowRight />}
                    onClick={() => navigate("/products")}
                    sx={{
                      bgcolor: PRIMARY, fontWeight: 700, px: 4, py: 1.5, borderRadius: "12px",
                      boxShadow: `0 4px 16px rgba(139,26,74,0.3)`,
                      "&:hover": { bgcolor: PRIMARY_DARK, transform: "translateY(-2px)" },
                      transition: "all 0.25s",
                    }}
                  >
                    Discover Our Craft
                  </Button>
                </Grid>
              </Grid>
            </Container>
          </Box>

          {/* ══ HOW IT WORKS ══════════════════════════════════════════════ */}
          <Box component="section" sx={{ bgcolor: "#fff", py: { xs: 7, md: 10 }, px: 2 }}>
            <Container maxWidth="lg">
              <Box sx={{ textAlign: "center", mb: 6 }}>
                <Typography variant="overline" sx={{ color: PRIMARY, fontWeight: 700, letterSpacing: "0.1em" }}>
                  Simple & joyful
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.02em", color: "#0f172a" }}>
                  How It Works
                </Typography>
              </Box>
              <Grid container spacing={3}>
                {PROCESS_STEPS.map(({ Icon, step, title, desc }, i) => (
                  <Grid key={step} size={{ xs: 12, md: 4 }}>
                    <Card
                      sx={{
                        position: "relative", textAlign: "center", p: 4,
                        border: `1.5px solid ${BORDER}`, borderRadius: "24px", boxShadow: "none",
                        bgcolor: "#fafaf9", transition: "all 0.25s",
                        "&:hover": {
                          borderColor: "#c4b5fd", bgcolor: PRIMARY_LIGHT,
                          transform: "translateY(-6px)", boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                          "& .process-icon": { transform: "scale(1.12) rotate(-5deg)" },
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          position: "absolute", top: -1, right: 20,
                          fontSize: "4rem", fontWeight: 900, color: "rgba(124,58,237,0.07)",
                          lineHeight: 1, pointerEvents: "none", letterSpacing: "-0.05em",
                        }}
                      >
                        {step}
                      </Typography>
                      <Box
                        className="process-icon"
                        sx={{
                          width: 60, height: 60, borderRadius: "16px",
                          background: `linear-gradient(135deg,${PRIMARY},#8b5cf6)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          mx: "auto", mb: 2, boxShadow: `0 4px 16px rgba(139,26,74,0.3)`,
                          transition: "transform 0.25s",
                        }}
                      >
                        <Icon style={{ width: 26, height: 26, color: "#fff" }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>{title}</Typography>
                      <Typography variant="body2" sx={{ color: TEXT_MUTED, lineHeight: 1.65 }}>{desc}</Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          {/* ══ PERSONALIZATION BANNER ════════════════════════════════════ */}
          <Box
            component="section"
            sx={{
              background: `linear-gradient(135deg,${PRIMARY_DARK} 0%,#6b1238 45%,${PRIMARY} 100%)`,
              py: { xs: 8, md: 12 }, px: 2, textAlign: "center", position: "relative", overflow: "hidden",
            }}
          >
            {/* Decorative floats */}
            <Box aria-hidden="true" sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              {["💍","🎨","🌹","✨","🎁","💕"].map((e, i) => (
                <Box key={i} component="span"
                  sx={{
                    position: "absolute", fontSize: "2rem", opacity: 0.18,
                    animation: "hpFloat ease-in-out infinite",
                    animationDuration: `${5 + i}s`, animationDelay: `${i * 0.5}s`,
                    ...[
                      { top: "10%", left: "5%"   },
                      { top: "20%", right: "8%"  },
                      { top: "60%", left: "8%"   },
                      { top: "70%", right: "6%"  },
                      { top: "40%", left: "3%"   },
                      { top: "80%", right: "15%" },
                    ][i],
                  }}
                >
                  {e}
                </Box>
              ))}
            </Box>
            <Box sx={{ maxWidth: 680, mx: "auto", position: "relative", zIndex: 1 }}>
              <Chip
                label="✦ Made Just for You"
                sx={{
                  mb: 3, bgcolor: "rgba(255,255,255,0.18)", color: "#fff",
                  fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.1em",
                  textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.3)",
                }}
              />
              <Typography
                variant="h3"
                sx={{ fontWeight: 900, color: "#fff", mb: 2, lineHeight: 1.15, letterSpacing: "-0.02em",
                  fontSize: { xs: "1.8rem", md: "2.6rem" } }}
              >
                Want something truly<br />one-of-a-kind?
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.65, mb: 3, fontSize: "1.05rem" }}>
                Add names, dates, photos, or a heartfelt message. Perfect for birthdays, anniversaries, weddings & corporate gifting.
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center" sx={{ mb: 5 }}>
                {["Wedding","Birthday","Anniversary","Corporate","Baby Shower"].map((occ) => (
                  <Chip key={occ} label={occ}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)",
                      fontWeight: 600, border: "1px solid rgba(255,255,255,0.25)",
                    }}
                  />
                ))}
              </Stack>
              <Button
                variant="contained"
                size="large"
                startIcon={<FiGift />}
                onClick={() => navigate("/products?customizable=true")}
                sx={{
                  bgcolor: "#fff", color: PRIMARY, fontWeight: 700, px: 4, py: 1.5, borderRadius: "12px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                  "&:hover": { bgcolor: "#f5f3ff", transform: "translateY(-2px)", boxShadow: "0 8px 28px rgba(0,0,0,0.2)" },
                  transition: "all 0.25s",
                }}
              >
                Shop Personalized Gifts
              </Button>
            </Box>
          </Box>

          {/* ══ TESTIMONIALS ══════════════════════════════════════════════ */}
          <Box component="section" sx={{ py: 8, overflow: "hidden" }}>
            <Container maxWidth="lg">
              <Box sx={{ textAlign: "center", mb: 5 }}>
                <Typography variant="overline" sx={{ color: PRIMARY, fontWeight: 700, letterSpacing: "0.1em" }}>
                  Real stories, real love
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.02em", color: "#0f172a" }}>
                  What Our Customers Say
                </Typography>
              </Box>
            </Container>
            {/* Scrolling track */}
            <Box
              aria-label="Customer reviews"
              sx={{
                overflow: "hidden",
                maskImage: "linear-gradient(to right,transparent 0%,black 8%,black 92%,transparent 100%)",
                WebkitMaskImage: "linear-gradient(to right,transparent 0%,black 8%,black 92%,transparent 100%)",
                "&:hover .testimonials-track": { animationPlayState: "paused" },
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                className="testimonials-track"
                sx={{
                  width: "max-content",
                  animation: "hpScrollLeft 30s linear infinite",
                  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
                }}
              >
                {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                  <Card
                    key={`${t.name}-${i}`}
                    sx={{
                      width: 300, flexShrink: 0, borderRadius: "16px",
                      border: `1.5px solid ${BORDER}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                      p: 2.5, display: "flex", flexDirection: "column", gap: 1.5,
                      transition: "all 0.25s",
                      "&:hover": { transform: "translateY(-4px)", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", borderColor: "#e0d7f8" },
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={0.5}>
                      <StarRow count={t.rating} />
                      {t.verified && (
                        <Chip
                          icon={<FiCheck style={{ width: 10, height: 10 }} />}
                          label="Verified Purchase"
                          size="small"
                          sx={{ bgcolor: "#f0fdf4", color: SECONDARY, border: "1px solid #bbf7d0", fontWeight: 700, fontSize: "0.62rem", height: 20 }}
                        />
                      )}
                    </Stack>
                    <Typography variant="body2" sx={{ color: TEXT_MUTED, lineHeight: 1.7, fontStyle: "italic", flex: 1 }}>
                      "{t.text}"
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <Box sx={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: `linear-gradient(135deg,${PRIMARY},#8b5cf6)`,
                        color: "#fff", fontWeight: 800, fontSize: "0.9rem",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        {t.name[0]}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: "#0f172a" }}>{t.name}</Typography>
                        <Typography variant="caption" sx={{ color: TEXT_MUTED }}>📍 {t.location}</Typography>
                      </Box>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Box>
          </Box>

          {/* ══ RECENTLY VIEWED ═══════════════════════════════════════════ */}
          <Box sx={{ py: 4 }}>
            <RecentlyViewed />
          </Box>

          {/* ══ NEWSLETTER ════════════════════════════════════════════════ */}
          <Box
            component="section"
            sx={{
              background: "linear-gradient(135deg,#fef9ec 0%,#fdf4ff 100%)",
              borderTop: `1px solid ${BORDER}`, py: { xs: 8, md: 10 }, px: 2,
            }}
          >
            <Box sx={{ maxWidth: 560, mx: "auto", textAlign: "center" }}>
              <Typography sx={{ fontSize: "3rem", mb: 1.5 }}>🎁</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.02em", color: "#0f172a", mb: 1.5 }}>
                Get ₹100 off your first order
              </Typography>
              <Typography sx={{ color: TEXT_MUTED, lineHeight: 1.65, mb: 4 }}>
                Join 1,200+ craft lovers. Early access to new collections, exclusive deals & handcrafted
                inspiration — straight to your inbox.
              </Typography>
              <Box
                component="form"
                onSubmit={(e) => { e.preventDefault(); navigate("/products"); }}
                sx={{ display: "flex", gap: 1, mb: 1.5, flexDirection: { xs: "column", sm: "row" } }}
              >
                <TextField
                  type="email"
                  placeholder="Enter your email address"
                  aria-label="Email address"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px", bgcolor: "#fff",
                      "& fieldset": { borderColor: "#e2e8f0" },
                      "&:hover fieldset": { borderColor: PRIMARY },
                      "&.Mui-focused fieldset": { borderColor: PRIMARY },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<FiZap />}
                  sx={{
                    bgcolor: PRIMARY, fontWeight: 700, px: 3, borderRadius: "10px", whiteSpace: "nowrap",
                    boxShadow: `0 4px 16px rgba(139,26,74,0.3)`,
                    "&:hover": { bgcolor: PRIMARY_DARK, transform: "translateY(-1px)" },
                    transition: "all 0.25s",
                  }}
                >
                  Claim ₹100 Off
                </Button>
              </Box>
              <Typography variant="caption" sx={{ color: TEXT_MUTED }}>
                No spam, ever. Unsubscribe anytime.
              </Typography>
            </Box>
          </Box>

          {/* ══ FINAL CTA (non-users) ════════════════════════════════════ */}
          {!user && (
            <Box
              component="section"
              sx={{
                background: "linear-gradient(150deg,#2D0B1F 0%,#4A1030 50%,#2D0B1F 100%)",
                py: { xs: 8, md: 12 }, px: 2, textAlign: "center", position: "relative", overflow: "hidden",
                "&::before": {
                  content: '""', position: "absolute", inset: 0,
                  background: "radial-gradient(ellipse at 50% 0%,rgba(139,26,74,0.25) 0%,transparent 70%)",
                  pointerEvents: "none",
                },
              }}
            >
              <Box sx={{ maxWidth: 680, mx: "auto", position: "relative", zIndex: 1 }}>
                <Chip
                  label="✦ Join the community"
                  sx={{
                    mb: 2, bgcolor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, fontSize: "0.75rem",
                  }}
                />
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 900, color: "#fff", mb: 2, lineHeight: 1.2, letterSpacing: "-0.02em",
                    fontSize: { xs: "1.8rem", md: "2.4rem" } }}
                >
                  Be part of India's most loved<br />handcrafted gifting brand
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.7, mb: 4 }}>
                  Save your wishlist, track orders, get personalised recommendations & early access to limited editions.
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center" sx={{ mb: 5 }}>
                  {["Save wishlists","Track orders","Exclusive deals","Early access"].map((p) => (
                    <Chip
                      key={p}
                      icon={<FiCheck style={{ width: 12, height: 12, color: "#C9A84C" }} />}
                      label={p}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)",
                        border: "1px solid rgba(255,255,255,0.15)", fontWeight: 600,
                      }}
                    />
                  ))}
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center">
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/register")}
                    sx={{
                      bgcolor: PRIMARY, fontWeight: 700, px: 4, py: 1.5, borderRadius: "12px",
                      boxShadow: `0 4px 20px rgba(139,26,74,0.4)`,
                      "&:hover": { bgcolor: PRIMARY_DARK, transform: "translateY(-2px)" },
                      transition: "all 0.25s",
                    }}
                  >
                    Create Free Account
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/login")}
                    sx={{
                      color: "rgba(255,255,255,0.8)", borderColor: "rgba(255,255,255,0.3)",
                      fontWeight: 700, px: 4, py: 1.5, borderRadius: "12px",
                      bgcolor: "rgba(255,255,255,0.06)",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.12)", color: "#fff", borderColor: "rgba(255,255,255,0.5)" },
                      transition: "all 0.25s",
                    }}
                  >
                    Sign In
                  </Button>
                </Stack>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
