import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import { Trash2, CreditCard, Package } from "react-feather";
import { DotsLoader } from "../../components/Loader";
// import api from "../../api/axios"; // COMMENTED OUT — Shiprocket API no longer used

// ── COMMENTED OUT — Shiprocket rate fetching (will be re-enabled when product scales)
/*
import api from "../../api/axios";

function findXpressbees(rates) { ... }
function fmtDate(etd, estimatedDays) { ... }
function XpressbeesWidget({ loading, error, zipCode, courier }) { ... }
const xStyles = { ... };
// Also commented: fetchRates(), ratesLoading, ratesError, rates state
*/

// ── COMMENTED OUT — tier-based delivery options (Standard / Fast / Express)
/*
function fmtDeliveryDate(etd, estimatedDays) { ... }
function buildTiers(rates) { ... }
function DeliveryOptions({ rates, loading, error, zipCode, selectedTier, onSelect }) { ... }
const styles = { ... };
*/

// ══════════════════════════════════════════════════════════════════════════════
// ROADWAYS SHIPPING — Domestic Slab Rate Card (Surface/Road only)
// All zones use roadways (no air transit) — cheapest & reliable for India
// ══════════════════════════════════════════════════════════════════════════════

// Weight slabs in grams → price (₹)
const ROAD_ZONES = {
  LOCAL: {
    label: "Local Delivery",
    sublabel: "Bangalore / Bengaluru",
    deliveryDays: "1–2",
    color: "#16a34a",
    rates: [
      { maxG: 250,   price: 50 },
      { maxG: 500,   price: 70 },
      { maxG: 750,   price: 90 },
      { maxG: 1000,  price: 110 },
      { maxG: 2000,  price: 175 },
      { maxG: 3000,  price: 240 },
      { maxG: 4000,  price: 305 },
      { maxG: 5000,  price: 370 },
      { maxG: 6000,  price: 425 },
      { maxG: 7000,  price: 480 },
      { maxG: 8000,  price: 535 },
      { maxG: 9000,  price: 590 },
      { maxG: 10000, price: 645 },
    ],
    perKgAbove10: 55,
    perKgAbove50: 45,
  },
  STATE: {
    label: "Within Karnataka",
    sublabel: "Rest of Karnataka",
    deliveryDays: "2–3",
    color: "#0891b2",
    rates: [
      { maxG: 250,   price: 65 },
      { maxG: 500,   price: 88 },
      { maxG: 750,   price: 110 },
      { maxG: 1000,  price: 133 },
      { maxG: 2000,  price: 210 },
      { maxG: 3000,  price: 290 },
      { maxG: 4000,  price: 370 },
      { maxG: 5000,  price: 450 },
      { maxG: 6000,  price: 520 },
      { maxG: 7000,  price: 595 },
      { maxG: 8000,  price: 670 },
      { maxG: 9000,  price: 745 },
      { maxG: 10000, price: 820 },
    ],
    perKgAbove10: 70,
    perKgAbove50: 58,
  },
  SOUTH: {
    label: "South India",
    sublabel: "AP, Telangana, Kerala, Tamil Nadu",
    deliveryDays: "3–5",
    color: "#7c3aed",
    rates: [
      { maxG: 250,   price: 85 },
      { maxG: 500,   price: 110 },
      { maxG: 750,   price: 135 },
      { maxG: 1000,  price: 160 },
      { maxG: 2000,  price: 255 },
      { maxG: 3000,  price: 355 },
      { maxG: 4000,  price: 455 },
      { maxG: 5000,  price: 555 },
      { maxG: 6000,  price: 640 },
      { maxG: 7000,  price: 730 },
      { maxG: 8000,  price: 820 },
      { maxG: 9000,  price: 910 },
      { maxG: 10000, price: 1000 },
    ],
    perKgAbove10: 88,
    perKgAbove50: 72,
  },
  PAN_INDIA: {
    label: "Pan-India",
    sublabel: "MH, GJ, Goa, Delhi, UP, MP, RJ, HR, WB & more",
    deliveryDays: "5–8",
    color: "#2563eb",
    rates: [
      { maxG: 250,   price: 120 },
      { maxG: 500,   price: 155 },
      { maxG: 750,   price: 190 },
      { maxG: 1000,  price: 225 },
      { maxG: 2000,  price: 360 },
      { maxG: 3000,  price: 500 },
      { maxG: 4000,  price: 640 },
      { maxG: 5000,  price: 780 },
      { maxG: 6000,  price: 895 },
      { maxG: 7000,  price: 1020 },
      { maxG: 8000,  price: 1145 },
      { maxG: 9000,  price: 1270 },
      { maxG: 10000, price: 1395 },
    ],
    perKgAbove10: 130,
    perKgAbove50: 108,
  },
  REMOTE: {
    label: "Remote / Hilly Areas",
    sublabel: "NE States, Andaman, J&K, Ladakh, HP",
    deliveryDays: "7–12",
    color: "#b45309",
    rates: [
      { maxG: 250,   price: 145 },
      { maxG: 500,   price: 188 },
      { maxG: 750,   price: 232 },
      { maxG: 1000,  price: 275 },
      { maxG: 2000,  price: 440 },
      { maxG: 3000,  price: 610 },
      { maxG: 4000,  price: 785 },
      { maxG: 5000,  price: 960 },
      { maxG: 6000,  price: 1105 },
      { maxG: 7000,  price: 1265 },
      { maxG: 8000,  price: 1425 },
      { maxG: 9000,  price: 1590 },
      { maxG: 10000, price: 1750 },
    ],
    perKgAbove10: 165,
    perKgAbove50: 138,
  },
};

