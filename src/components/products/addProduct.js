import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Switch from "@mui/material/Switch";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import { DotsLoader } from "../Loader";
import {
  FiArrowLeft, FiPackage, FiSave, FiCamera, FiX, FiHome,
  FiDollarSign, FiTruck, FiSettings, FiInfo,
  FiChevronDown, FiChevronUp, FiPlus, FiTrash2,
  FiEye, FiEyeOff, FiMove, FiZap,
} from "react-icons/fi";
import { MdPalette } from "react-icons/md";
import AdminLayout from "../admin/AdminLayout";
import { addProduct, updateProduct } from "../../features/productsSlice";
import { fetchPublicCategories } from "../../features/categoriesSlice";
import api from "../../api/axios";

/* ── Design tokens ─────────────────────────────────────────────── */
const P       = "#8b2252";
const P_DARK  = "#6b1238";
const P_LIGHT = "rgba(139,34,82,0.07)";
const BORDER  = "rgba(0,0,0,0.08)";

/* ── Shared field sx ────────────────────────────────────────────── */
const FIELD_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: "rgba(139,34,82,0.35)" },
    "&.Mui-focused fieldset": { borderColor: P, boxShadow: `0 0 0 3px rgba(139,34,82,0.1)` },
  },
};

const SWITCH_SX = {
  "& .MuiSwitch-switchBase.Mui-checked": { color: P },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: P },
};

/* ── Helpers ────────────────────────────────────────────────────── */
const isValidHex = (h) => /^#[0-9A-Fa-f]{6}$/.test(h);
const genId      = () => Math.random().toString(36).slice(2);

/* ── Section card ───────────────────────────────────────────────── */
function SC({ children, sx }) {
  return (
    <Card elevation={0} sx={{
      border: `1px solid ${BORDER}`, borderRadius: "16px",
      bgcolor: "#fff", overflow: "visible", ...sx,
    }}>
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        {children}
      </CardContent>
    </Card>
  );
}

/* ── Section header ─────────────────────────────────────────────── */
function SH({ icon: Icon, color = P, children, badge }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
      <Stack direction="row" alignItems="center" spacing={1.25}>
        <Box sx={{
          width: 34, height: 34, borderRadius: "9px", flexShrink: 0,
          bgcolor: `${color}12`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={15} style={{ color }} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a", lineHeight: 1 }}>
          {children}
        </Typography>
      </Stack>
      {badge !== undefined && (
        <Box sx={{
          px: 1.25, height: 24, display: "inline-flex", alignItems: "center",
          border: `1px solid ${BORDER}`, borderRadius: "20px",
        }}>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#6b7280" }}>{badge}</Typography>
        </Box>
      )}
    </Stack>
  );
}

/* ── Field label ────────────────────────────────────────────────── */
function FL({ children, required, hint }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
      <Typography sx={{ fontWeight: 600, fontSize: "0.8125rem", color: "#374151" }}>
        {children}
        {required && <Box component="span" sx={{ color: "#ef4444", ml: 0.25 }}>*</Box>}
      </Typography>
      {hint && (
        <Tooltip title={hint} arrow placement="top">
          <Box sx={{ display: "inline-flex", color: "#94a3b8", cursor: "help" }}>
            <FiInfo size={13} />
          </Box>
        </Tooltip>
      )}
    </Stack>
  );
}

