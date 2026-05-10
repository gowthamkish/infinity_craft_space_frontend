import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Trash2, ArrowLeft, ArrowRight, MapPin, Package } from "react-feather";
import { DotsLoader } from "../../components/Loader";
import { ProductThumb } from "./CartReviewStep";

// ══════════════════════════════════════════════════════════════════════════════
// ROADWAYS SHIPPING — Domestic Slab Rate Card (Surface/Road only)
// ══════════════════════════════════════════════════════════════════════════════

const ROAD_ZONES = {
  LOCAL: {
    label: "Local Delivery",
    sublabel: "Bangalore / Bengaluru",
    deliveryDays: "1–2",
    color: "#16a34a",
    rates: [
      { maxG: 250, price: 50 },  { maxG: 500, price: 70 },
      { maxG: 750, price: 90 },  { maxG: 1000, price: 110 },
      { maxG: 2000, price: 175 }, { maxG: 3000, price: 240 },
      { maxG: 4000, price: 305 }, { maxG: 5000, price: 370 },
      { maxG: 6000, price: 425 }, { maxG: 7000, price: 480 },
      { maxG: 8000, price: 535 }, { maxG: 9000, price: 590 },
      { maxG: 10000, price: 645 },
    ],
    perKgAbove10: 55, perKgAbove50: 45,
  },
  STATE: {
    label: "Within Karnataka",
    sublabel: "Rest of Karnataka",
    deliveryDays: "2–3",
    color: "#0891b2",
    rates: [
      { maxG: 250, price: 65 },  { maxG: 500, price: 88 },
      { maxG: 750, price: 110 }, { maxG: 1000, price: 133 },
      { maxG: 2000, price: 210 }, { maxG: 3000, price: 290 },
      { maxG: 4000, price: 370 }, { maxG: 5000, price: 450 },
      { maxG: 6000, price: 520 }, { maxG: 7000, price: 595 },
      { maxG: 8000, price: 670 }, { maxG: 9000, price: 745 },
      { maxG: 10000, price: 820 },
    ],
    perKgAbove10: 70, perKgAbove50: 58,
  },
  SOUTH: {
    label: "South India",
    sublabel: "AP, Telangana, Kerala, Tamil Nadu",
    deliveryDays: "3–5",
    color: "#7c3aed",
    rates: [
      { maxG: 250, price: 85 },  { maxG: 500, price: 110 },
      { maxG: 750, price: 135 }, { maxG: 1000, price: 160 },
      { maxG: 2000, price: 255 }, { maxG: 3000, price: 355 },
      { maxG: 4000, price: 455 }, { maxG: 5000, price: 555 },
      { maxG: 6000, price: 640 }, { maxG: 7000, price: 730 },
      { maxG: 8000, price: 820 }, { maxG: 9000, price: 910 },
      { maxG: 10000, price: 1000 },
    ],
    perKgAbove10: 88, perKgAbove50: 72,
  },
  PAN_INDIA: {
    label: "Pan-India",
    sublabel: "MH, GJ, Goa, Delhi, UP, MP, RJ, HR, WB & more",
    deliveryDays: "5–8",
    color: "#2563eb",
    rates: [
      { maxG: 250, price: 120 },  { maxG: 500, price: 155 },
      { maxG: 750, price: 190 },  { maxG: 1000, price: 225 },
      { maxG: 2000, price: 360 }, { maxG: 3000, price: 500 },
      { maxG: 4000, price: 640 }, { maxG: 5000, price: 780 },
      { maxG: 6000, price: 895 }, { maxG: 7000, price: 1020 },
      { maxG: 8000, price: 1145 }, { maxG: 9000, price: 1270 },
      { maxG: 10000, price: 1395 },
    ],
    perKgAbove10: 130, perKgAbove50: 108,
  },
  REMOTE: {
    label: "Remote / Hilly Areas",
    sublabel: "NE States, Andaman, J&K, Ladakh, HP",
    deliveryDays: "7–12",
    color: "#b45309",
    rates: [
      { maxG: 250, price: 145 },  { maxG: 500, price: 188 },
      { maxG: 750, price: 232 },  { maxG: 1000, price: 275 },
      { maxG: 2000, price: 440 }, { maxG: 3000, price: 610 },
      { maxG: 4000, price: 785 }, { maxG: 5000, price: 960 },
      { maxG: 6000, price: 1105 }, { maxG: 7000, price: 1265 },
      { maxG: 8000, price: 1425 }, { maxG: 9000, price: 1590 },
      { maxG: 10000, price: 1750 },
    ],
    perKgAbove10: 165, perKgAbove50: 138,
  },
};

