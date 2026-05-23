import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Stack,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  IconButton,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteForeverOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
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
    color: "#8B1A4A",
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
    color: "#8B1A4A",
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

/* ── Card header shared pattern ──────────────────────────────────────── */
function CardHeader({ icon: Icon, title, subtitle, iconColor }) {
  return (
    <Box
      sx={{
        px: 3,
        py: 2.25,
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderBottom: "1px solid #f0ebe8",
        background: "linear-gradient(135deg, #fdf6f0 0%, #fdf2f6 100%)",
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          background: iconColor || "linear-gradient(135deg, #8B1A4A, #C9A84C)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(139,26,74,0.22)",
        }}
      >
        <Icon sx={{ color: "white", fontSize: 20 }} />
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        )}
      </Box>
    </Box>
  );
}

/* ── Shipping rate card ─────────────────────────────────────────────── */
function ShippingWidget({ zoneKey, weightKg, rate, dispatchBuffer = 0 }) {
  if (!zoneKey) return null;
  const zone = ROAD_ZONES[zoneKey];
  if (!zone) return null;
  const deliveryRange = expectedDeliveryRange(zone.deliveryDays, dispatchBuffer);

  return (
    <Box
      sx={{
        p: 2,
        border: "1.5px solid",
        borderColor: zone.color + "40",
        borderRadius: 2.5,
        display: "flex",
        alignItems: "center",
        gap: 2,
        mb: 2.5,
        bgcolor: zone.color + "08",
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: zone.color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <LocalShippingOutlinedIcon sx={{ color: zone.color, fontSize: 22 }} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25, flexWrap: "wrap" }}>
          <Typography variant="body2" fontWeight={700}>Standard Road Delivery</Typography>
          <Chip
            label={zone.label}
            size="small"
            sx={{ bgcolor: zone.color + "18", color: zone.color, fontWeight: 700, height: 20, fontSize: "0.68rem" }}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary" display="block">
          {deliveryRange}
          {dispatchBuffer > 0 && (
            <Box component="span" sx={{ ml: 1, color: "warning.main", fontWeight: 600 }}>
              + 10–12 day handcraft
            </Box>
          )}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {zone.sublabel} · {weightKg < 1 ? `${Math.round(weightKg * 1000)} g` : `${weightKg.toFixed(2)} kg`}
        </Typography>
      </Box>
      <Typography variant="h6" fontWeight={800} sx={{ color: zone.color, flexShrink: 0 }}>
        {rate === 0 ? "FREE" : `₹${rate}`}
      </Typography>
    </Box>
  );
}

/* ── Address label chips ─────────────────────────────────────────── */
const LABEL_PRESETS = ["Home", "Office", "Other"];

