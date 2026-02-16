import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../features/authSlice";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get auth state from Redux
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check for registration success message
    const registrationMessage = localStorage.getItem("registrationSuccess");
    if (registrationMessage) {
      setSuccessMessage(registrationMessage);
      localStorage.removeItem("registrationSuccess");

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    }
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password.trim()) {
      errors.password = "Password is required";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Clear any existing errors
    dispatch(clearError());
    setValidationErrors({});
    setValidated(true);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const response = await dispatch(loginUser({ email, password }));

      // Check if login was successful
      if (loginUser.fulfilled.match(response)) {
        const redirectPath = localStorage.getItem("redirectAfterLogin");

        if (response.payload?.user?.isAdmin) {
          navigate("/admin/dashboard");
        } else if (redirectPath) {
          localStorage.removeItem("redirectAfterLogin");
          navigate(redirectPath);
        } else {
          navigate("/");
        }
      }
      // If rejected, error will be handled by Redux state
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const navigateToRegister = () => {
    navigate("/register");
  };

  return (
    <>
      <SEOHead
        title={`Login - ${SEO_CONFIG.SITE_NAME}`}
        description="Sign in to your Infinity Craft Space account to access exclusive features, track orders, and manage your craft supplies shopping experience."
        keywords="login, sign in, account, craft supplies account, user login"
        url={`${SEO_CONFIG.SITE_URL}/login`}
        noindex={true}
        canonical={`${SEO_CONFIG.SITE_URL}/login`}
      />
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)",
        }}
    >

      {loading ? (
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: "200px" }}
        >
          <Spinner
            animation="border"
            role="status"
            style={{
              color: "var(--primary-color)",
              width: "3rem",
              height: "3rem",
            }}
          >
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            Signing you in...
          </p>
        </div>
      ) : (
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={8} md={6} lg={4} xl={4}>
              <Card
                className="hover-shadow"
                style={{
                  border: "none",
                  borderRadius: "20px",
                  boxShadow: "var(--shadow-xl)",
                  background: "var(--bg-primary)",
                }}
              >
                <Card.Body style={{ padding: "3rem 2.5rem" }}>
                  <div className="text-center mb-4">
                    <h1
                      className="mb-2"
                      style={{
                        background:
                          "linear-gradient(45deg, var(--primary-color), var(--secondary-color))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        fontWeight: "700",
                        fontSize: "2rem",
                      }}
                    >
                      Welcome Back!
                    </h1>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "1rem",
                      }}
                    >
                      Sign in to your Infinity Craft Space account
                    </p>
                  </div>

                  {successMessage && (
                    <Alert
                      variant="success"
                      className="mb-4"
                      dismissible
                      onClose={() => setSuccessMessage("")}
                      style={{
                        borderRadius: "12px",
                        border: "none",
                        fontSize: "0.9rem",
                      }}
                    >
                      {successMessage}
                    </Alert>
                  )}

                  {error && (
                    <Alert
                      variant="danger"
                      className="mb-4"
                      style={{
                        borderRadius: "12px",
                        border: "none",
                        fontSize: "0.9rem",
                      }}
                    >
                      {error}
                    </Alert>
                  )}

                  <Form
                    noValidate
                    validated={validated}
                    onSubmit={handleSubmit}
                  >
                    <Form.Group className="mb-4" controlId="loginEmail">
                      <Form.Label
                        className="fw-bold text-start d-block"
                        style={{
                          color: "var(--text-primary)",
                          marginBottom: "0.75rem",
                        }}
                      >
                        Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (validationErrors.email) {
                            setValidationErrors({
                              ...validationErrors,
                              email: "",
                            });
                          }
                          // Clear auth error when user starts typing
                          if (error) {
                            dispatch(clearError());
                          }
                        }}
                        placeholder="Enter your email"
                        required
                        isInvalid={!!validationErrors.email}
                        isValid={
                          validated &&
                          email &&
                          !validationErrors.email &&
                          /\S+@\S+\.\S+/.test(email)
                        }
                        style={{
                          borderRadius: "12px",
                          padding: "12px 16px",
                          fontSize: "1rem",
                          transition: "all 0.3s ease",
                        }}
                      />
                      
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="loginPassword">
                      <Form.Label
                        className="fw-bold text-start d-block"
                        style={{
                          color: "var(--text-primary)",
                          marginBottom: "0.75rem",
                        }}
                      >
                        Password
                      </Form.Label>
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (validationErrors.password) {
                            setValidationErrors({
                              ...validationErrors,
                              password: "",
                            });
                          }
                          // Clear auth error when user starts typing
                          if (error) {
                            dispatch(clearError());
                          }
                        }}
                        placeholder="Enter your password"
                        required
                        minLength={6}
                        isInvalid={!!validationErrors.password}
                        isValid={
                          validated &&
                          password &&
                          !validationErrors.password &&
                          password.length >= 6
                        }
                        style={{
                          borderRadius: "12px",
                          padding: "12px 16px",
                          fontSize: "1rem",
                          transition: "all 0.3s ease",
                        }}
                      />
                      
                      
                    </Form.Group>

                    <div className="d-grid gap-3 mb-4">
                      <Button
                        variant="primary"
                        type="submit"
                        size="lg"
                        disabled={loading || !email || !password}
                        className="hover-scale"
                        style={{
                          borderRadius: "12px",
                          fontWeight: "600",
                          padding: "12px",
                          fontSize: "1.1rem",
                          background:
                            loading || !email || !password
                              ? "linear-gradient(45deg, #9ca3af, #6b7280)"
                              : "linear-gradient(45deg, var(--primary-color), var(--primary-light))",
                          border: "none",
                          boxShadow: "var(--shadow-md)",
                        }}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            Signing In...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>

                      <Button
                        variant="outline-secondary"
                        onClick={navigateToRegister}
                        className="hover-scale"
                        style={{
                          borderRadius: "12px",
                          fontWeight: "500",
                          padding: "10px",
                          borderColor: "var(--border-color)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Create New Account
                      </Button>
                    </div>

                    <div className="text-center">
                      <Button
                        variant="link"
                        onClick={() => navigate("/")}
                        style={{
                          color: "var(--primary-color)",
                          textDecoration: "none",
                          fontWeight: "500",
                        }}
                        className="hover-scale"
                      >
                        Continue shopping without account →
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      )}
      </div>
    </>
  );
}