function getZoneKey(state, city) {
  const s = (state || "").toLowerCase().trim();
  const c = (city  || "").toLowerCase().trim();
  if (c.includes("bangalore") || c.includes("bengaluru")) return "LOCAL";
  if (s.includes("karnataka")) return "STATE";
  if (s.includes("andhra") || s.includes("telangana") || s.includes("kerala") || s.includes("tamil")) return "SOUTH";
  if (
    s.includes("manipur") || s.includes("meghalaya") || s.includes("mizoram") ||
    s.includes("nagaland") || s.includes("sikkim") || s.includes("tripura") ||
    s.includes("assam") || s.includes("arunachal") || s.includes("andaman") ||
    s.includes("jammu") || s.includes("kashmir") || s.includes("ladakh") ||
    s.includes("himachal")
  ) return "REMOTE";
  return "PAN_INDIA";
}

function calcShippingRate(weightKg, zoneKey) {
  const zone = ROAD_ZONES[zoneKey];
  if (!zone) return 0;
  const weightG = weightKg * 1000;
  for (const slab of zone.rates) {
    if (weightG <= slab.maxG) return slab.price;
  }
  if (weightKg <= 50) {
    return zone.rates[zone.rates.length - 1].price + Math.ceil(weightKg - 10) * zone.perKgAbove10;
  }
  const base50 = zone.rates[zone.rates.length - 1].price + 40 * zone.perKgAbove10;
  return base50 + Math.ceil(weightKg - 50) * zone.perKgAbove50;
}

function expectedDeliveryRange(deliveryDays, dispatchBuffer = 0) {
  const parts = deliveryDays.split("–").map(Number);
  const minDays = (parts[0] || 3) + dispatchBuffer;
  const maxDays = (parts[1] || minDays + 3) + dispatchBuffer;
  const fmt = (d) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const from = new Date(); from.setDate(from.getDate() + minDays);
  const to   = new Date(); to.setDate(to.getDate() + maxDays);
  return `${fmt(from)} – ${fmt(to)}`;
}

/* ── Shipping rate card ─────────────────────────────────────────────── */
function ShippingWidget({ zoneKey, weightKg, rate, dispatchBuffer = 0 }) {
  if (!zoneKey) return null;
  const zone = ROAD_ZONES[zoneKey];
  if (!zone) return null;

  const deliveryRange = expectedDeliveryRange(zone.deliveryDays, dispatchBuffer);

  return (
    <div className="co-rate-card" role="region" aria-label="Shipping estimate">
      <div className="co-rate-icon">🚛</div>
      <div className="co-rate-info">
        <p className="co-rate-method">
          Standard Road Delivery
          <span style={{
            marginLeft: 8,
            fontSize: "0.65rem",
            fontWeight: 700,
            background: `${zone.color}18`,
            color: zone.color,
            padding: "2px 8px",
            borderRadius: "99px",
          }}>
            {zone.label}
          </span>
        </p>
        <p className="co-rate-eta">
          📅 {deliveryRange}
          {dispatchBuffer > 0 && (
            <span style={{ marginLeft: 8, color: "#d97706" }}>+ 10–12 day handcraft</span>
          )}
        </p>
        <p style={{ fontSize: "0.68rem", color: "#6b7280", margin: "2px 0 0" }}>
          {zone.sublabel} · {weightKg < 1 ? `${Math.round(weightKg * 1000)} g` : `${weightKg.toFixed(2)} kg`}
        </p>
      </div>
      <span className="co-rate-price">{rate === 0 ? "FREE" : `₹${rate}`}</span>
    </div>
  );
}

