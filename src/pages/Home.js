import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Header from "../components/Header";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import { useProducts } from "../hooks/useSmartFetch";
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
  FiSend,
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
import Divider from "@mui/material/Divider";

/* ─── Design tokens ────────────────────────────────────────────────────── */
const P       = "#8b2252";
const P_DARK  = "#6b1238";
const P_LIGHT = "rgba(139,34,82,0.08)";
const GOLD    = "#C9A84C";
const MUTED   = "#64748b";
const BORDER  = "rgba(0,0,0,0.07)";
const BG      = "#fdf8f5";
const NAVY    = "#3d1a2e";

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
  { value: 1200,  suffix: "+",  label: "Happy Customers",   icon: "😊" },
  { value: 500,   suffix: "+",  label: "Handmade Products", icon: "🎨" },
  { value: 28000, suffix: "+",  label: "Pincodes Served",   icon: "📦" },
  { value: 4.9,   suffix: "/5", label: "Avg. Rating",       icon: "⭐" },
];

const OCCASIONS = [
  { emoji: "🎂", label: "Birthday",    query: "Birthday",   gradient: "linear-gradient(135deg,#fce7ef,#fdf2f8)" },
  { emoji: "💕", label: "Anniversary", query: "Anniversary", gradient: "linear-gradient(135deg,#fdf2f8,#fce7ef)" },
  { emoji: "💍", label: "Wedding",     query: "Wedding",    gradient: "linear-gradient(135deg,#fef9ec,#fef3c7)" },
  { emoji: "🪔", label: "Diwali",      query: "Diwali",     gradient: "linear-gradient(135deg,#fffbeb,#fef9ec)" },
  { emoji: "💼", label: "Corporate",   query: "Corporate",  gradient: "linear-gradient(135deg,#eff6ff,#dbeafe)" },
  { emoji: "🍼", label: "Baby Shower", query: "Baby",       gradient: "linear-gradient(135deg,#f0fdf4,#dcfce7)" },
];

const TRUST_ITEMS = [
  { Icon: FiTruck,      title: "Free Shipping",    desc: "On orders above ₹999",     color: P,         bg: P_LIGHT },
  { Icon: FiRefreshCw,  title: "Easy Returns",     desc: "7-day hassle-free returns", color: "#059669", bg: "rgba(5,150,105,0.08)" },
  { Icon: FiLock,       title: "Secure Payment",   desc: "100% encrypted checkout",   color: "#0284c7", bg: "rgba(2,132,199,0.08)" },
  { Icon: FiAward,      title: "Handcrafted",      desc: "Made with love & care",     color: "#d97706", bg: "rgba(217,119,6,0.08)" },
];

const PROCESS_STEPS = [
  { Icon: FiPackage,    step: "01", title: "Browse & Discover",   desc: "Explore 500+ unique handcrafted products across every category — from resin art to custom jewelry." },
  { Icon: FiGift,       step: "02", title: "Personalize It",       desc: "Add names, dates, or a heartfelt message. Make every gift uniquely yours." },
  { Icon: FiSmartphone, step: "03", title: "Delivered with Love",  desc: "Crafted just for you and shipped in premium packaging to your doorstep." },
];

const TESTIMONIALS = [
  { name: "Priya S.",   location: "Mumbai",    rating: 5, verified: true, text: "The resin coasters I ordered were absolutely stunning. Quality far exceeded my expectations — everyone who sees them wants one!" },
  { name: "Rahul M.",   location: "Bangalore", rating: 5, verified: true, text: "Ordered a personalized gift hamper for Diwali — my entire team was in awe. The packaging alone made it feel luxurious." },
  { name: "Ananya K.",  location: "Chennai",   rating: 5, verified: true, text: "Fast delivery, beautiful packaging, and the customization was exactly what I envisioned. Will be a repeat customer for sure!" },
  { name: "Meera T.",   location: "Delhi",     rating: 5, verified: true, text: "Gifted an embroidery hoop to my mom for her birthday — she cried happy tears. The artistry and detail is unmatched." },
  { name: "Kavita R.",  location: "Hyderabad", rating: 5, verified: true, text: "Ordered a custom resin tray for my sister's wedding — it was the highlight of all the gifts. Absolutely gorgeous!" },
];

const MARQUEE_ITEMS = [
  "🚚 Free Shipping above ₹999",
  "✋ 100% Handcrafted",
  "🇮🇳 Pan-India Delivery",
  "⭐ 4.9/5 Average Rating",
  "🎁 Personalization Available",
  "📦 Gift-Ready Packaging",
  "🔄 7-Day Easy Returns",
  "💳 Secure Payment",
];

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
function StarRow({ count, size = 13 }) {
  return (
    <Stack direction="row" spacing={0.25} alignItems="center">
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar key={i} style={{ width: size, height: size, color: i < count ? "#f59e0b" : "#e2e8f0", fill: i < count ? "#f59e0b" : "none" }} />
      ))}
    </Stack>
  );
}

function SectionLabel({ overline, heading, centered = false }) {
  return (
    <Box sx={{ textAlign: centered ? "center" : "left", mb: centered ? 5 : 0 }}>
      <Typography
        component="span"
        sx={{
          display: "inline-block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: P, mb: 1,
          "&::before": { content: '"— "' },
          "&::after":  { content: '" —"' },
        }}
      >
        {overline}
      </Typography>
      <Typography
        variant="h4"
        sx={{ fontWeight: 800, letterSpacing: "-0.025em", color: "#0f172a", lineHeight: 1.2, display: "block" }}
      >
        {heading}
      </Typography>
    </Box>
  );
}

function StatCounter({ value, suffix, label, icon, animate }) {
  const count = useCountUp(value, 2200, animate);
  return (
    <Box sx={{ flex: 1, textAlign: "center", py: { xs: 2.5, md: 3 }, px: 2, position: "relative",
      "&:not(:last-child)::after": {
        content: '""', position: "absolute", right: 0, top: "25%", height: "50%",
        borderRight: "1px solid rgba(255,255,255,0.12)",
      },
    }}>
      <Typography sx={{ fontSize: "1.5rem", mb: 0.5 }}>{icon}</Typography>
      <Typography sx={{
        fontSize: { xs: "1.5rem", md: "1.9rem" }, fontWeight: 900, lineHeight: 1, mb: 0.25,
        letterSpacing: "-0.03em", color: "#fff",
      }}>
        {typeof count === "number" && count < 10 ? count.toFixed(1) : count.toLocaleString()}{suffix}
      </Typography>
      <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </Typography>
    </Box>
  );
}

