import React, { useEffect, useRef, useState } from "react";
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
}) => {
  const phoneInputRef = useRef(null);
  const itiRef = useRef(null);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    const input = phoneInputRef.current;
    if (!input) return;
    // determine initial country (intl-tel-input expects ISO2 code)
    const initialCountry =
      shippingAddress && shippingAddress.country
        ? shippingAddress.country.toLowerCase() === "india"
          ? "in"
          : undefined
        : undefined;

    const CSS_HREF =
      "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/css/intlTelInput.css";
    const SCRIPT_SRC =
      "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/intlTelInput.min.js";
    const UTILS_SRC =
      "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js";

    // inject CSS if not already present
    if (!document.querySelector(`link[href='${CSS_HREF}']`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CSS_HREF;
      document.head.appendChild(link);
    }

    const ensureScript = () =>
      new Promise((resolve, reject) => {
        if (window.intlTelInput) return resolve();
        const existing = document.querySelector(`script[src='${SCRIPT_SRC}']`);
        if (existing) {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () => reject());
          return;
        }
        const script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error("Failed to load intlTelInput script"));
        document.body.appendChild(script);
      });

    let mounted = true;

    ensureScript()
      .then(() => {
        if (!mounted) return;
        // initialize
        const iti = window.intlTelInput(input, {
          initialCountry: initialCountry,
          separateDialCode: true,
          utilsScript: UTILS_SRC,
        });
        itiRef.current = iti;

        // set initial input value from shippingAddress
        if (shippingAddress && shippingAddress.phone)
          input.value = shippingAddress.phone;

        const handleChange = () => {
          const val = input.value;
          const countryData =
            (itiRef.current && itiRef.current.getSelectedCountryData()) || {};
          setShippingAddress((prev) => ({
            ...prev,
            phone: val,
            country: countryData.name || prev.country,
            countryCode: countryData.dialCode || prev.countryCode,
          }));
        };

        input.addEventListener("change", handleChange);
        input.addEventListener("blur", handleChange);

        // store handler so we can remove it later
        input.__iti_handle_change = handleChange;
      })
      .catch(() => {
        // script failed to load — leave non-enhanced input
      });

    return () => {
      mounted = false;
      const handleChange = input.__iti_handle_change;
      if (handleChange) {
        input.removeEventListener("change", handleChange);
        input.removeEventListener("blur", handleChange);
        delete input.__iti_handle_change;
      }
      if (itiRef.current) {
        try {
          itiRef.current.destroy();
        } catch (e) {}
      }
      itiRef.current = null;
    };
  }, [shippingAddress.country, setShippingAddress]);

  const validatePhone = () => {
    const iti = itiRef.current;
    if (!iti) return false;
    try {
      return iti.isValidNumber();
    } catch (e) {
      return false;
    }
  };

  return (
    <Row>
      <Col lg={8} xs={12}>
        <Card
          style={{
            border: "none",
            borderRadius: "16px",
            boxShadow: "var(--shadow-lg)",
            marginBottom: "clamp(1rem, 4vw, 2rem)",
          }}
        >
          <Card.Header
            style={{
              background:
                "linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))",
              border: "none",
              borderRadius: "16px 16px 0 0",
              padding: "clamp(0.75rem, 3vw, 1.5rem)",
            }}
          >
            <div className="d-flex align-items-center">
              <CreditCard
                className="me-2"
                style={{ color: "var(--primary-color)" }}
              />
              <h4
                className="mb-0"
                style={{
                  color: "var(--text-primary)",
                  fontWeight: "600",
                  fontSize: "clamp(1rem, 4vw, 1.35rem)",
                }}
              >
                Shipping Address
              </h4>
            </div>
            <p
              className="mb-0 mt-1"
              style={{
                color: "var(--text-secondary)",
                fontSize: "clamp(0.8rem, 2vw, 0.875rem)",
              }}
            >
              Where should we deliver your order?
            </p>
          </Card.Header>
          <Card.Body style={{ padding: "clamp(1rem, 4vw, 2rem)" }}>
            {loadingAddresses ? (
              <div
                className="mb-4 text-center"
                style={{
                  padding: "clamp(1rem, 4vw, 2rem)",
                  color: "var(--text-secondary)",
                }}
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
                <h5 className="saved-addresses-title">
                  📍 Your Saved Addresses
                </h5>
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
                  if (!validatePhone()) {
                    setLocalError("Please enter a valid phone number");
                    return;
                  }
                  setLocalError(null);
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
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      name="phone"
                      defaultValue={shippingAddress.phone}
                      placeholder="Enter phone number"
                      required
                      style={{
                        ...inputStyle,
                        padding:
                          inputStyle && inputStyle.padding
                            ? inputStyle.padding
                            : undefined,
                      }}
                      autoComplete="off"
                      spellCheck="false"
                      className="form-control"
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

              {(error || localError) && (
                <Alert
                  variant="danger"
                  className="mb-3"
                  style={{ borderRadius: "12px" }}
                >
                  {localError || error}
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
              padding: "clamp(0.75rem, 3vw, 1.5rem)",
            }}
          >
            <div className="d-flex align-items-center">
              <Package className="me-2" />
              <h5
                className="mb-0 fw-bold"
                style={{ fontSize: "clamp(0.95rem, 3vw, 1.15rem)" }}
              >
                Order Summary
              </h5>
            </div>
            <p
              className="mb-0 mt-1"
              style={{
                fontSize: "clamp(0.8rem, 2vw, 0.875rem)",
                opacity: "0.9",
              }}
            >
              Review your items before checkout
            </p>
          </Card.Header>
          <Card.Body style={{ padding: "clamp(0.75rem, 3vw, 1.5rem)" }}>
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
                      item.product.name.charAt(0) === "K"
                        ? "#3b82f6"
                        : "#10b981"
                    }, ${
                      item.product.name.charAt(0) === "K"
                        ? "#1d4ed8"
                        : "#059669"
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
                <span style={{ color: "var(--text-secondary)" }}>
                  Subtotal:
                </span>
                <span style={{ fontWeight: "600" }}>
                  ₹{subtotal.toFixed(2)}
                </span>
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
};
