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
  FiShoppingCart, FiHeart, FiStar, FiTruck, FiRefreshCw,
  FiLock, FiAward, FiArrowRight, FiCheck, FiPackage,
  FiSmartphone, FiGift, FiZap,
} from "react-icons/fi";
import "./Home.css";

/* ─── Static data ──────────────────────────────────────────────────────── */

const STATS = [
  { value: 1200, suffix: "+", label: "Happy Customers" },
  { value: 500,  suffix: "+", label: "Handmade Products" },
  { value: 28000, suffix: "+", label: "Pincodes Served" },
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
  { Icon: FiTruck,      title: "Free Shipping",     desc: "On orders above ₹999", color: "#7c3aed" },
  { Icon: FiRefreshCw,  title: "Easy Returns",      desc: "7-day hassle-free returns", color: "#059669" },
  { Icon: FiLock,       title: "Secure Payment",    desc: "100% encrypted checkout", color: "#0284c7" },
  { Icon: FiAward,      title: "Handcrafted",       desc: "Made with love & care", color: "#f59e0b" },
];

const PROCESS_STEPS = [
  { Icon: FiPackage,     step: "01", title: "Browse & Discover",   desc: "Explore 500+ unique handcrafted products across every category — from resin art to custom jewelry." },
  { Icon: FiGift,        step: "02", title: "Personalize It",       desc: "Add names, dates, or a heartfelt message. Make every gift uniquely yours." },
  { Icon: FiSmartphone,  step: "03", title: "Delivered with Love",  desc: "Crafted just for you and shipped in premium packaging to your doorstep." },
];

