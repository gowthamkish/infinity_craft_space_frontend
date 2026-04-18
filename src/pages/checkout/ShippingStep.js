import React, { useEffect, useRef, useState, useCallback } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import { Trash2, CreditCard, Package } from "react-feather";
import { DotsLoader } from "../../components/Loader";
import api from "../../api/axios";

// ── Helpers ────────────────────────────────────────────────────────────────

/* COMMENTED OUT — tier-based delivery options (Standard / Fast / Express)
function fmtDeliveryDate(etd, estimatedDays) { ... }
function buildTiers(rates) { ... }
function DeliveryOptions({ rates, loading, error, zipCode, selectedTier, onSelect }) { ... }
const styles = { ... };
*/

// Pick Xpressbees Air from the Shiprocket rates array.
// Falls back to any Xpressbees courier, then to the first available rate.
function findXpressbees(rates) {
  if (!rates || rates.length === 0) return null;
  const byName = (name) => rates.find(
    (r) => r.courierName?.toLowerCase().includes(name)
  );
  return (
    byName("xpressbees air") ||
    byName("xpressbees") ||
    rates[0]
  );
}

function fmtDate(etd, estimatedDays) {
  if (etd) {
    try {
      const d = new Date(etd);
      if (!isNaN(d)) return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
      return etd;
    } catch { return etd; }
  }
  if (estimatedDays) {
    const d = new Date();
    d.setDate(d.getDate() + estimatedDays);
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  }
  return null;
}

// ── XpressbeesWidget ──────────────────────────────────────────────────────

function XpressbeesWidget({ loading, error, zipCode, courier }) {
  if (loading) {
    return (
      <div style={xStyles.card}>
        <div style={xStyles.header}>✈️ Delivery Partner</div>
        <div style={{ padding: "1rem", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>
          <DotsLoader size="sm" />
          <div style={{ marginTop: "0.4rem" }}>Checking rates for {zipCode}…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={xStyles.card}>
        <div style={xStyles.header}>✈️ Delivery Partner</div>
        <div style={{ padding: "0.875rem 1rem", color: "#b45309", fontSize: "0.82rem", background: "#fffbeb" }}>
          ⚠️ {error}
        </div>
      </div>
    );
  }

  if (!courier) return null;

  const deliveryDate = fmtDate(courier.etd, courier.estimatedDays);

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div style={xStyles.card}>
        <div style={xStyles.header}>
          ✈️ Delivery Partner
        </div>
        <div style={xStyles.body}>
          {/* Selected — always Xpressbees Air */}
          <div style={xStyles.row}>
            {/* Checkmark indicator */}
            <div style={xStyles.check}>✓</div>

            {/* Logo placeholder + name */}
            <div style={xStyles.logoBox}>XB</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "#1e293b" }}>
                  {courier.courierName || "Xpressbees Air"}
                </span>
                <span style={xStyles.tag}>Air Express</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.1rem" }}>
                Fast & reliable air delivery across India
              </div>
              {deliveryDate && (
                <div style={{ fontSize: "0.78rem", color: "#059669", fontWeight: 600, marginTop: "0.2rem" }}>
                  📅 Expected by {deliveryDate}
                </div>
              )}
            </div>

            {/* Price */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontWeight: 800, fontSize: "1.05rem", color: courier.rate === 0 ? "#059669" : "#1e293b" }}>
                {courier.rate === 0 ? "FREE" : `₹${courier.rate}`}
              </div>
              {courier.estimatedDays && (
                <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>~{courier.estimatedDays} days</div>
              )}
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div style={xStyles.trustBar}>
          <span>🔒 Secure</span>
          <span>📦 Insured</span>
          <span>🔄 Easy Returns</span>
          <span>⭐ 4.8/5 Rating</span>
        </div>
      </div>
    </div>
  );
}

