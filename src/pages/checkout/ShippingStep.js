import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  FiMapPin, FiBookmark, FiArrowRight, FiArrowLeft, FiTruck, FiTrash2, FiCheck,
} from "react-icons/fi";
import { Card, Alert, SummaryItems, Row, Total, HelpCard, Spinner, inr } from "./ui";

// ── Shipping zone data ────────────────────────────────────────────────
const ROAD_ZONES = {
  LOCAL: {
    label: "Local Delivery", sublabel: "Bangalore / Bengaluru", deliveryDays: "1–2", color: "#16a34a",
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
    label: "Within Karnataka", sublabel: "Rest of Karnataka", deliveryDays: "2–3", color: "#0891b2",
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
    label: "South India", sublabel: "AP, Telangana, Kerala, Tamil Nadu", deliveryDays: "3–5", color: "#d24e33",
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
    label: "Pan-India", sublabel: "MH, GJ, Goa, Delhi, UP, MP, RJ, HR, WB & more", deliveryDays: "5–8", color: "#d24e33",
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
    label: "Remote / Hilly Areas", sublabel: "NE States, Andaman, J&K, Ladakh, HP", deliveryDays: "7–12", color: "#b45309",
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
  const c = (city || "").toLowerCase().trim();
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
  const to = new Date(); to.setDate(to.getDate() + maxDays);
  return `${fmt(from)} – ${fmt(to)}`;
}

/* ── Shipping rate widget ───────────────────────────────────────────────── */
function ShippingWidget({ zoneKey, weightKg, rate, dispatchBuffer = 0 }) {
  if (!zoneKey) return null;
  const zone = ROAD_ZONES[zoneKey];
  if (!zone) return null;
  const deliveryRange = expectedDeliveryRange(zone.deliveryDays, dispatchBuffer);
  return (
    <div className="ck-ship" style={{ "--zone": zone.color }}>
      <span className="ck-ship-ico" aria-hidden="true"><FiTruck /></span>
      <div className="ck-ship-body">
        <div className="ck-ship-title">
          Standard road delivery <span className="ck-ship-tag">{zone.label}</span>
        </div>
        <div className="ck-ship-sub">
          Arrives {deliveryRange}
          {dispatchBuffer > 0 && <strong style={{ color: "#b45309", marginLeft: 6 }}>+ 10–12 days handcraft time</strong>}
        </div>
        <div className="ck-ship-sub">
          {zone.sublabel} · {weightKg < 1 ? `${Math.round(weightKg * 1000)} g` : `${weightKg.toFixed(2)} kg`}
        </div>
      </div>
      <div className="ck-ship-price">{rate === 0 ? "FREE" : `₹${rate}`}</div>
    </div>
  );
}

/* ── Address label chips ────────────────────────────────────────────────── */
const LABEL_PRESETS = ["Home", "Office", "Other"];
const LABEL_ICONS = { Home: "🏠", Office: "🏢", Other: "✏️" };

function AddressLabelChips({ value, onChange }) {
  const [custom, setCustom] = useState(LABEL_PRESETS.includes(value) || !value ? "" : value);
  const isPreset = LABEL_PRESETS.includes(value);
  const isOther = !isPreset && value;

  const select = (label) => {
    if (label === "Other") onChange("Other");
    else { setCustom(""); onChange(label); }
  };

  return (
    <div>
      <div className="ck-chips" role="group" aria-label="Address label">
        {LABEL_PRESETS.map((lbl) => {
          const active = lbl === "Other" ? (value === "Other" || isOther) : value === lbl;
          return (
            <button key={lbl} type="button" className={`ck-chip ${active ? "is-active" : ""}`} aria-pressed={active} onClick={() => select(lbl)}>
              <span aria-hidden="true">{LABEL_ICONS[lbl]}</span> {lbl}
            </button>
          );
        })}
      </div>
      {(value === "Other" || (isOther && !isPreset)) && (
        <input
          className="ck-input"
          style={{ marginTop: 12 }}
          placeholder="e.g. Parents' house, Gym…"
          aria-label="Custom address label"
          value={isOther && value !== "Other" ? value : custom}
          onChange={(e) => { setCustom(e.target.value); onChange(e.target.value || "Other"); }}
          autoFocus
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   STEP 2 — Shipping
   ══════════════════════════════════════════════════════════════════════════ */
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
  const itiRef = useRef(null);
  const [localError, setLocalError] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeAutoFilled, setPincodeAutoFilled] = useState(false);
  const [pincodeError, setPincodeError] = useState(null);

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

  const CUSTOM_KEYWORDS = ["embroidery", "kundan", "thread bangle", "thread bangles"];
  const hasCustomItems = cartItems.some((item) => {
    const text = `${item.product?.name ?? ""} ${item.product?.category ?? ""} ${item.product?.subCategory ?? ""}`.toLowerCase();
    return CUSTOM_KEYWORDS.some((kw) => text.includes(kw));
  });
  const dispatchBuffer = hasCustomItems ? 14 : 0;

  const cartWeight = cartItems.reduce(
    (sum, item) => sum + ((item.product?.weightInGrams ?? 500) / 1000) * item.quantity, 0,
  );

  const zoneKey = useMemo(() => {
    const state = shippingAddress.state?.trim();
    const city = shippingAddress.city?.trim();
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

  useEffect(() => {
    const input = phoneInputRef.current;
    if (!input) return;
    const CSS_HREF = "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/css/intlTelInput.css";
    const SCRIPT_SRC = "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/intlTelInput.min.js";
    const UTILS_SRC = "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js";

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

    // Keep the phone number in form state whether or not the intl-tel-input script loads
    // (it comes from a CDN — if that is blocked or slow the field must still work).
    const handleChange = () => {
      setShippingAddress((prev) => ({ ...prev, phone: input.value, country: "India", countryCode: "+91" }));
    };
    input.addEventListener("change", handleChange);
    input.addEventListener("blur", handleChange);
    input.addEventListener("keyup", handleChange);
    input.addEventListener("input", handleChange);
    input.__iti_handle_change = handleChange;

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

      const flagContainer = input.parentElement?.querySelector(".iti__flag-container");
      const countryListBtn = input.parentElement?.querySelector(".iti__selected-flag");
      if (flagContainer) { flagContainer.style.cursor = "not-allowed"; flagContainer.onclick = (e) => { e.preventDefault(); e.stopPropagation(); }; }
      if (countryListBtn) { countryListBtn.style.pointerEvents = "none"; countryListBtn.style.cursor = "not-allowed"; }

      if (shippingAddress?.phone) {
        let phoneValue = shippingAddress.phone.toString().trim();
        if (phoneValue.startsWith("+91")) phoneValue = phoneValue.substring(3);
        input.value = phoneValue;
      }
    }).catch(() => {});

    return () => {
      mounted = false;
      const hc = input.__iti_handle_change;
      if (hc) { input.removeEventListener("change", hc); input.removeEventListener("blur", hc); input.removeEventListener("keyup", hc); input.removeEventListener("input", hc); delete input.__iti_handle_change; }
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
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!validatePhone()) { setLocalError("Please enter a valid 10-digit Indian phone number"); return; }
    setLocalError(null);
    if (saveAddressToBook) await handleSaveAddress();
    proceedToPayment();
  };

  const displayTotal = subtotal + (shippingRate?.rate || 0);
  const count = cartItems.length;

  return (
    <div className="ck-grid">
      <div className="ck-main">
        {/* ── Saved addresses ─────────────────────────────────────────── */}
        {loadingAddresses ? (
          <Card icon={FiBookmark} title="Saved addresses" subtitle="Loading your saved addresses…">
            <div style={{ display: "flex", justifyContent: "center", padding: "8px 0", color: "var(--ics-ember-deep)" }}><Spinner /></div>
          </Card>
        ) : (
          savedAddresses.length > 0 && (
            <Card icon={FiBookmark} tint="teal" title="Saved addresses" subtitle="Choose where to deliver this order">
              <div className="ck-addrs">
                {savedAddresses.map((addr) => {
                  const selected = selectedAddressId === addr._id;
                  return (
                    <div
                      key={addr._id}
                      className={`ck-addr ${selected ? "is-selected" : ""}`}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selected}
                      onClick={() => selectSavedAddress(addr)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectSavedAddress(addr); } }}
                    >
                      {selected && <span className="ck-addr-tick" aria-hidden="true"><FiCheck size={14} /></span>}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {addr.label && <span className="ck-pill ck-pill--soft">{addr.label}</span>}
                        {addr.isDefault && <span className="ck-pill ck-pill--teal">Default</span>}
                      </div>
                      <div className="ck-addr-street">{addr.street}</div>
                      <div className="ck-addr-line">{addr.city}, {addr.state} – {addr.zipCode}</div>
                      {addr.phone && <div className="ck-addr-line">📞 {addr.phone}</div>}
                      <button
                        type="button"
                        className="ck-icon-btn ck-addr-del"
                        aria-label={`Delete address ${addr.street}`}
                        onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }}
                      >
                        <FiTrash2 size={17} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="ck-divider">or enter a new address</div>
            </Card>
          )
        )}

        {/* ── Address form ────────────────────────────────────────────── */}
        <Card icon={FiMapPin} title="Delivery address" subtitle="Where should we deliver your order?">
          <form className="ck-form" noValidate onSubmit={handleSubmit}>
            <div className="ck-field">
              <span className="ck-label">Address label <small>(optional)</small></span>
              <AddressLabelChips value={shippingAddress.label} onChange={(val) => setShippingAddress((prev) => ({ ...prev, label: val }))} />
            </div>

            <div className="ck-field">
              <label className="ck-label" htmlFor="co-street">Street address</label>
              <textarea
                id="co-street"
                className="ck-textarea"
                name="street"
                rows={3}
                value={shippingAddress.street}
                onChange={handleInputChange}
                placeholder="House / flat no., building name, street, area…"
                required
                autoComplete="street-address"
              />
            </div>

            <div className="ck-row" style={{ "--cols": 3 }}>
              <div className="ck-field">
                <label className="ck-label" htmlFor="co-zip">
                  PIN code {pincodeLoading && <Spinner />}
                </label>
                <input
                  id="co-zip"
                  className={`ck-input ${pincodeError ? "is-error" : ""}`}
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
                {pincodeError ? (
                  <span className="ck-help ck-help--err">{pincodeError}</span>
                ) : pincodeAutoFilled && !pincodeLoading ? (
                  <span className="ck-help ck-help--ok">✓ City &amp; state auto-filled</span>
                ) : null}
              </div>
              <div className="ck-field">
                <label className="ck-label" htmlFor="co-city">City</label>
                <input
                  id="co-city"
                  className={`ck-input ${pincodeAutoFilled ? "is-filled" : ""}`}
                  name="city"
                  value={shippingAddress.city}
                  onChange={(e) => { setPincodeAutoFilled(false); handleInputChange(e); }}
                  placeholder="City / district"
                  required
                  autoComplete="address-level2"
                />
              </div>
              <div className="ck-field">
                <label className="ck-label" htmlFor="co-state">State</label>
                <input
                  id="co-state"
                  className={`ck-input ${pincodeAutoFilled ? "is-filled" : ""}`}
                  name="state"
                  value={shippingAddress.state}
                  onChange={(e) => { setPincodeAutoFilled(false); handleInputChange(e); }}
                  placeholder="State"
                  required
                  autoComplete="address-level1"
                />
              </div>
            </div>

            <div className="ck-row">
              <div className="ck-field">
                <label className="ck-label" htmlFor="co-country">Country</label>
                <input id="co-country" className="ck-input" value="🇮🇳  India" disabled readOnly />
              </div>
              <div className="ck-field">
                <label className="ck-label" htmlFor="co-phone">Phone number <small>(India · 10 digits)</small></label>
                <input
                  ref={phoneInputRef}
                  id="co-phone"
                  className="ck-input"
                  type="tel"
                  name="phone"
                  defaultValue={shippingAddress.phone}
                  placeholder="9876543210"
                  required
                  autoComplete="tel-national"
                  inputMode="numeric"
                />
              </div>
            </div>

            {zoneKey && shippingCharge !== null && (
              <ShippingWidget zoneKey={zoneKey} weightKg={Math.max(cartWeight, 0.25)} rate={shippingCharge} dispatchBuffer={dispatchBuffer} />
            )}

            <div className="ck-checks">
              <label className="ck-check">
                <input type="checkbox" checked={saveAddressToBook} onChange={(e) => setSaveAddressToBook(e.target.checked)} />
                Save this address to my account
              </label>
              <label className="ck-check">
                <input type="checkbox" checked={!!shippingAddress.isDefault} onChange={(e) => setShippingAddress((prev) => ({ ...prev, isDefault: e.target.checked }))} />
                Make this my default address
              </label>
            </div>

            {(error || localError) && <Alert kind="error">{localError || error}</Alert>}

            <div className="ck-actions">
              <button type="button" className="ck-btn ck-btn--ghost" onClick={() => setCurrentStep(1)}>
                <FiArrowLeft size={18} /> Back
              </button>
              <button type="submit" className="ck-btn ck-btn--primary ck-btn--lg" disabled={loading}>
                {loading ? <><Spinner /> Saving…</> : <>Continue to payment <FiArrowRight size={18} /></>}
              </button>
            </div>
          </form>
        </Card>
      </div>

      {/* ── Summary ───────────────────────────────────────────────────── */}
      <aside className="ck-aside" aria-label="Order summary">
        <Card title="Order summary" subtitle={`${count} ${count === 1 ? "item" : "items"}`}>
          <SummaryItems cartItems={cartItems} />
          <hr className="ck-hr" />
          <div className="ck-rows">
            <Row label="Subtotal" value={inr(subtotal)} />
            {shippingRate ? (
              <Row label="Shipping" value={shippingRate.rate === 0 ? "FREE" : inr(shippingRate.rate)} tone={shippingRate.rate === 0 ? "ok" : undefined} />
            ) : (
              <Row label="Shipping" hint="Enter your PIN code" />
            )}
          </div>
          <hr className="ck-hr" />
          <Total value={inr(displayTotal)} />
          {!shippingRate && <p className="ck-help" style={{ marginTop: 12 }}>Your final total appears once we know your delivery PIN.</p>}
        </Card>
        <HelpCard />
      </aside>
    </div>
  );
};