// State → Zone key mapping (roadways grouping)
function getZoneKey(state, city) {
  const s = (state || "").toLowerCase().trim();
  const c = (city || "").toLowerCase().trim();

  if (c.includes("bangalore") || c.includes("bengaluru")) return "LOCAL";

  if (s.includes("karnataka")) return "STATE";

  if (
    s.includes("andhra") || s.includes("telangana") ||
    s.includes("kerala") || s.includes("tamil")
  ) return "SOUTH";

  if (
    s.includes("manipur") || s.includes("meghalaya") ||
    s.includes("mizoram") || s.includes("nagaland") ||
    s.includes("sikkim") || s.includes("tripura") ||
    s.includes("assam") || s.includes("arunachal") ||
    s.includes("andaman") || s.includes("jammu") ||
    s.includes("kashmir") || s.includes("ladakh") ||
    s.includes("himachal")
  ) return "REMOTE";

  // Maharashtra, Gujarat, Goa, Delhi, UP, MP, RJ, HR, WB, Punjab, Bihar, etc.
  return "PAN_INDIA";
}

// Shipping charge calculation
function calcShippingRate(weightKg, zoneKey) {
  const zone = ROAD_ZONES[zoneKey];
  if (!zone) return 0;

  const weightG = weightKg * 1000;

  for (const slab of zone.rates) {
    if (weightG <= slab.maxG) return slab.price;
  }

  if (weightKg <= 50) {
    const extraKg = Math.ceil(weightKg - 10);
    return zone.rates[zone.rates.length - 1].price + extraKg * zone.perKgAbove10;
  }

  const base50 = zone.rates[zone.rates.length - 1].price + 40 * zone.perKgAbove10;
  return base50 + Math.ceil(weightKg - 50) * zone.perKgAbove50;
}

// Expected delivery date range string
// dispatchBuffer: extra days for custom/handcrafted orders before dispatch
function expectedDeliveryRange(deliveryDays, dispatchBuffer = 0) {
  const parts = deliveryDays.split("–").map(Number);
  const minDays = (parts[0] || 3) + dispatchBuffer;
  const maxDays = (parts[1] || minDays + 3) + dispatchBuffer;

  const fmt = (d) =>
    d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

  const from = new Date();
  from.setDate(from.getDate() + minDays);
  const to = new Date();
  to.setDate(to.getDate() + maxDays);

  return `${fmt(from)} – ${fmt(to)}`;
}

// ── ShippingWidget ──────────────────────────────────────────────────────────