function WishlistButton({ productId }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const isAuthenticated = useSelector((s) => !!s.auth.user);
  const toggle = useCallback(async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { window.location.href = "/login"; return; }
    setLoading(true);
    try {
      if (wishlisted) { await api.delete(`/api/auth/wishlist/${productId}`); setWishlisted(false); }
      else            { await api.post("/api/auth/wishlist", { productId }); setWishlisted(true); }
    } catch { /* silent */ } finally { setLoading(false); }
  }, [wishlisted, productId, isAuthenticated]);

  return (
    <Tooltip title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}>
      <IconButton size="small" onClick={toggle} disabled={loading} sx={{
        position: "absolute", top: 8, right: 8, zIndex: 5,
        width: 32, height: 32,
        bgcolor: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)",
        border: wishlisted ? `1.5px solid #ec4899` : "1.5px solid rgba(255,255,255,0.6)",
        opacity: 0, transition: "opacity 0.2s, transform 0.2s",
        ".MuiCard-root:hover &": { opacity: 1 },
        "&:hover": { bgcolor: "#fdf2f8", transform: "scale(1.1)" },
      }}>
        <FiHeart style={{ width: 14, height: 14, color: wishlisted ? "#ec4899" : "#94a3b8", fill: wishlisted ? "#ec4899" : "none" }} />
      </IconButton>
    </Tooltip>
  );
}

function ProductCard({ product, index }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [adding, setAdding]  = useState(false);
  const [added, setAdded]    = useState(false);

  const imgSrc = buildCloudinaryUrl(product.images?.[0]?.url || product.image?.url || product.image, 480)
    || "https://placehold.co/480x480?text=No+Image";

  const isLowStock   = product.trackInventory && product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
  const isOutOfStock = product.trackInventory && product.stock === 0;
  const discountPct  = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;

  const handleAddToCart = useCallback(async (e) => {
    e.stopPropagation();
    if (isOutOfStock || adding) return;
    setAdding(true);
    await dispatch(optimisticAddToCart({ product, quantity: 1 }));
    setAdding(false); setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [dispatch, product, isOutOfStock, adding]);

  return (
    <Card
      onClick={() => navigate("/products")} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate("/products")}
      sx={{
        cursor: "pointer", position: "relative",
        border: `1px solid ${BORDER}`, borderRadius: "16px", overflow: "hidden",
        animation: `cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both`,
        animationDelay: `${index * 0.07}s`,
        "@keyframes cardIn": { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1), box-shadow 0.28s, border-color 0.28s",
        bgcolor: "#fff",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
          borderColor: `rgba(139,34,82,0.2)`,
          "& .product-img":  { transform: "scale(1.08)" },
          "& .card-overlay": { opacity: 1 },
        },
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <Box sx={{ position: "relative", aspectRatio: "1/1", overflow: "hidden", bgcolor: "#f8fafc" }}>
        <CardMedia component="img" image={imgSrc} alt={product.name} loading="lazy" decoding="async"
          className="product-img"
          sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)" }}
        />

        <Stack direction="column" spacing={0.5} sx={{ position: "absolute", top: 8, left: 8, zIndex: 2 }}>
          {discountPct > 0 && (
            <Box sx={{ px: 1, height: 20, display: "inline-flex", alignItems: "center", bgcolor: "#dc2626", borderRadius: "6px" }}>
              <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: "#fff", letterSpacing: "0.03em" }}>{discountPct}% OFF</Typography>
            </Box>
          )}
          {product.isCustomizable && (
            <Box sx={{ px: 1, height: 20, display: "inline-flex", alignItems: "center", bgcolor: P, borderRadius: "6px" }}>
              <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: "#fff" }}>✦ Custom</Typography>
            </Box>
          )}
        </Stack>

        {isLowStock && (
          <Box sx={{ position: "absolute", bottom: 8, left: 8, zIndex: 2, px: 1, height: 20, display: "inline-flex",
            alignItems: "center", bgcolor: "rgba(245,158,11,0.95)", borderRadius: "6px" }}>
            <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: "#fff" }}>Only {product.stock} left!</Typography>
          </Box>
        )}

        {isOutOfStock && (
          <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(255,255,255,0.72)", backdropFilter: "blur(3px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Sold Out
            </Typography>
          </Box>
        )}

        <Box className="card-overlay" sx={{
          position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", pb: 2,
          opacity: 0, transition: "opacity 0.28s", zIndex: 4,
          background: "linear-gradient(to top,rgba(0,0,0,0.28) 0%,transparent 55%)",
        }}>
          <Button size="small" onClick={handleAddToCart} disabled={isOutOfStock || adding}
            startIcon={added ? <FiCheck /> : adding ? null : <FiShoppingCart />}
            sx={{
              bgcolor: added ? "#059669" : "rgba(255,255,255,0.96)", color: added ? "#fff" : P,
              fontWeight: 700, fontSize: "0.8rem", borderRadius: "10px", px: 2.5, py: 0.7,
              backdropFilter: "blur(8px)", boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
              transition: "all 0.22s",
              "&:hover": { bgcolor: added ? "#059669" : P, color: "#fff" },
              "&:disabled": { opacity: 0.6 },
            }}
          >
            {added ? "Added!" : adding ? "Adding…" : "Add to Cart"}
          </Button>
        </Box>

        <WishlistButton productId={product._id} />
      </Box>

      <CardContent sx={{ p: "0.875rem 0.875rem 0.5rem" }}>
        {product.averageRating > 0 && (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
            <StarRow count={Math.round(product.averageRating)} />
            <Typography sx={{ fontSize: "0.72rem", color: MUTED }}>({product.ratingCount || 0})</Typography>
          </Stack>
        )}
        <Typography sx={{
          fontWeight: 700, color: "#0f172a", mb: 0.5, fontSize: "0.9rem", lineHeight: 1.35,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {product.name}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Typography sx={{ fontWeight: 800, color: P, fontSize: "1.05rem" }}>
            ₹{product.price?.toLocaleString()}
          </Typography>
          {product.originalPrice > product.price && (
            <Typography sx={{ fontSize: "0.78rem", color: MUTED, textDecoration: "line-through" }}>
              ₹{product.originalPrice?.toLocaleString()}
            </Typography>
          )}
        </Stack>
        {product.isCustomizable && (
          <Box sx={{ display: "inline-flex", alignItems: "center", mt: 0.75, px: 1, height: 18, bgcolor: P_LIGHT,
            borderRadius: "6px", border: `1px solid rgba(139,34,82,0.15)` }}>
            <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: P }}>✦ Personalizable</Typography>
          </Box>
        )}
      </CardContent>
      <CardActions sx={{ p: "0 0.875rem 0.875rem", pt: 0 }} />
    </Card>
  );
}

