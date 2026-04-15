import Header from "../components/Header";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import "./content-page.css";

export default function ReturnPolicy() {
  return (
    <>
      <SEOHead
        title={`Return Policy - ${SEO_CONFIG.SITE_NAME}`}
        description="Learn about Infinity Craft Space returns and refunds."
        url={`${SEO_CONFIG.SITE_URL}/return-policy`}
        canonical={`${SEO_CONFIG.SITE_URL}/return-policy`}
      />
      <Header />
      <div className="cp-page">
        <div className="cp-container">
          <div className="cp-card">
            <div className="cp-card-header">
              <div className="cp-eyebrow">Policies</div>
              <h1 className="cp-title">Return Policy</h1>
              <p className="cp-lead">
                We want you to be happy with your purchase. If you need to return an item, please review the policy below.
              </p>
            </div>
            <div className="cp-card-body cp-body">
              <h2 className="cp-section-heading">Eligibility</h2>
              <ul>
                <li>Items must be unused and in original packaging.</li>
                <li>Return requests must be submitted within 7 days of delivery.</li>
                <li>Custom or personalized items are non-returnable.</li>
              </ul>

              <h2 className="cp-section-heading">Documentation Requirements</h2>
              <p>To process your return request efficiently and protect both you and us, please provide:</p>
              <ul>
                <li><strong>Unboxing Video:</strong> A complete, uncut video of you unboxing the package, showing the sealed package, opening process, and item's condition from all angles.</li>
                <li><strong>360-Degree View:</strong> Record a 360-degree view of the product showing all sides, including any defects or issues.</li>
                <li><strong>Clear Photographs:</strong> High-quality images showing front, back, and side views; product tags and labels; any defects or damages; and original packaging.</li>
                <li><strong>Order Details:</strong> Screenshot or copy of your order confirmation email.</li>
              </ul>
              <p><em>Note: Returns without proper documentation may be rejected or delayed. Videos and images help us verify product condition and expedite your refund.</em></p>

              <h2 className="cp-section-heading">Process</h2>
              <ol>
                <li>Contact support at <a href="mailto:jsaginfinitycraftspace@gmail.com">jsaginfinitycraftspace@gmail.com</a> with your order ID, reason for return, and all required documentation.</li>
                <li>Our team will review your documentation within 24–48 hours and provide return instructions or request additional information if needed.</li>
                <li>Ship the item back using the provided instructions. Keep your shipping receipt for tracking.</li>
                <li>Once we receive and inspect the returned item, we will process your refund or exchange.</li>
              </ol>

              <h2 className="cp-section-heading">Refunds</h2>
              <p>Approved refunds are issued to the original payment method. Processing time depends on your bank (typically 5–7 business days).</p>

              <h2 className="cp-section-heading">Damaged or Defective Items</h2>
              <p>If you receive a damaged or defective item, documentation is critical:</p>
              <ul>
                <li>Record an uncut unboxing video immediately upon delivery (before opening the package).</li>
                <li>Capture clear, detailed photos and videos of the damage from multiple angles.</li>
                <li>Contact us within 48 hours of delivery for fastest resolution.</li>
              </ul>
              <p>We will arrange a replacement or full refund for verified damaged/defective items at no additional cost.</p>

              <h2 className="cp-section-heading">Important Notes</h2>
              <ul>
                <li>Return shipping costs are the customer's responsibility unless the item is damaged or defective.</li>
                <li>Partial refunds may apply if items are returned without complete packaging or accessories.</li>
                <li>We reserve the right to refuse returns that don't meet our documentation requirements or policy terms.</li>
                <li>For questions, reach us at <a href="mailto:jsaginfinitycraftspace@gmail.com">jsaginfinitycraftspace@gmail.com</a> or call <a href="tel:+918925083167">+91 8925083167</a>.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