const TESTIMONIALS = [
  { name: "Priya S.",   location: "Mumbai",    rating: 5, verified: true, text: "The resin coasters I ordered were absolutely stunning. Quality far exceeded my expectations — everyone who sees them wants one!" },
  { name: "Rahul M.",   location: "Bangalore", rating: 5, verified: true, text: "Ordered a personalized gift hamper for Diwali — my entire team was in awe. The packaging alone made it feel luxurious." },
  { name: "Ananya K.",  location: "Chennai",   rating: 5, verified: true, text: "Fast delivery, beautiful packaging, and the customization was exactly what I envisioned. Will be a repeat customer for sure!" },
  { name: "Meera T.",   location: "Delhi",     rating: 5, verified: true, text: "Gifted an embroidery hoop to my mom for her birthday — she cried happy tears. The artistry and detail is unmatched." },
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
      setCount(Math.floor(eased * target));
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
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─── Sub-components ───────────────────────────────────────────────────── */

function StarRow({ count }) {
  return (
    <span className="hp-stars" aria-label={`${count} stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar key={i} className={i < count ? "hp-star--on" : "hp-star--off"} />
      ))}
    </span>
  );
}

function StatCounter({ value, suffix, label, animate }) {
  const count = useCountUp(value, 2200, animate);
  return (
    <div className="hp-stat">
      <span className="hp-stat-value">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="hp-stat-label">{label}</span>
    </div>
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
      if (wishlisted) {
        await api.delete(`/api/auth/wishlist/${productId}`);
        setWishlisted(false);
      } else {
        await api.post("/api/auth/wishlist", { productId });
        setWishlisted(true);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [wishlisted, productId, isAuthenticated]);

  return (
    <button
      className={`hp-wishlist-btn ${wishlisted ? "hp-wishlist-btn--active" : ""}`}
      onClick={toggle}
      disabled={loading}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <FiHeart />
    </button>
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

  const isLowStock = product.trackInventory && product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
  const isOutOfStock = product.trackInventory && product.stock === 0;
  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = useCallback(async (e) => {
    e.stopPropagation();
    if (isOutOfStock || adding) return;
    setAdding(true);
    await dispatch(optimisticAddToCart({ product, quantity: 1 }));
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [dispatch, product, isOutOfStock, adding]);

  return (
    <div
      className="hp-product-card"
      style={{ animationDelay: `${index * 0.07}s` }}
      onClick={() => navigate("/products")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate("/products")}
    >
      <div className="hp-product-img-wrap">
        <img src={imgSrc} alt={product.name} loading="lazy" decoding="async" />

        {/* Badges */}
        <div className="hp-product-badges">
          {discountPct > 0 && (
            <span className="hp-badge hp-badge--discount">{discountPct}% OFF</span>
          )}
          {product.isCustomizable && (
            <span className="hp-badge hp-badge--custom">✦ Custom</span>
          )}
        </div>

        {isLowStock && (
          <span className="hp-badge hp-badge--low-stock">Only {product.stock} left!</span>
        )}
        {isOutOfStock && (
          <div className="hp-out-of-stock-overlay">Sold Out</div>
        )}

        {/* Hover overlay with quick-add */}
        <div className="hp-product-hover-overlay">
          <button
            className={`hp-quick-add ${added ? "hp-quick-add--added" : ""}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            aria-label="Add to cart"
          >
            {added ? (
              <><FiCheck /> Added!</>
            ) : adding ? (
              <span className="hp-spinner" />
            ) : (
              <><FiShoppingCart /> Add to Cart</>
            )}
          </button>
        </div>

        <WishlistButton productId={product._id} />
      </div>

      <div className="hp-product-info">
        {product.averageRating > 0 && (
          <div className="hp-product-rating">
            <StarRow count={Math.round(product.averageRating)} />
            <span className="hp-product-rating-count">({product.ratingCount || 0})</span>
          </div>
        )}
        <p className="hp-product-name">{product.name}</p>
        <div className="hp-product-pricing">
          <span className="hp-product-price">₹{product.price?.toLocaleString()}</span>
          {product.originalPrice > product.price && (
            <span className="hp-product-original-price">₹{product.originalPrice?.toLocaleString()}</span>
          )}
        </div>
        {product.isCustomizable && (
          <span className="hp-product-custom-tag">✦ Personalizable</span>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────── */

export default function Home() {
  const navigate = useNavigate();
  const { data: products = [], loading } = useProducts();
  const user = useSelector((state) => state.auth.user);

  const [statsRef, statsInView] = useInView(0.3);
  const [storyRef, storyInView] = useInView(0.2);
  const [processRef, processInView] = useInView(0.2);

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

  return (
    <>
      <SEOHead
        title={`${SEO_CONFIG.SITE_NAME} — Handcrafted Gifts & Custom Products`}
        description="Discover premium handcrafted products at InfinityCraftSpace. Custom resin art, personalized gifts, craft supplies and more — delivered across India."
        url={SEO_CONFIG.SITE_URL}
        canonical={SEO_CONFIG.SITE_URL}
      />
      <div className="App">
        <Header />
        <main className="hp-main">

          {/* ══ HERO ══════════════════════════════════════════════════════ */}
          <section className="hp-hero" aria-label="Hero">
            {/* Floating decorative elements */}
            <div className="hp-floats" aria-hidden="true">
              {FLOATING_ELEMENTS.map((el, i) => (
                <span key={i} className={`hp-float hp-float--${i + 1}`}>{el}</span>
              ))}
            </div>

            <div className="hp-hero-inner">
              <div className="hp-hero-content hp-fade-up">
                <span className="hp-eyebrow">
                  <span className="hp-eyebrow-dot" />
                  Handmade with Love in India
                </span>

                <h1 className="hp-hero-heading">
                  Gifts that carry<br />
                  <span className="hp-hero-accent">a lifetime</span> of<br />
                  memories
                </h1>

                <p className="hp-hero-body">
                  Personalized resin art, custom jewelry, embroidery hoops &
                  thoughtful gifting hampers — each piece crafted by hand,
                  delivered with care.
                </p>

                <div className="hp-hero-actions">
                  <button
                    className="hp-btn hp-btn--primary hp-btn--lg"
                    onClick={() => navigate("/products")}
                  >
                    <FiGift /> Explore Collection
                  </button>
                  <button
                    className="hp-btn hp-btn--ghost hp-btn--lg"
                    onClick={() => navigate("/products?customizable=true")}
                  >
                    Personalize Yours <FiArrowRight />
                  </button>
                </div>

                {/* Social proof */}
                <div className="hp-hero-social-proof">
                  <div className="hp-hero-avatars" aria-hidden="true">
                    {["P", "R", "A", "K", "M"].map((l, i) => (
                      <span key={i} className="hp-avatar">{l}</span>
                    ))}
                  </div>
                  <div>
                    <div className="hp-hero-proof-stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar key={i} className="hp-star--on" style={{ width: 13, height: 13 }} />
                      ))}
                    </div>
                    <span className="hp-hero-proof-text">
                      <strong>1,200+ happy customers</strong> across India
                    </span>
                  </div>
                </div>
              </div>

              {/* Right — Stats + Visual */}
              <div className="hp-hero-right">
                {/* Product image showcase */}
                <div className="hp-hero-blob" aria-hidden="true">
                  <div className="hp-hero-blob-inner hp-hero-blob-inner--img">
                    {featured[0] ? (
                      <img
                        src={buildCloudinaryUrl(
                          featured[0].images?.[0]?.url || featured[0].image?.url || featured[0].image,
                          480,
                        )}
                        alt={featured[0].name}
                        className="hp-hero-product-img"
                        loading="eager"
                        decoding="async"
                      />
                    ) : (
                      <span className="hp-hero-blob-emoji">🎁</span>
                    )}
                  </div>
                  <div className="hp-hero-blob-ring hp-hero-blob-ring--1" />
                  <div className="hp-hero-blob-ring hp-hero-blob-ring--2" />
                  {/* Mini product collage — 2nd & 3rd product thumbnails */}
                  {featured[1] && (
                    <div className="hp-hero-mini-card hp-hero-mini-card--tl">
                      <img
                        src={buildCloudinaryUrl(
                          featured[1].images?.[0]?.url || featured[1].image?.url || featured[1].image,
                          160,
                        )}
                        alt={featured[1].name}
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                  )}
                  {featured[2] && (
                    <div className="hp-hero-mini-card hp-hero-mini-card--br">
                      <img
                        src={buildCloudinaryUrl(
                          featured[2].images?.[0]?.url || featured[2].image?.url || featured[2].image,
                          160,
                        )}
                        alt={featured[2].name}
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                  )}
                </div>

                {/* Floating stat cards */}
                <div className="hp-hero-stat-card hp-hero-stat-card--top" aria-hidden="true">
                  <span className="hp-hero-stat-emoji">⭐</span>
                  <div>
                    <div className="hp-hero-stat-val">4.9/5</div>
                    <div className="hp-hero-stat-lbl">Average Rating</div>
                  </div>
                </div>
                <div className="hp-hero-stat-card hp-hero-stat-card--bottom" aria-hidden="true">
                  <span className="hp-hero-stat-emoji">🚀</span>
                  <div>
                    <div className="hp-hero-stat-val">2–5 Days</div>
                    <div className="hp-hero-stat-lbl">Pan-India Delivery</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="hp-hero-stats" ref={statsRef}>
              {STATS.map((stat) => (
                <StatCounter key={stat.label} {...stat} animate={statsInView} />
              ))}
            </div>
          </section>

          {/* ══ TRUST STRIP ═══════════════════════════════════════════════ */}
          <section className="hp-trust-strip" aria-label="Why shop with us">
            {TRUST_ITEMS.map(({ Icon, title, desc, color }) => (
              <div key={title} className="hp-trust-item">
                <div className="hp-trust-icon-wrap" style={{ "--trust-color": color }}>
                  <Icon />
                </div>
                <div>
                  <p className="hp-trust-title">{title}</p>
                  <p className="hp-trust-desc">{desc}</p>
                </div>
              </div>
            ))}
          </section>

          {/* ══ OCCASIONS ═════════════════════════════════════════════════ */}
          <section className="hp-section hp-occasions-section">
            <div className="hp-section-header">
              <div>
                <p className="hp-section-eyebrow">Find the perfect gift</p>
                <h2 className="hp-section-title">Shop by Occasion</h2>
              </div>
              <button className="hp-section-link" onClick={() => navigate("/products")}>
                View all <FiArrowRight />
              </button>
            </div>
            <div className="hp-occasions-grid">
              {OCCASIONS.map((occ, i) => (
                <button
                  key={occ.label}
                  className="hp-occasion-card"
                  style={{ animationDelay: `${i * 0.08}s` }}
                  onClick={() => navigate(`/products?q=${encodeURIComponent(occ.query)}`)}
                  aria-label={`Shop ${occ.label} gifts`}
                >
                  <span className="hp-occasion-emoji">{occ.emoji}</span>
                  <span className="hp-occasion-label">{occ.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ══ CATEGORIES ════════════════════════════════════════════════ */}
          {categories.length > 0 && (
            <section className="hp-section hp-categories-section">
              <div className="hp-section-header">
                <div>
                  <p className="hp-section-eyebrow">Explore our collections</p>
                  <h2 className="hp-section-title">Shop by Category</h2>
                </div>
                <button className="hp-section-link" onClick={() => navigate("/products")}>
                  See all <FiArrowRight />
                </button>
              </div>
              <div className="hp-categories-grid">
                {categories.map((cat, i) => (
                  <button
                    key={cat.name}
                    className={`hp-category-tile ${i === 0 ? "hp-category-tile--featured" : ""}`}
                    onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                    aria-label={`Browse ${cat.name}`}
                  >
                    <div className="hp-category-img-wrap">
                      {cat.img ? (
                        <img
                          src={buildCloudinaryUrl(cat.img, 600) || cat.img}
                          alt={cat.name}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="hp-category-placeholder" aria-hidden="true">🎁</div>
                      )}
                      <div className="hp-category-overlay" />
                    </div>
                    <div className="hp-category-content">
                      <span className="hp-category-name">{cat.name}</span>
                      <span className="hp-category-count">{cat.count} products</span>
                      <span className="hp-category-cta">Explore <FiArrowRight /></span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ══ BESTSELLERS ═══════════════════════════════════════════════ */}
          {!loading && featured.length > 0 && (
            <section className="hp-section hp-bestsellers-section">
              <div className="hp-section-header">
                <div>
                  <p className="hp-section-eyebrow">
                    {bestsellers.length ? "Customer favourites" : "Handpicked for you"}
                  </p>
                  <h2 className="hp-section-title">
                    {bestsellers.length ? "⭐ Bestsellers" : "Featured Products"}
                  </h2>
                </div>
                <button className="hp-section-link" onClick={() => navigate("/products")}>
                  View all <FiArrowRight />
                </button>
              </div>
              <div className="hp-products-grid">
                {featured.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} />
                ))}
              </div>
              <div className="hp-preview-cta">
                <button
                  className="hp-btn hp-btn--outline hp-btn--lg"
                  onClick={() => navigate("/products")}
                >
                  Browse All Products <FiArrowRight />
                </button>
              </div>
            </section>
          )}

          {/* ══ STORYTELLING ══════════════════════════════════════════════ */}
          <section className="hp-story-section" ref={storyRef}>
            <div className={`hp-story-inner ${storyInView ? "hp-in-view" : ""}`}>
              <div className="hp-story-visual">
                <div className="hp-story-blob">
                  <span className="hp-story-emoji">🖌️</span>
                </div>
                <div className="hp-story-badge">
                  <FiCheck /> 100% Handcrafted
                </div>
              </div>
              <div className="hp-story-content">
                <p className="hp-section-eyebrow">Our Story</p>
                <h2 className="hp-section-title">Crafted with Love,<br />Made to Last Forever</h2>
                <p className="hp-story-text">
                  Every product at InfinityCraftSpace begins as an idea — then becomes something you
                  can hold, feel, and treasure. Our artisans pour hours of skill and heart into each
                  piece, ensuring it carries emotions that mass-produced items never can.
                </p>
                <p className="hp-story-text">
                  From a personalized resin coaster for your best friend's kitchen, to a hand-embroidered
                  hoop commemorating your wedding date — we believe gifts should tell stories, not just
                  fill boxes.
                </p>
                <div className="hp-story-pillars">
                  {[
                    { icon: "🌿", text: "Sustainably sourced materials" },
                    { icon: "✋", text: "Every piece individually handcrafted" },
                    { icon: "📦", text: "Premium gifting-ready packaging" },
                  ].map((p) => (
                    <div key={p.text} className="hp-story-pillar">
                      <span>{p.icon}</span>
                      <span>{p.text}</span>
                    </div>
                  ))}
                </div>
                <button
                  className="hp-btn hp-btn--primary"
                  onClick={() => navigate("/products")}
                >
                  Discover Our Craft <FiArrowRight />
                </button>
              </div>
            </div>
          </section>

          {/* ══ HOW IT WORKS ══════════════════════════════════════════════ */}
          <section className="hp-process-section" ref={processRef}>
            <div className="hp-section-header hp-section-header--center">
              <p className="hp-section-eyebrow">Simple & joyful</p>
              <h2 className="hp-section-title">How It Works</h2>
            </div>
            <div className="hp-process-grid">
              {PROCESS_STEPS.map(({ Icon, step, title, desc }, i) => (
                <div
                  key={step}
                  className={`hp-process-card ${processInView ? "hp-in-view" : ""}`}
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="hp-process-number">{step}</div>
                  <div className="hp-process-icon-wrap">
                    <Icon />
                  </div>
                  <h3 className="hp-process-title">{title}</h3>
                  <p className="hp-process-desc">{desc}</p>
                  {i < PROCESS_STEPS.length - 1 && (
                    <div className="hp-process-connector" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ══ PERSONALIZATION BANNER ════════════════════════════════════ */}
          <section className="hp-custom-banner">
            <div className="hp-custom-banner-deco" aria-hidden="true">
              {["💍", "🎨", "🌹", "✨", "🎁", "💕"].map((e, i) => (
                <span key={i} className={`hp-custom-deco-el hp-custom-deco-el--${i + 1}`}>{e}</span>
              ))}
            </div>
            <div className="hp-custom-banner-inner">
              <span className="hp-custom-banner-tag">✦ Made Just for You</span>
              <h2 className="hp-custom-banner-title">
                Want something truly<br />one-of-a-kind?
              </h2>
              <p className="hp-custom-banner-desc">
                Add names, dates, photos, or a heartfelt message. Perfect for
                birthdays, anniversaries, weddings & corporate gifting.
              </p>
              <div className="hp-custom-banner-occasions">
                {["Wedding", "Birthday", "Anniversary", "Corporate", "Baby Shower"].map((occ) => (
                  <span key={occ} className="hp-custom-occ-tag">{occ}</span>
                ))}
              </div>
              <button
                className="hp-btn hp-btn--white hp-btn--lg"
                onClick={() => navigate("/products?customizable=true")}
              >
                <FiGift /> Shop Personalized Gifts
              </button>
            </div>
          </section>

          {/* ══ TESTIMONIALS ══════════════════════════════════════════════ */}
          <section className="hp-section hp-testimonials-section">
            <div className="hp-section-header hp-section-header--center">
              <p className="hp-section-eyebrow">Real stories, real love</p>
              <h2 className="hp-section-title">What Our Customers Say</h2>
            </div>
            <div className="hp-testimonials-grid">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={t.name}
                  className="hp-testimonial-card"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="hp-testimonial-top">
                    <StarRow count={t.rating} />
                    {t.verified && (
                      <span className="hp-verified-badge">
                        <FiCheck /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="hp-testimonial-text">"{t.text}"</p>
                  <div className="hp-testimonial-author">
                    <span className="hp-testimonial-avatar">{t.name[0]}</span>
                    <div>
                      <p className="hp-testimonial-name">{t.name}</p>
                      <p className="hp-testimonial-location">📍 {t.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ══ RECENTLY VIEWED ═══════════════════════════════════════════ */}
          <RecentlyViewed />

          {/* ══ NEWSLETTER ════════════════════════════════════════════════ */}
          <section className="hp-newsletter-section">
            <div className="hp-newsletter-inner">
              <div className="hp-newsletter-icon" aria-hidden="true">🎁</div>
              <h2 className="hp-newsletter-title">
                Get ₹100 off your first order
              </h2>
              <p className="hp-newsletter-desc">
                Join 1,200+ craft lovers. Early access to new collections,
                exclusive deals & handcrafted inspiration — straight to your inbox.
              </p>
              <form
                className="hp-newsletter-form"
                onSubmit={(e) => { e.preventDefault(); navigate("/products"); }}
              >
                <input
                  type="email"
                  className="hp-newsletter-input"
                  placeholder="Enter your email address"
                  aria-label="Email address"
                />
                <button type="submit" className="hp-btn hp-btn--primary">
                  <FiZap /> Claim ₹100 Off
                </button>
              </form>
              <p className="hp-newsletter-disclaimer">
                No spam, ever. Unsubscribe anytime.
              </p>
            </div>
          </section>

          {/* ══ FINAL CTA (non-users) ════════════════════════════════════ */}
          {!user && (
            <section className="hp-cta-section">
              <div className="hp-cta-inner">
                <span className="hp-eyebrow" style={{ justifyContent: "center" }}>
                  <span className="hp-eyebrow-dot" />
                  Join the community
                </span>
                <h2 className="hp-cta-title">
                  Be part of India's most loved<br />handcrafted gifting brand
                </h2>
                <p className="hp-cta-desc">
                  Save your wishlist, track orders, get personalised recommendations
                  & early access to limited editions.
                </p>
                <div className="hp-cta-perks">
                  {["Save wishlists", "Track orders", "Exclusive deals", "Early access"].map((p) => (
                    <span key={p} className="hp-cta-perk"><FiCheck /> {p}</span>
                  ))}
                </div>
                <div className="hp-cta-actions">
                  <button
                    className="hp-btn hp-btn--primary hp-btn--lg"
                    onClick={() => navigate("/register")}
                  >
                    Create Free Account
                  </button>
                  <button
                    className="hp-btn hp-btn--ghost hp-btn--lg"
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </section>
          )}

        </main>
      </div>
    </>
  );
}
