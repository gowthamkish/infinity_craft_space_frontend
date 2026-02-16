import React from "react";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Header from "../components/header";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";

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
      <Container
        fluid
        style={{
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          minHeight: "100vh",
          paddingTop: "110px",
          paddingBottom: "40px",
        }}
      >
        <Container>
          <Card className="border-0 shadow-lg" style={{ borderRadius: "20px" }}>
            <Card.Body className="p-4 p-md-5">
              <h1 className="mb-3">Return Policy</h1>
              <p className="text-muted">
                We want you to be happy with your purchase. If you need to
                return an item, please review the policy below.
              </p>

              <h5 className="mt-4">Eligibility</h5>
              <ul className="text-muted">
                <li>Items must be unused and in original packaging.</li>
                <li>
                  Return requests must be submitted within 7 days of delivery.
                </li>
                <li>Custom or personalized items are non-returnable.</li>
              </ul>

              <h5 className="mt-4">Documentation Requirements</h5>
              <p className="text-muted">
                To process your return request efficiently and protect both you
                and us, please provide the following documentation:
              </p>
              <ul className="text-muted">
                <li>
                  <strong>Unboxing Video:</strong> A complete, uncut video of
                  you unboxing the package. The video must show the sealed
                  package, the opening process, and the item's condition from
                  all angles.
                </li>
                <li>
                  <strong>360-Degree View:</strong> Record a 360-degree view of
                  the product showing all sides, including any defects or issues
                  if applicable.
                </li>
                <li>
                  <strong>Clear Photographs:</strong> High-quality images
                  showing:
                  <ul className="mt-2">
                    <li>Front, back, and side views of the item</li>
                    <li>Product tags and labels (if attached)</li>
                    <li>Any defects, damages, or discrepancies</li>
                    <li>Original packaging and accessories</li>
                  </ul>
                </li>
                <li>
                  <strong>Order Details:</strong> Screenshot or copy of your
                  order confirmation email.
                </li>
              </ul>
              <p className="text-muted">
                <em>
                  Note: Returns without proper documentation may be rejected or
                  delayed. Videos and images help us verify product condition
                  and expedite your refund.
                </em>
              </p>

              <h5 className="mt-4">Process</h5>
              <ol className="text-muted">
                <li>
                  Contact support at jsaginfinitycraftspace@gmail.com with your
                  order ID, reason for return, and all required documentation
                  (unboxing video, 360-degree footage, and photographs).
                </li>
                <li>
                  Our team will review your documentation within 24-48 hours and
                  provide return instructions or request additional information
                  if needed.
                </li>
                <li>
                  Ship the item back to us using the provided instructions. Keep
                  your shipping receipt for tracking.
                </li>
                <li>
                  Once we receive and inspect the returned item, we will process
                  your refund or exchange.
                </li>
              </ol>

              <h5 className="mt-4">Refunds</h5>
              <p className="text-muted">
                Approved refunds are issued to the original payment method. The
                processing time depends on your bank (typically 5-7 business
                days).
              </p>

              <h5 className="mt-4">Damaged or Defective Items</h5>
              <p className="text-muted">
                If you receive a damaged or defective item, documentation is
                critical:
              </p>
              <ul className="text-muted">
                <li>
                  Record an uncut unboxing video immediately upon delivery
                  (before opening the package).
                </li>
                <li>
                  Capture clear, detailed photos and videos of the damage from
                  multiple angles.
                </li>
                <li>
                  Contact us within 48 hours of delivery for fastest resolution.
                </li>
              </ul>
              <p className="text-muted">
                We will arrange a replacement or full refund for verified
                damaged/defective items at no additional cost to you.
              </p>

              <h5 className="mt-4">Important Notes</h5>
              <ul className="text-muted mb-0">
                <li>
                  Return shipping costs are the customer's responsibility unless
                  the item is damaged or defective.
                </li>
                <li>
                  Partial refunds may apply if items are returned without
                  complete packaging or accessories.
                </li>
                <li>
                  We reserve the right to refuse returns that don't meet our
                  documentation requirements or policy terms.
                </li>
                <li>
                  For questions or concerns, reach us at
                  jsaginfinitycraftspace@gmail.com or call +91 8925083167.
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Container>
      </Container>
    </>
  );
}
