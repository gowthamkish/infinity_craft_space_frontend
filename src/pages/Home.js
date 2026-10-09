import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Header from "../components/Header";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import { useGetProductsQuery, useGetPopularProductsQuery } from "../services/productsApi";
import {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "../services/accountApi";
import { buildCloudinaryUrl } from "../components/OptimizedImage";
import { PLACEHOLDER_SRC, onImgError } from "../utils/imageFallback";
import { optimisticAddToCart } from "../features/cartSlice";
import { useNewsletterSignup } from "../hooks/useNewsletterSignup";
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
  FiGift,
  FiSmartphone,
} from "react-icons/fi";
import "../styles/ember.css";
import "./home.css";

/* ─── Static content ───────────────────────────────────────────────────── */
const FESTIVALS = [
  { name: "Mother's Day",       emoji: "💐", query: "Mother",         date: new Date(2026, 4, 10) },
  { name: "Buddha Purnima",     emoji: "🙏", query: "Buddha Purnima", date: new Date(2026, 4, 23) },
  { name: "Eid al-Adha",        emoji: "🌙", query: "Eid",            date: new Date(2026, 5, 6) },
  { name: "Father's Day",       emoji: "👔", query: "Father",         date: new Date(2026, 5, 21) },
  { name: "Raksha Bandhan",     emoji: "🪢", query: "Rakhi",          date: new Date(2026, 7, 9) },
  { name: "Independence Day",   emoji: "🇮🇳", query: "Independence",   date: new Date(2026, 7, 15) },
  { name: "Ganesh Chaturthi",   emoji: "🐘", query: "Ganesh",         date: new Date(2026, 8, 14) },
  { name: "Dussehra",           emoji: "🏹", query: "Dussehra",       date: new Date(2026, 9, 2) },
  { name: "Diwali",             emoji: "🪔", query: "Diwali",         date: new Date(2026, 9, 20) },
  { name: "Christmas",          emoji: "🎄", query: "Christmas",      date: new Date(2026, 11, 25) },
];

function getUpcomingFestival() {
  const now = new Date();
  const upcoming = FESTIVALS.filter((f) => f.date > now).sort((a, b) => a.date - b.date)[0];
  if (!upcoming) return null;
  const days = Math.ceil((upcoming.date - now) / (1000 * 60 * 60 * 24));
  return days <= 45 ? { ...upcoming, days } : null;
}

const STATS = [
  { value: 1200,  suffix: "+",  label: "Happy Customers",   icon: "😊" },
  { value: 500,   suffix: "+",  label: "Handmade Products", icon: "🎨" },
  { value: 28000, suffix: "+",  label: "Pincodes Served",   icon: "📦" },
  { value: 4.9,   suffix: "/5", label: "Avg. Rating",       icon: "⭐" },
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
  { Icon: FiTruck,     title: "Free Shipping",  desc: "On every order above ₹999, delivered across India." },
  { Icon: FiRefreshCw, title: "Easy Returns",   desc: "7-day hassle-free returns if something isn't right." },
  { Icon: FiLock,      title: "Secure Payment", desc: "100% encrypted checkout powered by Razorpay." },
  { Icon: FiAward,     title: "Handcrafted",    desc: "Every piece is made by hand, with love and care." },
];

const PROCESS_STEPS = [
  { Icon: FiPackage,    step: "01", title: "Browse & Discover",  desc: "Explore 500+ unique handcrafted products across every category — from resin art to custom jewelry." },
  { Icon: FiGift,       step: "02", title: "Personalize It",     desc: "Add names, dates, or a heartfelt message. Make every gift uniquely yours." },
  { Icon: FiSmartphone, step: "03", title: "Delivered with Love", desc: "Crafted just for you and shipped in premium packaging to your doorstep." },
];

const STORY_POINTS = [
  { icon: "🌿", text: "Sustainably sourced materials" },
  { icon: "✋", text: "Every piece individually handcrafted" },
  { icon: "📦", text: "Premium gifting-ready packaging" },
];

