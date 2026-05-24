import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicCategories } from "../features/categoriesSlice";
import {
  Box, Typography, Stack, Chip, TextField, Button, Collapse,
  Checkbox, FormControlLabel, CircularProgress, Divider, InputAdornment,
} from "@mui/material";
import {
  FiChevronDown, FiChevronRight, FiArrowUp, FiArrowDown,
  FiType, FiTag,
} from "react-icons/fi";

const P    = "#8B1A4A";
const P_BG = "rgba(139,26,74,0.07)";
const BORDER = "rgba(0,0,0,0.08)";

const SORT_OPTIONS = [
  { value: "",                label: "Relevance",      icon: null },
  { value: "price-low-high",  label: "Price: Low → High", icon: <FiArrowUp size={12} /> },
  { value: "price-high-low",  label: "Price: High → Low", icon: <FiArrowDown size={12} /> },
  { value: "name-asc",        label: "Name: A → Z",    icon: <FiType size={12} /> },
  { value: "name-desc",       label: "Name: Z → A",    icon: <FiType size={12} /> },
];

function SectionHeading({ children }) {
  return (
    <Typography sx={{
      fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.08em", color: "text.disabled", mb: 1.25,
    }}>
      {children}
    </Typography>
  );
}

export default function ProductFilters({ products, onFiltersChange, activeFilters, onClearFilters }) {
  const dispatch = useDispatch();
  const [priceMin, setPriceMin]   = useState("");
  const [priceMax, setPriceMax]   = useState("");
  const [openCats, setOpenCats]   = useState(new Set());

  const { publicCategories: categories, publicCategoriesLoading } =
    useSelector((s) => s.categories);

  useEffect(() => { dispatch(fetchPublicCategories()); }, [dispatch]);

  useEffect(() => {
    const pr = activeFilters.priceRange;
    setPriceMin(pr ? String(pr.min || "") : "");
    setPriceMax(pr && pr.max !== Infinity ? String(pr.max) : "");
  }, [activeFilters.priceRange]);

  const prices   = products.map((p) => p.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const toggleCat   = (id) => setOpenCats((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const handleSort  = (val) => onFiltersChange({ ...activeFilters, sortBy: val });
  const handleCat   = (name, checked) => {
    const cats = activeFilters.categories || [];
    onFiltersChange({ ...activeFilters, categories: checked ? [...cats, name] : cats.filter((c) => c !== name) });
  };
  const applyPrice  = () => {
    const min = parseFloat(priceMin) || 0;
    const max = parseFloat(priceMax) || Infinity;
    onFiltersChange({ ...activeFilters, priceRange: { min, max } });
  };
  const clearPrice  = () => { setPriceMin(""); setPriceMax(""); onFiltersChange({ ...activeFilters, priceRange: null }); };
  const priceActive = !!activeFilters.priceRange;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* ── Sort ─────────────────────────────────────────── */}
      <Box>
        <SectionHeading>Sort By</SectionHeading>
        <Stack spacing={0.625}>
          {SORT_OPTIONS.map((opt) => {
            const active = (activeFilters.sortBy || "") === opt.value;
            return (
              <Box
                key={opt.value}
                component="button"
                onClick={() => handleSort(opt.value)}
                sx={{
                  display: "flex", alignItems: "center", gap: 1,
                  width: "100%", textAlign: "left",
                  px: 1.5, py: 1, borderRadius: "10px",
                  border: active ? `1.5px solid ${P}` : `1.5px solid transparent`,
                  bgcolor: active ? P_BG : "transparent",
                  cursor: "pointer", transition: "all 140ms",
                  "&:hover": { bgcolor: active ? P_BG : "rgba(0,0,0,0.04)", borderColor: active ? P : "rgba(0,0,0,0.1)" },
                }}
              >
                {opt.icon && (
                  <Box sx={{ color: active ? P : "text.disabled", flexShrink: 0, display: "flex" }}>
                    {opt.icon}
                  </Box>
                )}
                <Typography sx={{ fontSize: "0.875rem", fontWeight: active ? 600 : 400, color: active ? P : "text.primary", flex: 1 }}>
                  {opt.label}
                </Typography>
                {active && (
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: P, flexShrink: 0 }} />
                )}
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Divider sx={{ borderColor: BORDER }} />

      {/* ── Categories ───────────────────────────────────── */}
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
          <SectionHeading>Categories</SectionHeading>
          {(activeFilters.categories?.length || 0) > 0 && (
            <Box
              component="button"
              onClick={() => onFiltersChange({ ...activeFilters, categories: [] })}
              sx={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: P, fontWeight: 600, p: 0 }}
            >
              Clear
            </Box>
          )}
        </Stack>

        {publicCategoriesLoading ? (
          <Stack alignItems="center" py={3}>
            <CircularProgress size={22} sx={{ color: P }} />
          </Stack>
        ) : (
          <Stack spacing={0.25}>
            {(categories || []).map((cat) => {
              const hasSubs = cat.subcategories?.length > 0;
              const isOpen  = openCats.has(cat._id);
              const catChecked = activeFilters.categories?.includes(cat.name) || false;
              const activeSubs = cat.subcategories?.filter((s) => activeFilters.categories?.includes(s.name)) || [];

              return (
                <Box key={cat._id}>
                  <Stack direction="row" alignItems="center" sx={{ borderRadius: "8px", "&:hover": { bgcolor: "rgba(0,0,0,0.03)" } }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={catChecked}
                          onChange={(e) => handleCat(cat.name, e.target.checked)}
                          sx={{ color: "text.disabled", "&.Mui-checked": { color: P }, p: 0.75 }}
                        />
                      }
                      label={
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <Typography sx={{ fontSize: "0.875rem", fontWeight: catChecked ? 600 : 400, color: catChecked ? P : "text.primary" }}>
                            {cat.name}
                          </Typography>
                          {activeSubs.length > 0 && (
                            <Box sx={{ bgcolor: P_BG, color: P, fontSize: "0.65rem", fontWeight: 700, px: 0.625, py: 0.125, borderRadius: "4px" }}>
                              {activeSubs.length}
                            </Box>
                          )}
                        </Stack>
                      }
                      sx={{ m: 0, flex: 1 }}
                    />
                    {hasSubs && (
                      <Box
                        component="button"
                        onClick={() => toggleCat(cat._id)}
                        sx={{ background: "none", border: "none", cursor: "pointer", p: 0.75, color: "text.disabled", display: "flex", borderRadius: "6px", "&:hover": { color: P, bgcolor: P_BG } }}
                      >
                        {isOpen ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                      </Box>
                    )}
                  </Stack>

                  {hasSubs && (
                    <Collapse in={isOpen}>
                      <Stack spacing={0.125} sx={{ pl: 3.5, pt: 0.25, pb: 0.5 }}>
                        {cat.subcategories.filter((s) => s.isActive).map((sub) => {
                          const subChecked = activeFilters.categories?.includes(sub.name) || false;
                          return (
                            <FormControlLabel
                              key={sub._id}
                              control={
                                <Checkbox
                                  size="small"
                                  checked={subChecked}
                                  onChange={(e) => handleCat(sub.name, e.target.checked)}
                                  sx={{ color: "text.disabled", "&.Mui-checked": { color: P }, p: 0.5 }}
                                />
                              }
                              label={
                                <Typography sx={{ fontSize: "0.8125rem", fontWeight: subChecked ? 600 : 400, color: subChecked ? P : "text.secondary" }}>
                                  {sub.name}
                                </Typography>
                              }
                              sx={{ m: 0, "&:hover": { "& .MuiTypography-root": { color: P } } }}
                            />
                          );
                        })}
                      </Stack>
                    </Collapse>
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      <Divider sx={{ borderColor: BORDER }} />

      {/* ── Price Range ──────────────────────────────────── */}
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
          <SectionHeading>Price Range</SectionHeading>
          {priceActive && (
            <Box component="button" onClick={clearPrice}
              sx={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: P, fontWeight: 600, p: 0 }}>
              Clear
            </Box>
          )}
        </Stack>

        {prices.length > 0 && (
          <Typography sx={{ fontSize: "0.75rem", color: "text.disabled", mb: 1.25 }}>
            Available range: ₹{minPrice.toLocaleString()} – ₹{maxPrice.toLocaleString()}
          </Typography>
        )}

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small" type="number" placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: "0.8125rem", color: "text.disabled" }}>₹</Typography></InputAdornment> } }}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                "& fieldset": { borderColor: BORDER },
                "&:hover fieldset": { borderColor: "rgba(139,26,74,0.35)" },
                "&.Mui-focused fieldset": { borderColor: P },
              },
            }}
          />
          <Typography sx={{ color: "text.disabled", fontSize: "0.875rem", flexShrink: 0 }}>–</Typography>
          <TextField
            size="small" type="number" placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: "0.8125rem", color: "text.disabled" }}>₹</Typography></InputAdornment> } }}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                "& fieldset": { borderColor: BORDER },
                "&:hover fieldset": { borderColor: "rgba(139,26,74,0.35)" },
                "&.Mui-focused fieldset": { borderColor: P },
              },
            }}
          />
        </Stack>

        <Button
          variant="outlined" fullWidth size="small"
          onClick={applyPrice}
          disabled={!priceMin && !priceMax}
          sx={{
            mt: 1.25, borderRadius: "10px", textTransform: "none", fontWeight: 600,
            borderColor: priceActive ? P : BORDER, color: priceActive ? P : "text.secondary",
            "&:hover": { borderColor: P, bgcolor: P_BG, color: P },
            "&.Mui-disabled": { opacity: 0.45 },
          }}
        >
          Apply Price Filter
        </Button>

        {priceActive && (
          <Box sx={{ mt: 1, p: 1, bgcolor: P_BG, borderRadius: "8px", border: `1px solid rgba(139,26,74,0.18)` }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <FiTag size={11} color={P} />
              <Typography sx={{ fontSize: "0.75rem", color: P, fontWeight: 600 }}>
                ₹{activeFilters.priceRange.min.toLocaleString()} – {activeFilters.priceRange.max === Infinity ? "Max" : `₹${activeFilters.priceRange.max.toLocaleString()}`}
              </Typography>
            </Stack>
          </Box>
        )}
      </Box>

    </Box>
  );
}
