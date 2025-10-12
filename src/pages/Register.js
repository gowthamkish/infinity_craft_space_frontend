import { useDispatch } from "react-redux";
import { register } from "../features/authSlice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [validated, setValidated] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};

    if (!form.username.trim()) {
      errors.username = "Full name is required";
    } else if (form.username.length < 2) {
      errors.username = "Full name must be at least 2 characters long";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!form.password.trim()) {
      errors.password = "Password is required";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setError("");
    setValidationErrors({});
    setValidated(true);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const response = await dispatch(register(form));
      setLoading(false);
      
      if (response?.payload) {
        // Registration successful, redirect to login page
        // Store a success message to show on login page
        localStorage.setItem("registrationSuccess", "Account created successfully! Please log in with your credentials.");
        navigate("/login");
      } else {
        setError(
          response?.error?.message || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      setLoading(false);
      setError(
        "Registration failed. Please check your information and try again."
      );
    }
  };

  return (
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
            Creating your account...
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
                      Join Us Today! 🚀
                    </h1>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "1rem",
                      }}
                    >
                      Create your Infinity Craft Space account
                    </p>
                  </div>

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
                    <Form.Group className="mb-4" controlId="registerUsername">
                      <Form.Label
                        className="fw-bold text-start d-block"
                        style={{
                          color: "var(--text-primary)",
                          marginBottom: "0.75rem",
                        }}
                      >
                        Full Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={form.username}
                        onChange={(e) => {
                          setForm({ ...form, username: e.target.value });
                          if (validationErrors.username) {
                            setValidationErrors({
                              ...validationErrors,
                              username: "",
                            });
                          }
                        }}
                        placeholder="Enter your full name"
                        required
                        minLength={2}
                        isInvalid={!!validationErrors.username}
                        isValid={
                          validated &&
                          form.username &&
                          !validationErrors.username &&
                          form.username.length >= 2
                        }
                        style={{
                          borderRadius: "12px",
                          padding: "12px 16px",
                          fontSize: "1rem",
                          transition: "all 0.3s ease",
                        }}
                      />
                      <Form.Control.Feedback
                        type="invalid"
                        style={{ fontSize: "0.875rem" }}
                      >
                        {validationErrors.username ||
                          "Please provide a valid full name (at least 2 characters)."}
                      </Form.Control.Feedback>
                      <Form.Control.Feedback
                        type="valid"
                        style={{ fontSize: "0.875rem" }}
                      >
                        Full name looks good!
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="registerEmail">
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
                        value={form.email}
                        onChange={(e) => {
                          setForm({ ...form, email: e.target.value });
                          if (validationErrors.email) {
                            setValidationErrors({
                              ...validationErrors,
                              email: "",
                            });
                          }
                        }}
                        placeholder="Enter your email"
                        required
                        isInvalid={!!validationErrors.email}
                        isValid={
                          validated &&
                          form.email &&
                          !validationErrors.email &&
                          /\S+@\S+\.\S+/.test(form.email)
                        }
                        style={{
                          borderRadius: "12px",
                          padding: "12px 16px",
                          fontSize: "1rem",
                          transition: "all 0.3s ease",
                        }}
                      />
                      <Form.Control.Feedback
                        type="invalid"
                        style={{ fontSize: "0.875rem" }}
                      >
                        {validationErrors.email ||
                          "Please provide a valid email address."}
                      </Form.Control.Feedback>
                      <Form.Control.Feedback
                        type="valid"
                        style={{ fontSize: "0.875rem" }}
                      >
                        Email looks good!
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="registerPassword">
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
                        value={form.password}
                        onChange={(e) => {
                          setForm({ ...form, password: e.target.value });
                          if (validationErrors.password) {
                            setValidationErrors({
                              ...validationErrors,
                              password: "",
                            });
                          }
                        }}
                        placeholder="Create a strong password"
                        required
                        minLength={6}
                        isInvalid={!!validationErrors.password}
                        isValid={
                          validated &&
                          form.password &&
                          !validationErrors.password &&
                          form.password.length >= 6
                        }
                        style={{
                          borderRadius: "12px",
                          padding: "12px 16px",
                          fontSize: "1rem",
                          transition: "all 0.3s ease",
                        }}
                      />
                      <Form.Control.Feedback
                        type="invalid"
                        style={{ fontSize: "0.875rem" }}
                      >
                        
                      </Form.Control.Feedback>
                      <Form.Control.Feedback
                        type="valid"
                        style={{ fontSize: "0.875rem" }}
                      >
                        Password strength looks good!
                      </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-grid gap-3 mb-4">
                      <Button
                        variant="primary"
                        type="submit"
                        size="lg"
                        disabled={
                          loading ||
                          !form.username ||
                          !form.email ||
                          !form.password
                        }
                        className="hover-scale"
                        style={{
                          borderRadius: "12px",
                          fontWeight: "600",
                          padding: "12px",
                          fontSize: "1.1rem",
                          background:
                            loading ||
                            !form.username ||
                            !form.email ||
                            !form.password
                              ? "linear-gradient(45deg, #9ca3af, #6b7280)"
                              : "linear-gradient(45deg, var(--secondary-color), #34d399)",
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
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>

                      <Button
                        variant="outline-secondary"
                        onClick={() => navigate("/login")}
                        className="hover-scale"
                        style={{
                          borderRadius: "12px",
                          fontWeight: "500",
                          padding: "10px",
                          borderColor: "var(--border-color)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Already have an account? Sign In
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
  );
}