const xStyles = {
  card: {
    border: "1.5px solid #e2e8f0",
    borderRadius: "14px",
    overflow: "hidden",
  },
  header: {
    padding: "0.65rem 1rem",
    background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    borderBottom: "1px solid #e2e8f0",
    fontWeight: 700,
    fontSize: "0.875rem",
    color: "#1e293b",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  },
  body: {
    padding: "0.875rem 1rem",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    background: "#eff6ff",
    border: "2px solid #2563eb",
    borderRadius: "12px",
    padding: "0.85rem 1rem",
    boxShadow: "0 0 0 3px rgba(37,99,235,0.08)",
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "#2563eb",
    color: "white",
    fontSize: "0.75rem",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: "8px",
    background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
    color: "white",
    fontSize: "0.72rem",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    letterSpacing: "0.03em",
  },
  tag: {
    fontSize: "0.65rem",
    fontWeight: 700,
    padding: "0.1rem 0.45rem",
    borderRadius: "99px",
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    background: "#dbeafe",
    color: "#1d4ed8",
  },
  trustBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem 1.5rem",
    padding: "0.5rem 0.75rem",
    fontSize: "0.72rem",
    color: "#64748b",
    background: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    justifyContent: "center",
  },
};

// ── AddressLabelChips ─────────────────────────────────────────────────────

const LABEL_PRESETS = ["Home", "Office", "Other"];