function AddressLabelChips({ value, onChange }) {
  const [custom, setCustom] = useState(LABEL_PRESETS.includes(value) || !value ? "" : value);
  const isPreset = LABEL_PRESETS.includes(value);
  const isOther = !isPreset && value;

  const select = (label) => {
    if (label === "Other") { onChange("Other"); }
    else { setCustom(""); onChange(label); }
  };

  const LABELS_DISPLAY = { Home: "🏠 Home", Office: "🏢 Office", Other: "✏️ Other" };

  return (
    <Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
        {LABEL_PRESETS.map((lbl) => {
          const active = lbl === "Other" ? (value === "Other" || isOther) : value === lbl;
          return (
            <Chip
              key={lbl}
              label={LABELS_DISPLAY[lbl]}
              onClick={() => select(lbl)}
              variant={active ? "filled" : "outlined"}
              sx={{
                cursor: "pointer",
                fontWeight: 600,
                ...(active
                  ? { bgcolor: "rgba(139,26,74,0.1)", color: "#8B1A4A", border: "1px solid rgba(139,26,74,0.3)" }
                  : { borderColor: "#e7e5e4" }),
              }}
            />
          );
        })}
      </Stack>
      {(value === "Other" || (isOther && !isPreset)) && (
        <TextField
          size="small"
          fullWidth
          placeholder="e.g. Parents' house, Gym…"
          value={isOther && value !== "Other" ? value : custom}
          onChange={(e) => { setCustom(e.target.value); onChange(e.target.value || "Other"); }}
          autoFocus
        />
      )}
    </Box>
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
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!validatePhone()) { setLocalError("Please enter a valid 10-digit Indian phone number"); return; }
    setLocalError(null);
    if (saveAddressToBook) await handleSaveAddress();
    proceedToPayment();
  };

  const displayTotal = subtotal + (shippingRate?.rate || 0);

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#8B1A4A" },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#8B1A4A" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#8B1A4A" },
  };

  return (
    <Grid container spacing={3}>
      {/* Main: form */}
      <Grid item xs={12} md={8}>

        {/* Saved addresses */}
        {loadingAddresses ? (
          <Paper
            elevation={0}
            sx={{ p: 3, border: "1px solid #f0e8e2", borderRadius: 3, mb: 3, textAlign: "center" }}
          >
            <CircularProgress size={22} sx={{ color: "#8B1A4A", mr: 1 }} />
            <Typography variant="body2" color="text.secondary" component="span">
              Loading saved addresses…
            </Typography>
          </Paper>
        ) : savedAddresses.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #f0e8e2",
              borderRadius: 3,
              mb: 3,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(139,26,74,0.07)",
            }}
          >
            <CardHeader
              icon={CheckCircleOutlineIcon}
              title="Saved Addresses"
              subtitle="Select a delivery address below"
              iconColor="linear-gradient(135deg, #16a34a, #15803d)"
            />
            <Box sx={{ p: 2.5 }}>
              <Grid container spacing={1.5}>
                {savedAddresses.map((addr) => {
                  const selected = selectedAddressId === addr._id;
                  return (
                    <Grid item xs={12} sm={6} key={addr._id}>
                      <Box
                        onClick={() => selectSavedAddress(addr)}
                        sx={{
                          p: 2,
                          border: "2px solid",
                          borderColor: selected ? "#8B1A4A" : "#e7e5e4",
                          borderRadius: 2.5,
                          cursor: "pointer",
                          bgcolor: selected ? "#fdf2f6" : "#fff",
                          "&:hover": { borderColor: "#8B1A4A" },
                          transition: "all 0.15s ease",
                          position: "relative",
                        }}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selected}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectSavedAddress(addr); } }}
                      >
                        {selected && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 10,
                              left: 10,
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              bgcolor: "#8B1A4A",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <CheckCircleOutlineIcon sx={{ color: "white", fontSize: 14 }} />
                          </Box>
                        )}
                        <Box sx={{ pl: selected ? 3 : 0 }}>
                          {addr.label && (
                            <Chip
                              label={addr.label}
                              size="small"
                              sx={{
                                mb: 0.75,
                                bgcolor: "rgba(139,26,74,0.08)",
                                color: "#8B1A4A",
                                fontWeight: 700,
                                height: 20,
                                fontSize: "0.68rem",
                              }}
                            />
                          )}
                          <Typography variant="body2" fontWeight={600}>{addr.street}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {addr.city}, {addr.state} – {addr.zipCode}
                          </Typography>
                          {addr.phone && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              📞 {addr.phone}
                            </Typography>
                          )}
                          {addr.isDefault && (
                            <Chip
                              label="Default"
                              size="small"
                              sx={{ mt: 0.5, bgcolor: "#fdf2f6", color: "#8B1A4A", border: "1px solid rgba(139,26,74,0.3)", height: 18, fontSize: "0.65rem" }}
                            />
                          )}
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }}
                          sx={{ position: "absolute", top: 8, right: 8, color: "#ef4444", "&:hover": { bgcolor: "#fef2f2" } }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
              <Divider sx={{ my: 2.5, borderColor: "#f0e8e2" }}>
                <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                  or enter a new address
                </Typography>
              </Divider>
            </Box>
          </Paper>
        )}

        {/* Address form */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #f0e8e2",
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(139,26,74,0.07)",
          }}
        >
          <CardHeader
            icon={LocationOnOutlinedIcon}
            title="Delivery Address"
            subtitle="Where should we deliver your order?"
          />

          <Box sx={{ p: 2.5 }}>
            <Box component="form" noValidate onSubmit={handleSubmit}>

              {/* Address label */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: "#44403c" }}>
                  Address Label{" "}
                  <Typography component="span" variant="caption" color="text.secondary">(optional)</Typography>
                </Typography>
                <AddressLabelChips
                  value={shippingAddress.label}
                  onChange={(val) => setShippingAddress((prev) => ({ ...prev, label: val }))}
                />
              </Box>

              {/* Street */}
              <TextField
                label="Street Address"
                name="street"
                value={shippingAddress.street}
                onChange={handleInputChange}
                placeholder="House/Flat no., Building name, Street, Area…"
                required
                fullWidth
                multiline
                rows={2}
                sx={{ mb: 2.5, ...fieldSx }}
                autoComplete="street-address"
              />

              {/* Pincode / City / State / Country */}
              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={
                      <span>
                        PIN Code
                        {pincodeLoading && <CircularProgress size={11} sx={{ ml: 0.75 }} />}
                      </span>
                    }
                    name="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      handleInputChange({ target: { name: "zipCode", value: val } });
                      if (val.length < 6) { setPincodeAutoFilled(false); setPincodeError(null); }
                    }}
                    placeholder="6-digit PIN"
                    required
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 6, inputMode: "numeric" } }}
                    autoComplete="postal-code"
                    error={!!pincodeError}
                    helperText={
                      pincodeError
                        ? pincodeError
                        : pincodeAutoFilled && !pincodeLoading
                        ? "✓ City & state auto-filled"
                        : undefined
                    }
                    FormHelperTextProps={{
                      sx: { color: pincodeAutoFilled && !pincodeError ? "#16a34a" : undefined, fontWeight: 600 },
                    }}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={
                      <span>
                        City
                        {pincodeAutoFilled && (
                          <Chip label="Auto" size="small" color="success" sx={{ ml: 0.5, height: 16, fontSize: "0.6rem" }} />
                        )}
                      </span>
                    }
                    name="city"
                    value={shippingAddress.city}
                    onChange={(e) => { setPincodeAutoFilled(false); handleInputChange(e); }}
                    placeholder="City / District"
                    required
                    fullWidth
                    autoComplete="address-level2"
                    sx={{
                      ...fieldSx,
                      ...(pincodeAutoFilled ? { "& .MuiOutlinedInput-root": { bgcolor: "#f0fdf4" } } : {}),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={
                      <span>
                        State
                        {pincodeAutoFilled && (
                          <Chip label="Auto" size="small" color="success" sx={{ ml: 0.5, height: 16, fontSize: "0.6rem" }} />
                        )}
                      </span>
                    }
                    name="state"
                    value={shippingAddress.state}
                    onChange={(e) => { setPincodeAutoFilled(false); handleInputChange(e); }}
                    placeholder="State"
                    required
                    fullWidth
                    autoComplete="address-level1"
                    sx={{
                      ...fieldSx,
                      ...(pincodeAutoFilled ? { "& .MuiOutlinedInput-root": { bgcolor: "#f0fdf4" } } : {}),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Country"
                    name="country"
                    value={shippingAddress.country}
                    fullWidth
                    slotProps={{ input: { readOnly: true } }}
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f5f5f4", borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>

              {/* Phone */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75, color: "#44403c" }}>
                  Phone Number{" "}
                  <Typography component="span" variant="caption" color="text.secondary">
                    (India · 10 digits)
                  </Typography>
                </Typography>
                <input
                  ref={phoneInputRef}
                  id="co-phone"
                  type="tel"
                  name="phone"
                  defaultValue={shippingAddress.phone}
                  placeholder="9876543210"
                  required
                  autoComplete="tel-national"
                  inputMode="numeric"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid #c4c4c4",
                    borderRadius: 8,
                    fontSize: "1rem",
                    fontFamily: "inherit",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s",
                  }}
                />
              </Box>

              {/* Shipping rate */}
              {zoneKey && shippingCharge !== null && (
                <ShippingWidget
                  zoneKey={zoneKey}
                  weightKg={Math.max(cartWeight, 0.25)}
                  rate={shippingCharge}
                  dispatchBuffer={dispatchBuffer}
                />
              )}

              {/* Save checkboxes */}
              <Box
                sx={{
                  mb: 2.5,
                  p: 2,
                  bgcolor: "#fafaf9",
                  border: "1px solid #f0e8e2",
                  borderRadius: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={saveAddressToBook}
                      onChange={(e) => setSaveAddressToBook(e.target.checked)}
                      sx={{ "&.Mui-checked": { color: "#8B1A4A" } }}
                    />
                  }
                  label={<Typography variant="body2" fontWeight={500}>Save this address to my account</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={shippingAddress.isDefault}
                      onChange={(e) => setShippingAddress((prev) => ({ ...prev, isDefault: e.target.checked }))}
                      sx={{ "&.Mui-checked": { color: "#8B1A4A" } }}
                    />
                  }
                  label={<Typography variant="body2" fontWeight={500}>Make this my default address</Typography>}
                />
              </Box>

              {(error || localError) && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                  {localError || error}
                </Alert>
              )}

              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => setCurrentStep(1)}
                  sx={{
                    minWidth: 100,
                    py: 1.25,
                    borderColor: "#e7e5e4",
                    color: "text.secondary",
                    borderRadius: 2,
                    "&:hover": { borderColor: "#8B1A4A", color: "#8B1A4A" },
                  }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowForwardIcon />}
                  disabled={loading}
                  sx={{
                    flex: 1,
                    py: 1.5,
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #8B1A4A, #7a1640)",
                    boxShadow: "0 4px 14px rgba(139,26,74,0.35)",
                    "&:hover": { background: "linear-gradient(135deg, #7a1640, #6b1236)" },
                  }}
                >
                  {loading ? "Saving…" : "Continue to Payment"}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* Sidebar: order summary */}
      <Grid item xs={12} md={4}>
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #f0e8e2",
            borderRadius: 3,
            overflow: "hidden",
            position: { md: "sticky" },
            top: { md: 80 },
            boxShadow: "0 4px 24px rgba(139,26,74,0.10)",
          }}
        >
          {/* Rose gradient header */}
          <Box
            sx={{
              px: 3,
              py: 2.5,
              background: "linear-gradient(135deg, #8B1A4A 0%, #7a1640 100%)",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: "white", mb: 0.25 }}>
              Order Summary
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
            </Typography>
          </Box>

          <Box sx={{ p: 2.5 }}>
            <Stack spacing={1.5} sx={{ mb: 2.5 }}>
              {cartItems.slice(0, 3).map((item) => (
                <Stack key={item.product._id} direction="row" alignItems="center" spacing={1.25}>
                  <ProductThumb product={item.product} size="xs" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" fontWeight={600} noWrap display="block">
                      {item.product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Qty: {item.quantity}</Typography>
                  </Box>
                  <Typography variant="caption" fontWeight={700}>₹{item.totalPrice}</Typography>
                </Stack>
              ))}
              {cartItems.length > 3 && (
                <Typography variant="caption" color="text.secondary">
                  +{cartItems.length - 3} more items
                </Typography>
              )}
            </Stack>

            <Divider sx={{ borderColor: "#f0e8e2", mb: 2 }} />

            <Stack spacing={1.25}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2" fontWeight={600}>₹{subtotal.toFixed(2)}</Typography>
              </Stack>
              {shippingRate ? (
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Shipping</Typography>
                    {zoneKey && (
                      <Typography variant="caption" color="text.secondary">{ROAD_ZONES[zoneKey]?.label}</Typography>
                    )}
                  </Box>
                  {shippingRate.rate === 0 ? (
                    <Chip label="FREE" size="small" color="success" sx={{ height: 20 }} />
                  ) : (
                    <Typography variant="body2" fontWeight={600}>₹{shippingRate.rate}</Typography>
                  )}
                </Stack>
              ) : (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Shipping</Typography>
                  <Typography variant="caption" sx={{ color: "#8B1A4A", fontStyle: "italic" }}>
                    Enter PIN to calculate
                  </Typography>
                </Stack>
              )}
            </Stack>

            <Divider sx={{ borderColor: "#f0e8e2", my: 2 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: "#8B1A4A" }}>
                ₹{displayTotal.toFixed(2)}
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ borderTop: "1px solid #f0e8e2", bgcolor: "#fafaf9", px: 2.5, py: 2 }}>
            <Stack direction="row" justifyContent="space-around">
              {["🔒 Secure", "🚚 Tracked", "↩ Returns"].map((t) => (
                <Typography key={t} variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                  {t}
                </Typography>
              ))}
            </Stack>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