const TESTIMONIALS = [
  { name: "Priya S.",  location: "Mumbai",    rating: 5, text: "The resin coasters I ordered were absolutely stunning. Quality far exceeded my expectations — everyone who sees them wants one!" },
  { name: "Rahul M.",  location: "Bangalore", rating: 5, text: "Ordered a personalized gift hamper for Diwali — my entire team was in awe. The packaging alone made it feel luxurious." },
  { name: "Ananya K.", location: "Chennai",   rating: 5, text: "Fast delivery, beautiful packaging, and the customization was exactly what I envisioned. Will be a repeat customer for sure!" },
  { name: "Meera T.",  location: "Delhi",     rating: 5, text: "Gifted an embroidery hoop to my mom for her birthday — she cried happy tears. The artistry and detail is unmatched." },
  { name: "Kavita R.", location: "Hyderabad", rating: 5, text: "Ordered a custom resin tray for my sister's wedding — it was the highlight of all the gifts. Absolutely gorgeous!" },
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

const EMPTY_LIST = []; // stable reference so memoised sections don't re-run while loading

/* ─── Hooks ────────────────────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Browsers without IntersectionObserver just show everything
    if (typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useCountUp(target, start, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    let raf;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * target).toFixed(target < 10 ? 1 : 0)));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return count;
}

/* ─── Small building blocks ────────────────────────────────────────────── */
/** Fades + slides its children in once, when they scroll into view. */
function Reveal({ children, delay = 0, className = "", as: Tag = "div", ...rest }) {
  const [ref, inView] = useInView(0.12);
  return (
    <Tag
      ref={ref}
      className={`hm-reveal ${inView ? "is-visible" : ""} ${className}`.trim()}
      style={{ "--d": `${delay}s` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function SectionHead({ eyebrow, title, sub, teal = false, action }) {
  return (
    <Reveal className={`hm-head ${action ? "hm-head--row" : ""}`}>
      <div>
        <span className={`hm-eyebrow ${teal ? "hm-eyebrow--teal" : ""}`}>{eyebrow}</span>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {action}
    </Reveal>
  );
}

function Stars({ count, total }) {
  return (
    <div className="hm-stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar key={i} className={i < count ? "on" : "off"} />
      ))}
      {total != null && <span>({total})</span>}
    </div>
  );
}

function Stat({ value, suffix, label, icon, animate }) {
  const count = useCountUp(value, animate);
  return (
    <div className="hm-stat">
      <div className="hm-stat-icon" aria-hidden="true">{icon}</div>
      <div className="hm-stat-num">
        {value < 10 ? count.toFixed(1) : count.toLocaleString("en-IN")}{suffix}
      </div>
      <div className="hm-stat-lbl">{label}</div>
    </div>
  );
}

/* ─── Product card ─────────────────────────────────────────────────────── */
function ProductCard({ product, delay = 0 }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s) => !!s.auth.user);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Shared, de-duplicated wishlist query: hearts show the real saved state and flip optimistically.
  const { data: wishlist } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const wishlisted = !!wishlist?.some((p) => (typeof p === "object" ? p._id : p) === product._id);
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const imgSrc =
    buildCloudinaryUrl(product.images?.[0]?.url || product.image?.url || product.image, 520) ||
    PLACEHOLDER_SRC;

  const isOutOfStock = product.trackInventory && product.stock === 0;
  const isLowStock = product.trackInventory && product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
  const discountPct =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;

  // Products that need a choice (size / colour / personalisation) go to the detail page
  const needsOptions =
    (product.showHoopSizePicker && product.hoopSizes?.length > 0) ||
    (product.showColorPickerToUsers && (product.colors || []).some((c) => c.visibleToUsers)) ||
    product.isCustomizable;
  const detailPath = `/product/${product._id}`;

  const handleAdd = useCallback(
    async (e) => {
      e.stopPropagation();
      if (isOutOfStock || adding) return;
      if (needsOptions) { navigate(detailPath); return; }
      setAdding(true);
      await dispatch(optimisticAddToCart({ product, quantity: 1 }));
      setAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    },
    [dispatch, navigate, product, isOutOfStock, adding, needsOptions, detailPath],
  );

  const handleHeart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate("/login"); return; }
    try {
      if (wishlisted) await removeFromWishlist(product._id).unwrap();
      else await addToWishlist({ product }).unwrap();
    } catch { /* optimistic change is rolled back automatically */ }
  };

  return (
    <Reveal as="article" delay={delay} className="hm-pcard" onClick={() => navigate(detailPath)}>
      <div className="hm-pmedia">
        <img src={imgSrc} alt={product.name} loading="lazy" decoding="async" onError={onImgError} />

        <div className="hm-badges">
          {discountPct > 0 && <span className="hm-badge">{discountPct}% OFF</span>}
          {product.isCustomizable && <span className="hm-badge hm-badge--teal">✦ Custom</span>}
          {isLowStock && <span className="hm-badge hm-badge--warn">Only {product.stock} left</span>}
        </div>

        <button
          type="button"
          className={`hm-heart ${wishlisted ? "is-on" : ""}`}
          onClick={handleHeart}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
        >
          <FiHeart size={16} />
        </button>

        {isOutOfStock && <div className="hm-soldout">Sold out</div>}
      </div>

      <div className="hm-pbody">
        {product.category && <span className="hm-pcat">{product.category}</span>}
        <Link to={detailPath} className="hm-ptitle" onClick={(e) => e.stopPropagation()}>
          {product.name}
        </Link>
        {product.averageRating > 0 && <Stars count={Math.round(product.averageRating)} total={product.ratingCount || 0} />}

        <div className="hm-pfoot">
          <span className="hm-price">
            ₹{product.price?.toLocaleString("en-IN")}
            {discountPct > 0 && <small>₹{product.compareAtPrice?.toLocaleString("en-IN")}</small>}
          </span>
          <button
            type="button"
            className={`hm-add ${added ? "is-done" : ""}`}
            onClick={handleAdd}
            disabled={isOutOfStock || adding}
          >
            {added ? <FiCheck size={14} /> : <FiShoppingCart size={14} />}
            {added ? "Added" : adding ? "Adding…" : needsOptions ? "Customise" : "Add"}
          </button>
        </div>
      </div>
    </Reveal>
  );
}

