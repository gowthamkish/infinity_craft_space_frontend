import React from "react";
import { Container, Card, Row, Col } from "../components/ui";
import Header from "../components/header";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";

export default function ContactUs() {
  return (
    <>
      <SEOHead
        title={`Contact Us - ${SEO_CONFIG.SITE_NAME}`}
        description="Get in touch with Infinity Craft Space support."
        url={`${SEO_CONFIG.SITE_URL}/contact-us`}
        canonical={`${SEO_CONFIG.SITE_URL}/contact-us`}
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
              <h1 className="mb-3">Contact Us</h1>
              <p className="text-muted">
                Have a question about your order or products? Reach out to us
                and we&apos;ll respond as soon as possible.
              </p>

              <Row className="mt-4">
                <Col md={6} className="mb-4 mb-md-0">
                  <h5>Support</h5>
                  <p className="text-muted mb-1">
                    Email: jsaginfinitycraftspace@gmail.com
                  </p>
                  <p className="text-muted mb-1">Phone: +91 8925083167</p>
                  <p className="text-muted mb-0">
                    Hours: 10:00 AM - 6:00 PM IST
                  </p>
                </Col>
                <Col md={6}>
                  <h5>Address</h5>
                  <p className="text-muted mb-0">
                    Infinity Craft Space
                    <br />
                    17, Beladingalu, Aishwaraya Crystal Layout,
                    <br />
                    MJ Infrastructure Road, Bangalore - 560068.
                    <br />
                    Karnataka, India
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Container>
      </Container>
    </>
  );
}
