import React from "react";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Header from "../components/header";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";

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
              <h1 className="mb-3">Terms & Conditions</h1>
              <p className="text-muted">
                These terms govern your use of Infinity Craft Space and any
                purchases made through our store. By using the site, you agree
                to the conditions below.
              </p>

              <h5 className="mt-4">1. Use of the Site</h5>
              <p className="text-muted">
                You must be at least 18 years old (or have a parent/guardian’s
                consent) to place an order. You agree to use the site for lawful
                purposes and to provide accurate information when creating an
                account or placing an order.
              </p>

              <h5 className="mt-4">2. Accounts & Security</h5>
              <p className="text-muted">
                You are responsible for maintaining the confidentiality of your
                account credentials. Notify us immediately if you suspect
                unauthorized access to your account.
              </p>

              <h5 className="mt-4">3. Products, Pricing & Availability</h5>
              <p className="text-muted">
                Product details, pricing, and availability may change without
                notice. We strive for accuracy, but errors may occur. If we
                discover an error in pricing or availability, we will notify you
                and give you the option to proceed or cancel your order.
              </p>

              <h5 className="mt-4">4. Orders & Payments</h5>
              <p className="text-muted">
                Orders are confirmed only after successful payment and order
                confirmation. We reserve the right to refuse or cancel orders in
                cases of suspected fraud, stock issues, or payment errors.
              </p>

              <h5 className="mt-4">5. Shipping & Delivery</h5>
              <p className="text-muted">
                Estimated delivery timelines are provided at checkout. Delays
                may occur due to carriers, weather, or other factors outside our
                control. Risk of loss transfers to you upon delivery.
              </p>

              <h5 className="mt-4">6. Returns & Refunds</h5>
              <p className="text-muted">
                Our return and refund rules are described in the Return Policy.
                Please review it before initiating a return request.
              </p>

              <h5 className="mt-4">7. Reviews & Community Content</h5>
              <p className="text-muted">
                By submitting reviews or content, you grant us the right to use
                and display it on the site. Content must be respectful and free
                of illegal, harmful, or misleading material.
              </p>

              <h5 className="mt-4">8. Intellectual Property</h5>
              <p className="text-muted">
                All site content, including logos, images, and text, is owned by
                Infinity Craft Space or its licensors. You may not copy or
                reproduce content without prior permission.
              </p>

              <h5 className="mt-4">9. Limitation of Liability</h5>
              <p className="text-muted">
                To the extent permitted by law, Infinity Craft Space is not
                liable for indirect, incidental, or consequential damages
                arising from your use of the site or products.
              </p>

              <h5 className="mt-4">10. Changes to These Terms</h5>
              <p className="text-muted">
                We may update these terms from time to time. Continued use of
                the site after changes indicates acceptance of the revised
                terms.
              </p>

              <h5 className="mt-4">11. Contact</h5>
              <p className="text-muted mb-0">
                For questions about these terms, contact us at
                jsaginfinitycraftspace@gmail.com.
              </p>
            </Card.Body>
          </Card>
        </Container>
      </Container>
    </>
  );
}