function ShippingWidget({ zoneKey, weightKg, rate, dispatchBuffer = 0 }) {
  if (!zoneKey) return null;

  const zone = ROAD_ZONES[zoneKey];
  if (!zone) return null;

  const deliveryRange = expectedDeliveryRange(zone.deliveryDays, dispatchBuffer);
  const accent = zone.color;

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div style={shipStyles.card}>
        {/* Header */}
        <div style={shipStyles.header}>
          <span>🚚 Shipping Details</span>
          <span style={{
            fontSize: "0.68rem",
            fontWeight: 700,
            color: "#16a34a",
            background: "#dcfce7",
            padding: "0.15rem 0.55rem",
            borderRadius: "99px",
          }}>
            🛣️ Road Delivery
          </span>
        </div>

        {/* Rate row */}
        <div style={shipStyles.body}>
          <div style={{ ...shipStyles.row, borderColor: accent, boxShadow: `0 0 0 3px ${accent}18` }}>
            <div style={{ ...shipStyles.check, background: accent }}>✓</div>

            <div style={{ ...shipStyles.iconBox, background: `linear-gradient(135deg, ${accent}, ${accent}bb)` }}>
              🚛
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "#1e293b" }}>
                  Standard Road Delivery
                </span>
                <span style={{ ...shipStyles.tag, background: `${accent}1a`, color: accent }}>
                  {zone.label}
                </span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.1rem" }}>
                {zone.sublabel}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#059669", fontWeight: 600, marginTop: "0.25rem" }}>
                📅 Expected: {deliveryRange}
              </div>
              {dispatchBuffer > 0 && (
                <div style={{ fontSize: "0.7rem", color: "#f59e0b", fontWeight: 600, marginTop: "0.1rem" }}>
                  ⏳ Includes ~10–12 day handcraft dispatch
                </div>
              )}
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.1rem" }}>
                Shipment weight:{" "}
                {weightKg < 1
                  ? `${Math.round(weightKg * 1000)} g`
                  : `${weightKg.toFixed(2)} kg`}
              </div>
            </div>

            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", color: rate === 0 ? "#059669" : "#1e293b" }}>
                {rate === 0 ? "FREE" : `₹${rate}`}
              </div>
              <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
                {zone.deliveryDays} days
              </div>
            </div>
          </div>
        </div>

        <div style={shipStyles.trustBar}>
          <span>🔒 Safe Packaging</span>
          <span>📦 Door Delivery</span>
          <span>🔄 Easy Returns</span>
          <span>📍 Pan-India</span>
        </div>
      </div>
    </div>
  );
}

