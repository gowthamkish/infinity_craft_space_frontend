/**
 * Home.js — Lightweight landing page that redirects to the full ProductListing.
 * ProductListing already has search, filters, cart, wishlist — duplicating it
 * here would add maintenance burden. Instead we render a minimal hero + redirect.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import { useProducts } from "../hooks/useSmartFetch";
import RecentlyViewed from "../components/RecentlyViewed";
import "./Home.css";

export default function Home() {
  const navigate   = useNavigate();
  const { data: products, loading } = useProducts();

  // If the route ever lands here instead of ProductListing, soft-redirect
  useEffect(() => {
    // Only redirect if there is no hash / query params that suggest we need this page
    const hasQuery = window.location.search || window.location.hash;
    if (!hasQuery) {
      navigate("/products", { replace: true });
    }
  }, [navigate]);

  // While the redirect fires, show a brief pass-through loading state
  return (
    <>
      <SEOHead
        title={SEO_CONFIG.SITE_NAME}
        description="Discover premium craft supplies at Infinity Craft Space."
        url={SEO_CONFIG.SITE_URL}
        canonical={SEO_CONFIG.SITE_URL}
      />
      <div className="App">
        <Header />
        <main className="home-main" style={{ paddingTop: "90px" }}>
          {/* Hero */}
          <section className="home-hero">
            <div className="home-hero-content">
              <span className="home-hero-eyebrow">✨ Premium craft supplies</span>
              <h1 className="home-hero-heading">
                Unleash your creativity
              </h1>
              <p className="home-hero-body">
                Thousands of curated materials, tools, and kits for artists,
                crafters, and makers of every skill level.
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
                  onClick={() => navigate("/products?category=new")}
                >
                  New arrivals →
                </button>
              </div>
            </div>
          </section>

          {/* Quick feature strip */}
          <section className="home-features">
            {[
              { icon: "🚚", title: "Free shipping",    desc: "On all orders" },
              { icon: "↩️", title: "Easy returns",     desc: "30-day hassle-free" },
              { icon: "🔒", title: "Secure payment",   desc: "Encrypted checkout" },
              { icon: "🎨", title: "Curated quality",  desc: "Hand-picked products" },
            ].map((f) => (
              <div key={f.title} className="home-feature-item">
                <span className="home-feature-icon">{f.icon}</span>
                <div>
                  <p className="home-feature-title">{f.title}</p>
                  <p className="home-feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Product preview — first 8 products */}
          {!loading && products.length > 0 && (
            <section className="home-preview">
              <div className="home-preview-header">
                <h2>Featured products</h2>
                <button
                  className="home-preview-all"
                  onClick={() => navigate("/products")}
                >
                  View all →
                </button>
              </div>
              <div className="home-preview-grid">
                {products.slice(0, 8).map((product) => (
                  <button
                    key={product._id}
                    className="home-product-card"
                    onClick={() => navigate(`/product/${product._id}`)}
                    aria-label={`View ${product.name}`}
                  >
                    <div className="home-product-img-wrap">
                      <img
                        src={
                          product.images?.[0]?.url ||
                          product.image?.url ||
                          product.image ||
                          "https://via.placeholder.com/300x300?text=No+Image"
                        }
                        alt={product.name}
                        loading="lazy"
                      />
                    </div>
                    <div className="home-product-info">
                      <p className="home-product-name">{product.name}</p>
                      <p className="home-product-price">₹{product.price}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="home-preview-cta">
                <button
                  className="home-btn home-btn--primary"
                  onClick={() => navigate("/products")}
                >
                  Browse all products
                </button>
              </div>
            </section>
          )}

          <RecentlyViewed />
        </main>
      </div>
    </>
  );
}