/* ── Description toolbar button ─────────────────────────────────── */
function FmtBtn({ children, onClick, title }) {
  return (
    <Tooltip title={title || ""} arrow>
      <Button type="button" size="small" onClick={onClick}
        sx={{
          minWidth: 34, px: 1, py: 0.5, fontSize: "0.82rem", fontWeight: 700,
          border: `1px solid ${BORDER}`, color: "#475569", borderRadius: "7px",
          textTransform: "none", lineHeight: 1.4, bgcolor: "#fff",
          "&:hover": { borderColor: P, color: P, bgcolor: P_LIGHT },
          transition: "all 0.15s",
        }}>
        {children}
      </Button>
    </Tooltip>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PRODUCT COLORS SECTION
   ══════════════════════════════════════════════════════════════════ */
function ProductColorsSection({ colors, setColors, showColorPicker, setShowColorPicker, stockErrors, setStockErrors }) {
  const [collapsed,     setCollapsed]     = useState(false);
  const [draftHex,      setDraftHex]      = useState("#8b2252");
  const [draftHexInput, setDraftHexInput] = useState("#8b2252");
  const [draftName,     setDraftName]     = useState("");
  const [addError,      setAddError]      = useState("");
  const [dragIdx,       setDragIdx]       = useState(null);
  const [dropIdx,       setDropIdx]       = useState(null);
  const [editingCell,   setEditingCell]   = useState(null); // { id, field }
  const [editVal,       setEditVal]       = useState("");
  const [confirmDel,    setConfirmDel]    = useState(null);
  const [previewSel,    setPreviewSel]    = useState(null);
  const nativePickerRef = useRef(null);

  const MAX_COLORS = 12;
  const atMax = colors.length >= MAX_COLORS;

  /* ── Hex/swatch sync ──────────────────────────────────────────── */
  const handleNativePick = (e) => {
    const v = e.target.value;
    setDraftHex(v);
    setDraftHexInput(v);
    setAddError("");
  };

  const handleHexInput = (e) => {
    let v = e.target.value;
    if (!v.startsWith("#")) v = "#" + v;
    setDraftHexInput(v);
    if (isValidHex(v)) { setDraftHex(v); setAddError(""); }
  };

  const handleHexBlur = () => {
    if (!isValidHex(draftHexInput)) {
      setDraftHexInput(draftHex); // revert to last valid
    }
  };

  /* ── Add color ────────────────────────────────────────────────── */
  const handleAddColor = () => {
    const hex  = draftHex.trim();
    const name = draftName.trim() || `Custom ${hex}`;
    if (!isValidHex(hex)) { setAddError("Please enter a valid color name and hex code"); return; }
    if (colors.some((c) => c.hex.toLowerCase() === hex.toLowerCase())) {
      setAddError("This color already exists"); return;
    }
    if (atMax) return;
    setColors((prev) => [
      ...prev,
      { id: genId(), name, hex, stock: "", visibleToUsers: true, sortOrder: prev.length },
    ]);
    setDraftName("");
    setAddError("");
  };

  /* ── Remove color ─────────────────────────────────────────────── */
  const handleRemove = (id) => {
    setColors((prev) => prev.filter((c) => c.id !== id));
    setConfirmDel(null);
    if (previewSel !== null) setPreviewSel(null);
  };

  /* ── Update color field ───────────────────────────────────────── */
  const updateColor = (id, key, val) =>
    setColors((prev) => prev.map((c) => c.id === id ? { ...c, [key]: val } : c));

  /* ── Inline editing ───────────────────────────────────────────── */
  const startEdit = (id, field, current) => {
    setEditingCell({ id, field });
    setEditVal(current);
  };
  const commitEdit = (id, field) => {
    let val = editVal.trim();
    if (field === "hex") {
      if (!isValidHex(val)) val = colors.find((c) => c.id === id)?.hex || val;
    }
    if (field === "name" && !val) val = `Custom ${colors.find((c) => c.id === id)?.hex}`;
    updateColor(id, field, val);
    setEditingCell(null);
  };

  /* ── Drag-to-reorder ──────────────────────────────────────────── */
  const handleDragStart = (e, idx) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    setDropIdx(idx);
  };
  const handleDrop = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDropIdx(null); return; }
    setColors((prev) => {
      const next = [...prev];
      const [item] = next.splice(dragIdx, 1);
      next.splice(idx, 0, item);
      return next.map((c, i) => ({ ...c, sortOrder: i }));
    });
    setDragIdx(null);
    setDropIdx(null);
  };
  const handleDragEnd = () => { setDragIdx(null); setDropIdx(null); };

  /* ── Status chip helper ───────────────────────────────────────── */
  const getStatusChip = (color) => {
    if (!color.visibleToUsers) return { label: "Hidden", dot: "#94a3b8", bg: "#f8fafc", border: BORDER, text: "#6b7280" };
    if (!showColorPicker)       return { label: "Hidden (master off)", dot: "#d97706", bg: "#fffbeb", border: "#fde68a", text: "#92400e" };
    return { label: "Visible", dot: "#10b981", bg: "#f0fdf4", border: "#bbf7d0", text: "#059669" };
  };

  /* ── Visible colors for preview ───────────────────────────────── */
  const visibleColors = colors.filter((c) => c.visibleToUsers);

  return (
    <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: "16px", bgcolor: "#fff", overflow: "visible" }}>
      <CardContent sx={{ p: 3, "&:last-child": { pb: collapsed ? 3 : 3 } }}>

        {/* ── Section header row ─────────────────────────────────── */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: collapsed ? 0 : 0.75 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{
              width: 34, height: 34, borderRadius: "9px", flexShrink: 0,
              bgcolor: "rgba(139,34,82,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <MdPalette size={17} style={{ color: P }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a", lineHeight: 1.1 }}>
                Product Colors
              </Typography>
              {colors.length > 0 && (
                <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                  {colors.length} color{colors.length !== 1 ? "s" : ""} · {visibleColors.length} visible
                </Typography>
              )}
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1.5}>
            {/* Master visibility toggle */}
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Typography sx={{ fontSize: "0.8125rem", color: "#374151", fontWeight: 500 }}>
                Show color picker to customers
              </Typography>
              <Switch
                size="small"
                checked={showColorPicker}
                onChange={(e) => setShowColorPicker(e.target.checked)}
                sx={SWITCH_SX}
              />
            </Stack>

            {/* Collapse chevron */}
            <Box
              onClick={() => setCollapsed((v) => !v)}
              sx={{
                width: 30, height: 30, borderRadius: "8px", border: `1px solid ${BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#64748b",
                "&:hover": { bgcolor: "#f8fafc", color: P },
                transition: "all 0.15s",
              }}
            >
              {collapsed ? <FiChevronDown size={15} /> : <FiChevronUp size={15} />}
            </Box>
          </Stack>
        </Stack>

        <Collapse in={!collapsed}>
          <Box>
            <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", mb: 2.5, mt: 0.5 }}>
              Add color variants customers can choose from. Toggle visibility per color.
            </Typography>

            {/* ── Add color row ───────────────────────────────────── */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems="flex-start" sx={{ mb: 1.5 }}>

              {/* Swatch + native picker */}
              <Box sx={{ flexShrink: 0 }}>
                <Tooltip title="Click to pick color" arrow>
                  <Box
                    onClick={() => nativePickerRef.current?.click()}
                    sx={{
                      width: 40, height: 40, borderRadius: "8px",
                      bgcolor: draftHex, border: `2px solid ${BORDER}`,
                      cursor: "pointer", flexShrink: 0,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      transition: "transform 0.15s, box-shadow 0.15s",
                      "&:hover": { transform: "scale(1.08)", boxShadow: "0 4px 14px rgba(0,0,0,0.2)" },
                    }}
                  />
                </Tooltip>
                <input
                  ref={nativePickerRef}
                  type="color"
                  value={draftHex}
                  onChange={handleNativePick}
                  style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
                />
              </Box>

              {/* Hex text input */}
              <TextField
                size="small"
                value={draftHexInput}
                onChange={handleHexInput}
                onBlur={handleHexBlur}
                placeholder="#8b2252"
                sx={{
                  width: 116,
                  ...FIELD_SX,
                  "& input": { fontFamily: "monospace", fontSize: "0.875rem", height: "auto" },
                  "& .MuiOutlinedInput-root": {
                    ...FIELD_SX["& .MuiOutlinedInput-root"],
                    height: 40,
                  },
                }}
              />

              {/* Color name input */}
              <Box sx={{ flex: 1, minWidth: 0, position: "relative" }}>
                <TextField
                  fullWidth size="small"
                  value={draftName}
                  onChange={(e) => {
                    if (e.target.value.length <= 30) setDraftName(e.target.value);
                    setAddError("");
                  }}
                  placeholder="Color name (e.g. Midnight Black)"
                  sx={{
                    ...FIELD_SX,
                    "& .MuiOutlinedInput-root": {
                      ...FIELD_SX["& .MuiOutlinedInput-root"],
                      height: 40,
                    },
                  }}
                  slotProps={{ htmlInput: { maxLength: 30 } }}
                />
                {draftName.length >= 25 && (
                  <Typography sx={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    fontSize: "0.68rem", color: draftName.length >= 30 ? "#ef4444" : "#94a3b8",
                    pointerEvents: "none",
                  }}>
                    {draftName.length}/30
                  </Typography>
                )}
              </Box>

              {/* Add button */}
              <Tooltip title={atMax ? "Maximum 12 colors reached" : ""} arrow>
                <span>
                  <Button
                    type="button"
                    onClick={handleAddColor}
                    disabled={atMax}
                    startIcon={<FiPlus size={14} />}
                    sx={{
                      height: 40, borderRadius: "8px", textTransform: "none",
                      fontWeight: 600, fontSize: "0.8125rem", flexShrink: 0,
                      border: `1.5px solid ${P}`, color: P, bgcolor: "transparent",
                      "&:hover": { bgcolor: P_LIGHT },
                      "&:disabled": { borderColor: BORDER, color: "#94a3b8" },
                      transition: "all 0.15s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Add Color
                  </Button>
                </span>
              </Tooltip>
            </Stack>

            {/* Add error */}
            {addError && (
              <Typography sx={{ fontSize: "0.75rem", color: "#ef4444", mb: 1.5, ml: 0.25 }}>
                {addError}
              </Typography>
            )}

            {/* ── Color list + preview ────────────────────────────── */}
            <Grid container spacing={2.5} alignItems="flex-start">

              {/* List */}
              <Grid size={{ xs: 12, md: colors.length > 0 ? 8 : 12 }}>
                <Box sx={{
                  border: `1px solid ${BORDER}`, borderRadius: "12px",
                  bgcolor: "#fafbfc", overflow: "hidden",
                  minHeight: 80,
                }}>
                  {colors.length === 0 ? (
                    /* Empty state */
                    <Stack alignItems="center" justifyContent="center" spacing={0.75} sx={{ py: 4 }}>
                      <MdPalette size={32} style={{ color: "#d1d5db" }} />
                      <Typography sx={{ fontSize: "0.875rem", color: "#94a3b8", fontWeight: 500 }}>
                        No colors added yet
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#b0b7c3" }}>
                        Add your first color variant above
                      </Typography>
                    </Stack>
                  ) : (
                    <Box>
                      {colors.map((color, idx) => {
                        const chip       = getStatusChip(color);
                        const isDragging = dragIdx === idx;
                        const isDropTarget = dropIdx === idx && dragIdx !== null && dragIdx !== idx;
                        const isEditing  = (field) => editingCell?.id === color.id && editingCell?.field === field;
                        const hasStockError = stockErrors[color.id];

                        return (
                          <Box
                            key={color.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDrop={(e) => handleDrop(e, idx)}
                            onDragEnd={handleDragEnd}
                            sx={{
                              px: 1.75, py: 1.5,
                              borderBottom: idx < colors.length - 1 ? `1px solid ${BORDER}` : "none",
                              borderTop: isDropTarget ? `2px solid ${P}` : "2px solid transparent",
                              opacity: isDragging ? 0.45 : 1,
                              bgcolor: isDragging ? `${P}08` : "transparent",
                              transition: "opacity 0.15s, background 0.15s",
                              /* Animate in */
                              animation: "colorRowIn 0.2s ease both",
                              "@keyframes colorRowIn": {
                                from: { opacity: 0, transform: "translateY(-6px)" },
                                to:   { opacity: 1, transform: "translateY(0)" },
                              },
                            }}
                          >
                            <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap" gap={1}>

                              {/* Drag handle */}
                              <Box sx={{ color: "#d1d5db", cursor: "grab", display: "flex", "&:active": { cursor: "grabbing" } }}>
                                <FiMove size={15} />
                              </Box>

                              {/* Color swatch */}
                              <Box sx={{
                                width: 32, height: 32, borderRadius: "7px", flexShrink: 0,
                                bgcolor: color.hex,
                                border: `1.5px solid rgba(0,0,0,0.12)`,
                                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                              }} />

                              {/* Name + hex */}
                              <Box sx={{ flex: 1, minWidth: 100 }}>
                                {isEditing("name") ? (
                                  <input
                                    autoFocus
                                    value={editVal}
                                    maxLength={30}
                                    onChange={(e) => setEditVal(e.target.value)}
                                    onBlur={() => commitEdit(color.id, "name")}
                                    onKeyDown={(e) => { if (e.key === "Enter") commitEdit(color.id, "name"); if (e.key === "Escape") setEditingCell(null); }}
                                    style={{
                                      width: "100%", border: `1px solid ${P}`, borderRadius: 6,
                                      outline: "none", padding: "2px 6px", fontSize: "0.875rem",
                                      fontWeight: 500, color: "#0f172a", background: "#fff",
                                      boxShadow: `0 0 0 2px rgba(139,34,82,0.1)`,
                                    }}
                                  />
                                ) : (
                                  <Typography
                                    onClick={() => startEdit(color.id, "name", color.name)}
                                    sx={{
                                      fontSize: "0.875rem", fontWeight: 600, color: "#0f172a",
                                      cursor: "text", lineHeight: 1.3,
                                      "&:hover": { color: P },
                                      transition: "color 0.15s",
                                    }}
                                    title="Click to edit name"
                                  >
                                    {color.name}
                                  </Typography>
                                )}

                                {isEditing("hex") ? (
                                  <input
                                    autoFocus
                                    value={editVal}
                                    onChange={(e) => setEditVal(e.target.value)}
                                    onBlur={() => commitEdit(color.id, "hex")}
                                    onKeyDown={(e) => { if (e.key === "Enter") commitEdit(color.id, "hex"); if (e.key === "Escape") setEditingCell(null); }}
                                    style={{
                                      width: 90, border: `1px solid ${P}`, borderRadius: 5,
                                      outline: "none", padding: "1px 5px", fontSize: "0.72rem",
                                      fontFamily: "monospace", color: "#475569", background: "#fff",
                                    }}
                                  />
                                ) : (
                                  <Typography
                                    onClick={() => startEdit(color.id, "hex", color.hex)}
                                    sx={{
                                      fontSize: "0.72rem", color: "#94a3b8", fontFamily: "monospace",
                                      cursor: "text", "&:hover": { color: P }, transition: "color 0.15s",
                                    }}
                                    title="Click to edit hex"
                                  >
                                    {color.hex}
                                  </Typography>
                                )}
                              </Box>

                              {/* Stock input */}
                              <Box sx={{ flexShrink: 0 }}>
                                <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: "#94a3b8", mb: 0.35, textAlign: "center" }}>
                                  Stock
                                </Typography>
                                <Tooltip
                                  title={hasStockError ? "Stock qty required per color" : ""}
                                  arrow
                                  open={!!hasStockError}
                                  placement="top"
                                >
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="Qty"
                                    value={color.stock}
                                    onChange={(e) => {
                                      updateColor(color.id, "stock", e.target.value);
                                      if (e.target.value) setStockErrors((prev) => { const n = { ...prev }; delete n[color.id]; return n; });
                                    }}
                                    style={{
                                      width: 60, height: 32, borderRadius: 7, textAlign: "center",
                                      border: `1.5px solid ${hasStockError ? "#f59e0b" : BORDER}`,
                                      outline: "none", fontSize: "0.8125rem", fontWeight: 600,
                                      color: "#0f172a", background: hasStockError ? "#fffbeb" : "#fff",
                                      padding: "0 6px",
                                      boxShadow: hasStockError ? "0 0 0 2px rgba(245,158,11,0.15)" : "none",
                                    }}
                                  />
                                </Tooltip>
                              </Box>

                              {/* Visibility toggle */}
                              <Stack alignItems="center" sx={{ flexShrink: 0 }}>
                                <Typography sx={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600, mb: 0.25, whiteSpace: "nowrap" }}>
                                  Visible
                                </Typography>
                                <Tooltip
                                  title={!showColorPicker ? "Enable master color toggle first" : ""}
                                  arrow
                                >
                                  <span>
                                    <Switch
                                      size="small"
                                      checked={color.visibleToUsers}
                                      disabled={!showColorPicker}
                                      onChange={(e) => updateColor(color.id, "visibleToUsers", e.target.checked)}
                                      sx={{
                                        opacity: !showColorPicker ? 0.45 : 1,
                                        ...SWITCH_SX,
                                      }}
                                    />
                                  </span>
                                </Tooltip>
                              </Stack>

                              {/* Status chip */}
                              <Box sx={{
                                px: 1.25, height: 22, display: "inline-flex", alignItems: "center", gap: 0.6,
                                bgcolor: chip.bg, border: `1px solid ${chip.border}`, borderRadius: "20px",
                                flexShrink: 0,
                              }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: chip.dot, flexShrink: 0 }} />
                                <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: chip.text, whiteSpace: "nowrap" }}>
                                  {chip.label}
                                </Typography>
                              </Box>

                              {/* Delete button */}
                              {confirmDel === color.id ? (
                                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
                                  <Typography sx={{ fontSize: "0.72rem", color: "#64748b", whiteSpace: "nowrap" }}>
                                    Remove {color.name.slice(0, 10)}{color.name.length > 10 ? "…" : ""}?
                                  </Typography>
                                  <Button type="button" size="small" onClick={() => handleRemove(color.id)}
                                    sx={{ minWidth: 0, px: 1, py: 0.25, fontSize: "0.72rem", fontWeight: 700, color: "#ef4444",
                                      border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", textTransform: "none",
                                      "&:hover": { bgcolor: "rgba(239,68,68,0.06)" } }}>
                                    Yes
                                  </Button>
                                  <Button type="button" size="small" onClick={() => setConfirmDel(null)}
                                    sx={{ minWidth: 0, px: 1, py: 0.25, fontSize: "0.72rem", color: "#64748b",
                                      border: `1px solid ${BORDER}`, borderRadius: "6px", textTransform: "none",
                                      "&:hover": { bgcolor: "#f8fafc" } }}>
                                    No
                                  </Button>
                                </Stack>
                              ) : (
                                <Box
                                  onClick={() => setConfirmDel(color.id)}
                                  sx={{
                                    width: 30, height: 30, borderRadius: "7px", flexShrink: 0,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "#d1d5db", cursor: "pointer",
                                    border: `1px solid transparent`,
                                    "&:hover": { color: "#ef4444", bgcolor: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)" },
                                    transition: "all 0.15s",
                                  }}
                                >
                                  <FiTrash2 size={14} />
                                </Box>
                              )}
                            </Stack>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* ── Customer Preview panel ──────────────────────────── */}
              {colors.length > 0 && (
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{
                    border: `1px solid ${BORDER}`, borderRadius: "12px",
                    bgcolor: "#fff", p: 2, position: "relative", overflow: "hidden",
                  }}>
                    <Typography sx={{
                      fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8",
                      textTransform: "uppercase", letterSpacing: "0.08em", mb: 1.5,
                    }}>
                      Customer Preview
                    </Typography>

                    {/* Muted overlay when master toggle off */}
                    {!showColorPicker && (
                      <Box sx={{
                        position: "absolute", inset: 0, borderRadius: "12px",
                        bgcolor: "rgba(248,250,252,0.88)", backdropFilter: "blur(2px)",
                        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
                      }}>
                        <Stack alignItems="center" spacing={0.5}>
                          <FiEyeOff size={18} style={{ color: "#94a3b8" }} />
                          <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8", textAlign: "center", px: 2 }}>
                            Color picker hidden from customers
                          </Typography>
                        </Stack>
                      </Box>
                    )}

                    {visibleColors.length === 0 && showColorPicker ? (
                      <Box sx={{ bgcolor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", p: 1.5 }}>
                        <Typography sx={{ fontSize: "0.75rem", color: "#92400e", textAlign: "center" }}>
                          No colors visible to customers
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        {/* Swatch row */}
                        <Stack direction="row" flexWrap="wrap" gap={0.875} sx={{ mb: 1.5 }}>
                          {visibleColors.map((c, i) => {
                            const selected = previewSel === c.id;
                            return (
                              <Tooltip key={c.id} title={c.name} arrow>
                                <Box
                                  onClick={() => setPreviewSel(selected ? null : c.id)}
                                  sx={{
                                    width: 28, height: 28, borderRadius: "50%",
                                    bgcolor: c.hex, cursor: "pointer",
                                    border: selected ? `2.5px solid ${P}` : "2px solid rgba(0,0,0,0.1)",
                                    boxShadow: selected ? `0 0 0 3px rgba(139,34,82,0.18)` : "none",
                                    transition: "all 0.18s",
                                    "&:hover": { transform: "scale(1.15)", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" },
                                  }}
                                />
                              </Tooltip>
                            );
                          })}
                        </Stack>

                        {/* Selected color name */}
                        {previewSel !== null && (() => {
                          const sel = visibleColors.find((c) => c.id === previewSel);
                          if (!sel) return null;
                          return (
                            <Stack direction="row" alignItems="center" spacing={0.75}>
                              <Box sx={{ width: 14, height: 14, borderRadius: "3px", bgcolor: sel.hex, border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }} />
                              <Typography sx={{ fontSize: "0.78rem", color: "#374151", fontWeight: 500 }}>
                                Selected: <strong>{sel.name}</strong>
                              </Typography>
                            </Stack>
                          );
                        })()}

                        {previewSel === null && (
                          <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                            Click a swatch to preview selection
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Preview caption */}
                    <Typography sx={{ fontSize: "0.68rem", color: "#d1d5db", mt: 1.5 }}>
                      {visibleColors.length} of {colors.length} color{colors.length !== 1 ? "s" : ""} visible
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════════════
   AI AUTOFILL DIALOG
   ══════════════════════════════════════════════════════════════════ */
function AiAutofillDialog({ open, onClose, productName, categories, onApply }) {
  const [keywords, setKeywords]   = useState("");
  const [catHint,  setCatHint]    = useState("");
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState("");
  const [result,   setResult]     = useState(null);

  const handleGenerate = async () => {
    if (!productName?.trim()) { setError("Enter a product name in the form first"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await api.post("/api/admin/products/ai-autofill", {
        name: productName, keywords, category: catHint,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApply(result);
    onClose();
    setResult(null); setKeywords(""); setCatHint(""); setError("");
  };

  const handleClose = () => {
    onClose();
    setResult(null); setKeywords(""); setCatHint(""); setError("");
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: "20px", maxHeight: "90vh" } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 34, height: 34, borderRadius: "9px", bgcolor: `${P}12`,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiZap size={15} style={{ color: P }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", lineHeight: 1 }}>
              AI Product Fill
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#6b7280", mt: 0.25 }}>
              Generate description, tags & SEO using Claude AI
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2}>
          <Box sx={{ p: 1.5, bgcolor: "#fafafa", borderRadius: "10px", border: `1px solid ${BORDER}` }}>
            <Typography sx={{ fontSize: "0.75rem", color: "#6b7280", mb: 0.25 }}>Generating for</Typography>
            <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>
              {productName || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No product name yet</span>}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.8rem", color: "#374151", mb: 0.75 }}>
              Materials / keywords <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
            </Typography>
            <TextField fullWidth size="small" multiline rows={2}
              placeholder="e.g. handmade, silk thread, Rajasthani, meenakari, gold plated"
              value={keywords} onChange={(e) => setKeywords(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.8rem", color: "#374151", mb: 0.75 }}>
              Category hint <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
            </Typography>
            <FormControl fullWidth size="small">
              <Select value={catHint} onChange={(e) => setCatHint(e.target.value)} displayEmpty
                sx={{ borderRadius: "10px" }}>
                <MenuItem value=""><em style={{ color: "#94a3b8" }}>Let AI decide</em></MenuItem>
                {categories.map(c => (
                  <MenuItem key={c._id || c.name} value={c.name}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {error && <Alert severity="error" sx={{ borderRadius: "10px", fontSize: "0.82rem" }}>{error}</Alert>}

          {result && (
            <Box sx={{ p: 2, bgcolor: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#15803d", mb: 1.5 }}>
                ✓ Generated successfully — preview
              </Typography>
              <Stack spacing={1.5}>
                <Box>
                  <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b7280", mb: 0.25, textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: "#374151", lineHeight: 1.5 }}>{result.description}</Typography>
                </Box>
                {result.tags?.length > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b7280", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tags</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {result.tags.map(t => <Chip key={t} label={t} size="small" sx={{ fontSize: "0.72rem", height: 22 }} />)}
                    </Stack>
                  </Box>
                )}
                {result.suggestedCategory && (
                  <Box>
                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b7280", mb: 0.25, textTransform: "uppercase", letterSpacing: "0.05em" }}>Suggested category</Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: "#374151" }}>
                      {result.suggestedCategory}{result.suggestedSubCategory ? ` › ${result.suggestedSubCategory}` : ""}
                    </Typography>
                  </Box>
                )}
                {result.seoTitle && (
                  <Box>
                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b7280", mb: 0.25, textTransform: "uppercase", letterSpacing: "0.05em" }}>SEO title</Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: "#374151" }}>{result.seoTitle}</Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
        <Button onClick={handleClose} sx={{ color: "#6b7280", textTransform: "none", fontWeight: 600 }}>
          Cancel
        </Button>
        {!result ? (
          <Button variant="contained" onClick={handleGenerate} disabled={loading || !productName?.trim()}
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <FiZap size={14} />}
            sx={{ bgcolor: P, textTransform: "none", fontWeight: 700, borderRadius: "10px",
              "&:hover": { bgcolor: P_DARK }, "&:disabled": { bgcolor: "#e5e7eb" } }}>
            {loading ? "Generating…" : "Generate"}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleApply}
            sx={{ bgcolor: "#16a34a", textTransform: "none", fontWeight: 700, borderRadius: "10px",
              "&:hover": { bgcolor: "#15803d" } }}>
            Apply to Form
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════ */
const AddProduct = () => {
  const params   = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const descRef      = useRef(null);

  const { publicCategories: categories = [], publicCategoriesLoading: categoriesLoading } =
    useSelector((s) => s.categories);

  const [form, setForm] = useState({
    name: "", sku: "", price: "", compareAtPrice: "",
    description: "", category: "", subCategory: "",
    stock: "", lowStockThreshold: "5", trackInventory: true,
    estimatedDelivery: "5", weightInGrams: "500",
    isCustomizable: false, processingDaysMin: "10", processingDaysMax: "12",
  });
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  /* ── Color section state ───────────────────────────────────────── */
  const [colors,           setColors]           = useState([]);
  const [showColorPicker,  setShowColorPicker]  = useState(false);
  const [stockErrors,      setStockErrors]      = useState({});

  const [weightUnit,     setWeightUnit]     = useState("g");
  const [editingId]                         = useState(params?.id ?? null);
  const [loading,        setLoading]        = useState(false);
  const [alert,          setAlert]          = useState({ show: false, message: "", variant: "" });
  const [aiDialogOpen,   setAiDialogOpen]   = useState(false);
  const [imageFiles,     setImageFiles]     = useState([]);
  const [imagePreviews,  setImagePreviews]  = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [dragOver,       setDragOver]       = useState(false);

  const subCategoryOptions = form.category
    ? categories.find((c) => c.name === form.category)?.subcategories?.filter((s) => s.isActive) || []
    : [];

  /* ── Image helpers ─────────────────────────────────────────────── */
  const handleImageChange = (e) => handleFiles(Array.from(e.target.files));
  const handleFiles = (files) => {
    if (imageFiles.length + files.length > 10) {
      setAlert({ show: true, message: "Maximum 10 images allowed", variant: "warning" }); return;
    }
    const validFiles = [], newPreviews = [];
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) { setAlert({ show: true, message: `${file.name} is not a valid image`, variant: "warning" }); return; }
      if (file.size > 10 * 1024 * 1024) { setAlert({ show: true, message: `${file.name} is too large. Max 10 MB`, variant: "warning" }); return; }
      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({ id: Date.now() + Math.random(), file, preview: reader.result, name: file.name });
        if (newPreviews.length === validFiles.length) {
          setImageFiles((p) => [...p, ...validFiles]);
          setImagePreviews((p) => [...p, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  const removeImage     = (i) => { setImageFiles((p) => p.filter((_, idx) => idx !== i)); setImagePreviews((p) => p.filter((_, idx) => idx !== i)); };
  const removeAllImages = () => { setImageFiles([]); setImagePreviews([]); setExistingImages([]); if (fileInputRef.current) fileInputRef.current.value = ""; };
  const handleDragOver  = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false); };
  const handleDrop      = (e) => { e.preventDefault(); setDragOver(false); handleFiles(Array.from(e.dataTransfer.files)); };

  /* ── Description toolbar ───────────────────────────────────────── */
  const insertFormat = (type) => {
    const ta = descRef.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd, sel = form.description.slice(s, e);
    const map = { bold: `**${sel || "bold"}**`, italic: `_${sel || "italic"}_`, underline: `<u>${sel || "text"}</u>`, list: `\n• ${sel || "item"}` };
    const ins = map[type];
    const next = form.description.slice(0, s) + ins + form.description.slice(e);
    set("description", next);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + ins.length, s + ins.length); }, 0);
  };

  /* ── Submit ────────────────────────────────────────────────────── */
  const fileToBase64 = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.category) {
      setAlert({ show: true, message: "Please fill in all required fields", variant: "warning" }); return;
    }

    /* ── Color validations ──────────────────────────────────────── */
    // Blocking: colors with empty stock
    if (colors.length > 0) {
      const errs = {};
      colors.forEach((c) => { if (c.stock === "" || c.stock === undefined) errs[c.id] = true; });
      if (Object.keys(errs).length > 0) {
        setStockErrors(errs);
        setAlert({ show: true, message: "Please enter stock quantity for all color variants.", variant: "warning" });
        return;
      }
    }

    // Non-blocking: master ON but 0 visible colors
    if (showColorPicker && colors.length > 0 && !colors.some((c) => c.visibleToUsers)) {
      setAlert({
        show: true,
        message: "Color picker is enabled but no colors are visible to customers. Either add visible colors or disable the color picker.",
        variant: "warning",
      });
      // Non-blocking — do not return, allow submit
    }

    setLoading(true); setAlert({ show: false, message: "", variant: "" });
    try {
      let productData = {
        ...form,
        colors: colors.map(({ id, ...c }) => c),
        showColorPickerToUsers: showColorPicker,
      };
      if (imageFiles.length > 0) {
        setImageUploading(true);
        try {
          const imagesData = [];
          for (const file of imageFiles) {
            const b64 = await fileToBase64(file);
            imagesData.push({ base64: b64, filename: file.name, mimetype: file.type, size: file.size, originalName: file.name });
          }
          productData.images = imagesData;
        } catch {
          setAlert({ show: true, message: "Failed to process images. Try fewer or smaller images.", variant: "error" });
          setImageUploading(false); setLoading(false); return;
        }
      }
      if (editingId) {
        await dispatch(updateProduct({ id: editingId, productData })).unwrap();
        setAlert({ show: true, message: "Product updated successfully!", variant: "success" });
      } else {
        await dispatch(addProduct(productData)).unwrap();
        setAlert({ show: true, message: "Product added successfully!", variant: "success" });
      }
      if (!editingId) {
        setForm({ name: "", sku: "", price: "", compareAtPrice: "", description: "", category: "", subCategory: "", stock: "", lowStockThreshold: "5", trackInventory: true, estimatedDelivery: "5", weightInGrams: "500", isCustomizable: false, processingDaysMin: "10", processingDaysMax: "12" });
        setColors([]); setShowColorPicker(false); setStockErrors({});
        removeAllImages();
      }
      setTimeout(() => navigate("/admin/products"), 1500);
    } catch (err) {
      let msg = err?.message || "An error occurred while saving the product";
      if (msg.includes("413") || msg.includes("Payload too large")) msg = "Images are too large. Try fewer or compress them.";
      else if (msg.includes("timeout")) msg = "Request timed out. Try fewer images.";
      setAlert({ show: true, message: msg, variant: "error" });
    } finally { setLoading(false); setImageUploading(false); }
  };

  /* ── Data loading ──────────────────────────────────────────────── */
  useEffect(() => { dispatch(fetchPublicCategories()); }, [dispatch]);
  useEffect(() => {
    const product = location.state?.product;
    if (editingId && product) {
      setForm({
        name: product.name, sku: product.sku || "", price: product.price,
        compareAtPrice: product.compareAtPrice || "", description: product.description,
        category: product.category, subCategory: product.subCategory,
        stock: product.stock !== undefined ? product.stock : "",
        lowStockThreshold: product.lowStockThreshold !== undefined ? product.lowStockThreshold : "5",
        trackInventory: product.trackInventory !== undefined ? product.trackInventory : true,
        estimatedDelivery: product.estimatedDelivery !== undefined ? String(product.estimatedDelivery) : "5",
        weightInGrams: product.weightInGrams !== undefined ? String(product.weightInGrams) : "500",
        isCustomizable: product.isCustomizable ?? false,
        processingDaysMin: product.processingDaysMin !== undefined ? String(product.processingDaysMin) : "10",
        processingDaysMax: product.processingDaysMax !== undefined ? String(product.processingDaysMax) : "12",
      });
      if (product.colors?.length > 0) {
        setColors(product.colors.map((c, i) => ({ ...c, id: c.id || genId(), sortOrder: c.sortOrder ?? i })));
        setShowColorPicker(product.showColorPickerToUsers ?? false);
      }
      if (product.images?.length > 0) setExistingImages(product.images);
      else if (product.image?.url) setExistingImages([{ url: product.image.url, originalName: product.image.originalName || "image.jpg", isPrimary: true }]);
    }
  }, [editingId, location.state]);

  const alertSeverity = alert.variant === "danger" ? "error" : alert.variant === "warning" ? "warning" : alert.variant === "success" ? "success" : "info";
  const totalImages = imagePreviews.length + existingImages.length;
  const discountPct = form.price && form.compareAtPrice && Number(form.compareAtPrice) > Number(form.price)
    ? Math.round((1 - Number(form.price) / Number(form.compareAtPrice)) * 100) : 0;

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <AdminLayout>
      <Box sx={{ width: "100%", bgcolor: "#f8f9fc", minHeight: "100vh", p: { xs: 2, md: 3 } }}>

        {/* ── Page header ─────────────────────────────────────────── */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <Box sx={{ fontSize: "0.78rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }}
            onClick={() => navigate("/")}>
            <FiHome size={13} /> Home
          </Box>
          <Box sx={{ fontSize: "0.78rem", color: "#94a3b8" }}>/</Box>
          <Box sx={{ fontSize: "0.78rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }}
            onClick={() => navigate("/admin/products")}>
            <FiPackage size={13} /> Products
          </Box>
          <Box sx={{ fontSize: "0.78rem", color: "#94a3b8" }}>/</Box>
          <Box sx={{ fontSize: "0.78rem", color: P, fontWeight: 600 }}>
            {editingId ? "Edit Product" : "Add Product"}
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0 }}>
            <Button variant="outlined" size="small" startIcon={<FiArrowLeft size={13} />}
              onClick={() => navigate("/admin/products")}
              sx={{
                borderRadius: "10px", textTransform: "none", fontWeight: 600, flexShrink: 0,
                borderColor: BORDER, color: "#64748b", height: 36,
                "&:hover": { borderColor: P, color: P, bgcolor: P_LIGHT },
              }}>
              Products
            </Button>
            <Box sx={{ height: 24, width: "1px", bgcolor: BORDER, flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", color: "#0f172a", lineHeight: 1.2 }}>
                {editingId ? "Edit Product" : "Add New Product"}
              </Typography>
              <Typography sx={{ fontSize: "0.8125rem", color: "#94a3b8", mt: 0.25 }}>
                {editingId ? "Update product details and save changes" : "Fill in the details to create a new listing"}
              </Typography>
            </Box>
          </Stack>
          {!editingId && (
            <Button variant="outlined" size="small" startIcon={<FiZap size={13} />}
              onClick={() => setAiDialogOpen(true)}
              sx={{
                borderRadius: "10px", textTransform: "none", fontWeight: 700, flexShrink: 0,
                borderColor: P, color: P, height: 36,
                "&:hover": { bgcolor: P_LIGHT, borderColor: P_DARK },
              }}>
              AI Fill
            </Button>
          )}
        </Stack>

        <AiAutofillDialog
          open={aiDialogOpen}
          onClose={() => setAiDialogOpen(false)}
          productName={form.name}
          categories={categories}
          onApply={(data) => {
            if (data.description) set("description", data.description);
            if (data.suggestedCategory && !form.category) set("category", data.suggestedCategory);
            if (data.suggestedSubCategory && !form.subCategory) set("subCategory", data.suggestedSubCategory);
            setAlert({
              show: true,
              message: "AI content applied! Review and adjust the description, tags, and SEO fields below.",
              variant: "success",
            });
          }}
        />

        {alert.show && (
          <Alert severity={alertSeverity} onClose={() => setAlert({ show: false, message: "", variant: "" })}
            sx={{ borderRadius: "12px", mb: 2.5, fontWeight: 600 }}>
            {alert.message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3} alignItems="flex-start">

            {/* ════ LEFT COLUMN (8/12) ════════════════════════════════ */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack spacing={3}>

                {/* ── Basic Information ─────────────────────────────── */}
                <SC>
                  <SH icon={FiPackage}>Basic Information</SH>

                  <FL required>Product name</FL>
                  <TextField fullWidth size="small"
                    placeholder="e.g. Handmade Ceramic Mug"
                    value={form.name} onChange={(e) => set("name", e.target.value)} required
                    sx={{ ...FIELD_SX, mb: 2.5 }} />

                  <Grid container spacing={2} sx={{ mb: 2.5 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FL required>Category</FL>
                      <FormControl fullWidth size="small" required sx={FIELD_SX}>
                        <Select value={form.category}
                          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, subCategory: "" }))}
                          displayEmpty
                          renderValue={(v) => v || <Box component="span" sx={{ color: "#94a3b8" }}>Select category</Box>}>
                          <MenuItem value=""><em>Select category</em></MenuItem>
                          {categoriesLoading ? <MenuItem disabled>Loading…</MenuItem>
                            : categories.map((cat) => <MenuItem key={cat._id} value={cat.name}>{cat.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FL>Subcategory</FL>
                      <FormControl fullWidth size="small" disabled={!form.category || subCategoryOptions.length === 0} sx={FIELD_SX}>
                        <Select value={form.subCategory} onChange={(e) => set("subCategory", e.target.value)}
                          displayEmpty
                          renderValue={(v) => v || <Box component="span" sx={{ color: "#94a3b8" }}>Select subcategory</Box>}>
                          <MenuItem value=""><em>None</em></MenuItem>
                          {subCategoryOptions.map((sub) => <MenuItem key={sub._id} value={sub.name}>{sub.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FL hint="Stock Keeping Unit — your internal product code">SKU / Product code</FL>
                      <TextField fullWidth size="small" placeholder="e.g. MUG-001"
                        value={form.sku} onChange={(e) => set("sku", e.target.value)} sx={FIELD_SX} />
                    </Grid>
                  </Grid>

                  {/* Description editor */}
                  <FL>Description</FL>
                  <Box sx={{
                    border: `1px solid ${BORDER}`, borderRadius: "12px", overflow: "hidden",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    "&:focus-within": { borderColor: P, boxShadow: `0 0 0 3px rgba(139,34,82,0.1)` },
                  }}>
                    <Stack direction="row" spacing={0.75} sx={{ px: 1.5, py: 1, borderBottom: `1px solid ${BORDER}`, bgcolor: "#f8fafc" }}>
                      <FmtBtn onClick={() => insertFormat("bold")} title="Bold"><b>B</b></FmtBtn>
                      <FmtBtn onClick={() => insertFormat("italic")} title="Italic"><i>I</i></FmtBtn>
                      <FmtBtn onClick={() => insertFormat("underline")} title="Underline"><u>U</u></FmtBtn>
                      <FmtBtn onClick={() => insertFormat("list")} title="Bullet list">• List</FmtBtn>
                      <Box sx={{ flex: 1 }} />
                      <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8", alignSelf: "center" }}>
                        {form.description.length} chars
                      </Typography>
                    </Stack>
                    <Box component="textarea" ref={descRef} rows={6}
                      placeholder="Describe your product — materials, dimensions, care instructions…"
                      value={form.description} onChange={(e) => set("description", e.target.value)}
                      sx={{
                        width: "100%", border: "none", outline: "none", resize: "vertical",
                        p: 1.75, fontFamily: "Inter, sans-serif", fontSize: "0.875rem",
                        color: "#1c1917", bgcolor: "#fff", lineHeight: 1.65,
                        display: "block", boxSizing: "border-box", minHeight: 120,
                      }} />
                  </Box>
                </SC>

                {/* ── Product Colors ────────────────────────────────── */}
                <ProductColorsSection
                  colors={colors}
                  setColors={setColors}
                  showColorPicker={showColorPicker}
                  setShowColorPicker={setShowColorPicker}
                  stockErrors={stockErrors}
                  setStockErrors={setStockErrors}
                />

                {/* ── Product Images ────────────────────────────────── */}
                <SC>
                  <SH icon={FiCamera} badge={`${totalImages} / 10 uploaded`}>
                    Product Images
                  </SH>

                  {/* Drop zone */}
                  <Box onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      border: `2px dashed ${dragOver ? P : BORDER}`,
                      borderRadius: "14px", p: { xs: 4, sm: 6 }, textAlign: "center", cursor: "pointer",
                      bgcolor: dragOver ? P_LIGHT : "#fdfaf8",
                      transition: "all 0.2s ease",
                      mb: totalImages > 0 ? 2.5 : 0,
                      "&:hover": { borderColor: "rgba(139,34,82,0.4)", bgcolor: P_LIGHT },
                    }}>
                    <Box sx={{
                      width: 56, height: 56, borderRadius: "50%", mx: "auto", mb: 2,
                      background: `linear-gradient(135deg, rgba(139,34,82,0.12), rgba(139,34,82,0.22))`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <FiCamera size={24} style={{ color: P }} />
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5, fontSize: "0.9375rem" }}>
                      Click to upload or drag &amp; drop
                    </Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      JPEG, PNG, WebP · max 10 MB each · up to 10 images
                    </Typography>
                    {totalImages === 0 && (
                      <Box sx={{
                        display: "inline-flex", alignItems: "center", gap: 0.75, mt: 2,
                        px: 2, height: 32, borderRadius: "20px",
                        bgcolor: P_LIGHT, border: `1px solid rgba(139,34,82,0.2)`,
                      }}>
                        <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: P }}>Browse files</Typography>
                      </Box>
                    )}
                  </Box>

                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: "none" }} />

                  {totalImages > 0 && (
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151" }}>
                          Selected ({totalImages})
                          <Box component="span" sx={{ ml: 1, fontSize: "0.72rem", color: "#94a3b8", fontWeight: 400 }}>
                            First image is the primary listing photo
                          </Box>
                        </Typography>
                        <Button type="button" size="small" startIcon={<FiX size={12} />} onClick={removeAllImages}
                          sx={{
                            borderRadius: "8px", textTransform: "none", fontSize: "0.78rem",
                            color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)",
                            "&:hover": { bgcolor: "rgba(239,68,68,0.06)", borderColor: "#ef4444" },
                          }}>
                          Remove all
                        </Button>
                      </Stack>
                      <Grid container spacing={1.5}>
                        {existingImages.map((img, i) => (
                          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={`ex-${i}`}>
                            <Box sx={{ position: "relative", borderRadius: "12px", overflow: "hidden",
                              border: `2px solid ${i === 0 ? P : BORDER}`, aspectRatio: "1/1" }}>
                              <Box component="img" src={img.url} alt={img.originalName || `Image ${i + 1}`}
                                sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                              {img.isPrimary && (
                                <Box sx={{
                                  position: "absolute", top: 6, left: 6,
                                  px: 1, py: 0.25, borderRadius: "6px",
                                  background: "linear-gradient(135deg,#10b981,#059669)",
                                  fontSize: "0.6rem", color: "#fff", fontWeight: 800,
                                }}>⭐ Primary</Box>
                              )}
                            </Box>
                          </Grid>
                        ))}
                        {imagePreviews.map((img, i) => (
                          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={img.id}>
                            <Box sx={{ position: "relative", borderRadius: "12px", overflow: "hidden",
                              border: `2px solid ${i === 0 && existingImages.length === 0 ? P : BORDER}`, aspectRatio: "1/1" }}>
                              <Box component="img" src={img.preview} alt={img.name}
                                sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                              <Box component="button" type="button" onClick={() => removeImage(i)}
                                sx={{
                                  position: "absolute", top: 6, right: 6, width: 26, height: 26,
                                  borderRadius: "50%", border: "none", cursor: "pointer",
                                  background: "linear-gradient(135deg,#ef4444,#dc2626)",
                                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                                  p: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                  "&:hover": { transform: "scale(1.1)" }, transition: "transform 0.15s",
                                }}>
                                <FiX size={12} />
                              </Box>
                              {i === 0 && existingImages.length === 0 && (
                                <Box sx={{
                                  position: "absolute", top: 6, left: 6,
                                  px: 1, py: 0.25, borderRadius: "6px",
                                  background: "linear-gradient(135deg,#10b981,#059669)",
                                  fontSize: "0.6rem", color: "#fff", fontWeight: 800,
                                }}>⭐ Primary</Box>
                              )}
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </SC>

              </Stack>
            </Grid>

            {/* ════ RIGHT COLUMN (4/12) ════════════════════════════════ */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={3}>

                {/* ── Pricing & Stock ───────────────────────────────── */}
                <SC>
                  <SH icon={FiDollarSign} color="#10b981">Pricing &amp; Stock</SH>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                      <FL required>Price (₹)</FL>
                      <TextField fullWidth size="small" type="number" placeholder="0.00"
                        value={form.price} onChange={(e) => set("price", e.target.value)} required
                        slotProps={{
                          input: { startAdornment: <InputAdornment position="start"><Typography sx={{ color: "#6b7280", fontWeight: 700 }}>₹</Typography></InputAdornment> },
                          htmlInput: { min: 0, step: 0.01 },
                        }}
                        sx={FIELD_SX} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                      <FL hint="Will appear as a crossed-out price on the product page">Compare at price</FL>
                      <TextField fullWidth size="small" type="number" placeholder="0.00"
                        value={form.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)}
                        slotProps={{
                          input: { startAdornment: <InputAdornment position="start"><Typography sx={{ color: "#6b7280", fontWeight: 700 }}>₹</Typography></InputAdornment> },
                          htmlInput: { min: 0, step: 0.01 },
                        }}
                        sx={FIELD_SX} />
                      {discountPct > 0 && (
                        <Box sx={{
                          display: "inline-flex", alignItems: "center", mt: 0.75,
                          px: 1.25, height: 22, borderRadius: "20px",
                          bgcolor: "#f0fdf4", border: "1px solid #bbf7d0",
                        }}>
                          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#059669" }}>
                            {discountPct}% off applied
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2, borderColor: BORDER }} />

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                      <FL>Stock quantity</FL>
                      <TextField fullWidth size="small" type="number" placeholder="0"
                        value={form.stock} onChange={(e) => set("stock", e.target.value)}
                        slotProps={{ htmlInput: { min: 0 } }} sx={FIELD_SX} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                      <FL hint='Shows "Only X left!" warning on product page when stock drops below this'>Low stock alert</FL>
                      <TextField fullWidth size="small" type="number" placeholder="5"
                        value={form.lowStockThreshold} onChange={(e) => set("lowStockThreshold", e.target.value)}
                        slotProps={{ htmlInput: { min: 0 } }} sx={FIELD_SX} />
                    </Grid>
                  </Grid>

                  {/* Track inventory toggle */}
                  <Box sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    bgcolor: "#f8fafc", border: `1px solid ${BORDER}`, borderRadius: "12px", px: 2, py: 1.5,
                    transition: "all 0.2s",
                    "&:hover": { borderColor: "rgba(139,34,82,0.2)" },
                  }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>Track inventory</Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>Auto-update stock on each sale</Typography>
                    </Box>
                    <Switch checked={form.trackInventory} onChange={(e) => set("trackInventory", e.target.checked)} sx={SWITCH_SX} />
                  </Box>
                </SC>

                {/* ── Shipping ──────────────────────────────────────── */}
                <SC>
                  <SH icon={FiTruck} color="#3b82f6">Shipping</SH>

                  <FL hint="Used to calculate shipping rates at checkout">
                    Product weight
                    <Box component="span" sx={{ fontWeight: 400, color: "#94a3b8", ml: 0.5 }}>(for shipping)</Box>
                  </FL>

                  <Stack direction="row" spacing={0.75} sx={{ mb: 1.5 }}>
                    {["g", "kg"].map((u) => (
                      <Button key={u} type="button" size="small"
                        variant={weightUnit === u ? "contained" : "outlined"}
                        onClick={() => setWeightUnit(u)}
                        sx={{
                          minWidth: 44, height: 32, px: 2, fontSize: "0.82rem", fontWeight: 700,
                          borderRadius: "8px", textTransform: "none",
                          ...(weightUnit === u
                            ? { bgcolor: P, "&:hover": { bgcolor: P_DARK } }
                            : { borderColor: BORDER, color: "#374151", "&:hover": { borderColor: P, color: P, bgcolor: P_LIGHT } }),
                        }}>
                        {u}
                      </Button>
                    ))}
                  </Stack>

                  <TextField fullWidth size="small" type="number"
                    placeholder={weightUnit === "g" ? "e.g. 500" : "e.g. 0.5"}
                    value={weightUnit === "g" ? form.weightInGrams : form.weightInGrams ? (Number(form.weightInGrams) / 1000).toFixed(3).replace(/\.?0+$/, "") : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || val === "-") { set("weightInGrams", ""); return; }
                      const g = weightUnit === "g" ? Math.round(Number(val)) : Math.round(Number(val) * 1000);
                      set("weightInGrams", String(g));
                    }}
                    slotProps={{
                      input: { endAdornment: <InputAdornment position="end"><Typography sx={{ color: "#94a3b8", fontWeight: 600, fontSize: "0.85rem" }}>{weightUnit}</Typography></InputAdornment> },
                      htmlInput: { min: weightUnit === "g" ? "1" : "0.001", step: weightUnit === "g" ? "1" : "0.001" },
                    }}
                    helperText={form.weightInGrams
                      ? weightUnit === "g" ? `≈ ${(Number(form.weightInGrams) / 1000).toFixed(3).replace(/\.?0+$/, "")} kg` : `≈ ${form.weightInGrams} g`
                      : "Enter weight to estimate shipping"}
                    sx={FIELD_SX} />
                </SC>

                {/* ── Customisable ──────────────────────────────────── */}
                <SC>
                  <SH icon={FiSettings} color="#d97706">Customisable / Made-to-Order</SH>

                  <Box
                    onClick={() => set("isCustomizable", !form.isCustomizable)}
                    sx={{
                      display: "flex", alignItems: "flex-start", gap: 1.5, cursor: "pointer",
                      bgcolor: form.isCustomizable ? "rgba(217,119,6,0.06)" : "#f8fafc",
                      border: `1.5px solid ${form.isCustomizable ? "#fcd34d" : BORDER}`,
                      borderRadius: "12px", px: 2, py: 1.5,
                      transition: "all 0.2s ease",
                      mb: form.isCustomizable ? 2.5 : 0,
                      "&:hover": { borderColor: form.isCustomizable ? "#f59e0b" : "rgba(139,34,82,0.2)" },
                    }}>
                    <Checkbox checked={form.isCustomizable}
                      onChange={(e) => { e.stopPropagation(); set("isCustomizable", e.target.checked); }}
                      onClick={(e) => e.stopPropagation()} size="small"
                      sx={{ p: 0, mt: 0.25, "&.Mui-checked": { color: "#d97706" } }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: form.isCustomizable ? "#92400e" : "#0f172a" }}>
                        Mark as customisable
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", mt: 0.25 }}>
                        Customers see dispatch notice &amp; processing timeline at checkout
                      </Typography>
                    </Box>
                  </Box>

                  {form.isCustomizable && (
                    <Grid container spacing={2}>
                      <Grid size={6}>
                        <FL>Min days</FL>
                        <TextField fullWidth size="small" type="number" placeholder="10"
                          value={form.processingDaysMin} onChange={(e) => set("processingDaysMin", e.target.value)}
                          slotProps={{ htmlInput: { min: 1, max: 90 } }}
                          helperText="Min business days" sx={FIELD_SX} />
                      </Grid>
                      <Grid size={6}>
                        <FL>Max days</FL>
                        <TextField fullWidth size="small" type="number" placeholder="12"
                          value={form.processingDaysMax} onChange={(e) => set("processingDaysMax", e.target.value)}
                          slotProps={{ htmlInput: { min: 1, max: 90 } }}
                          helperText="Max business days" sx={FIELD_SX} />
                      </Grid>
                    </Grid>
                  )}
                </SC>

                {/* ── Action buttons ────────────────────────────────── */}
                <Box sx={{
                  bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "16px", p: 2.5,
                  position: { lg: "sticky" }, bottom: { lg: 24 },
                  boxShadow: { lg: "0 -4px 24px rgba(0,0,0,0.06)" },
                }}>
                  <Button type="submit" variant="contained" fullWidth
                    disabled={loading || imageUploading}
                    startIcon={!loading && !imageUploading ? <FiSave size={16} /> : undefined}
                    sx={{
                      borderRadius: "12px", fontWeight: 700, py: 1.625, fontSize: "0.9375rem",
                      textTransform: "none", mb: 1.25,
                      background: `linear-gradient(135deg, ${P} 0%, ${P_DARK} 100%)`,
                      boxShadow: `0 4px 16px rgba(139,34,82,0.3)`,
                      "&:hover": { background: `linear-gradient(135deg, ${P_DARK} 0%, #5e1232 100%)`, boxShadow: `0 6px 20px rgba(139,34,82,0.4)` },
                      "&:disabled": { opacity: 0.65 },
                    }}>
                    {loading || imageUploading ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <DotsLoader size="sm" />
                        <span>{imageUploading ? `Uploading ${imageFiles.length} image${imageFiles.length > 1 ? "s" : ""}…` : editingId ? "Updating…" : "Adding…"}</span>
                      </Stack>
                    ) : (editingId ? "Update Product" : "Add Product")}
                  </Button>
                  <Button type="button" variant="outlined" fullWidth startIcon={<FiArrowLeft size={15} />}
                    onClick={() => navigate("/admin/products")} disabled={loading || imageUploading}
                    sx={{
                      borderRadius: "12px", fontWeight: 600, py: 1.375, fontSize: "0.875rem",
                      textTransform: "none", borderColor: BORDER, color: "#64748b",
                      "&:hover": { borderColor: P, color: P, bgcolor: P_LIGHT },
                    }}>
                    Cancel
                  </Button>

                  {/* Quick tips */}
                  <Divider sx={{ my: 2, borderColor: BORDER }} />
                  <Stack spacing={1}>
                    {[
                      "Required: name, price, and category",
                      "First image becomes the primary listing photo",
                      "Use Compare price to show a discount badge",
                      colors.length > 0 ? `${colors.length} color variant${colors.length !== 1 ? "s" : ""} added` : null,
                    ].filter(Boolean).map((tip) => (
                      <Stack key={tip} direction="row" spacing={1} alignItems="flex-start">
                        <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#94a3b8", flexShrink: 0, mt: 0.875 }} />
                        <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.5 }}>{tip}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default AddProduct;
