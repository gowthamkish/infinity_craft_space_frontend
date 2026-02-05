import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import { Trash2, CreditCard, Package } from "react-feather";

export const ShippingStep = ({
  cartItems,
  subtotal,
  total,
  shippingAddress,
  labelStyle,
  inputStyle,
  loadingAddresses,
  savedAddresses,
  selectedAddressId,
  selectSavedAddress,
  handleDeleteAddress,
  saveAddressToBook,
  setSaveAddressToBook,
  setShippingAddress,
  handleInputChange,
  error,
  setCurrentStep,
  loading,
  proceedToPayment,
  handleSaveAddress,
}) => (
  <Row>
    <Col lg={8} xs={12}>
      <Card
        style={{
          border: "none",
          borderRadius: "16px",
          boxShadow: "var(--shadow-lg)",
          marginBottom: "2rem",
        }}
      >
        <Card.Header
          style={{
            background:
              "linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))",
            border: "none",
            borderRadius: "16px 16px 0 0",
            padding: "1.5rem",
          }}
        >
          <div className="d-flex align-items-center">
            <CreditCard
              className="me-2"
              style={{ color: "var(--primary-color)" }}
            />
            <h4
              className="mb-0"
              style={{ color: "var(--text-primary)", fontWeight: "600" }}
            >
              Shipping Address
            </h4>
          </div>
          <p
            className="mb-0 mt-1"
            style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
          >
            Where should we deliver your order?
          </p>
        </Card.Header>
        <Card.Body style={{ padding: "2rem" }}>
          {loadingAddresses ? (
            <div
              className="mb-4 text-center"
              style={{ padding: "2rem", color: "var(--text-secondary)" }}
            >
              <div
                className="spinner-border spinner-border-sm me-2"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              Loading your saved addresses...
            </div>
          ) : savedAddresses.length > 0 ? (
            <div className="saved-addresses-section">
              <h5 className="saved-addresses-title">📍 Your Saved Addresses</h5>
              <div className="saved-addresses-container">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr._id}
                    className={`saved-address-card ${
                      selectedAddressId === addr._id ? "selected" : ""
                    }`}
                    onClick={() => selectSavedAddress(addr)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        selectSavedAddress(addr);
                      }
                    }}
                  >
                    <div className="address-radio" />

                    <div className="address-details">
                      <div className="address-label">
                        {addr.label ? (
                          <>
                            {addr.label}{" "}
                            <Badge
                              bg="light"
                              text="dark"
                              style={{
                                fontSize: "0.75rem",
                                marginLeft: "0.5rem",
                              }}
                            >
                              {addr.city}
                            </Badge>
                          </>
                        ) : (
                          `${addr.city}, ${addr.state}`
                        )}
                      </div>
                      <div className="address-text">
                        {addr.street}
                        <br />
                        {addr.city}, {addr.state} {addr.zipCode}
                        <br />
                        {addr.country}
                      </div>
                      <div className="address-phone">📞 {addr.phone}</div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(addr._id);
                      }}
                      className="address-delete-btn"
                      title="Delete this address"
                      type="button"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <hr
                style={{
                  border: "1px solid var(--border-color)",
                  margin: "1.5rem 0",
                }}
              />
            </div>
          ) : null}

          <Form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              (async () => {
                if (saveAddressToBook) await handleSaveAddress();
                proceedToPayment();
              })();
            }}
          >
            <Row>
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label style={labelStyle}>
                    Address Label (optional)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="label"
                    value={shippingAddress.label}
                    onChange={handleInputChange}
                    placeholder="Home / Office / Friend"
                    style={inputStyle}
                    autoComplete="off"
                    spellCheck="false"
                  />
                </Form.Group>
              </Col>
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label style={labelStyle}>Street Address *</Form.Label>
                  <Form.Control
                    type="text"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleInputChange}
                    placeholder="Enter your complete street address"
                    required
                    style={inputStyle}
                    autoComplete="off"
                    spellCheck="false"
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={labelStyle}>City *</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    required
                    style={inputStyle}
                    autoComplete="off"
                    spellCheck="false"
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={labelStyle}>State *</Form.Label>
                  <Form.Control
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    placeholder="Enter your state"
                    required
                    style={inputStyle}
                    autoComplete="off"
                    spellCheck="false"
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={labelStyle}>ZIP Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={handleInputChange}
                    placeholder="Enter ZIP/Postal code"
                    required
                    style={inputStyle}
                    autoComplete="off"
                    spellCheck="false"
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={labelStyle}>Phone Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    required
                    style={inputStyle}
                    autoComplete="off"
                    spellCheck="false"
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={labelStyle}>Country</Form.Label>
                  <Form.Control
                    type="text"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    placeholder="India"
                    disabled
                    style={{
                      ...inputStyle,
                      backgroundColor: "var(--bg-tertiary)",
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            {error && (
              <Alert
                variant="danger"
                className="mb-3"
                style={{ borderRadius: "12px" }}
              >
                {error}
              </Alert>
            )}

            <div
              className="d-flex flex-column flex-md-row gap-3"
              style={{ alignItems: "stretch" }}
            >
              <Button
                variant="outline-secondary"
                onClick={() => setCurrentStep(1)}
                style={{
                  borderRadius: "12px",
                  fontWeight: "500",
                  padding: "12px 24px",
                }}
                className="flex-md-shrink-0"
              >
                Back to Cart
              </Button>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  flex: "1",
                }}
              >
                <Form.Check
                  type="checkbox"
                  id="saveAddress"
                  label="Save this address to my account"
                  checked={saveAddressToBook}
                  onChange={(e) => setSaveAddressToBook(e.target.checked)}
                  style={{ fontSize: "0.95rem" }}
                />
                <Form.Check
                  type="checkbox"
                  id="defaultAddress"
                  label="Make this my default address"
                  checked={shippingAddress.isDefault}
                  onChange={(e) =>
                    setShippingAddress((prev) => ({
                      ...prev,
                      isDefault: e.target.checked,
                    }))
                  }
                  style={{ fontSize: "0.95rem" }}
                />
              </div>

              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                style={{
                  borderRadius: "12px",
                  fontWeight: "600",
                  padding: "12px 24px",
                  background:
                    "linear-gradient(45deg, var(--secondary-color), #34d399)",
                  border: "none",
                  boxShadow: "var(--shadow-md)",
                }}
                className="flex-md-shrink-0"
              >
                Continue to Payment →
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Col>
    <Col lg={4}>
      <Card
        style={{
          border: "none",
          borderRadius: "16px",
          boxShadow: "var(--shadow-lg)",
          position: "sticky",
          top: "2rem",
        }}
      >
        <Card.Header
          style={{
            background:
              "linear-gradient(135deg, var(--secondary-color), #34d399)",
            color: "white",
            border: "none",
            borderRadius: "16px 16px 0 0",
            padding: "1.5rem",
          }}
        >
          <div className="d-flex align-items-center">
            <Package className="me-2" />
            <h5 className="mb-0 fw-bold">Order Summary</h5>
          </div>
          <p
            className="mb-0 mt-1"
            style={{ fontSize: "0.875rem", opacity: "0.9" }}
          >
            Review your items before checkout
          </p>
        </Card.Header>
        <Card.Body style={{ padding: "1.5rem" }}>
          {cartItems.slice(0, 3).map((item) => (
            <div
              key={item.product._id}
              className="d-flex align-items-center mb-3"
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  background: `linear-gradient(135deg, ${
                    item.product.name.charAt(0) === "K" ? "#3b82f6" : "#10b981"
                  }, ${
                    item.product.name.charAt(0) === "K" ? "#1d4ed8" : "#059669"
                  })`,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: "700",
                  marginRight: "12px",
                }}
              >
                {item.product.name.charAt(0)}
              </div>
              <div className="flex-grow-1">
                <h6
                  className="mb-0"
                  style={{ fontSize: "0.875rem", fontWeight: "600" }}
                >
                  {item.product.name}
                </h6>
                <p
                  className="mb-0"
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Qty: {item.quantity}
                </p>
              </div>
              <span
                style={{ fontWeight: "600", color: "var(--secondary-color)" }}
              >
                ₹{item.totalPrice}
              </span>
            </div>
          ))}

          {cartItems.length > 3 && (
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                textAlign: "center",
              }}
            >
              +{cartItems.length - 3} more items
            </p>
          )}

          <hr style={{ border: "1px solid var(--border-color)" }} />

          <div className="mb-3">
            <div className="d-flex justify-content-between mb-2">
              <span style={{ color: "var(--text-secondary)" }}>Subtotal:</span>
              <span style={{ fontWeight: "600" }}>₹{subtotal.toFixed(2)}</span>
            </div>
            <hr style={{ border: "1px solid var(--border-color)" }} />
            <div className="d-flex justify-content-between">
              <span
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                }}
              >
                Total:
              </span>
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "var(--secondary-color)",
                }}
              >
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>

          <div
            style={{
              background: "var(--bg-tertiary)",
              padding: "1rem",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <p
              className="mb-0"
              style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}
            >
              🔒 Your payment information is secure and encrypted
            </p>
          </div>
        </Card.Body>
      </Card>
    </Col>
  </Row>
);
