import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
import CheckIcon from "@mui/icons-material/Check";
import { ProductThumb } from "./CartReviewStep";

const P = "#8b2252";
const P_LIGHT = "rgba(139,34,82,0.08)";
const BORDER = "rgba(0,0,0,0.09)";

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
    label: "South India", sublabel: "AP, Telangana, Kerala, Tamil Nadu", deliveryDays: "3–5", color: "#8b2252",
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
    label: "Pan-India", sublabel: "MH, GJ, Goa, Delhi, UP, MP, RJ, HR, WB & more", deliveryDays: "5–8", color: "#8b2252",
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

/* ── Shipping widget ─────────────────────────────────────────────────── */
function ShippingWidget({ zoneKey, weightKg, rate, dispatchBuffer = 0 }) {
  if (!zoneKey) return null;
  const zone = ROAD_ZONES[zoneKey];
  if (!zone) return null;
  const deliveryRange = expectedDeliveryRange(zone.deliveryDays, dispatchBuffer);

  return (
    <Box
      sx={{
        p: 2,
        border: `1.5px solid ${zone.color}40`,
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        mb: 2,
        bgcolor: zone.color + "0a",
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "8px",
          bgcolor: zone.color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <LocalShippingOutlinedIcon sx={{ color: zone.color, fontSize: 20 }} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.25, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500 }}>Standard Road Delivery</Typography>
          <Chip
            label={zone.label}
            size="small"
            sx={{ bgcolor: zone.color + "18", color: zone.color, fontWeight: 600, height: 18, fontSize: "0.68rem" }}
          />
        </Stack>
        <Typography sx={{ fontSize: "0.75rem", color: "#6b7280", display: "block" }}>
          {deliveryRange}
          {dispatchBuffer > 0 && (
            <Box component="span" sx={{ ml: 1, color: "#d97706", fontWeight: 500 }}>
              + 10–12 day handcraft
            </Box>
          )}
        </Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
          {zone.sublabel} · {weightKg < 1 ? `${Math.round(weightKg * 1000)} g` : `${weightKg.toFixed(2)} kg`}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, color: zone.color, flexShrink: 0 }}>
        {rate === 0 ? "FREE" : `₹${rate}`}
      </Typography>
    </Box>
  );
}

/* ── Address label pills ─────────────────────────────────────────────── */
const LABEL_PRESETS = ["Home", "Office", "Other"];
const LABEL_ICONS = { Home: "🏠", Office: "🏢", Other: "✏️" };

function AddressLabelChips({ value, onChange }) {
  const [custom, setCustom] = useState(LABEL_PRESETS.includes(value) || !value ? "" : value);
  const isPreset = LABEL_PRESETS.includes(value);
  const isOther = !isPreset && value;

  const select = (label) => {
    if (label === "Other") { onChange("Other"); }
    else { setCustom(""); onChange(label); }
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        {LABEL_PRESETS.map((lbl) => {
          const active = lbl === "Other" ? (value === "Other" || isOther) : value === lbl;
          return (
            <Box
              key={lbl}
              role="button"
              tabIndex={0}
              onClick={() => select(lbl)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") select(lbl); }}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.5,
                height: 32,
                borderRadius: "20px",
                border: "1.5px solid",
                borderColor: active ? P : "#d1d5db",
                bgcolor: active ? P : "#fff",
                color: active ? "#fff" : "#6b7280",
                fontSize: "0.8125rem",
                fontWeight: active ? 500 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
                userSelect: "none",
                "&:hover": {
                  borderColor: P,
                  color: active ? "#fff" : P,
                },
              }}
            >
              <span>{LABEL_ICONS[lbl]}</span>
              <span>{lbl}</span>
            </Box>
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
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              height: 40,
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: P },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: P, boxShadow: `0 0 0 3px rgba(139,34,82,0.12)` },
            },
          }}
        />
      )}
    </Box>
  );
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    height: 40,
    fontSize: "0.875rem",
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: P },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: P,
      boxShadow: `0 0 0 3px rgba(139,34,82,0.12)`,
    },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: P },
  "& .MuiInputLabel-root": { fontSize: "0.875rem" },
};

const multilineSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    fontSize: "0.875rem",
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: P },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: P,
      boxShadow: `0 0 0 3px rgba(139,34,82,0.12)`,
    },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: P },
  "& .MuiInputLabel-root": { fontSize: "0.875rem" },
};

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

  return (
    <Grid container spacing={3} alignItems="flex-start">
      {/* ── Left: form ───────────────────────────────────────────────── */}
      <Grid item xs={12} sm={7} lg={8}>

        {/* Saved addresses */}
        {loadingAddresses ? (
          <Paper
            elevation={0}
            sx={{ p: 3, border: `0.5px solid ${BORDER}`, borderRadius: "12px", mb: 2.5, textAlign: "center" }}
          >
            <CircularProgress size={20} sx={{ color: P, mr: 1 }} />
            <Typography sx={{ fontSize: "0.875rem", color: "#6b7280" }} component="span">
              Loading saved addresses…
            </Typography>
          </Paper>
        ) : savedAddresses.length > 0 && (
          <Paper
            elevation={0}
            sx={{ border: `0.5px solid ${BORDER}`, borderRadius: "12px", mb: 2.5, overflow: "hidden", bgcolor: "#fff" }}
          >
            <Box sx={{ px: 2.5, py: 2, borderBottom: `0.5px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 1.5 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "#16a34a" }} />
              <Box>
                <Typography sx={{ fontSize: "1rem", fontWeight: 500 }}>Saved Addresses</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>Select a delivery address below</Typography>
              </Box>
            </Box>
            <Box sx={{ p: 2 }}>
              <Grid container spacing={1.5}>
                {savedAddresses.map((addr) => {
                  const selected = selectedAddressId === addr._id;
                  return (
                    <Grid item xs={12} sm={6} key={addr._id}>
                      <Box
                        onClick={() => selectSavedAddress(addr)}
                        sx={{
                          p: 2,
                          border: "1.5px solid",
                          borderColor: selected ? P : "#e5e7eb",
                          borderRadius: "10px",
                          cursor: "pointer",
                          bgcolor: selected ? P_LIGHT : "#fff",
                          "&:hover": { borderColor: P },
                          transition: "all 0.15s ease",
                          position: "relative",
                        }}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selected}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectSavedAddress(addr); } }}
                      >
                        {selected && (
                          <Box sx={{ position: "absolute", top: 10, right: 10, width: 18, height: 18, borderRadius: "50%", bgcolor: P, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <CheckIcon sx={{ color: "#fff", fontSize: 12 }} />
                          </Box>
                        )}
                        {addr.label && (
                          <Chip
                            label={addr.label}
                            size="small"
                            sx={{ mb: 0.75, bgcolor: P_LIGHT, color: P, fontWeight: 600, height: 18, fontSize: "0.68rem" }}
                          />
                        )}
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>{addr.street}</Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", display: "block" }}>
                          {addr.city}, {addr.state} – {addr.zipCode}
                        </Typography>
                        {addr.phone && (
                          <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", display: "block" }}>
                            📞 {addr.phone}
                          </Typography>
                        )}
                        {addr.isDefault && (
                          <Chip
                            label="Default"
                            size="small"
                            sx={{ mt: 0.5, bgcolor: P_LIGHT, color: P, border: `1px solid ${P}40`, height: 18, fontSize: "0.65rem" }}
                          />
                        )}
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
              <Divider sx={{ my: 2, borderColor: BORDER }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", px: 1 }}>
                  or enter a new address
                </Typography>
              </Divider>
            </Box>
          </Paper>
        )}

        {/* Address form */}
        <Paper
          elevation={0}
          sx={{ border: `0.5px solid ${BORDER}`, borderRadius: "12px", overflow: "hidden", bgcolor: "#fff" }}
        >
          {/* Card header */}
          <Box sx={{ px: 2.5, py: 2, borderBottom: `0.5px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: P_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LocationOnOutlinedIcon sx={{ fontSize: 20, color: P }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1rem", fontWeight: 500 }}>Delivery Address</Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                Where should we deliver your order?
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: 2.5 }}>
            <Box component="form" noValidate onSubmit={handleSubmit}>

              {/* Address label */}
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, mb: 1, color: "#374151" }}>
                  Address Label{" "}
                  <Typography component="span" sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>(optional)</Typography>
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
                sx={{ mb: 2.5, ...multilineSx }}
                autoComplete="street-address"
              />

              {/* PIN / City / State */}
              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label={
                      <span>
                        PIN Code{pincodeLoading && <CircularProgress size={10} sx={{ ml: 0.75 }} />}
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
                      sx: { color: pincodeAutoFilled && !pincodeError ? "#16a34a" : undefined, fontWeight: 500, fontSize: "0.7rem" },
                    }}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="City"
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
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="State"
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
              </Grid>

              {/* Country — full width, disabled */}
              <TextField
                label="Country"
                name="country"
                value="🇮🇳  India"
                fullWidth
                disabled
                sx={{ mb: 2.5, "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "#f9fafb", height: 40, fontSize: "0.875rem" } }}
              />

              {/* Phone */}
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, mb: 0.75, color: "#374151" }}>
                  Phone Number{" "}
                  <Typography component="span" sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
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
                    height: 40,
                    padding: "0 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    color: "#1c1917",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = P;
                    e.target.style.boxShadow = "0 0 0 3px rgba(139,34,82,0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.boxShadow = "none";
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
                  bgcolor: "#f9fafb",
                  border: `0.5px solid ${BORDER}`,
                  borderRadius: "10px",
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={saveAddressToBook}
                      onChange={(e) => setSaveAddressToBook(e.target.checked)}
                      size="small"
                      sx={{ "&.Mui-checked": { color: P } }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: "0.8125rem", color: "#374151" }}>
                      Save this address to my account
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={shippingAddress.isDefault}
                      onChange={(e) => setShippingAddress((prev) => ({ ...prev, isDefault: e.target.checked }))}
                      size="small"
                      sx={{ "&.Mui-checked": { color: P } }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: "0.8125rem", color: "#374151" }}>
                      Make this my default address
                    </Typography>
                  }
                />
              </Box>

              {(error || localError) && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: "10px" }}>
                  {localError || error}
                </Alert>
              )}

              <Stack direction="row" spacing={1.5} justifyContent="space-between">
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => setCurrentStep(1)}
                  sx={{
                    height: 48,
                    px: 3,
                    borderRadius: "10px",
                    borderColor: P,
                    color: P,
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    textTransform: "none",
                    "&:hover": { bgcolor: P_LIGHT, borderColor: P },
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
                    height: 48,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    borderRadius: "10px",
                    bgcolor: P,
                    textTransform: "none",
                    boxShadow: "0 2px 12px rgba(139,34,82,0.28)",
                    "&:hover": { bgcolor: "#7a1d47", boxShadow: "0 4px 16px rgba(139,34,82,0.36)" },
                  }}
                >
                  {loading ? "Saving…" : "Continue to Payment"}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* ── Right: compact order summary ─────────────────────────────── */}
      <Grid item xs={12} sm={5} lg={4}>
        <Paper
          elevation={0}
          sx={{
            border: `0.5px solid ${BORDER}`,
            borderRadius: "12px",
            bgcolor: "#fff",
            position: { sm: "sticky" },
            top: { sm: "24px" },
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: 2.5, py: 2, borderBottom: `0.5px solid ${BORDER}` }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 500, mb: 0.25 }}>Order Summary</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
            </Typography>
          </Box>

          <Box sx={{ p: 2.5 }}>
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              {cartItems.map((item) => (
                <Stack key={item.product._id} direction="row" alignItems="center" spacing={1.25}>
                  <ProductThumb product={item.product} size="xs" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500 }} noWrap>
                      {item.product.name}
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", display: "block" }}>
                      Qty {item.quantity} × ₹{item.product.price}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500, flexShrink: 0 }}>
                    ₹{item.totalPrice?.toLocaleString()}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Divider sx={{ borderColor: BORDER, mb: 2 }} />

            <Stack spacing={1.25} sx={{ width: "100%", mb: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: "0.875rem", color: "#6b7280" }}>Subtotal</Typography>
                <Typography sx={{ fontSize: "0.9375rem", fontWeight: 500 }}>₹{subtotal.toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: "0.875rem", color: "#6b7280" }}>Shipping</Typography>
                {shippingRate ? (
                  <Typography sx={{ fontSize: "0.9375rem", fontWeight: 500 }}>
                    {shippingRate.rate === 0 ? "FREE" : `₹${shippingRate.rate}`}
                  </Typography>
                ) : (
                  <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", fontStyle: "italic" }}>
                    Enter PIN to calculate
                  </Typography>
                )}
              </Stack>
            </Stack>

            <Divider sx={{ borderColor: BORDER, mb: 2 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
              <Typography sx={{ fontSize: "1rem", fontWeight: 500 }}>Total</Typography>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 600, color: P }}>
                ₹{displayTotal.toFixed(2)}
              </Typography>
            </Stack>

            {!shippingRate && (
              <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", mt: 1.5, fontStyle: "italic" }}>
                Shipping calculated at next step
              </Typography>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
