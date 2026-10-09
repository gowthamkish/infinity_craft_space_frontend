/**
 * Shared building blocks for the checkout steps. Styling lives in styles/checkout.css (.ck-*).
 */
import { FiAlertTriangle, FiAlertCircle, FiInfo, FiCheckCircle, FiShield, FiTruck, FiRefreshCw, FiMail, FiPhone } from "react-icons/fi";
import { PLACEHOLDER_SRC, onImgError } from "../../utils/imageFallback";

/** ₹1,234.50 — Indian digit grouping, always 2 decimals */
export const inr = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const productImage = (product) => product?.images?.[0]?.url || product?.image?.url || product?.image || null;

/** Square product thumbnail with the branded fallback when the image is missing or broken. */
export function Thumb({ product, size = "md" }) {
  const cls = size === "xs" ? "ck-thumb ck-thumb--xs" : size === "sm" ? "ck-thumb ck-thumb--sm" : "ck-thumb";
  return (
    <div className={cls}>
      <img src={productImage(product) || PLACEHOLDER_SRC} alt={product?.name || ""} loading="lazy" decoding="async" onError={onImgError} />
    </div>
  );
}

/** Card with an optional icon header. `dark` gives the payment summary its charcoal header. */
export function Card({ icon: Icon, tint = "ember", title, subtitle, badge, dark = false, footer, children, bodyClass = "ck-card-body", noBody = false, className = "" }) {
  return (
    <section className={`ck-card ${className}`.trim()}>
      {(title || Icon) && (
        <header className={`ck-card-head ${dark ? "ck-card-head--dark" : ""}`}>
          {Icon && (
            <span className={`ck-ico ${tint === "teal" ? "ck-ico--teal" : ""}`} aria-hidden="true">
              <Icon />
            </span>
          )}
          <div className="ck-card-head-text">
            <h2 className="ck-card-title">{title}</h2>
            {subtitle && <p className="ck-card-sub">{subtitle}</p>}
          </div>
          {badge}
        </header>
      )}
      {noBody ? children : <div className={bodyClass}>{children}</div>}
      {footer && <footer className="ck-card-foot">{footer}</footer>}
    </section>
  );
}

const ALERT_ICON = { error: FiAlertCircle, warn: FiAlertTriangle, info: FiInfo, success: FiCheckCircle };
export function Alert({ kind = "error", children }) {
  const Icon = ALERT_ICON[kind] || FiInfo;
  return (
    <div className={`ck-alert ck-alert--${kind}`} role={kind === "error" ? "alert" : "status"}>
      <Icon size={18} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

/** Compact line items used inside every summary card */
export function SummaryItems({ cartItems }) {
  return (
    <div className="ck-sum-items">
      {cartItems.map((item) => (
        <div key={item.product._id} className="ck-sum-item">
          <Thumb product={item.product} size="sm" />
          <div style={{ minWidth: 0 }}>
            <div className="ck-sum-item-name">{item.product.name}</div>
            <div className="ck-sum-item-meta">
              Qty {item.quantity} × {inr(item.product.price)}
            </div>
          </div>
          <div className="ck-sum-item-price">{inr(item.totalPrice)}</div>
        </div>
      ))}
    </div>
  );
}

export function Row({ label, value, tone, hint }) {
  return (
    <div className={`ck-row-line ${tone === "ok" ? "ck-row-line--ok" : ""}`}>
      <span>{label}</span>
      {value != null ? <b>{value}</b> : <i>{hint}</i>}
    </div>
  );
}

export function Total({ label = "Total", value }) {
  return (
    <div className="ck-total">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

export function MiniTrust({ items }) {
  return (
    <div className="ck-mini-trust">
      {items.map(({ Icon, label }) => (
        <span key={label}>
          <Icon size={15} aria-hidden="true" />
          {label}
        </span>
      ))}
    </div>
  );
}

export const TRUST_MINI = [
  { Icon: FiShield, label: "Secure checkout" },
  { Icon: FiTruck, label: "Fast delivery" },
  { Icon: FiRefreshCw, label: "Easy returns" },
];

/** "Need help?" card shown in the summary column (contact details match the site footer) */
export function HelpCard() {
  return (
    <section className="ck-card ck-help-card">
      <span className="ck-ico ck-ico--teal" aria-hidden="true">
        <FiPhone />
      </span>
      <div>
        <h3>Need help with your order?</h3>
        <p>
          <a href="tel:+918925083167">+91 89250 83167</a> · Mon–Sat
          <br />
          <a href="mailto:infinitycraftspacejsag@gmail.com">
            <FiMail size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />
            infinitycraftspacejsag@gmail.com
          </a>
        </p>
      </div>
    </section>
  );
}

export function Spinner() {
  return <span className="ck-spinner" aria-hidden="true" />;
}