function AddressLabelChips({ value, onChange }) {
  const [custom, setCustom] = useState(
    LABEL_PRESETS.includes(value) || !value ? "" : value
  );
  const isPreset = LABEL_PRESETS.includes(value);
  const isOther = !isPreset && value;

  const select = (label) => {
    if (label === "Other") {
      onChange("Other");
    } else {
      setCustom("");
      onChange(label);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
        {LABEL_PRESETS.map((lbl) => {
          const active = lbl === "Other" ? (value === "Other" || isOther) : value === lbl;
          return (
            <button
              key={lbl}
              type="button"
              onClick={() => select(lbl)}
              style={{
                padding: "0.3rem 0.9rem",
                borderRadius: "99px",
                border: `1.5px solid ${active ? "var(--primary-color, #2563eb)" : "#cbd5e1"}`,
                background: active ? "var(--primary-color, #2563eb)" : "white",
                color: active ? "white" : "#475569",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {lbl === "Home" ? "🏠 Home" : lbl === "Office" ? "🏢 Office" : "✏️ Other"}
            </button>
          );
        })}
      </div>
      {(value === "Other" || (isOther && !isPreset)) && (
        <input
          type="text"
          className="form-control"
          placeholder="e.g. Parents' house, Gym, etc."
          value={isOther && value !== "Other" ? value : custom}
          onChange={(e) => { setCustom(e.target.value); onChange(e.target.value || "Other"); }}
          style={{ fontSize: "0.875rem", borderRadius: "10px" }}
          autoFocus
        />
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

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
  shippingRate,
  onShippingRateSelected,
}) => {
  const phoneInputRef = useRef(null);
  const itiRef = useRef(null);
  const [localError, setLocalError] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeAutoFilled, setPincodeAutoFilled] = useState(false);
  const [pincodeError, setPincodeError] = useState(null);

  // Auto-fill city/state from India Post pincode API
  const fetchPincodeDetails = useCallback(async (pin) => {
    setPincodeLoading(true);
    setPincodeError(null);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length) {
        const po = data[0].PostOffice[0];
        setShippingAddress((prev) => ({
          ...prev,
          city: po.District || po.Division || prev.city,
          state: po.State || prev.state,
        }));
        setPincodeAutoFilled(true);
      } else {
        setPincodeError("Pincode not found — please enter city/state manually");
        setPincodeAutoFilled(false);
      }
    } catch {
      setPincodeAutoFilled(false);
    } finally {
      setPincodeLoading(false);
    }
  }, [setShippingAddress]);

  // ── Shipping rates state ─────────────────────────────────────
  const [rates, setRates] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState(null);
  // COMMENTED OUT — tier selection (Standard / Fast / Express)
  // const [selectedTier, setSelectedTier] = useState("fast");

  // Calculate total weight from cart items (0.5 kg default per item unit)
  const cartWeight = cartItems.reduce(
    (sum, item) => sum + (item.product?.weight || 0.5) * item.quantity,
    0,
  );

  const fetchRates = useCallback(
    async (pincode) => {
      if (!pincode || !/^\d{6}$/.test(pincode)) return;
      setRatesLoading(true);
      setRatesError(null);
      try {
        const res = await api.get("/api/shipping/rates", {
          params: {
            pincode,
            weight: Math.max(cartWeight, 0.5).toFixed(2),
            declaredValue: subtotal.toFixed(0),
          },
        });
        const fetchedRates = res.data.rates || [];
        setRates(fetchedRates);
        // Always pick Xpressbees Air (or best fallback)
        const xb = findXpressbees(fetchedRates);
        onShippingRateSelected?.(xb ?? null);
      } catch {
        setRatesError("Could not fetch shipping rates. Free shipping will apply.");
        onShippingRateSelected?.(null);
      } finally {
        setRatesLoading(false);
      }
    },
    [cartWeight, subtotal, onShippingRateSelected],
  );

  // Auto-fetch rates + city/state when pincode reaches 6 digits
  useEffect(() => {
    const pin = shippingAddress.zipCode?.trim();
    if (pin?.length === 6 && /^\d{6}$/.test(pin)) {
      fetchRates(pin);
      fetchPincodeDetails(pin);
    } else {
      setRates([]);
      onShippingRateSelected?.(null);
      if ((pin?.length ?? 0) < 6) {
        setPincodeAutoFilled(false);
        setPincodeError(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingAddress.zipCode]);

  useEffect(() => {
    const input = phoneInputRef.current;
    if (!input) return;

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
        // Initialize with India only — no country switching allowed
        const iti = window.intlTelInput(input, {
          initialCountry: "in", // Fixed to India
          separateDialCode: true,
          utilsScript: UTILS_SRC,
          onlyCountries: ["in"], // Restrict to India only
          preferredCountries: ["in"],
        });
        itiRef.current = iti;

        // Disable country selection but keep flag visible
        const flagContainer = input.parentElement?.querySelector(
          ".iti__flag-container",
        );
        if (flagContainer) {
          // Prevent clicking on the flag to open country list
          flagContainer.style.cursor = "not-allowed";
          flagContainer.style.pointerEvents = "auto";
          flagContainer.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          };
        }

        // Disable the country list button
        const countryListBtn = input.parentElement?.querySelector(
          ".iti__selected-flag",
        );
        if (countryListBtn) {
          countryListBtn.style.pointerEvents = "none";
          countryListBtn.style.cursor = "not-allowed";
        }

        // set initial input value from shippingAddress
        if (shippingAddress && shippingAddress.phone) {
          // Strip country code if present (e.g., +91 prefix)
          let phoneValue = shippingAddress.phone.toString().trim();
          if (phoneValue.startsWith("+91")) {
            phoneValue = phoneValue.substring(3);
          }
          input.value = phoneValue;
        }

        const handleChange = () => {
          const fullNumber = iti.getNumber(); // Full number with country code
          const nationalNumber = input.value; // Just the number part

          setShippingAddress((prev) => ({
            ...prev,
            phone: nationalNumber, // Store without country code
            country: "India",
            countryCode: "+91",
          }));
        };

        input.addEventListener("change", handleChange);
        input.addEventListener("blur", handleChange);
        input.addEventListener("keyup", handleChange);

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
        input.removeEventListener("keyup", handleChange);
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
    const input = phoneInputRef.current;
    if (!input || !input.value) return false;

    // Indian phone validation: 10 digits, starting with 6-9
    const phoneNumber = input.value.toString().trim();
    const isFallbackValid = /^[6-9]\d{9}$/.test(phoneNumber);

    // Try intl-tel-input validation if available
    const iti = itiRef.current;
    if (iti) {
      try {
        return iti.isValidNumber() || isFallbackValid;
      } catch (e) {
        return isFallbackValid;
      }
    }

    return isFallbackValid;
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
                <DotsLoader size="sm" />
                Loading your saved addresses…
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
              {/* ── Address Label Chips ── */}
              <div className="mb-3">
                <Form.Label style={labelStyle}>Address Label <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optional)</span></Form.Label>
                <AddressLabelChips
                  value={shippingAddress.label}
                  onChange={(val) => setShippingAddress((prev) => ({ ...prev, label: val }))}
                />
              </div>

              {/* ── Street Address ── */}
              <div className="mb-3">
                <Form.Label style={labelStyle}>
                  Street Address <span style={{ color: "#ef4444" }}>*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="street"
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  placeholder="House/Flat no., Building name, Street, Area…"
                  required
                  style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
                  autoComplete="street-address"
                />
              </div>

              {/* ── Pincode + auto-fill row ── */}
              <Row>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label style={labelStyle}>
                      PIN Code <span style={{ color: "#ef4444" }}>*</span>
                    </Form.Label>
                    <div style={{ position: "relative" }}>
                      <Form.Control
                        type="text"
                        name="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                          handleInputChange({ target: { name: "zipCode", value: val } });
                          if (val.length < 6) { setPincodeAutoFilled(false); setPincodeError(null); }
                        }}
                        placeholder="6-digit PIN"
                        required
                        maxLength={6}
                        inputMode="numeric"
                        style={{ ...inputStyle, paddingRight: pincodeLoading ? "2.5rem" : undefined }}
                        autoComplete="postal-code"
                      />
                      {pincodeLoading && (
                        <div style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem", color: "#94a3b8" }}>
                          ⟳
                        </div>
                      )}
                    </div>
                    {pincodeAutoFilled && !pincodeLoading && (
                      <div style={{ fontSize: "0.72rem", color: "#059669", marginTop: "0.25rem", fontWeight: 600 }}>
                        ✓ City & state auto-filled
                      </div>
                    )}
                    {pincodeError && (
                      <div style={{ fontSize: "0.72rem", color: "#b45309", marginTop: "0.25rem" }}>
                        ⚠ {pincodeError}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label style={labelStyle}>
                      City <span style={{ color: "#ef4444" }}>*</span>
                      {pincodeAutoFilled && (
                        <span style={{ marginLeft: "0.4rem", fontSize: "0.68rem", color: "#059669", fontWeight: 600 }}>Auto</span>
                      )}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={(e) => { setPincodeAutoFilled(false); handleInputChange(e); }}
                      placeholder="City / District"
                      required
                      style={{
                        ...inputStyle,
                        background: pincodeAutoFilled ? "#f0fdf4" : undefined,
                        borderColor: pincodeAutoFilled ? "#86efac" : undefined,
                      }}
                      autoComplete="address-level2"
                    />
                  </Form.Group>
                </Col>

                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label style={labelStyle}>
                      State <span style={{ color: "#ef4444" }}>*</span>
                      {pincodeAutoFilled && (
                        <span style={{ marginLeft: "0.4rem", fontSize: "0.68rem", color: "#059669", fontWeight: 600 }}>Auto</span>
                      )}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={(e) => { setPincodeAutoFilled(false); handleInputChange(e); }}
                      placeholder="State"
                      required
                      style={{
                        ...inputStyle,
                        background: pincodeAutoFilled ? "#f0fdf4" : undefined,
                        borderColor: pincodeAutoFilled ? "#86efac" : undefined,
                      }}
                      autoComplete="address-level1"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* ── Phone ── */}
              <div className="mb-3">
                <Form.Label style={labelStyle}>
                  Phone Number <span style={{ color: "#ef4444" }}>*</span>
                  <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: "0.4rem", fontSize: "0.78rem" }}>(India, 10 digits)</span>
                </Form.Label>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  name="phone"
                  defaultValue={shippingAddress.phone}
                  placeholder="9876543210"
                  required
                  style={{ ...inputStyle, width: "100%", cursor: "text" }}
                  autoComplete="tel-national"
                  inputMode="numeric"
                  className="form-control"
                />
              </div>

              {/* ── Delivery Partner Widget (Xpressbees Air) ── */}
              {(ratesLoading || rates.length > 0 || ratesError) && (
                <XpressbeesWidget
                  loading={ratesLoading}
                  error={ratesError}
                  zipCode={shippingAddress.zipCode}
                  courier={findXpressbees(rates)}
                />
              )}

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
              {shippingRate && (
                <div className="d-flex justify-content-between mb-2">
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.875rem",
                    }}
                  >
                    Shipping (Xpressbees Air):
                  </span>
                  <span
                    style={{
                      fontWeight: "600",
                      color: shippingRate.rate === 0 ? "#059669" : "inherit",
                    }}
                  >
                    {shippingRate.rate === 0 ? "FREE" : `₹${shippingRate.rate}`}
                  </span>
                </div>
              )}
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
                  ₹{(subtotal + (shippingRate?.rate || 0)).toFixed(2)}
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
