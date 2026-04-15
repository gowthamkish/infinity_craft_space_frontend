import Header from "../components/Header";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import "./content-page.css";

const TERMS = [
  {
    title: "1. Use of the Site",
    body: "You must be at least 18 years old (or have a parent/guardian's consent) to place an order. You agree to use the site for lawful purposes and to provide accurate information when creating an account or placing an order.",
  },
  {
    title: "2. Accounts & Security",
    body: "You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately if you suspect unauthorized access to your account.",
  },
  {
    title: "3. Products, Pricing & Availability",
    body: "Product details, pricing, and availability may change without notice. We strive for accuracy, but errors may occur. If we discover an error in pricing or availability, we will notify you and give you the option to proceed or cancel your order.",
  },
  {
    title: "4. Orders & Payments",
    body: "Orders are confirmed only after successful payment and order confirmation. We reserve the right to refuse or cancel orders in cases of suspected fraud, stock issues, or payment errors.",
  },
  {
    title: "5. Shipping & Delivery",
    body: "Estimated delivery timelines are provided at checkout. Delays may occur due to carriers, weather, or other factors outside our control. Risk of loss transfers to you upon delivery.",
  },
  {
    title: "6. Returns & Refunds",
    body: "Our return and refund rules are described in the Return Policy. Please review it before initiating a return request.",
  },
  {
    title: "7. Reviews & Community Content",
    body: "By submitting reviews or content, you grant us the right to use and display it on the site. Content must be respectful and free of illegal, harmful, or misleading material.",
  },
  {
    title: "8. Intellectual Property",
    body: "All site content, including logos, images, and text, is owned by Infinity Craft Space or its licensors. You may not copy or reproduce content without prior permission.",
  },
  {
    title: "9. Limitation of Liability",
    body: "To the extent permitted by law, Infinity Craft Space is not liable for indirect, incidental, or consequential damages arising from your use of the site or products.",
  },
  {
    title: "10. Changes to These Terms",
    body: "We may update these terms from time to time. Continued use of the site after changes indicates acceptance of the revised terms.",
  },
];

export default function TermsAndConditions() {
  return (
    <>
      <SEOHead
        title={`Terms & Conditions - ${SEO_CONFIG.SITE_NAME}`}
        description="Review the terms and conditions for shopping at Infinity Craft Space."
        url={`${SEO_CONFIG.SITE_URL}/terms-and-conditions`}
        canonical={`${SEO_CONFIG.SITE_URL}/terms-and-conditions`}
      />
      <Header />
      <div className="cp-page">
        <div className="cp-container">
          <div className="cp-card">
            <div className="cp-card-header">
              <div className="cp-eyebrow">Legal</div>
              <h1 className="cp-title">Terms &amp; Conditions</h1>
              <p className="cp-lead">
                These terms govern your use of Infinity Craft Space and any purchases made through our store. By using the site, you agree to the conditions below.
              </p>
            </div>
            <div className="cp-card-body cp-body">
              {TERMS.map((section) => (
                <div key={section.title}>
                  <h2 className="cp-section-heading">{section.title}</h2>
                  <p>{section.body}</p>
                </div>
              ))}

              <h2 className="cp-section-heading">11. Contact</h2>
              <p>
                For questions about these terms, contact us at{" "}
                <a href="mailto:jsaginfinitycraftspace@gmail.com">jsaginfinitycraftspace@gmail.com</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
