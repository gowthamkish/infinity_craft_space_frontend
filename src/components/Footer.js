import React from "react";
import { Container, Row, Col } from "../components/ui";
import { Link, useLocation } from "react-router-dom";
import Divider from "@mui/material/Divider";
// Use public asset at /ICS_Logo.jpeg so it's served directly without bundling

export default function Footer() {
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        color: "#e2e8f0",
        padding: "2.5rem 0 1.25rem",
        marginTop: "auto",
      }}
    >
      <Container fluid>
        <Row className="gy-4">
          <Col md={4} className="d-flex flex-column align-items-start">
            <img
              src="/ICS_Logo.jpeg"
              alt="Infinity Craft Space"
              style={{
                width: "150px",
                maxWidth: "100%",
                marginBottom: "0.5rem",
              }}
            />
            <p className="mb-0" style={{ color: "#cbd5f5" }}>
              Premium craft supplies, materials, and tools for creative minds.
            </p>
          </Col>
          <Col md={4}>
            <h6 className="text-uppercase" style={{ letterSpacing: "0.05em" }}>
              Quick Links
            </h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <Link
                  to="/return-policy"
                  style={{ color: "#e2e8f0", textDecoration: "none" }}
                >
                  Return Policy
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/terms-and-conditions"
                  style={{ color: "#e2e8f0", textDecoration: "none" }}
                >
                  Terms & Conditions
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/contact-us"
                  style={{ color: "#e2e8f0", textDecoration: "none" }}
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  style={{ color: "#e2e8f0", textDecoration: "none" }}
                >
                  Products
                </Link>
              </li>
            </ul>
          </Col>
          <Col md={4}>
            <h6 className="text-uppercase" style={{ letterSpacing: "0.05em" }}>
              Support
            </h6>
            <p className="mb-1" style={{ color: "#cbd5f5" }}>
              jsaginfinitycraftspace@gmail.com
            </p>
            <p className="mb-0" style={{ color: "#cbd5f5" }}>
              +91 8925083167
            </p>
          </Col>
        </Row>
        <Divider
          style={{ borderColor: "rgba(255,255,255,0.2)", margin: "1.5rem 0" }}
        />
        <div className="text-center" style={{ color: "#94a3b8" }}>
          © {new Date().getFullYear()} Infinity Craft Space. All rights
          reserved.
        </div>
      </Container>
    </footer>
  );
}
