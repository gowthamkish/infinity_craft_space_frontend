import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

export const EmptyCart = ({ navigate }) => (
  <div className="main-container" style={{ paddingTop: "110px" }}>
    <Container>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card
            className="text-center"
            style={{
              border: "none",
              borderRadius: "24px",
              boxShadow: "var(--shadow-xl)",
              padding: "2rem",
            }}
          >
            <Card.Body>
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  background:
                    "linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 2rem",
                  fontSize: "3rem",
                }}
              >
                🛒
              </div>
              <h2
                className="mb-3"
                style={{ color: "var(--text-primary)", fontWeight: "700" }}
              >
                Your Cart is Empty
              </h2>
              <p
                className="mb-4"
                style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}
              >
                Looks like you haven't added any items to your cart yet. Start
                shopping to fill it up!
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/")}
                style={{
                  borderRadius: "12px",
                  fontWeight: "600",
                  padding: "12px 24px",
                  background:
                    "linear-gradient(45deg, var(--primary-color), var(--primary-light))",
                  border: "none",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                Start Shopping
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  </div>
);