/* ── Address label chips ────────────────────────────────────────────── */
const LABEL_PRESETS = ["Home", "Office", "Other"];

function AddressLabelChips({ value, onChange }) {
  const [custom, setCustom] = useState(LABEL_PRESETS.includes(value) || !value ? "" : value);
  const isPreset = LABEL_PRESETS.includes(value);
  const isOther  = !isPreset && value;

  const select = (label) => {
    if (label === "Other") { onChange("Other"); }
    else { setCustom(""); onChange(label); }
  };

  const chipStyle = (active) => ({
    padding: "5px 14px",
    borderRadius: "99px",
    border: `1.5px solid ${active ? "#6d28d9" : "#ced1e8"}`,
    background: active ? "#6d28d9" : "white",
    color: active ? "white" : "#475569",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 120ms ease",
    fontFamily: "inherit",
  });

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
        {LABEL_PRESETS.map((lbl) => {
          const active = lbl === "Other" ? (value === "Other" || isOther) : value === lbl;
          return (
            <button key={lbl} type="button" onClick={() => select(lbl)} style={chipStyle(active)}>
              {lbl === "Home" ? "🏠 Home" : lbl === "Office" ? "🏢 Office" : "✏️ Other"}
            </button>
          );
        })}
      </div>
      {(value === "Other" || (isOther && !isPreset)) && (
        <input
          type="text"
          className="co-input"
          placeholder="e.g. Parents' house, Gym…"
          value={isOther && value !== "Other" ? value : custom}
          onChange={(e) => { setCustom(e.target.value); onChange(e.target.value || "Other"); }}
          autoFocus
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN — ShippingStep
   ══════════════════════════════════════════════════════════════════════ */
export const ShippingStep = ({
  cartItems,
  subtotal,
  total,
  shippingAddress,
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
  const itiRef        = useRef(null);
  const [localError, setLocalError]             = useState(null);
  const [pincodeLoading, setPincodeLoading]     = useState(false);
  const [pincodeAutoFilled, setPincodeAutoFilled] = useState(false);
  const [pincodeError, setPincodeError]         = useState(null);

  /* ── Pincode auto-fill ─────────────────────────────────────────────── */
  const fetchPincodeDetails = useCallback(async (pin) => {
    setPincodeLoading(true);
    setPincodeError(null);
    try {
      const res  = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length) {
        const po = data[0].PostOffice[0];
        setShippingAddress((prev) => ({
          ...prev,
          city:  po.District || po.Division || prev.city,
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

  /* ── Custom order dispatch buffer ──────────────────────────────────── */
  const CUSTOM_KEYWORDS = ["embroidery", "kundan", "thread bangle", "thread bangles"];
  const hasCustomItems  = cartItems.some((item) => {
    const text = `${item.product?.name ?? ""} ${item.product?.category ?? ""} ${item.product?.subCategory ?? ""}`.toLowerCase();
    return CUSTOM_KEYWORDS.some((kw) => text.includes(kw));
  });
  const dispatchBuffer = hasCustomItems ? 14 : 0;

  /* ── Shipping weight & zone ────────────────────────────────────────── */
  const cartWeight = cartItems.reduce(
    (sum, item) => sum + ((item.product?.weightInGrams ?? 500) / 1000) * item.quantity, 0,
  );

  const zoneKey = useMemo(() => {
    const state = shippingAddress.state?.trim();
    const city  = shippingAddress.city?.trim();
    if (!state && !city) return null;
    return getZoneKey(state, city);
  }, [shippingAddress.state, shippingAddress.city]);

  const shippingCharge = useMemo(() => {
    if (!zoneKey) return null;
    return calcShippingRate(Math.max(cartWeight, 0.25), zoneKey);
  }, [zoneKey, cartWeight]);

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

  /* ── Pincode trigger ───────────────────────────────────────────────── */
  useEffect(() => {
    const pin = shippingAddress.zipCode?.trim();
    if (pin?.length === 6 && /^\d{6}$/.test(pin)) {
      fetchPincodeDetails(pin);
    } else {
      onShippingRateSelected?.(null);
      if ((pin?.length ?? 0) < 6) {
        setPincodeAutoFilled(false);
        setPincodeError(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingAddress.zipCode]);

  /* ── intl-tel-input phone widget ───────────────────────────────────── */
  useEffect(() => {
    const input = phoneInputRef.current;
    if (!input) return;

    const CSS_HREF   = "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/css/intlTelInput.css";
    const SCRIPT_SRC = "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/intlTelInput.min.js";
    const UTILS_SRC  = "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js";

    if (!document.querySelector(`link[href='${CSS_HREF}']`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet"; link.href = CSS_HREF;
      document.head.appendChild(link);
    }

    const ensureScript = () => new Promise((resolve, reject) => {
      if (window.intlTelInput) return resolve();
      const existing = document.querySelector(`script[src='${SCRIPT_SRC}']`);
      if (existing) { existing.addEventListener("load", resolve); existing.addEventListener("error", reject); return; }
      const script = document.createElement("script");
      script.src = SCRIPT_SRC; script.async = true;
      script.onload = resolve; script.onerror = reject;
      document.body.appendChild(script);
    });

    let mounted = true;

    ensureScript().then(() => {
      if (!mounted) return;
      const iti = window.intlTelInput(input, {
        initialCountry: "in",
        separateDialCode: true,
        utilsScript: UTILS_SRC,
        onlyCountries: ["in"],
        preferredCountries: ["in"],
      });
      itiRef.current = iti;

      const flagContainer  = input.parentElement?.querySelector(".iti__flag-container");
      const countryListBtn = input.parentElement?.querySelector(".iti__selected-flag");
      if (flagContainer)  { flagContainer.style.cursor = "not-allowed"; flagContainer.onclick = (e) => { e.preventDefault(); e.stopPropagation(); }; }
      if (countryListBtn) { countryListBtn.style.pointerEvents = "none"; countryListBtn.style.cursor = "not-allowed"; }

      if (shippingAddress?.phone) {
        let phoneValue = shippingAddress.phone.toString().trim();
        if (phoneValue.startsWith("+91")) phoneValue = phoneValue.substring(3);
        input.value = phoneValue;
      }

      const handleChange = () => {
        setShippingAddress((prev) => ({ ...prev, phone: input.value, country: "India", countryCode: "+91" }));
      };

      input.addEventListener("change", handleChange);
      input.addEventListener("blur", handleChange);
      input.addEventListener("keyup", handleChange);
      input.__iti_handle_change = handleChange;
    }).catch(() => {});

    return () => {
      mounted = false;
      const hc = input.__iti_handle_change;
      if (hc) { input.removeEventListener("change", hc); input.removeEventListener("blur", hc); input.removeEventListener("keyup", hc); delete input.__iti_handle_change; }
      if (itiRef.current) { try { itiRef.current.destroy(); } catch (e) {} }
      itiRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingAddress.country, setShippingAddress]);

  const validatePhone = () => {
    const input = phoneInputRef.current;
    if (!input || !input.value) return false;
    const ph = input.value.toString().trim();
    const fallback = /^[6-9]\d{9}$/.test(ph);
    if (itiRef.current) { try { return itiRef.current.isValidNumber() || fallback; } catch { return fallback; } }
    return fallback;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!validatePhone()) { setLocalError("Please enter a valid 10-digit Indian phone number"); return; }
    setLocalError(null);
    if (saveAddressToBook) await handleSaveAddress();
    proceedToPayment();
  };

  const displayTotal = subtotal + (shippingRate?.rate || 0);

  return (
    <>
      <div className="co-grid">
        {/* ── Main: form ─── */}
        <div className="co-main">

          {/* Saved addresses */}
          {loadingAddresses ? (
            <section className="co-section" style={{ padding: "24px", textAlign: "center", color: "var(--co-ink-3)" }}>
              <DotsLoader size="sm" />
              <span style={{ marginLeft: 10 }}>Loading saved addresses…</span>
            </section>
          ) : savedAddresses.length > 0 && (
            <section className="co-section" aria-label="Saved addresses">
              <header className="co-section-head">
                <div className="co-section-icon co-section-icon--green">
                  <MapPin size={16} />
                </div>
                <div>
                  <h2 className="co-section-title">Saved Addresses</h2>
                  <p className="co-section-sub">Select a delivery address below</p>
                </div>
              </header>

              <div className="co-section-body">
                <div className="co-addr-grid">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`co-addr-card${selectedAddressId === addr._id ? " selected" : ""}`}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selectedAddressId === addr._id}
                      onClick={() => selectSavedAddress(addr)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectSavedAddress(addr); } }}
                    >
                      <div className="co-addr-radio" aria-hidden="true">
                        {selectedAddressId === addr._id && <div className="co-addr-dot" />}
                      </div>
                      <div className="co-addr-info">
                        {addr.label && <p className="co-addr-label-tag">{addr.label}</p>}
                        <p className="co-addr-street">{addr.street}</p>
                        <p className="co-addr-city">{addr.city}, {addr.state} {addr.zipCode}</p>
                        {addr.phone && <p style={{ fontSize: "0.72rem", color: "var(--co-ink-3)", margin: "2px 0 0" }}>📞 {addr.phone}</p>}
                        {addr.isDefault && <span className="co-addr-default-badge">Default</span>}
                        <button
                          type="button"
                          className="co-addr-del"
                          onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }}
                          aria-label={`Delete address ${addr.street}`}
                        >
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="co-or-divider" style={{ padding: "0 22px" }}>or enter a new address</div>
            </section>
          )}

          {/* Address form */}
          <section className="co-section" aria-label="Shipping address form">
            <header className="co-section-head">
              <div className="co-section-icon co-section-icon--purple">
                <MapPin size={16} />
              </div>
              <div>
                <h2 className="co-section-title">Delivery Address</h2>
                <p className="co-section-sub">Where should we deliver your order?</p>
              </div>
            </header>

            <div className="co-section-body">
              <form noValidate onSubmit={handleSubmit}>

                {/* Address label chips */}
                <div className="co-field" style={{ marginBottom: 16 }}>
                  <label className="co-label">
                    Address Label <span style={{ fontWeight: 400, color: "var(--co-ink-4)" }}>(optional)</span>
                  </label>
                  <AddressLabelChips
                    value={shippingAddress.label}
                    onChange={(val) => setShippingAddress((prev) => ({ ...prev, label: val }))}
                  />
                </div>

                {/* Street */}
                <div className="co-field co-form-full" style={{ marginBottom: 16 }}>
                  <label className="co-label co-label--req" htmlFor="co-street">Street Address</label>
                  <textarea
                    id="co-street"
                    className="co-input"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleInputChange}
                    placeholder="House/Flat no., Building name, Street, Area…"
                    required
                    rows={2}
                    style={{ resize: "none", lineHeight: 1.5 }}
                    autoComplete="street-address"
                  />
                </div>

                {/* Pincode / City / State */}
                <div className="co-form-grid" style={{ marginBottom: 16 }}>
                  <div className="co-field">
                    <label className="co-label co-label--req" htmlFor="co-zipcode">
                      PIN Code
                      {pincodeLoading && <span style={{ marginLeft: 6, fontSize: "0.68rem", color: "var(--co-ink-4)" }}>⟳ Loading…</span>}
                    </label>
                    <input
                      id="co-zipcode"
                      className={`co-input${pincodeError ? " co-input--error" : ""}`}
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
                      autoComplete="postal-code"
                    />
                    {pincodeAutoFilled && !pincodeLoading && (
                      <span style={{ fontSize: "0.7rem", color: "var(--co-green)", fontWeight: 600 }}>✓ City &amp; state auto-filled</span>
                    )}
                    {pincodeError && (
                      <span style={{ fontSize: "0.7rem", color: "var(--co-warn)" }}>⚠ {pincodeError}</span>
                    )}
                  </div>

                  <div className="co-field">
                    <label className="co-label co-label--req" htmlFor="co-city">
                      City
                      {pincodeAutoFilled && <span style={{ marginLeft: 5, fontSize: "0.64rem", color: "var(--co-green)", fontWeight: 700 }}>Auto</span>}
                    </label>
                    <input
                      id="co-city"
                      className="co-input"
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={(e) => { setPincodeAutoFilled(false); handleInputChange(e); }}
                      placeholder="City / District"
                      required
                      autoComplete="address-level2"
                      style={pincodeAutoFilled ? { background: "#f0fdf4", borderColor: "#86efac" } : undefined}
                    />
                  </div>

                  <div className="co-field">
                    <label className="co-label co-label--req" htmlFor="co-state">
                      State
                      {pincodeAutoFilled && <span style={{ marginLeft: 5, fontSize: "0.64rem", color: "var(--co-green)", fontWeight: 700 }}>Auto</span>}
                    </label>
                    <input
                      id="co-state"
                      className="co-input"
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={(e) => { setPincodeAutoFilled(false); handleInputChange(e); }}
                      placeholder="State"
                      required
                      autoComplete="address-level1"
                      style={pincodeAutoFilled ? { background: "#f0fdf4", borderColor: "#86efac" } : undefined}
                    />
                  </div>

                  <div className="co-field">
                    <label className="co-label" htmlFor="co-country">Country</label>
                    <input
                      id="co-country"
                      className="co-input"
                      type="text"
                      name="country"
                      value={shippingAddress.country}
                      readOnly
                      style={{ background: "var(--co-surface-2)", color: "var(--co-ink-3)", cursor: "not-allowed" }}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="co-field" style={{ marginBottom: 16 }}>
                  <label className="co-label co-label--req" htmlFor="co-phone">
                    Phone Number
                    <span style={{ fontWeight: 400, color: "var(--co-ink-4)", marginLeft: 5, fontSize: "0.72rem" }}>(India · 10 digits)</span>
                  </label>
                  <input
                    ref={phoneInputRef}
                    id="co-phone"
                    type="tel"
                    name="phone"
                    defaultValue={shippingAddress.phone}
                    placeholder="9876543210"
                    required
                    className="co-input"
                    style={{ width: "100%" }}
                    autoComplete="tel-national"
                    inputMode="numeric"
                  />
                </div>

                {/* Shipping rate widget */}
                {zoneKey && shippingCharge !== null && (
                  <ShippingWidget
                    zoneKey={zoneKey}
                    weightKg={Math.max(cartWeight, 0.25)}
                    rate={shippingCharge}
                    dispatchBuffer={dispatchBuffer}
                  />
                )}

                {/* Save checkbox row */}
                <div style={{ marginBottom: 20 }}>
                  <label className="co-check-row" htmlFor="co-save-addr">
                    <div className={`co-check-box${saveAddressToBook ? " checked" : ""}`} aria-hidden="true">
                      {saveAddressToBook && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <input
                      id="co-save-addr"
                      type="checkbox"
                      checked={saveAddressToBook}
                      onChange={(e) => setSaveAddressToBook(e.target.checked)}
                      style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
                    />
                    <span className="co-check-lbl">Save this address to my account</span>
                  </label>

                  <label className="co-check-row" htmlFor="co-default-addr" style={{ marginTop: 10 }}>
                    <div className={`co-check-box${shippingAddress.isDefault ? " checked" : ""}`} aria-hidden="true">
                      {shippingAddress.isDefault && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <input
                      id="co-default-addr"
                      type="checkbox"
                      checked={shippingAddress.isDefault}
                      onChange={(e) => setShippingAddress((prev) => ({ ...prev, isDefault: e.target.checked }))}
                      style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
                    />
                    <span className="co-check-lbl">Make this my default address</span>
                  </label>
                </div>

                {(error || localError) && (
                  <div className="co-error" role="alert">⚠ {localError || error}</div>
                )}

                <div className="co-btn-row">
                  <button type="button" className="co-back" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button type="submit" className="co-cta" disabled={loading} style={{ flex: 1 }}>
                    {loading ? <><DotsLoader size="sm" /> Saving…</> : <>Continue to Payment <ArrowRight size={16} /></>}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>

        {/* ── Sidebar: order summary ─── */}
        <aside className="co-sidebar" aria-label="Order summary">
          <div className="co-summary">
            <div className="co-summary-head">
              <p className="co-summary-head-title">Order Summary</p>
              <p className="co-summary-head-sub">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</p>
            </div>

            <div className="co-summary-body">
              {cartItems.slice(0, 3).map((item) => (
                <div key={item.product._id} className="co-summary-item">
                  <ProductThumb product={item.product} size="xs" />
                  <div className="co-summary-item-info">
                    <p className="co-summary-item-name">{item.product.name}</p>
                    <p className="co-summary-item-qty">Qty: {item.quantity}</p>
                  </div>
                  <span className="co-summary-item-price">₹{item.totalPrice}</span>
                </div>
              ))}
              {cartItems.length > 3 && (
                <p className="co-summary-more">+{cartItems.length - 3} more items</p>
              )}

              <hr className="co-divider" />

              <div className="co-price-row">
                <span className="co-price-label">Subtotal</span>
                <span className="co-price-val">₹{subtotal.toFixed(2)}</span>
              </div>

              {shippingRate ? (
                <div className="co-price-row">
                  <div>
                    <span className="co-price-label">Shipping</span>
                    {zoneKey && <p style={{ fontSize: "0.68rem", color: "var(--co-ink-4)", margin: "1px 0 0" }}>{ROAD_ZONES[zoneKey]?.label}</p>}
                  </div>
                  <span className={`co-price-val${shippingRate.rate === 0 ? " co-price-row--discount" : ""}`}>
                    {shippingRate.rate === 0
                      ? <><span className="co-free-badge">FREE</span></>
                      : `₹${shippingRate.rate}`}
                  </span>
                </div>
              ) : (
                <div className="co-price-row">
                  <span className="co-price-label">Shipping</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--co-ink-4)" }}>Enter state to calculate</span>
                </div>
              )}

              <div className="co-price-row co-price-row--total">
                <span className="co-total-label">Total</span>
                <span className="co-total-val">₹{displayTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="co-trust" aria-label="Trust indicators">
              <div className="co-trust-item"><span className="co-trust-icon">🔒</span>Secure</div>
              <div className="co-trust-item"><span className="co-trust-icon">🚚</span>Tracked</div>
              <div className="co-trust-item"><span className="co-trust-icon">↩</span>Returns</div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Mobile sticky bar ─── */}
      <div className="co-sticky-bar">
        <div className="co-sticky-total">
          <p className="co-sticky-lbl">Order Total</p>
          <p className="co-sticky-amount">₹{displayTotal.toFixed(2)}</p>
        </div>
        <button type="button" className="co-cta" onClick={handleSubmit} disabled={loading}>
          {loading ? <DotsLoader size="sm" /> : <>Continue <ArrowRight size={15} /></>}
        </button>
      </div>
    </>
  );
};
