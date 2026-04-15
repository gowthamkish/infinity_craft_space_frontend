import "./Loader.css";

/**
 * OrbitLoader — Three concentric spinning rings (page / section loading)
 * size: "sm" | "md" (default) | "lg"
 */
export function OrbitLoader({ size = "md" }) {
  const cls = `loader-orbit${size === "sm" ? " loader-orbit--sm" : size === "lg" ? " loader-orbit--lg" : ""}`;
  return (
    <div className={cls} role="status" aria-label="Loading">
      <div className="loader-orbit__ring loader-orbit__ring--1" />
      <div className="loader-orbit__ring loader-orbit__ring--2" />
      <div className="loader-orbit__ring loader-orbit__ring--3" />
    </div>
  );
}

/**
 * DotsLoader — Three bouncing dots (button / inline loading)
 * size: "sm" | "md" (default) | "lg"
 */
export function DotsLoader({ size = "md" }) {
  const cls = `loader-dots${size === "sm" ? " loader-dots--sm" : size === "lg" ? " loader-dots--lg" : ""}`;
  return (
    <span className={cls} role="status" aria-label="Loading">
      <span className="loader-dots__dot" />
      <span className="loader-dots__dot" />
      <span className="loader-dots__dot" />
    </span>
  );
}

/**
 * BarsLoader — Five animated equalizer bars (filter panel / narrow areas)
 * size: "sm" | "md" (default)
 */
export function BarsLoader({ size = "md" }) {
  const cls = `loader-bars${size === "sm" ? " loader-bars--sm" : ""}`;
  return (
    <div className={cls} role="status" aria-label="Loading">
      <div className="loader-bars__bar" />
      <div className="loader-bars__bar" />
      <div className="loader-bars__bar" />
      <div className="loader-bars__bar" />
      <div className="loader-bars__bar" />
    </div>
  );
}

/**
 * PageLoader — Full-page loading screen with orbit loader + labels
 * variant: "page" | "section" | "card"
 */
export function PageLoader({ label = "Loading…", sublabel, variant = "page" }) {
  const cls = `loader-page${variant === "section" ? " loader-page--section" : variant === "card" ? " loader-page--card" : ""}`;
  return (
    <div className={cls}>
      <OrbitLoader size={variant === "card" ? "sm" : "md"} />
      {label && <p className="loader-label">{label}</p>}
      {sublabel && <p className="loader-sublabel">{sublabel}</p>}
    </div>
  );
}

/**
 * RouteLoader — Used in ProtectedRoute / AdminRoute while checking auth
 */
export function RouteLoader() {
  return (
    <div className="loader-route">
      <OrbitLoader size="lg" />
      <p className="loader-label">Verifying access…</p>
    </div>
  );
}
