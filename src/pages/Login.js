import { useDispatch } from "react-redux";
import { loginUser } from "../features/authSlice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await dispatch(loginUser({ email, password }));
    setLoading(false);
    if (response?.payload?.token) {
      if (response?.payload?.user?.isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }
    }
  };

  const navigateToRegister = () => {
    navigate("/register");
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "100px" }}
        >
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Row className="w-100 justify-content-center">
          <Col xs={12} sm={8} md={6} lg={4}>
            <Card>
              <Card.Body>
                <h2 className="mb-4 text-center">Login</h2>
                <Form onSubmit={handleSubmit}>
                  <Form.Group
                    className="mb-3 text-start"
                    controlId="formBasicEmail"
                  >
                    <Form.Label className="text-start w-100">Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      required
                    />
                  </Form.Group>
                  <Form.Group
                    className="mb-3 text-start"
                    controlId="formBasicPassword"
                  >
                    <Form.Label className="text-start w-100">
                      Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-center gap-4">
                    <Button variant="primary" type="submit">
                      Login
                    </Button>
                    <Button variant="secondary" onClick={navigateToRegister}>
                      Register
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}