function ProductSkeletons({ count = 8 }) {
  return (
    <div className="hm-products" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="hm-skel">
          <div className="hm-skel-img" />
          <div className="hm-skel-body">
            <div className="hm-skel-line" style={{ width: "35%" }} />
            <div className="hm-skel-line" style={{ width: "85%" }} />
            <div className="hm-skel-line" style={{ width: "50%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { data: productsPage, isLoading: loading } = useGetProductsQuery(undefined, { refetchOnFocus: true });
  const products = productsPage?.products ?? EMPTY_LIST;
  const { data: popularData } = useGetPopularProductsQuery({ limit: 4 });
  const popular = (popularData ?? EMPTY_LIST).slice(0, 4);

  const [statsRef, statsInView] = useInView(0.3);
  const newsletter = useNewsletterSignup("home");

  // One pass over the catalogue: first image + product count per category
  const categories = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      if (!p.category) continue;
      const entry = map.get(p.category);
      if (entry) entry.count += 1;
      else map.set(p.category, { name: p.category, img: p.images?.[0]?.url || p.image?.url || p.image, count: 1 });
    }
    return [...map.values()].slice(0, 6);
  }, [products]);

  const featured = useMemo(() => {
    const rated = products
      .filter((p) => p.averageRating > 0 && p.stock !== 0)
      .sort((a, b) => b.averageRating - a.averageRating || b.ratingCount - a.ratingCount);
    return (rated.length ? rated : products).slice(0, 8);
  }, [products]);

  const collage = useMemo(
    () => featured.filter((p) => p.images?.[0]?.url || p.image?.url || p.image).slice(0, 3),
    [featured],
  );

  const festival = getUpcomingFestival();
  const goShop = (query = "") => navigate(`/products${query}`);

  return (
    <>
      <SEOHead
        title={`${SEO_CONFIG.SITE_NAME} — Handcrafted Gifts & Custom Products`}
        description="Discover premium handcrafted products at InfinityCraftSpace. Custom resin art, personalized gifts, craft supplies and more — delivered across India."
        url={SEO_CONFIG.SITE_URL}
        canonical={SEO_CONFIG.SITE_URL}
        type="website"
        image={SEO_CONFIG.DEFAULT_IMAGE}
      />
      <div className="App hm">
        <Header />

        {/* ══ FESTIVAL BANNER ═════════════════════════════════════════════ */}
        {festival && (
          <div className="hm-festival" role="banner">
            <span className="hm-festival-emoji" aria-hidden="true">{festival.emoji}</span>
            <span>
              <strong>
                {festival.days === 1 ? "Tomorrow is" : festival.days <= 7 ? `${festival.days} days to` : "Coming up —"}{" "}
                {festival.name}
              </strong>
              {" · "}Find the perfect handcrafted gift
            </span>
            <button
              type="button"
              className="hm-btn hm-btn--primary hm-btn--sm"
              onClick={() => goShop(`?q=${encodeURIComponent(festival.query)}`)}
            >
              Shop Gifts <FiArrowRight size={13} />
            </button>
          </div>
        )}

        <main>
          {/* ══ HERO ═══════════════════════════════════════════════════════ */}
          <section className="hm-hero" aria-label="Hero">
            <div className="hm-hero-grid" aria-hidden="true" />
            <div className="hm-orb hm-orb--1" aria-hidden="true" />
            <div className="hm-orb hm-orb--2" aria-hidden="true" />

            <div className="hm-container hm-hero-inner">
              <div>
                <span className="hm-eyebrow">Handmade with love in India</span>
                <h1>
                  Gifts that carry <span className="hm-grad-text hm-nowrap">a lifetime</span> of memories
                </h1>
                <p className="hm-hero-sub">
                  Personalized resin art, custom jewelry, embroidery hoops &amp; thoughtful gifting hampers — each
                  piece crafted by hand and delivered with care.
                </p>
                <div className="hm-hero-cta">
                  <button type="button" className="hm-btn hm-btn--primary hm-btn--lg" onClick={() => goShop()}>
                    <FiGift /> Explore Collection
                  </button>
                  <button
                    type="button"
                    className="hm-btn hm-btn--ghost hm-btn--lg"
                    onClick={() => goShop("?customizable=true")}
                  >
                    Personalize a Gift <FiArrowRight />
                  </button>
                </div>
                <div className="hm-hero-stats">
                  <div className="hm-hero-stat"><div className="num">1,200+</div><div className="lbl">Happy customers</div></div>
                  <div className="hm-hero-stat"><div className="num">500+</div><div className="lbl">Handmade products</div></div>
                  <div className="hm-hero-stat"><div className="num">4.9/5</div><div className="lbl">Avg. rating</div></div>
                </div>
              </div>

              <div className="hm-collage" aria-hidden={collage.length === 0}>
                <div className="hm-frame">
                  {[0, 1, 2].map((i) => {
                    const p = collage[i];
                    const src = p && buildCloudinaryUrl(p.images?.[0]?.url || p.image?.url || p.image, 520);
                    return (
                      <div key={i} className={`hm-frame-tile ${src ? "" : "hm-frame-tile--empty"}`}>
                        {src ? (
                          <>
                            <img src={src} alt={p.name} loading={i === 0 ? "eager" : "lazy"} decoding="async" onError={onImgError} />
                            <span className="hm-frame-tag">{p.name}</span>
                          </>
                        ) : (
                          <span aria-hidden="true">{["🎨", "💍", "🎁"][i]}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="hm-chip hm-chip--a"><span className="mini">⭐</span>4.9/5 · 1,200+ reviews</div>
                <div className="hm-chip hm-chip--teal hm-chip--b"><span className="mini">🚚</span>Free shipping ₹999+</div>
                <div className="hm-chip hm-chip--c"><span className="mini">✋</span>100% handmade</div>
              </div>
            </div>
          </section>

          {/* ══ MARQUEE ════════════════════════════════════════════════════ */}
          <div className="hm-marquee-wrap" aria-label="Store highlights">
            <div className="hm-marquee">
              <div className="hm-marquee-track">
                {[0, 1].map((g) => (
                  <div className="hm-marquee-group" key={g} aria-hidden={g === 1}>
                    {MARQUEE_ITEMS.map((t) => <span key={`${g}-${t}`}>{t}</span>)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══ SHOP BY CATEGORY ═══════════════════════════════════════════ */}
          {categories.length > 0 && (
            <section className="hm-section">
              <div className="hm-container">
                <SectionHead
                  eyebrow="Explore our collections"
                  title="Shop by category"
                  action={
                    <Link to="/products" className="hm-link">View all products <FiArrowRight size={15} /></Link>
                  }
                />
                <div className="hm-cats">
                  {categories.map((cat, i) => {
                    const src = cat.img && buildCloudinaryUrl(cat.img, 640);
                    return (
                      <Reveal
                        key={cat.name}
                        as="button"
                        type="button"
                        delay={i * 0.06}
                        className={`hm-cat ${src ? "" : "hm-cat--plain"}`}
                        onClick={() => goShop(`?category=${encodeURIComponent(cat.name)}`)}
                        aria-label={`Shop ${cat.name}`}
                      >
                        {src ? <img src={src} alt="" loading="lazy" decoding="async" onError={onImgError} /> : <span aria-hidden="true">🎨</span>}
                        <span className="hm-cat-body">
                          <span>
                            <span className="hm-cat-name" style={{ display: "block" }}>{cat.name}</span>
                            <span className="hm-cat-count" style={{ display: "block" }}>
                              {cat.count} {cat.count === 1 ? "product" : "products"}
                            </span>
                          </span>
                          <span className="hm-cat-arrow"><FiArrowRight size={16} /></span>
                        </span>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ══ BESTSELLERS ════════════════════════════════════════════════ */}
          <section className="hm-section hm-section--alt">
            <div className="hm-container">
              <SectionHead
                eyebrow="Customer favourites"
                title="Our bestsellers"
                sub="The pieces our customers keep coming back for."
                action={<Link to="/products" className="hm-link">Shop everything <FiArrowRight size={15} /></Link>}
              />
              {loading ? (
                <ProductSkeletons />
              ) : featured.length > 0 ? (
                <div className="hm-products">
                  {featured.map((p, i) => <ProductCard key={p._id} product={p} delay={(i % 4) * 0.07} />)}
                </div>
              ) : (
                <Reveal className="hm-card" style={{ textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
                  <h3>New pieces landing soon</h3>
                  <p style={{ marginBottom: 20 }}>Our artisans are busy crafting. Check back shortly.</p>
                  <button type="button" className="hm-btn hm-btn--primary" onClick={() => goShop()}>Browse the shop</button>
                </Reveal>
              )}
            </div>
          </section>

          {/* ══ SHOP BY OCCASION ═══════════════════════════════════════════ */}
          <section className="hm-section">
            <div className="hm-container">
              <SectionHead
                eyebrow="Find the perfect gift"
                title="Shop by occasion"
                sub="Whatever you're celebrating, there's a handmade piece for it."
                teal
              />
              <div className="hm-occs">
                {OCCASIONS.map((o, i) => (
                  <Reveal
                    key={o.label}
                    as="button"
                    type="button"
                    delay={i * 0.05}
                    className="hm-occ"
                    onClick={() => goShop(`?q=${encodeURIComponent(o.query)}`)}
                  >
                    <span className="hm-occ-emoji" aria-hidden="true">{o.emoji}</span>
                    {o.label}
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ══ CURRENTLY POPULAR (only when the API has data) ═════════════ */}
          {popular.length > 0 && (
            <section className="hm-section hm-section--alt">
              <div className="hm-container">
                <SectionHead
                  eyebrow="Flying off the shelves"
                  title="Currently popular"
                  action={<Link to="/products" className="hm-link">View all <FiArrowRight size={15} /></Link>}
                />
                <div className="hm-products">
                  {popular.map((p, i) => <ProductCard key={p._id} product={p} delay={i * 0.07} />)}
                </div>
              </div>
            </section>
          )}

          {/* ══ WHY US ═════════════════════════════════════════════════════ */}
          <section className="hm-section">
            <div className="hm-container">
              <SectionHead
                eyebrow="Why shop with us"
                title="Made with care, delivered with confidence"
                sub="From the first click to your doorstep, we keep it simple and trustworthy."
              />
              <div className="hm-features">
                {TRUST_ITEMS.map(({ Icon, title, desc }, i) => (
                  <Reveal key={title} delay={i * 0.07} className="hm-card hm-card--hover">
                    <div className={`hm-icon ${i % 2 ? "hm-icon--teal" : ""}`}><Icon /></div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ══ HOW IT WORKS ═══════════════════════════════════════════════ */}
          <section className="hm-section hm-section--alt">
            <div className="hm-container">
              <SectionHead eyebrow="Simple & joyful" title="How it works" sub="Three easy steps from idea to unboxing." teal />
              <div className="hm-steps">
                {PROCESS_STEPS.map(({ Icon, step, title, desc }, i) => (
                  <Reveal key={step} delay={i * 0.08} className="hm-card hm-card--hover">
                    <div className="hm-step-num">STEP {step}</div>
                    <div className={`hm-icon ${i === 1 ? "hm-icon--teal" : ""}`}><Icon /></div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ══ OUR STORY + STATS ══════════════════════════════════════════ */}
          <section className="hm-section">
            <div className="hm-container">
              <Reveal className="hm-panel">
                <div>
                  <span className="hm-eyebrow">Our story</span>
                  <h2>Crafted with love, made to last forever</h2>
                  <p>
                    Every product at InfinityCraftSpace begins as an idea — then becomes something you can hold, feel,
                    and treasure. Our artisans pour hours of skill and heart into each piece, ensuring it carries
                    emotions that mass-produced items never can.
                  </p>
                  <p>
                    From a personalized resin coaster for your best friend's kitchen, to a hand-embroidered hoop
                    commemorating your wedding date — we believe gifts should tell stories, not just fill boxes.
                  </p>
                  <ul className="hm-checks">
                    {STORY_POINTS.map((pt) => (
                      <li key={pt.text}><span aria-hidden="true">{pt.icon}</span>{pt.text}</li>
                    ))}
                  </ul>
                  <button type="button" className="hm-btn hm-btn--primary" onClick={() => goShop()}>
                    Discover our craft <FiArrowRight />
                  </button>
                </div>
                <div className="hm-stats" ref={statsRef}>
                  {STATS.map((s) => <Stat key={s.label} {...s} animate={statsInView} />)}
                </div>
              </Reveal>
            </div>
          </section>

          {/* ══ TESTIMONIALS ═══════════════════════════════════════════════ */}
          <section className="hm-section hm-section--alt">
            <div className="hm-container">
              <SectionHead eyebrow="Real stories, real love" title="What our customers say" />
              {/* The row animates in once as a whole — cards inside a horizontal scroller can sit
                  off-screen, so per-card scroll reveals would leave them hidden until scrolled. */}
              <Reveal className="hm-reviews" tabIndex={0} aria-label="Customer reviews">
                {TESTIMONIALS.map((t) => (
                  <figure key={t.name} className="hm-card hm-review" style={{ margin: 0 }}>
                    <Stars count={t.rating} />
                    <blockquote>“{t.text}”</blockquote>
                    <figcaption className="hm-review-who">
                      <span className="hm-avatar" aria-hidden="true">{t.name[0]}</span>
                      <span>
                        <span className="hm-review-name" style={{ display: "block" }}>{t.name}</span>
                        <span className="hm-review-loc">{t.location} <span className="hm-verified">Verified</span></span>
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </Reveal>
            </div>
          </section>

          {/* ══ CTA ════════════════════════════════════════════════════════ */}
          <section className="hm-section">
            <div className="hm-container">
              <Reveal className="hm-cta">
                <div className="hm-cta-ring" aria-hidden="true" />
                <span className="hm-eyebrow">Join the community</span>
                <h2>Be part of India's most loved handcrafted gifting brand</h2>
                <p>Get early access to new collections, festive launches and subscriber-only offers.</p>

                <form className="hm-form" onSubmit={newsletter.submit} noValidate>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    aria-label="Email address"
                    autoComplete="email"
                    value={newsletter.email}
                    onChange={newsletter.onChange}
                    disabled={newsletter.loading}
                    aria-invalid={newsletter.status === "error"}
                  />
                  <button type="submit" className="hm-btn hm-btn--primary" disabled={newsletter.loading}>
                    {newsletter.loading ? "Subscribing…" : "Get updates"}
                  </button>
                </form>
                <p
                  className={`hm-note ${newsletter.status === "success" ? "hm-note--ok" : ""} ${newsletter.status === "error" ? "hm-note--err" : ""}`}
                  role="status"
                  aria-live="polite"
                >
                  {newsletter.message || "No spam — unsubscribe any time."}
                </p>

                {!user && (
                  <>
                    <div className="hm-divider">or</div>
                    <div className="hm-cta-actions">
                      <button type="button" className="hm-btn hm-btn--teal hm-btn--lg" onClick={() => navigate("/register")}>
                        Create free account
                      </button>
                      <button type="button" className="hm-btn hm-btn--ghost hm-btn--lg" onClick={() => navigate("/login")}>
                        Sign in
                      </button>
                    </div>
                  </>
                )}
              </Reveal>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
