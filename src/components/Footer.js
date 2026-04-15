import { Link, useLocation } from "react-router-dom";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiShoppingBag,
  FiFileText,
  FiRefreshCcw,
  FiMessageCircle,
  FiTruck,
  FiShield,
  FiAward,
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiLinkedin,
} from "react-icons/fi";
import "./Footer.css";

const QUICK_LINKS = [
  { label: "Shop All Products", to: "/", icon: FiShoppingBag },
  { label: "Return Policy", to: "/return-policy", icon: FiRefreshCcw },
  {
    label: "Terms & Conditions",
    to: "/terms-and-conditions",
    icon: FiFileText,
  },
  { label: "Contact Us", to: "/contact-us", icon: FiMessageCircle },
];

const TRUST_ITEMS = [
  {
    icon: FiTruck,
    label: "Free Shipping",
    sub: "On orders above ₹999",
    color: "#10b981",
  },
  {
    icon: FiShield,
    label: "Secure Payments",
    sub: "100% safe checkout",
    color: "#2563eb",
  },
  {
    icon: FiAward,
    label: "Quality Promise",
    sub: "Curated craft supplies",
    color: "#f59e0b",
  },
];

const SOCIAL_LINKS = [
  { icon: FiFacebook, label: "Facebook", url: "#" },
  { icon: FiInstagram, label: "Instagram", url: "#" },
  { icon: FiTwitter, label: "Twitter", url: "#" },
  { icon: FiLinkedin, label: "LinkedIn", url: "#" },
];

const BUSINESS_HOURS = [
  { day: "Monday – Friday", time: "9 AM – 7 PM", isOpen: true },
  { day: "Saturday", time: "10 AM – 5 PM", isOpen: true },
  { day: "Sunday", time: "Closed", isOpen: false },
];

export default function Footer() {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <footer className="footer">
      {/* ── Trust Bar ────────────────────────────────────────── */}
      <div className="footer-trust-bar">
        <div className="footer-trust-container">
          {TRUST_ITEMS.map(({ icon: Icon, label, sub, color }) => (
            <div
              key={label}
              className="footer-trust-item"
              role="region"
              aria-label={label}
            >
              <div
                className="footer-trust-icon"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon size={20} color={color} />
              </div>
              <div className="footer-trust-content">
                <p className="footer-trust-label">{label}</p>
                <p className="footer-trust-sub">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Footer ──────────────────────────────────────── */}
      <div className="footer-main">
        <div className="footer-wrapper">
          {/* Brand Section */}
          <div className="footer-column footer-brand-section">
            <div className="footer-brand-header">
              {/* Logo */}
              <div className="footer-brand-logo-wrap">
                <img
                  src="/ICS_Logo.jpeg"
                  alt="Infinity Craft Space Logo"
                  className="footer-brand-logo"
                  loading="lazy"
                />
              </div>
              <h3 className="footer-brand-name">Infinity Craft Space</h3>
            </div>

            <p className="footer-brand-tagline">
              Curated craft supplies, premium materials &amp; tools for every
              creative mind.
            </p>

            {/* Contact Info */}
            <div className="footer-contact-section">
              <h4 className="footer-section-subtitle">Get In Touch</h4>
              <div className="footer-contact-list">
                <a
                  href="mailto:jsaginfinitycraftspace@gmail.com"
                  className="footer-contact-item footer-contact-link"
                  aria-label="Email us"
                >
                  <FiMail size={16} />
                  <span>jsaginfinitycraftspace@gmail.com</span>
                </a>
                <a
                  href="tel:+918925083167"
                  className="footer-contact-item footer-contact-link"
                  aria-label="Call us"
                >
                  <FiPhone size={16} />
                  <span>+91 (892) 508-3167</span>
                </a>
                <div className="footer-contact-item footer-contact-static">
                  <FiMapPin size={16} />
                  <span>Bangalore, Karnataka, India</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="footer-social-section">
              <p className="footer-section-subtitle">Follow Us</p>
              <div className="footer-social-links">
                {SOCIAL_LINKS.map(({ icon: Icon, label, url }) => (
                  <a
                    key={label}
                    href={url}
                    className="footer-social-link"
                    aria-label={label}
                    title={label}
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="footer-column footer-links-section">
            <h4 className="footer-column-heading">Quick Links</h4>
            <nav className="footer-nav-list" aria-label="Footer quick links">
              {QUICK_LINKS.map(({ label, to, icon: Icon }) => (
                <Link key={to} to={to} className="footer-nav-item">
                  <Icon size={16} className="footer-nav-icon" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Business Hours Section */}
          <div className="footer-column footer-hours-section">
            <h4 className="footer-column-heading">Business Hours</h4>
            <div className="footer-hours-list">
              {BUSINESS_HOURS.map(({ day, time, isOpen }) => (
                <div key={day} className="footer-hours-item">
                  <span className="footer-hours-day">{day}</span>
                  <span
                    className={`footer-hours-time ${isOpen ? "footer-hours-open" : "footer-hours-closed"}`}
                  >
                    {time}
                  </span>
                </div>
              ))}
            </div>
            <p className="footer-hours-note">All times in IST (GMT+5:30)</p>
          </div>

          {/* Newsletter Section */}
          <div className="footer-column footer-newsletter-section">
            <h4 className="footer-column-heading">Newsletter</h4>
            <p className="footer-newsletter-desc">
              Subscribe to get special offers &amp; updates!
            </p>
            <form
              className="footer-newsletter-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="footer-newsletter-input-wrap">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="footer-newsletter-input"
                  aria-label="Email for newsletter"
                />
                <button
                  type="submit"
                  className="footer-newsletter-btn"
                  aria-label="Subscribe"
                >
                  Subscribe
                </button>
              </div>
              <p className="footer-newsletter-info">
                No spam, ever. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ───────────────────────────────────────── */}
      <div className="footer-bottom">
        <div className="footer-bottom-wrapper">
          <p className="footer-copyright">
            © {new Date().getFullYear()} <strong>Infinity Craft Space</strong>.
            All rights reserved.
          </p>
          <nav className="footer-legal-links" aria-label="Footer legal links">
            <Link to="/terms-and-conditions" className="footer-legal-link">
              Terms
            </Link>
            <span className="footer-legal-divider" />
            <Link to="/return-policy" className="footer-legal-link">
              Returns
            </Link>
            <span className="footer-legal-divider" />
            <Link to="/contact-us" className="footer-legal-link">
              Support
            </Link>
            <span className="footer-legal-divider" />
            <a href="#privacy" className="footer-legal-link">
              Privacy
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