function ProductSkeleton() {
  return (
    <Card sx={{ borderRadius: "16px", border: `1px solid ${BORDER}`, boxShadow: "none", bgcolor: "#fff" }}>
      <Skeleton variant="rectangular" sx={{ aspectRatio: "1/1", width: "100%" }} />
      <CardContent>
        <Skeleton variant="text" width="60%" sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="85%" />
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
    <Box component="section" sx={{ py: { xs: 7, md: 10 }, bgcolor: BG }}>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mb: 5 }}>
          <SectionLabel overline="Flying off the shelves" heading="🔥 Currently Popular" />
          <Button endIcon={<FiArrowRight size={14} />} onClick={() => navigate("/products")}
            sx={{ color: P, fontWeight: 700, fontSize: "0.875rem", "&:hover": { bgcolor: P_LIGHT }, flexShrink: 0 }}>
            View all
          </Button>
        </Stack>
        <Grid container spacing={2.5}>
          {popularProducts.map((product, i) => (
            <Grid key={product._id} size={{ xs: 6, sm: 4, md: 3 }}>
              <Box sx={{ position: "relative" }}>
                {product.ratingCount > 0 && (
                  <Box sx={{
                    position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
                    zIndex: 10, px: 1.25, height: 22, display: "flex", alignItems: "center",
                    background: "linear-gradient(135deg,#ef4444,#f97316)", borderRadius: "20px",
                    boxShadow: "0 2px 10px rgba(239,68,68,0.35)", whiteSpace: "nowrap",
                  }}>
                    <Typography sx={{ fontSize: "0.6rem", fontWeight: 800, color: "#fff" }}>
                      🔥 {product.ratingCount}+ bought this
                    </Typography>
                  </Box>
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
    () => [...products].filter((p) => p.averageRating > 0 && p.stock !== 0)
      .sort((a, b) => b.averageRating - a.averageRating || b.ratingCount - a.ratingCount).slice(0, 8),
    [products],
  );

  const featured = bestsellers.length ? bestsellers : products.slice(0, 8);
  const festival  = getUpcomingFestival();

  const globalKeyframes = `
    @keyframes hpFloat {
      0%,100% { transform: translateY(0) rotate(0deg); }
      33%      { transform: translateY(-14px) rotate(5deg); }
      66%      { transform: translateY(-6px) rotate(-3deg); }
    }
    @keyframes hpPulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(139,34,82,0.35); }
      50%      { box-shadow: 0 0 0 8px rgba(139,34,82,0); }
    }
    @keyframes hpMarquee {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    @keyframes hpScrollLeft {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    @keyframes hpBlobMorph {
      0%   { border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%; }
      50%  { border-radius: 40% 60% 30% 70% / 60% 40% 60% 40%; }
      100% { border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%; }
    }
    @keyframes hpFadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes hpScaleIn {
      from { opacity: 0; transform: scale(0.92); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes hpShimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
  `;

  return (
    <>
      <style>{globalKeyframes}</style>
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
          <Box role="banner" sx={{
            display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap",
            background: "linear-gradient(135deg,#fffbeb 0%,#fef3c7 60%,#fef9ec 100%)",
            borderBottom: "1px solid #fde68a", px: { xs: 2, md: 3 }, py: 1,
          }}>
            <Typography sx={{ fontSize: "1.3rem", flexShrink: 0 }}>{festival.emoji}</Typography>
            <Typography variant="body2" sx={{ flex: 1, minWidth: 200, color: "#78350f", lineHeight: 1.4, fontSize: "0.875rem" }}>
              <strong>
                {festival.days === 1 ? "Tomorrow is" : festival.days <= 7 ? `${festival.days} days to` : "Coming up —"}{" "}
                {festival.name}
              </strong>
              {" · "}Find the perfect handcrafted gift
            </Typography>
            <Button size="small" endIcon={<FiArrowRight size={12} />}
              onClick={() => navigate(`/products?q=${encodeURIComponent(festival.query)}`)}
              sx={{ bgcolor: "#f59e0b", color: "#fff", fontWeight: 700, fontSize: "0.8rem",
                borderRadius: "8px", flexShrink: 0, "&:hover": { bgcolor: "#d97706" } }}>
              Shop Gifts
            </Button>
          </Box>
        )}

        <Box component="main" sx={{ bgcolor: BG, minHeight: "100vh", overflowX: "hidden" }}>

          {/* ══ HERO ══════════════════════════════════════════════════════ */}
          <Box component="section" aria-label="Hero" sx={{
            position: "relative",
            background: `linear-gradient(145deg, ${NAVY} 0%, #5a1c3a 45%, ${P} 100%)`,
            pt: { xs: 8, md: 11 }, pb: { xs: 6, md: 9 },
            px: { xs: 2, md: 3 }, overflow: "hidden",
          }}>
            {/* Radial glow backdrop */}
            <Box aria-hidden="true" sx={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "radial-gradient(ellipse 70% 60% at 75% 50%, rgba(201,168,76,0.12) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 20% 60%, rgba(139,34,82,0.25) 0%, transparent 60%)",
            }} />

            {/* Floating decorative emojis */}
            <Box aria-hidden="true" sx={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
              {["🌸","✨","🎨","💎","🌿","🎁"].map((el, i) => (
                <Box key={i} component="span" sx={{
                  position: "absolute", fontSize: "1.6rem", opacity: 0.18,
                  animation: `hpFloat linear infinite`,
                  animationDuration: `${5.5 + i * 0.8}s`, animationDelay: `${i * 0.7}s`,
                  ...[
                    { top: "10%", left: "4%"  },
                    { top: "18%", right: "6%" },
                    { top: "58%", left: "2%"  },
                    { top: "72%", right: "4%" },
                    { top: "38%", left: "50%" },
                    { top: "82%", left: "28%" },
                  ][i],
                }}>{el}</Box>
              ))}
            </Box>

            <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
              <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">

                {/* Left — Copy */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ animation: "hpFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both" }}>

                    {/* Eyebrow pill */}
                    <Box sx={{
                      display: "inline-flex", alignItems: "center", gap: 0.75, mb: 3,
                      px: 1.75, height: 32, borderRadius: "20px",
                      bgcolor: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)",
                    }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: GOLD, animation: "hpPulse 2s ease-in-out infinite" }} />
                      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        Handmade with Love in India
                      </Typography>
                    </Box>

                    <Typography variant="h1" sx={{
                      fontSize: { xs: "2.5rem", sm: "3rem", md: "3.75rem" },
                      fontWeight: 900, lineHeight: 1.06, mb: 2.5, letterSpacing: "-0.035em", color: "#fff",
                    }}>
                      Gifts that carry
                      <br />
                      <Box component="span" sx={{
                        background: `linear-gradient(135deg, ${GOLD} 0%, #F4A7B9 50%, ${GOLD} 100%)`,
                        backgroundSize: "200% auto",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                        animation: "hpShimmer 4s linear infinite",
                      }}>
                        a lifetime
                      </Box>{" "}of
                      <br />memories
                    </Typography>

                    <Typography sx={{
                      color: "rgba(255,255,255,0.65)", lineHeight: 1.75, mb: 4,
                      maxWidth: 460, fontSize: { xs: "0.95rem", md: "1.05rem" },
                    }}>
                      Personalized resin art, custom jewelry, embroidery hoops &amp; thoughtful gifting hampers
                      — each piece crafted by hand, delivered with care.
                    </Typography>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 5 }}>
                      <Button variant="contained" size="large" startIcon={<FiGift />}
                        onClick={() => navigate("/products")}
                        sx={{
                          bgcolor: P, fontWeight: 700, px: 4, py: 1.5, borderRadius: "12px", fontSize: "0.9375rem",
                          boxShadow: `0 6px 24px rgba(139,34,82,0.45)`,
                          "&:hover": { bgcolor: P_DARK, transform: "translateY(-2px)", boxShadow: `0 10px 32px rgba(139,34,82,0.5)` },
                          transition: "all 0.25s",
                        }}>
                        Explore Collection
                      </Button>
                      <Button variant="outlined" size="large" endIcon={<FiArrowRight />}
                        onClick={() => navigate("/products?customizable=true")}
                        sx={{
                          color: "#fff", borderColor: "rgba(255,255,255,0.35)", fontWeight: 700, px: 4, py: 1.5,
                          borderRadius: "12px", fontSize: "0.9375rem",
                          "&:hover": { borderColor: "rgba(255,255,255,0.7)", bgcolor: "rgba(255,255,255,0.08)", transform: "translateY(-2px)" },
                          transition: "all 0.25s",
                        }}>
                        Browse Categories
                      </Button>
                    </Stack>

                    {/* Social proof avatars */}
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Stack direction="row">
                        {["P","R","A","K","M"].map((l, i) => (
                          <Box key={i} sx={{
                            width: 38, height: 38, borderRadius: "50%",
                            background: `linear-gradient(135deg,${P},${GOLD})`,
                            color: "#fff", fontSize: "0.72rem", fontWeight: 800,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "2.5px solid rgba(255,255,255,0.18)",
                            ml: i === 0 ? 0 : "-11px",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
                          }}>{l}</Box>
                        ))}
                      </Stack>
                      <Box>
                        <Stack direction="row" spacing={0.25} sx={{ mb: 0.25 }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FiStar key={i} style={{ width: 13, height: 13, color: "#f59e0b", fill: "#f59e0b" }} />
                          ))}
                        </Stack>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)" }}>
                          <strong style={{ color: "rgba(255,255,255,0.85)" }}>1,200+ happy customers</strong> across India
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>

                {/* Right — Product showcase grid */}
                <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: "none", md: "block" } }}>
                  <Box sx={{ animation: "hpScaleIn 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s both" }}>
                    <Grid container spacing={1.5}>
                      {/* Large card */}
                      <Grid size={7}>
                        <Box sx={{
                          aspectRatio: "3/4", borderRadius: "20px", overflow: "hidden",
                          border: "2px solid rgba(255,255,255,0.15)",
                          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
                          position: "relative",
                          animation: "hpFloat 6s ease-in-out infinite",
                        }}>
                          {featured[0] ? (
                            <Box component="img"
                              src={buildCloudinaryUrl(featured[0].images?.[0]?.url || featured[0].image?.url || featured[0].image, 600)}
                              alt={featured[0]?.name} loading="eager"
                              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          ) : (
                            <Box sx={{ width: "100%", height: "100%", bgcolor: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Typography sx={{ fontSize: "6rem" }}>🎁</Typography>
                            </Box>
                          )}
                          {/* Price tag overlay */}
                          {featured[0] && (
                            <Box sx={{
                              position: "absolute", bottom: 14, left: 14, right: 14,
                              bgcolor: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)",
                              border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px",
                              px: 1.5, py: 1,
                            }}>
                              <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#fff",
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {featured[0].name}
                              </Typography>
                              <Typography sx={{ fontSize: "0.85rem", fontWeight: 900, color: GOLD }}>
                                ₹{featured[0].price?.toLocaleString()}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Grid>

                      {/* Two small cards stacked */}
                      <Grid size={5}>
                        <Stack spacing={1.5} sx={{ height: "100%" }}>
                          {[featured[1], featured[2]].map((prod, idx) => (
                            <Box key={idx} sx={{
                              flex: 1, borderRadius: "16px", overflow: "hidden",
                              border: "2px solid rgba(255,255,255,0.12)",
                              boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
                              animation: `hpFloat ${6.5 + idx}s ease-in-out infinite`,
                              animationDelay: `${0.8 + idx * 0.5}s`,
                              position: "relative",
                            }}>
                              {prod ? (
                                <Box component="img"
                                  src={buildCloudinaryUrl(prod.images?.[0]?.url || prod.image?.url || prod.image, 300)}
                                  alt={prod?.name} loading="eager"
                                  sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                              ) : (
                                <Box sx={{ width: "100%", height: "100%", bgcolor: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Typography sx={{ fontSize: "2.5rem" }}>🎨</Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      </Grid>
                    </Grid>

                    {/* Floating stat cards */}
                    <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                      {[
                        { emoji: "⭐", val: "4.9/5",    lbl: "Average Rating"     },
                        { emoji: "🚀", val: "2–5 Days", lbl: "Pan-India Delivery"  },
                        { emoji: "🎁", val: "500+",     lbl: "Handmade Products"   },
                      ].map((card, i) => (
                        <Box key={i} sx={{
                          flex: 1, display: "flex", alignItems: "center", gap: 1,
                          bgcolor: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255,255,255,0.15)", borderRadius: "14px",
                          px: 1.5, py: 1.25,
                        }}>
                          <Typography sx={{ fontSize: "1.3rem" }}>{card.emoji}</Typography>
                          <Box>
                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{card.val}</Typography>
                            <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.2 }}>{card.lbl}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Container>

            {/* Stats bar inside hero */}
            <Container maxWidth="lg" sx={{ mt: { xs: 5, md: 7 }, position: "relative", zIndex: 1 }}>
              <Box ref={statsRef} sx={{
                display: "flex", flexWrap: "wrap",
                borderRadius: "20px",
                bgcolor: "rgba(255,255,255,0.06)", backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                overflow: "hidden",
              }}>
                {STATS.map((stat) => (
                  <StatCounter key={stat.label} {...stat} animate={statsInView} />
                ))}
              </Box>
            </Container>
          </Box>

          {/* ══ MARQUEE TICKER ════════════════════════════════════════════ */}
          <Box sx={{ bgcolor: P, overflow: "hidden", py: 1.25,
            "&:hover .marquee-track": { animationPlayState: "paused" } }}>
            <Stack direction="row" className="marquee-track" sx={{
              width: "max-content",
              animation: "hpMarquee 28s linear infinite",
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}>
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                <Stack key={i} direction="row" alignItems="center" sx={{ px: 3, flexShrink: 0 }}>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.92)", whiteSpace: "nowrap" }}>
                    {item}
                  </Typography>
                  <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.4)", ml: 3, flexShrink: 0 }} />
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* ══ TRUST STRIP ═══════════════════════════════════════════════ */}
          <Box component="section" aria-label="Why shop with us"
            sx={{ bgcolor: "#fff", borderBottom: `1px solid ${BORDER}` }}>
            <Container maxWidth="lg" disableGutters>
              <Grid container>
                {TRUST_ITEMS.map(({ Icon, title, desc, color, bg }, i) => (
                  <Grid key={title} size={{ xs: 6, md: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{
                      p: { xs: 2, md: 2.5 },
                      borderRight: { xs: i % 2 === 0 ? `1px solid ${BORDER}` : "none", md: i < 3 ? `1px solid ${BORDER}` : "none" },
                      borderBottom: { xs: i < 2 ? `1px solid ${BORDER}` : "none", md: "none" },
                      transition: "background 0.25s",
                      "&:hover": { bgcolor: BG },
                      "&:hover .trust-icon-wrap": { transform: "scale(1.1) rotate(-5deg)" },
                    }}>
                      <Box className="trust-icon-wrap" sx={{
                        width: 46, height: 46, borderRadius: "12px", flexShrink: 0,
                        bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "transform 0.25s",
                      }}>
                        <Icon style={{ width: 20, height: 20, color }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a", mb: 0.15 }}>{title}</Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: MUTED }}>{desc}</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          {/* ══ OCCASIONS ═════════════════════════════════════════════════ */}
          <Box component="section" sx={{ py: { xs: 7, md: 10 } }}>
            <Container maxWidth="lg">
              <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mb: 5 }}>
                <SectionLabel overline="Find the perfect gift" heading="Shop by Occasion" />
                <Button endIcon={<FiArrowRight size={14} />} onClick={() => navigate("/products")}
                  sx={{ color: P, fontWeight: 700, fontSize: "0.875rem", "&:hover": { bgcolor: P_LIGHT }, flexShrink: 0 }}>
                  View all
                </Button>
              </Stack>
              <Grid container spacing={2}>
                {OCCASIONS.map((occ, i) => (
                  <Grid key={occ.label} size={{ xs: 4, sm: 2 }}>
                    <Box component="button"
                      onClick={() => navigate(`/products?q=${encodeURIComponent(occ.query)}`)}
                      aria-label={`Shop ${occ.label} gifts`}
                      sx={{
                        width: "100%", display: "flex", flexDirection: "column",
                        alignItems: "center", gap: 1.25, py: 3, px: 1.5,
                        background: occ.gradient, border: `1.5px solid ${BORDER}`,
                        borderRadius: "18px", cursor: "pointer",
                        transition: "all 0.28s cubic-bezier(0.4,0,0.2,1)",
                        animation: "cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both",
                        animationDelay: `${i * 0.08}s`,
                        "@keyframes cardIn": { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
                        "&:hover": {
                          borderColor: P, transform: "translateY(-6px) scale(1.03)",
                          boxShadow: `0 12px 32px rgba(139,34,82,0.15)`,
                          "& .occ-label": { color: P },
                          "& .occ-emoji": { transform: "scale(1.2) rotate(-8deg)" },
                        },
                      }}
                    >
                      <Typography className="occ-emoji" sx={{ fontSize: "2.4rem", lineHeight: 1, transition: "transform 0.28s" }}>{occ.emoji}</Typography>
                      <Typography className="occ-label" sx={{
                        fontWeight: 700, fontSize: "0.8125rem", color: "#0f172a", textAlign: "center",
                        transition: "color 0.2s",
                      }}>{occ.label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          {/* ══ CATEGORIES ════════════════════════════════════════════════ */}
          {categories.length > 0 && (
            <Box component="section" sx={{ py: { xs: 7, md: 10 }, bgcolor: "#fff" }}>
              <Container maxWidth="lg">
                <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mb: 5 }}>
                  <SectionLabel overline="Explore our collections" heading="Shop by Category" />
                  <Button endIcon={<FiArrowRight size={14} />} onClick={() => navigate("/products")}
                    sx={{ color: P, fontWeight: 700, fontSize: "0.875rem", "&:hover": { bgcolor: P_LIGHT }, flexShrink: 0 }}>
                    See all
                  </Button>
                </Stack>
                <Grid container spacing={2}>
                  {categories.map((cat, i) => (
                    <Grid key={cat.name} size={{ xs: i === 0 ? 12 : 6, sm: i === 0 ? 8 : 4, md: i === 0 ? 8 : 4 }}>
                      <Box component="button"
                        onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                        aria-label={`Browse ${cat.name}`}
                        sx={{
                          position: "relative", width: "100%", border: "none", cursor: "pointer",
                          borderRadius: "20px", overflow: "hidden",
                          aspectRatio: i === 0 ? "16/9" : "4/3",
                          p: 0, display: "block",
                          transition: "transform 0.3s, box-shadow 0.3s",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                          "&:hover": {
                            transform: "scale(1.02)", boxShadow: "0 20px 52px rgba(0,0,0,0.18)",
                            "& .cat-img": { transform: "scale(1.1)" },
                            "& .cat-overlay": { background: `linear-gradient(to top, ${NAVY}ee 0%, rgba(15,23,42,0.2) 60%, transparent 100%)` },
                            "& .cat-cta": { opacity: 1, transform: "translateY(0)" },
                          },
                        }}
                      >
                        <Box sx={{ position: "relative", width: "100%", height: "100%", bgcolor: "#e2e8f0" }}>
                          {cat.img ? (
                            <Box component="img" className="cat-img"
                              src={buildCloudinaryUrl(cat.img, 600) || cat.img} alt={cat.name}
                              loading="lazy" decoding="async"
                              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)" }}
                            />
                          ) : (
                            <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem" }}>🎁</Box>
                          )}
                          <Box className="cat-overlay" sx={{
                            position: "absolute", inset: 0, transition: "background 0.3s",
                            background: "linear-gradient(to top,rgba(15,23,42,0.72) 0%,rgba(15,23,42,0.15) 55%,transparent 100%)",
                          }} />
                          <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: { xs: 2, md: 2.5 } }}>
                            <Typography sx={{
                              color: "#fff", fontWeight: 800, fontSize: { xs: "0.9rem", md: "1rem" },
                              textTransform: "capitalize", textShadow: "0 2px 8px rgba(0,0,0,0.4)", mb: 0.25,
                            }}>
                              {cat.name}
                            </Typography>
                            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", mb: 0.75 }}>
                              {cat.count} products
                            </Typography>
                            <Stack direction="row" alignItems="center" className="cat-cta" spacing={0.5}
                              sx={{
                                opacity: 0, transform: "translateY(6px)", transition: "all 0.25s",
                                color: "#fff", fontSize: "0.8rem", fontWeight: 700,
                                display: "inline-flex", alignItems: "center",
                                bgcolor: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
                                border: "1px solid rgba(255,255,255,0.25)", borderRadius: "8px",
                                px: 1.25, py: 0.5,
                              }}>
                              <span>Explore</span><FiArrowRight size={12} />
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
          <Box component="section" sx={{ py: { xs: 7, md: 10 }, bgcolor: "#fff" }}>
            <Container maxWidth="lg">
              <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mb: 5 }}>
                <SectionLabel
                  overline={bestsellers.length ? "Customer favourites" : "Handpicked for you"}
                  heading={bestsellers.length ? "⭐ Bestsellers" : "Featured Products"}
                />
                <Button endIcon={<FiArrowRight size={14} />} onClick={() => navigate("/products")}
                  sx={{ color: P, fontWeight: 700, fontSize: "0.875rem", "&:hover": { bgcolor: P_LIGHT }, flexShrink: 0 }}>
                  View all
                </Button>
              </Stack>

              <Grid container spacing={2.5}>
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}><ProductSkeleton /></Grid>
                    ))
                  : featured.length === 0 ? (
                      <Grid size={12}>
                        <Box sx={{ textAlign: "center", py: 8 }}>
                          <Typography sx={{ fontSize: "3rem", mb: 2 }}>🎨</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}>No products yet</Typography>
                          <Typography sx={{ color: MUTED }}>Check back soon for handcrafted treasures!</Typography>
                        </Box>
                      </Grid>
                    ) : featured.map((product, i) => (
                      <Grid key={product._id} size={{ xs: 6, sm: 4, md: 3 }}>
                        <ProductCard product={product} index={i} />
                      </Grid>
                    ))
                }
              </Grid>

              {!loading && featured.length > 0 && (
                <Box sx={{ textAlign: "center", mt: 6 }}>
                  <Button variant="outlined" size="large" endIcon={<FiArrowRight />}
                    onClick={() => navigate("/products")}
                    sx={{
                      borderColor: BORDER, color: "#0f172a", fontWeight: 700, px: 5, py: 1.5,
                      borderRadius: "12px", fontSize: "0.9375rem",
                      "&:hover": { borderColor: P, color: P, bgcolor: P_LIGHT, transform: "translateY(-2px)" },
                      transition: "all 0.25s",
                    }}>
                    Browse All Products
                  </Button>
                </Box>
              )}
            </Container>
          </Box>

          {/* ══ HOW IT WORKS ══════════════════════════════════════════════ */}
          <Box component="section" sx={{ bgcolor: BG, py: { xs: 7, md: 10 }, px: 2 }}>
            <Container maxWidth="lg">
              <SectionLabel overline="Simple & joyful" heading="How It Works" centered />
              <Grid container spacing={3} sx={{ position: "relative" }}>
                {/* Connecting line on desktop */}
                <Box sx={{
                  display: { xs: "none", md: "block" },
                  position: "absolute", top: "80px", left: "calc(16.67% + 24px)", right: "calc(16.67% + 24px)",
                  height: 2, bgcolor: BORDER, zIndex: 0,
                }} />

                {PROCESS_STEPS.map(({ Icon, step, title, desc }, i) => (
                  <Grid key={step} size={{ xs: 12, md: 4 }}>
                    <Box sx={{
                      textAlign: "center", p: { xs: 3, md: 4 },
                      bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "20px",
                      position: "relative", zIndex: 1,
                      transition: "all 0.28s",
                      "&:hover": {
                        borderColor: `rgba(139,34,82,0.2)`, transform: "translateY(-6px)",
                        boxShadow: `0 16px 48px rgba(139,34,82,0.1)`,
                        "& .process-icon-wrap": { transform: "scale(1.1) rotate(-5deg)", boxShadow: `0 8px 24px rgba(139,34,82,0.35)` },
                      },
                    }}>
                      {/* Step number watermark */}
                      <Typography sx={{
                        position: "absolute", top: 12, right: 20, fontSize: "3.5rem", fontWeight: 900,
                        color: "rgba(0,0,0,0.04)", lineHeight: 1, pointerEvents: "none", letterSpacing: "-0.05em",
                      }}>{step}</Typography>

                      <Box className="process-icon-wrap" sx={{
                        width: 64, height: 64, borderRadius: "18px",
                        background: `linear-gradient(135deg,${P},${P_DARK})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        mx: "auto", mb: 2.5, transition: "all 0.28s",
                        boxShadow: `0 4px 16px rgba(139,34,82,0.25)`,
                      }}>
                        <Icon style={{ width: 26, height: 26, color: "#fff" }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 1, fontSize: "1.0625rem" }}>{title}</Typography>
                      <Typography sx={{ color: MUTED, lineHeight: 1.7, fontSize: "0.875rem" }}>{desc}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          {/* ══ STORYTELLING ══════════════════════════════════════════════ */}
          <Box component="section" sx={{ bgcolor: "#fff", py: { xs: 7, md: 10 }, px: 2 }}>
            <Container maxWidth="lg">
              <Grid container spacing={{ xs: 5, md: 10 }} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ position: "relative" }}>
                    {/* Main blob visual */}
                    <Box sx={{
                      width: "100%", maxWidth: 400, mx: "auto",
                      aspectRatio: "1/1",
                      borderRadius: "40% 60% 70% 30% / 60% 40% 60% 40%",
                      background: `linear-gradient(135deg,${P_LIGHT},rgba(201,168,76,0.12))`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      animation: "hpBlobMorph 12s ease-in-out infinite alternate",
                    }}>
                      <Typography sx={{ fontSize: { xs: "5rem", md: "7rem" }, animation: "hpFloat 5s ease-in-out infinite" }}>🖌️</Typography>
                    </Box>
                    {/* Floating badge */}
                    <Box sx={{
                      position: "absolute", bottom: "8%", right: "0%",
                      display: "inline-flex", alignItems: "center", gap: 1,
                      bgcolor: "#fff", border: `1.5px solid rgba(139,34,82,0.2)`,
                      borderRadius: "14px", px: 1.75, py: 1,
                      boxShadow: "0 8px 28px rgba(0,0,0,0.1)",
                    }}>
                      <FiCheck style={{ color: P, width: 16, height: 16 }} />
                      <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: P }}>100% Handcrafted</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <SectionLabel overline="Our Story" heading={"Crafted with Love,\nMade to Last Forever"} />
                  <Typography sx={{ color: MUTED, lineHeight: 1.78, mt: 2.5, mb: 2, fontSize: "0.9375rem" }}>
                    Every product at InfinityCraftSpace begins as an idea — then becomes something you can hold, feel, and treasure.
                    Our artisans pour hours of skill and heart into each piece, ensuring it carries emotions that mass-produced items never can.
                  </Typography>
                  <Typography sx={{ color: MUTED, lineHeight: 1.78, mb: 3.5, fontSize: "0.9375rem" }}>
                    From a personalized resin coaster for your best friend's kitchen, to a hand-embroidered hoop commemorating your wedding
                    date — we believe gifts should tell stories, not just fill boxes.
                  </Typography>
                  <Stack spacing={2} sx={{ mb: 4.5 }}>
                    {[
                      { icon: "🌿", text: "Sustainably sourced materials" },
                      { icon: "✋", text: "Every piece individually handcrafted" },
                      { icon: "📦", text: "Premium gifting-ready packaging" },
                    ].map((p) => (
                      <Stack key={p.text} direction="row" alignItems="center" spacing={1.5}>
                        <Box sx={{
                          width: 36, height: 36, borderRadius: "10px", bgcolor: P_LIGHT,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <Typography sx={{ fontSize: "1.1rem" }}>{p.icon}</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 600, color: "#0f172a", fontSize: "0.9375rem" }}>{p.text}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Button variant="contained" endIcon={<FiArrowRight />} onClick={() => navigate("/products")}
                    sx={{
                      bgcolor: P, fontWeight: 700, px: 4, py: 1.5, borderRadius: "12px", fontSize: "0.9375rem",
                      boxShadow: `0 4px 20px rgba(139,34,82,0.3)`,
                      "&:hover": { bgcolor: P_DARK, transform: "translateY(-2px)" },
                      transition: "all 0.25s",
                    }}>
                    Discover Our Craft
                  </Button>
                </Grid>
              </Grid>
            </Container>
          </Box>

          {/* ══ PERSONALIZATION BANNER ════════════════════════════════════ */}
          <Box component="section" sx={{
            background: `linear-gradient(145deg,${NAVY} 0%,${P_DARK} 50%,${P} 100%)`,
            py: { xs: 8, md: 12 }, px: 2, textAlign: "center", position: "relative", overflow: "hidden",
          }}>
            <Box aria-hidden="true" sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              {["💍","🎨","🌹","✨","🎁","💕"].map((e, i) => (
                <Box key={i} component="span" sx={{
                  position: "absolute", fontSize: "2rem", opacity: 0.15,
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
                }}>{e}</Box>
              ))}
            </Box>
            <Box sx={{ maxWidth: 680, mx: "auto", position: "relative", zIndex: 1 }}>
              <Box sx={{
                display: "inline-flex", alignItems: "center", gap: 0.75, mb: 3,
                px: 2, height: 34, borderRadius: "20px",
                bgcolor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
              }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  ✦ Made Just for You
                </Typography>
              </Box>

              <Typography variant="h3" sx={{
                fontWeight: 900, color: "#fff", mb: 2, lineHeight: 1.12, letterSpacing: "-0.025em",
                fontSize: { xs: "1.9rem", md: "2.75rem" },
              }}>
                Want something truly<br />one-of-a-kind?
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.7, mb: 4, fontSize: { xs: "0.95rem", md: "1.05rem" } }}>
                Add names, dates, photos, or a heartfelt message. Perfect for birthdays, anniversaries, weddings &amp; corporate gifting.
              </Typography>

              <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center" sx={{ mb: 5 }}>
                {["Wedding","Birthday","Anniversary","Corporate","Baby Shower"].map((occ) => (
                  <Box key={occ} sx={{
                    px: 2, height: 34, display: "inline-flex", alignItems: "center",
                    bgcolor: "rgba(255,255,255,0.12)", borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    transition: "all 0.2s",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.2)", cursor: "pointer" },
                  }}>
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{occ}</Typography>
                  </Box>
                ))}
              </Stack>

              <Button variant="contained" size="large" startIcon={<FiGift />}
                onClick={() => navigate("/products?customizable=true")}
                sx={{
                  bgcolor: "#fff", color: P, fontWeight: 700, px: 5, py: 1.5,
                  borderRadius: "12px", fontSize: "0.9375rem",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
                  "&:hover": { bgcolor: "#fdf8f5", transform: "translateY(-2px)", boxShadow: "0 10px 32px rgba(0,0,0,0.22)" },
                  transition: "all 0.25s",
                }}>
                Shop Personalized Gifts
              </Button>
            </Box>
          </Box>

          {/* ══ TESTIMONIALS ══════════════════════════════════════════════ */}
          <Box component="section" sx={{ py: { xs: 7, md: 10 }, overflow: "hidden", bgcolor: BG }}>
            <Container maxWidth="lg">
              <SectionLabel overline="Real stories, real love" heading="What Our Customers Say" centered />
            </Container>

            <Box aria-label="Customer reviews" sx={{
              mt: 5, overflow: "hidden",
              maskImage: "linear-gradient(to right,transparent 0%,black 7%,black 93%,transparent 100%)",
              WebkitMaskImage: "linear-gradient(to right,transparent 0%,black 7%,black 93%,transparent 100%)",
              "&:hover .testimonials-track": { animationPlayState: "paused" },
            }}>
              <Stack direction="row" className="testimonials-track" spacing={2.5} sx={{
                width: "max-content",
                animation: "hpScrollLeft 36s linear infinite",
                "@media (prefers-reduced-motion: reduce)": { animation: "none" },
              }}>
                {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                  <Box key={`${t.name}-${i}`} sx={{
                    width: 320, flexShrink: 0, borderRadius: "18px",
                    border: `1px solid ${BORDER}`, bgcolor: "#fff",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    p: 3, display: "flex", flexDirection: "column", gap: 2,
                    transition: "all 0.28s",
                    "&:hover": { transform: "translateY(-5px)", boxShadow: "0 12px 36px rgba(0,0,0,0.1)", borderColor: `rgba(139,34,82,0.2)` },
                  }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={0.5}>
                      <StarRow count={t.rating} />
                      {t.verified && (
                        <Box sx={{
                          display: "inline-flex", alignItems: "center", gap: 0.5,
                          px: 1, height: 22, bgcolor: "#f0fdf4", border: "1px solid #bbf7d0",
                          borderRadius: "20px",
                        }}>
                          <FiCheck style={{ width: 10, height: 10, color: "#059669" }} />
                          <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#059669" }}>Verified</Typography>
                        </Box>
                      )}
                    </Stack>
                    <Typography sx={{ color: MUTED, lineHeight: 1.72, fontStyle: "italic", flex: 1, fontSize: "0.875rem" }}>
                      "{t.text}"
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <Box sx={{
                        width: 42, height: 42, borderRadius: "50%",
                        background: `linear-gradient(135deg,${P},${P_DARK})`,
                        color: "#fff", fontWeight: 800, fontSize: "1rem",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        {t.name[0]}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.875rem" }}>{t.name}</Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: MUTED }}>📍 {t.location}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>

          {/* ══ NEWSLETTER ════════════════════════════════════════════════ */}
          <Box component="section" sx={{ bgcolor: BG, borderTop: `1px solid ${BORDER}`, py: { xs: 8, md: 11 }, px: 2 }}>
            <Container maxWidth="md">
              <Box sx={{
                bgcolor: "#fff", borderRadius: "24px",
                border: `1px solid ${BORDER}`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}>
                <Grid container>
                  {/* Left — gradient accent */}
                  <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: "none", md: "block" } }}>
                    <Box sx={{
                      height: "100%", minHeight: 300,
                      background: `linear-gradient(145deg,${NAVY} 0%,${P} 100%)`,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      p: 4, position: "relative", overflow: "hidden",
                    }}>
                      <Box aria-hidden="true" sx={{ position: "absolute", inset: 0,
                        background: "radial-gradient(ellipse 80% 60% at 50% 100%,rgba(201,168,76,0.2) 0%,transparent 70%)" }} />
                      <Typography sx={{ fontSize: "4rem", mb: 2, position: "relative", zIndex: 1, animation: "hpFloat 4s ease-in-out infinite" }}>🎁</Typography>
                      <Typography sx={{ fontWeight: 900, color: "#fff", fontSize: "1.5rem", mb: 0.5, textAlign: "center", position: "relative", zIndex: 1 }}>
                        ₹100 Off
                      </Typography>
                      <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", textAlign: "center", position: "relative", zIndex: 1 }}>
                        on your first order
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Right — form */}
                  <Grid size={{ xs: 12, md: 7 }}>
                    <Box sx={{ p: { xs: 3, md: 4.5 } }}>
                      <Typography sx={{ fontSize: "2.5rem", mb: 1.5, display: { md: "none" } }}>🎁</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", mb: 1, letterSpacing: "-0.025em" }}>
                        Get ₹100 off your first order
                      </Typography>
                      <Typography sx={{ color: MUTED, lineHeight: 1.7, mb: 3.5, fontSize: "0.9rem" }}>
                        Join 1,200+ craft lovers. Early access to new collections, exclusive deals &amp; handcrafted inspiration.
                      </Typography>
                      <Box component="form" onSubmit={(e) => { e.preventDefault(); navigate("/products"); }}
                        sx={{ display: "flex", gap: 1.5, flexDirection: { xs: "column", sm: "row" }, mb: 2 }}>
                        <TextField
                          type="email" placeholder="Enter your email address" aria-label="Email address"
                          value={emailValue} onChange={(e) => setEmailValue(e.target.value)}
                          size="small" fullWidth
                          sx={{
                            flex: 1,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "10px", bgcolor: BG, height: 44,
                              "& fieldset": { borderColor: BORDER },
                              "&:hover fieldset": { borderColor: P },
                              "&.Mui-focused fieldset": { borderColor: P },
                            },
                          }}
                        />
                        <Button type="submit" variant="contained" startIcon={<FiSend size={15} />}
                          sx={{
                            bgcolor: P, fontWeight: 700, px: 3, borderRadius: "10px",
                            whiteSpace: "nowrap", height: 44, fontSize: "0.875rem",
                            boxShadow: `0 4px 16px rgba(139,34,82,0.3)`,
                            "&:hover": { bgcolor: P_DARK, transform: "translateY(-1px)" },
                            transition: "all 0.25s",
                          }}>
                          Claim Offer
                        </Button>
                      </Box>
                      <Typography sx={{ fontSize: "0.75rem", color: MUTED }}>
                        No spam, ever. Unsubscribe anytime.
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Container>
          </Box>

          {/* ══ FINAL CTA (non-users) ════════════════════════════════════ */}
          {!user && (
            <Box component="section" sx={{
              background: `linear-gradient(150deg,${NAVY} 0%,#4A1030 50%,${NAVY} 100%)`,
              py: { xs: 8, md: 12 }, px: 2, textAlign: "center", position: "relative", overflow: "hidden",
              "&::before": {
                content: '""', position: "absolute", inset: 0,
                background: `radial-gradient(ellipse at 50% 0%,rgba(139,34,82,0.3) 0%,transparent 65%)`,
                pointerEvents: "none",
              },
            }}>
              <Box sx={{ maxWidth: 680, mx: "auto", position: "relative", zIndex: 1 }}>
                <Box sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.75, mb: 2.5,
                  px: 2, height: 34, borderRadius: "20px",
                  bgcolor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    ✦ Join the community
                  </Typography>
                </Box>

                <Typography variant="h3" sx={{
                  fontWeight: 900, color: "#fff", mb: 2, lineHeight: 1.18, letterSpacing: "-0.025em",
                  fontSize: { xs: "1.9rem", md: "2.5rem" },
                }}>
                  Be part of India's most loved<br />handcrafted gifting brand
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.62)", lineHeight: 1.75, mb: 4.5, fontSize: "0.9375rem" }}>
                  Save your wishlist, track orders, get personalised recommendations &amp; early access to limited editions.
                </Typography>

                <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center" sx={{ mb: 5 }}>
                  {["Save wishlists","Track orders","Exclusive deals","Early access"].map((p) => (
                    <Box key={p} sx={{
                      display: "inline-flex", alignItems: "center", gap: 0.75,
                      px: 1.75, height: 34, borderRadius: "20px",
                      bgcolor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                    }}>
                      <FiCheck style={{ width: 12, height: 12, color: GOLD }} />
                      <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{p}</Typography>
                    </Box>
                  ))}
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center">
                  <Button variant="contained" size="large" onClick={() => navigate("/register")}
                    sx={{
                      bgcolor: P, fontWeight: 700, px: 5, py: 1.5, borderRadius: "12px", fontSize: "0.9375rem",
                      boxShadow: `0 6px 24px rgba(139,34,82,0.45)`,
                      "&:hover": { bgcolor: P_DARK, transform: "translateY(-2px)" },
                      transition: "all 0.25s",
                    }}>
                    Create Free Account
                  </Button>
                  <Button variant="outlined" size="large" onClick={() => navigate("/login")}
                    sx={{
                      color: "rgba(255,255,255,0.8)", borderColor: "rgba(255,255,255,0.25)",
                      fontWeight: 700, px: 5, py: 1.5, borderRadius: "12px", fontSize: "0.9375rem",
                      bgcolor: "rgba(255,255,255,0.05)",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.1)", color: "#fff", borderColor: "rgba(255,255,255,0.45)" },
                      transition: "all 0.25s",
                    }}>
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
