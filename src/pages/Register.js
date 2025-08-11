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

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const registered = dispatch(register(form));
    if (registered) {
      navigate("/login");
    }
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card>
            <Card.Body>
              <h2 className="mb-4 text-center">Register</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group
                  className="mb-3 text-start"
                  controlId="formUsername"
                >
                  <Form.Label className="text-start w-100">Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    placeholder="Username"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3 text-start" controlId="formEmail">
                  <Form.Label className="text-start w-100">Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="Email"
                    required
                  />
                </Form.Group>
                <Form.Group
                  className="mb-3 text-start"
                  controlId="formPassword"
                >
                  <Form.Label className="text-start w-100">Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Password"
                    required
                  />
                </Form.Group>
                <div className="d-flex justify-content-center gap-4">
                  <Button variant="primary" type="submit">
                    Register
                  </Button>
                  <Button variant="secondary" onClick={() => navigate("/")}>
                    Login
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
