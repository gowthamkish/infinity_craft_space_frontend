import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Button, Row, Col } from "react-bootstrap";
import { Helmet } from "react-helmet-async";
import "./NotFound.css";

// Icons as inline SVG to avoid react-feather dependency issues
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const ShoppingBagIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <Helmet>
        <title>Page Not Found | Infinity Craft Space</title>
        <meta
          name="description"
          content="The page you're looking for doesn't exist or has been moved."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="not-found-page">
        <Container>
          <Row className="justify-content-center align-items-center min-vh-100">
            <Col xs={12} md={10} lg={8} xl={6}>
              <div className="not-found-content">
                {/* Animated 404 Illustration */}
                <div className="not-found-illustration">
                  <div className="error-code">
                    <span className="digit">4</span>
                    <span className="digit zero">
                      <div className="craft-icon">
                        <div className="paint-brush"></div>
                        <div className="paint-drops">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </span>
                    <span className="digit">4</span>
                  </div>
                </div>

                {/* Error Message */}
                <div className="not-found-message">
                  <h1>Oops! Page Not Found</h1>
                  <p className="lead">
                    Looks like this page has wandered off to explore new
                    creative horizons. Don't worry, let's get you back on track!
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="not-found-actions">
                  <Button
                    variant="primary"
                    size="lg"
                    as={Link}
                    to="/"
                    className="action-btn primary-action"
                  >
                    <HomeIcon />
                    <span>Go to Homepage</span>
                  </Button>

                  <Button
                    variant="outline-secondary"
                    size="lg"
                    onClick={handleGoBack}
                    className="action-btn"
                  >
                    <ArrowLeftIcon />
                    <span>Go Back</span>
                  </Button>
                </div>

                {/* Helpful Links */}
                <div className="helpful-links">
                  <p className="helpful-title">Or try one of these:</p>
                  <div className="links-grid">
                    <Link to="/" className="helpful-link">
                      <ShoppingBagIcon />
                      <span>Browse Products</span>
                    </Link>
                    <Link to="/login" className="helpful-link">
                      <UserIcon />
                      <span>Sign In</span>
                    </Link>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="floating-elements">
                  <div className="float-element brush"></div>
                  <div className="float-element palette"></div>
                  <div className="float-element star"></div>
                  <div className="float-element diamond"></div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default NotFound;
