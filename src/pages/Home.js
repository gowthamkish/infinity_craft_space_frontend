import { lazy, Suspense, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "../components/Header";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import { useProducts } from "../hooks/useSmartFetch";
import RecentlyViewed from "../components/RecentlyViewed";
import { buildCloudinaryUrl } from "../components/OptimizedImage";
import "./Home.css";

const TRUST_ITEMS = [
  { icon: "🚚", title: "Free Shipping",    desc: "On all orders above ₹999" },
  { icon: "↩️", title: "Easy Returns",     desc: "7-day hassle-free returns" },
  { icon: "🔒", title: "Secure Payment",   desc: "100% encrypted checkout" },
  { icon: "✦",  title: "Handcrafted",      desc: "Every product made with care" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Browse",     desc: "Explore hundreds of handcrafted products — from resin art to custom jewelry." },
  { step: "02", title: "Customize",  desc: "Add a personal touch. Many items support custom text, colors, and designs." },
  { step: "03", title: "Receive",    desc: "Your order is crafted just for you and delivered with love." },
];

const TESTIMONIALS = [
  { name: "Priya S.",   location: "Mumbai",    rating: 5, text: "The resin coasters I ordered were absolutely stunning. Quality exceeded expectations!" },
  { name: "Rahul M.",   location: "Bangalore", rating: 5, text: "Ordered a personalized gift hamper for Diwali — my team loved it. Will order again!" },
  { name: "Ananya K.",  location: "Chennai",   rating: 5, text: "Fast delivery, beautiful packaging, and the customization was exactly what I wanted." },
];

function StarRow({ count }) {
  return (
    <span className="home-stars" aria-label={`${count} stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < count ? "home-star--on" : "home-star--off"}>★</span>
      ))}
    </span>
  );
}

function ProductCard({ product, onClick }) {
  const imgSrc =
    buildCloudinaryUrl(product.images?.[0]?.url || product.image?.url || product.image, 400) ||
    "https://placehold.co/400x400?text=No+Image";

  return (
    <button
      className="home-product-card"
      onClick={() => onClick(product._id)}
      aria-label={`View ${product.name}`}
    >
      <div className="home-product-img-wrap">
        <img src={imgSrc} alt={product.name} loading="lazy" decoding="async" />
        {product.isCustomizable && (
          <span className="home-product-badge">✦ Custom</span>
        )}
        {product.trackInventory && product.stock > 0 && product.stock <= (product.lowStockThreshold || 5) && (
          <span className="home-product-badge home-product-badge--low">Only {product.stock} left</span>
        )}
      </div>
      <div className="home-product-info">
        {product.averageRating > 0 && (
          <div className="home-product-rating">
            <StarRow count={Math.round(product.averageRating)} />
            <span className="home-product-rating-count">({product.ratingCount || 0})</span>
          </div>
        )}
        <p className="home-product-name">{product.name}</p>
        <p className="home-product-price">₹{product.price?.toLocaleString()}</p>
      </div>
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { data: products = [], loading } = useProducts();
  const user = useSelector((state) => state.auth.user);

  // Get unique categories from loaded products for category showcase
  const categories = useMemo(() => {
    if (!products.length) return [];
    const catMap = new Map();
    products.forEach((p) => {
      if (p.category && !catMap.has(p.category)) {
        const imgSrc = p.images?.[0]?.url || p.image?.url || p.image;
        catMap.set(p.category, { name: p.category, img: imgSrc });
      }
    });
    return [...catMap.values()].slice(0, 6);
  }, [products]);

  // Bestsellers: top-rated products with at least 1 review
  const bestsellers = useMemo(
    () =>
      [...products]
        .filter((p) => p.averageRating > 0 && p.stock !== 0)
        .sort((a, b) => b.averageRating - a.averageRating || b.ratingCount - a.ratingCount)
        .slice(0, 8),
    [products],
  );

  // Fallback featured if no rated products yet
  const featured = bestsellers.length ? bestsellers : products.slice(0, 8);

  const handleProductClick = (id) => navigate(`/product/${id}`);

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
        <main className="home-main">

          {/* ── Hero ────────────────────────────────────────────────��─ */}
          <section className="home-hero">
            <div className="home-hero-inner">
              <div className="home-hero-content">
                <span className="home-hero-eyebrow">✦ Handcrafted in India</span>
                <h1 className="home-hero-heading">
                  Gifts that tell<br />
                  <span className="home-hero-accent">a story</span>
                </h1>
                <p className="home-hero-body">
                  Personalized resin art, custom jewelry, craft kits, and gifting hampers —
                  all made with love, delivered to your door.
                </p>
                <div className="home-hero-actions">
                  <button
                    className="home-btn home-btn--primary"
                    onClick={() => navigate("/products")}
                  >
                    Shop all products
                  </button>
                  <button
                    className="home-btn home-btn--ghost"
                    onClick={() => navigate("/products?category=custom")}
                  >
                    Personalize yours →
                  </button>
                </div>
                <div className="home-hero-social-proof">
                  <div className="home-hero-avatars" aria-hidden="true">
                    {["P", "R", "A", "K"].map((l, i) => (
                      <span key={i} className="home-avatar">{l}</span>
                    ))}
                  </div>
                  <span className="home-hero-proof-text">
                    <strong>1,200+ happy customers</strong> across India
                  </span>
                </div>
              </div>
              <div className="home-hero-visual" aria-hidden="true">
                <div className="home-hero-blob">
                  <span className="home-hero-blob-emoji">🎨</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Trust strip ─────────────────────────────────────────── */}
          <section className="home-trust-strip" aria-label="Why shop with us">
            {TRUST_ITEMS.map((t) => (
              <div key={t.title} className="home-trust-item">
                <span className="home-trust-icon" aria-hidden="true">{t.icon}</span>
                <div>
                  <p className="home-trust-title">{t.title}</p>
                  <p className="home-trust-desc">{t.desc}</p>
                </div>
              </div>
            ))}
          </section>

          {/* ── Category Showcase ────────────────────────────────────── */}
          {categories.length > 0 && (
            <section className="home-section home-categories-section">
              <div className="home-section-header">
                <h2 className="home-section-title">Shop by category</h2>
                <button className="home-section-link" onClick={() => navigate("/products")}>
                  See all →
                </button>
              </div>
              <div className="home-categories-grid">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    className="home-category-tile"
                    onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                    aria-label={`Browse ${cat.name}`}
                  >
                    <div className="home-category-img-wrap">
                      {cat.img ? (
                        <img
                          src={buildCloudinaryUrl(cat.img, 300) || cat.img}
                          alt={cat.name}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <span className="home-category-placeholder" aria-hidden="true">🎁</span>
                      )}
                      <div className="home-category-overlay" />
                    </div>
                    <span className="home-category-name">{cat.name}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ── Bestsellers / Featured products ─────────────────────── */}
          {!loading && featured.length > 0 && (
            <section className="home-section home-bestsellers-section">
              <div className="home-section-header">
                <h2 className="home-section-title">
                  {bestsellers.length ? "⭐ Bestsellers" : "Featured products"}
                </h2>
                <button className="home-section-link" onClick={() => navigate("/products")}>
                  View all →
                </button>
              </div>
              <div className="home-products-scroll">
                {featured.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onClick={handleProductClick}
                  />
                ))}
              </div>
              <div className="home-preview-cta">
                <button
                  className="home-btn home-btn--outline"
                  onClick={() => navigate("/products")}
                >
                  Browse all products
                </button>
              </div>
            </section>
          )}

          {/* ── How it works ─────────────────────────────────────────── */}
          <section className="home-section home-hiw-section">
            <h2 className="home-section-title home-section-title--center">
              How it works
            </h2>
            <div className="home-hiw-grid">
              {HOW_IT_WORKS.map((step) => (
                <div key={step.step} className="home-hiw-card">
                  <span className="home-hiw-step">{step.step}</span>
                  <h3 className="home-hiw-title">{step.title}</h3>
                  <p className="home-hiw-desc">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Personalization CTA banner ───────────────────────────── */}
          <section className="home-custom-banner">
            <div className="home-custom-banner-inner">
              <span className="home-custom-banner-tag">✦ Made just for you</span>
              <h2 className="home-custom-banner-title">
                Want something truly one-of-a-kind?
              </h2>
              <p className="home-custom-banner-desc">
                Browse our customizable range — add names, dates, or a special message.
                Perfect for birthdays, anniversaries, and corporate gifting.
              </p>
              <button
                className="home-btn home-btn--primary"
                onClick={() => navigate("/products?customizable=true")}
              >
                Shop personalized gifts
              </button>
            </div>
          </section>

          {/* ── Testimonials ─────────────────────────────────────────── */}
          <section className="home-section home-testimonials-section">
            <h2 className="home-section-title home-section-title--center">
              What our customers say
            </h2>
            <div className="home-testimonials-grid">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="home-testimonial-card">
                  <StarRow count={t.rating} />
                  <p className="home-testimonial-text">"{t.text}"</p>
                  <div className="home-testimonial-author">
                    <span className="home-testimonial-avatar">{t.name[0]}</span>
                    <div>
                      <p className="home-testimonial-name">{t.name}</p>
                      <p className="home-testimonial-location">{t.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Recently viewed (personalised) ──────────────────────── */}
          <RecentlyViewed />

          {/* ── Newsletter / final CTA ───────────────────────────────── */}
          {!user && (
            <section className="home-cta-section">
              <div className="home-cta-inner">
                <h2 className="home-cta-title">Join the InfinityCraftSpace community</h2>
                <p className="home-cta-desc">
                  Create an account to save your wishlist, track orders, and get early access to new arrivals.
                </p>
                <div className="home-cta-actions">
                  <button
                    className="home-btn home-btn--primary"
                    onClick={() => navigate("/register")}
                  >
                    Create free account
                  </button>
                  <button
                    className="home-btn home-btn--ghost"
                    onClick={() => navigate("/login")}
                  >
                    Sign in
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