const shipStyles = {
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
    justifyContent: "space-between",
  },
  body: { padding: "0.875rem 1rem" },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    background: "#f8fafc",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    padding: "0.85rem 1rem",
  },
  check: {
    width: 22, height: 22,
    borderRadius: "50%",
    color: "white",
    fontSize: "0.75rem",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconBox: {
    width: 38, height: 38,
    borderRadius: "8px",
    fontSize: "1.2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tag: {
    fontSize: "0.62rem",
    fontWeight: 700,
    padding: "0.1rem 0.45rem",
    borderRadius: "99px",
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

// ── AddressLabelChips ─────────────────────────────────────────────────────────

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

// ── Main Component ─────────────────────────────────────────────────────────────

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

  // ── Custom order dispatch buffer ─────────────────────────────────────────────
  const CUSTOM_KEYWORDS = ["embroidery", "kundan", "thread bangle", "thread bangles"];
  const hasCustomItems = cartItems.some((item) => {
    const text = `${item.product?.name ?? ""} ${item.product?.category ?? ""} ${item.product?.subCategory ?? ""}`.toLowerCase();
    return CUSTOM_KEYWORDS.some((kw) => text.includes(kw));
  });
  // 10 business days minimum dispatch buffer for custom orders (~14 calendar days)
  const dispatchBuffer = hasCustomItems ? 14 : 0;

  // ── Shipping calculation (The Professional Couriers) ────────────────────────

  // Total cart weight — uses weightInGrams from product if set, else 500g default per unit
  const cartWeight = cartItems.reduce(
    (sum, item) => sum + ((item.product?.weightInGrams ?? 500) / 1000) * item.quantity,
    0,
  );

  // Derive zone + rate from state/city whenever they change
  const zoneKey = useMemo(() => {
    const state = shippingAddress.state?.trim();
    const city = shippingAddress.city?.trim();
    if (!state && !city) return null;
    return getZoneKey(state, city);
  }, [shippingAddress.state, shippingAddress.city]);

  const shippingCharge = useMemo(() => {
    if (!zoneKey) return null;
    const weight = Math.max(cartWeight, 0.25); // min 250g slab
    return calcShippingRate(weight, zoneKey);
  }, [zoneKey, cartWeight]);

  // Propagate rate to parent whenever zone/charge changes
  useEffect(() => {
    if (zoneKey && shippingCharge !== null) {
      onShippingRateSelected?.({
        courierName: "Road Delivery",
        rate: shippingCharge,
        estimatedDays: ROAD_ZONES[zoneKey]?.deliveryDays,
        zoneKey,
      });
    } else {
      onShippingRateSelected?.(null);
    }
  }, [zoneKey, shippingCharge, onShippingRateSelected]);

  // COMMENTED OUT — Shiprocket rate fetching (re-enable when scaling)
  /*
  const [rates, setRates] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState(null);
  // const [selectedTier, setSelectedTier] = useState("fast");

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
  */

  // Trigger pincode auto-fill when 6-digit pin is entered
  useEffect(() => {
    const pin = shippingAddress.zipCode?.trim();
    if (pin?.length === 6 && /^\d{6}$/.test(pin)) {
      fetchPincodeDetails(pin);
      // COMMENTED OUT — Shiprocket: fetchRates(pin);
    } else {
      onShippingRateSelected?.(null);
      if ((pin?.length ?? 0) < 6) {
        setPincodeAutoFilled(false);
        setPincodeError(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingAddress.zipCode]);

  // ── intl-tel-input phone widget ──────────────────────────────────────────────

  useEffect(() => {
    const input = phoneInputRef.current;
    if (!input) return;

    const CSS_HREF =
      "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/css/intlTelInput.css";
    const SCRIPT_SRC =
      "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/intlTelInput.min.js";
    const UTILS_SRC =
      "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js";

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
        const iti = window.intlTelInput(input, {
          initialCountry: "in",
          separateDialCode: true,
          utilsScript: UTILS_SRC,
          onlyCountries: ["in"],
          preferredCountries: ["in"],
        });
        itiRef.current = iti;

        const flagContainer = input.parentElement?.querySelector(
          ".iti__flag-container",
        );
        if (flagContainer) {
          flagContainer.style.cursor = "not-allowed";
          flagContainer.style.pointerEvents = "auto";
          flagContainer.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          };
        }

        const countryListBtn = input.parentElement?.querySelector(
          ".iti__selected-flag",
        );
        if (countryListBtn) {
          countryListBtn.style.pointerEvents = "none";
          countryListBtn.style.cursor = "not-allowed";
        }

        if (shippingAddress && shippingAddress.phone) {
          let phoneValue = shippingAddress.phone.toString().trim();
          if (phoneValue.startsWith("+91")) {
            phoneValue = phoneValue.substring(3);
          }
          input.value = phoneValue;
        }

        const handleChange = () => {
          const nationalNumber = input.value;
          setShippingAddress((prev) => ({
            ...prev,
            phone: nationalNumber,
            country: "India",
            countryCode: "+91",
          }));
        };

        input.addEventListener("change", handleChange);
        input.addEventListener("blur", handleChange);
        input.addEventListener("keyup", handleChange);
        input.__iti_handle_change = handleChange;
      })
      .catch(() => {});

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
        try { itiRef.current.destroy(); } catch (e) {}
      }
      itiRef.current = null;
    };
  }, [shippingAddress.country, setShippingAddress]);

  const validatePhone = () => {
    const input = phoneInputRef.current;
    if (!input || !input.value) return false;
    const phoneNumber = input.value.toString().trim();
    const isFallbackValid = /^[6-9]\d{9}$/.test(phoneNumber);
    const iti = itiRef.current;
    if (iti) {
      try { return iti.isValidNumber() || isFallbackValid; } catch (e) { return isFallbackValid; }
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

              {/* ── Pincode + City + State ── */}
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

              {/* ── Shipping Widget (Road Delivery) ── */}
              {zoneKey && shippingCharge !== null && (
                <ShippingWidget
                  zoneKey={zoneKey}
                  weightKg={Math.max(cartWeight, 0.25)}
                  rate={shippingCharge}
                  dispatchBuffer={dispatchBuffer}
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

      {/* ── Order Summary Sidebar ── */}
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
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                    <div>Shipping:</div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.1rem" }}>
                      Road Delivery
                      {zoneKey && (
                        <span> · {ROAD_ZONES[zoneKey]?.label}</span>
                      )}
                    </div>
                  </div>
                  <span
                    style={{
                      fontWeight: "600",
                      color: shippingRate.rate === 0 ? "#059669" : "inherit",
                      alignSelf: "flex-start",
                    }}
                  >
                    {shippingRate.rate === 0 ? "FREE" : `₹${shippingRate.rate}`}
                  </span>
                </div>
              )}

              {!shippingRate && (
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                    Shipping:
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    Enter state to calculate
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
