import { lazy, Suspense } from "react";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import LaunchBanner from "../components/LaunchBanner";

const Header = lazy(() => import("../components/Header"));

/**
 * The only page visitors can see before launch: the banner, with the site navigation blurred behind it.
 * `inert` makes the blurred header unclickable AND unfocusable (keyboard / screen reader included).
 */
export default function LaunchPage() {
  return (
    <div className="App">
      <SEOHead
        title={`${SEO_CONFIG.SITE_NAME} — Grand Website Launch · 20 November 2026`}
        description="Something amazing is coming! InfinityCraftSpace — handcrafted gifts, delivered across India — launches on 20 November 2026."
        url={SEO_CONFIG.SITE_URL}
        canonical={SEO_CONFIG.SITE_URL}
        type="website"
        image={SEO_CONFIG.DEFAULT_IMAGE}
      />
      <div className="launch-blurred" inert="" aria-hidden="true">
        <Suspense fallback={<div style={{ height: 70 }} />}><Header /></Suspense>
      </div>
      <main id="main-content">
        <LaunchBanner />
      </main>
    </div>
  );
}
