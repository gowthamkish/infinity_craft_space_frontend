import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import {
  FiArrowLeft, FiUploadCloud, FiDownload, FiCheckCircle,
  FiXCircle, FiAlertCircle, FiPackage, FiTrash2,
} from "react-icons/fi";
import AdminLayout from "../admin/AdminLayout";
import api from "../../api/axios";

/* ── tokens ─────────────────────────────────────────────────────── */
const P      = "#8b2252";
const P_DARK = "#6b1238";
const BORDER = "rgba(0,0,0,0.08)";

const REQUIRED_COLS = ["name", "category", "price"];
const ALL_COLS = [
  "name","category","subCategory","sku","price","compareAtPrice",
  "stock","lowStockThreshold","description","tags",
  "weightInGrams","estimatedDelivery","isCustomizable",
  "processingDaysMin","processingDaysMax",
  "seoTitle","seoDescription","seoKeywords",
];

/* ── CSV parser (handles quoted fields + commas inside quotes) ────── */
function parseCsv(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (!lines.length) return { headers: [], rows: [] };

  const parseRow = (line) => {
    const cells = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === "," && !inQ) {
        cells.push(cur); cur = "";
      } else {
        cur += ch;
      }
    }
    cells.push(cur);
    return cells;
  };

  const headers = parseRow(lines[0]).map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cells = parseRow(line);
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = String(cells[idx] ?? "").trim(); });
    rows.push(obj);
  }
  return { headers, rows };
}

/* ── Excel parser (uses SheetJS, reads first sheet) ─────────────── */
function parseExcel(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: "array" });
  // Skip an "Instructions" sheet if present, use the first data sheet
  const sheetName = wb.SheetNames.find(n => n.toLowerCase() !== "instructions") || wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  // header:1 → first row is headers; defval:"" fills empty cells
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  if (raw.length < 2) return { headers: [], rows: [] };

  const headers = raw[0].map(h => String(h).trim());
  const rows = [];
  for (let i = 1; i < raw.length; i++) {
    const cells = raw[i];
    // skip completely empty rows
    if (cells.every(c => c === "" || c == null)) continue;
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = String(cells[idx] ?? "").trim(); });
    rows.push(obj);
  }
  return { headers, rows };
}

/* ── validation ──────────────────────────────────────────────────── */
function validateRow(row, idx) {
  const errors = [];
  if (!row.name?.trim())          errors.push("Name required");
  if (!row.category?.trim())      errors.push("Category required");
  const p = parseFloat(row.price);
  if (isNaN(p) || p <= 0)        errors.push("Valid price required");
  return errors;
}

/* ─────────────────────────────────────────────────────────────────── */
export default function BulkImport() {
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const [step,        setStep]        = useState("upload"); // upload | preview | result
  const [csvRows,     setCsvRows]     = useState([]);
  const [headers,     setHeaders]     = useState([]);
  const [rowErrors,   setRowErrors]   = useState({});   // { rowIdx: [msg] }
  const [dragOver,    setDragOver]    = useState(false);
  const [importing,   setImporting]   = useState(false);
  const [result,      setResult]      = useState(null);
  const [fileError,   setFileError]   = useState("");

  /* ── parse file (CSV or Excel) ───────────────────────────────── */
  const handleFile = useCallback((file) => {
    if (!file) return;
    const isExcel = /\.(xlsx|xls)$/i.test(file.name);
    const isCsv   = /\.csv$/i.test(file.name);
    if (!isExcel && !isCsv) {
      setFileError("Please upload a .csv, .xlsx, or .xls file"); return;
    }
    setFileError("");

    const processRows = ({ headers: h, rows }) => {
      const missing = REQUIRED_COLS.filter(c => !h.includes(c));
      if (missing.length) {
        setFileError(`File is missing required columns: ${missing.join(", ")}`); return;
      }
      const errs = {};
      rows.forEach((row, i) => {
        const e = validateRow(row, i);
        if (e.length) errs[i] = e;
      });
      setHeaders(h);
      setCsvRows(rows);
      setRowErrors(errs);
      setStep("preview");
    };

    const reader = new FileReader();
    if (isExcel) {
      reader.onload = (e) => {
        try {
          processRows(parseExcel(e.target.result));
        } catch (err) {
          setFileError("Could not read Excel file: " + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (e) => processRows(parseCsv(e.target.result));
      reader.readAsText(file);
    }
  }, []);

  const onFileChange = (e) => { handleFile(e.target.files[0]); e.target.value = ""; };
  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };

  /* ── import ──────────────────────────────────────────────────── */
  const runImport = async () => {
    const validRows = csvRows.filter((_, i) => !rowErrors[i]);
    if (!validRows.length) return;
    setImporting(true);
    try {
      const res = await api.post("/api/admin/products/bulk-import", { rows: validRows });
      setResult(res.data);
      setStep("result");
    } catch (err) {
      setFileError(err.response?.data?.error || "Import failed. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  /* ── download templates ──────────────────────────────────────── */
  const downloadCsvTemplate = async () => {
    try {
      const res = await api.get("/api/admin/products/csv-template", { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a = document.createElement("a"); a.href = url; a.download = "products_template.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch {
      const header = ALL_COLS.join(",");
      const sample = ["Handmade Kundan Bangle","Jewellery","Bangles","KUN-001","499","699","50","5","Beautiful handcrafted kundan bangle.","kundan;bangle","50","5","false","","","Handmade Kundan Bangle | Infinity Craft Space","Shop beautiful handcrafted kundan bangles.","kundan bangle"].map(v=>`"${v}"`).join(",");
      const url = URL.createObjectURL(new Blob([`${header}\n${sample}`], { type: "text/csv" }));
      const a = document.createElement("a"); a.href = url; a.download = "products_template.csv"; a.click();
      URL.revokeObjectURL(url);
    }
  };

  const downloadExcelTemplate = () => {
    const a = document.createElement("a");
    a.href = "/products_import_sample.xlsx";
    a.download = "products_template.xlsx";
    a.click();
  };

  const reset = () => { setCsvRows([]); setHeaders([]); setRowErrors({}); setResult(null); setFileError(""); setStep("upload"); };

  const errorCount = Object.keys(rowErrors).length;
  const validCount  = csvRows.length - errorCount;

  /* ── shared card ──────────────────────────────────────────────── */
  const SC = ({ children, sx }) => (
    <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: "16px", bgcolor: "#fff", ...sx }}>
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>{children}</CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, md: 3 }, py: 3 }}>

        {/* ── header ─────────────────────────────────────────────── */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
          <Button startIcon={<FiArrowLeft />} onClick={() => navigate("/admin/products")}
            sx={{ color: "#6b7280", textTransform: "none", fontWeight: 600, "&:hover": { color: P } }}>
            Back
          </Button>
          <Box sx={{ width: 34, height: 34, borderRadius: "9px", bgcolor: `${P}12`,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiUploadCloud size={15} style={{ color: P }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1.125rem", color: "#0f172a", lineHeight: 1 }}>
              Bulk Product Import
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#6b7280", mt: 0.25 }}>
              Import hundreds of products at once via CSV
            </Typography>
          </Box>
        </Stack>

        {/* ── STEP 1: upload ──────────────────────────────────────── */}
        {step === "upload" && (
          <Stack spacing={3}>
            {/* instructions */}
            <SC>
              <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
                <Box sx={{ width: 34, height: 34, borderRadius: "9px", bgcolor: "#eff6ff",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FiAlertCircle size={15} style={{ color: "#3b82f6" }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", mb: 0.5 }}>
                    How to import products
                  </Typography>
                  <Stack component="ol" spacing={0.5} sx={{ pl: 2.5, m: 0 }}>
                    {[
                      "Download the Excel or CSV template below",
                      "Fill in your products (images can be added later via Edit Product)",
                      "Use semicolons (;) to separate multiple tags and SEO keywords",
                      "Required columns: name, category, price",
                      "Upload the completed .xlsx, .xls, or .csv file",
                    ].map((t, i) => (
                      <Typography key={i} component="li" sx={{ fontSize: "0.825rem", color: "#374151" }}>{t}</Typography>
                    ))}
                  </Stack>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                <Button variant="outlined" startIcon={<FiDownload />} onClick={downloadExcelTemplate}
                  sx={{ borderColor: P, color: P, textTransform: "none", fontWeight: 600,
                    borderRadius: "10px", "&:hover": { bgcolor: `${P}08`, borderColor: P_DARK } }}>
                  Download Excel Template
                </Button>
                <Button variant="outlined" startIcon={<FiDownload />} onClick={downloadCsvTemplate}
                  sx={{ borderColor: BORDER, color: "#374151", textTransform: "none", fontWeight: 600,
                    borderRadius: "10px", "&:hover": { bgcolor: "#f8fafc", borderColor: "#94a3b8" } }}>
                  Download CSV Template
                </Button>
              </Stack>
            </SC>

            {/* drop zone */}
            <SC>
              <Box
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                sx={{
                  border: `2px dashed ${dragOver ? P : BORDER}`,
                  borderRadius: "12px",
                  p: 5, textAlign: "center", cursor: "pointer",
                  bgcolor: dragOver ? `${P}05` : "#fafafa",
                  transition: "all 0.2s",
                  "&:hover": { borderColor: P, bgcolor: `${P}05` },
                }}>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={onFileChange} style={{ display: "none" }} />
                <FiUploadCloud size={36} style={{ color: dragOver ? P : "#94a3b8", marginBottom: 12 }} />
                <Typography sx={{ fontWeight: 600, color: "#0f172a", mb: 0.5 }}>
                  Drop your CSV file here, or click to browse
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  .xlsx · .xls · .csv · Maximum 500 products per import
                </Typography>
              </Box>
              {fileError && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: "10px" }}>{fileError}</Alert>
              )}
            </SC>
          </Stack>
        )}

        {/* ── STEP 2: preview ─────────────────────────────────────── */}
        {step === "preview" && (
          <Stack spacing={3}>
            {/* summary bar */}
            <SC>
              <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }}
                justifyContent="space-between" spacing={2}>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Chip label={`${csvRows.length} rows loaded`} size="small"
                    sx={{ bgcolor: "#f1f5f9", fontWeight: 600, fontSize: "0.8rem" }} />
                  <Chip icon={<FiCheckCircle size={13} />} label={`${validCount} valid`} size="small"
                    sx={{ bgcolor: "#f0fdf4", color: "#15803d", fontWeight: 600, fontSize: "0.8rem" }} />
                  {errorCount > 0 && (
                    <Chip icon={<FiXCircle size={13} />} label={`${errorCount} with errors (will be skipped)`} size="small"
                      sx={{ bgcolor: "#fef2f2", color: "#dc2626", fontWeight: 600, fontSize: "0.8rem" }} />
                  )}
                </Stack>
                <Stack direction="row" spacing={1.5}>
                  <Button onClick={reset} startIcon={<FiTrash2 />}
                    sx={{ color: "#6b7280", textTransform: "none", fontWeight: 600 }}>
                    Clear
                  </Button>
                  <Button variant="contained" onClick={runImport} disabled={!validCount || importing}
                    sx={{ bgcolor: P, textTransform: "none", fontWeight: 700, borderRadius: "10px",
                      "&:hover": { bgcolor: P_DARK }, "&:disabled": { bgcolor: "#e5e7eb" } }}>
                    {importing ? "Importing…" : `Import ${validCount} Products`}
                  </Button>
                </Stack>
              </Stack>
              {importing && <LinearProgress sx={{ mt: 2, borderRadius: 4,
                "& .MuiLinearProgress-bar": { bgcolor: P } }} />}
              {fileError && <Alert severity="error" sx={{ mt: 2, borderRadius: "10px" }}>{fileError}</Alert>}
            </SC>

            {/* table */}
            <SC sx={{ overflow: "hidden" }}>
              <TableContainer sx={{ maxHeight: 480, overflow: "auto" }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", bgcolor: "#f8fafc", width: 50 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", bgcolor: "#f8fafc" }}>Status</TableCell>
                      {["name","category","subCategory","price","stock","isCustomizable","tags"].map(col => (
                        <TableCell key={col} sx={{ fontWeight: 700, fontSize: "0.75rem", bgcolor: "#f8fafc",
                          textTransform: "capitalize", whiteSpace: "nowrap" }}>
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {csvRows.map((row, i) => {
                      const errs = rowErrors[i];
                      return (
                        <TableRow key={i} sx={{
                          bgcolor: errs ? "#fef2f2" : "transparent",
                          "&:hover": { bgcolor: errs ? "#fee2e2" : "#f8fafc" },
                        }}>
                          <TableCell sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>{i + 1}</TableCell>
                          <TableCell>
                            {errs ? (
                              <Tooltip title={errs.join(", ")} arrow>
                                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ cursor: "help" }}>
                                  <FiXCircle size={14} style={{ color: "#dc2626" }} />
                                  <Typography sx={{ fontSize: "0.72rem", color: "#dc2626", fontWeight: 600 }}>Error</Typography>
                                </Stack>
                              </Tooltip>
                            ) : (
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <FiCheckCircle size={14} style={{ color: "#16a34a" }} />
                                <Typography sx={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: 600 }}>OK</Typography>
                              </Stack>
                            )}
                          </TableCell>
                          {["name","category","subCategory","price","stock","isCustomizable","tags"].map(col => (
                            <TableCell key={col} sx={{ fontSize: "0.78rem", color: "#374151", maxWidth: 160,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {row[col] || <span style={{ color: "#94a3b8" }}>—</span>}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </SC>
          </Stack>
        )}

        {/* ── STEP 3: result ──────────────────────────────────────── */}
        {step === "result" && result && (
          <Stack spacing={3}>
            <SC>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: "12px", bgcolor: "#f0fdf4",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FiCheckCircle size={24} style={{ color: "#16a34a" }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}>
                    Import Complete
                  </Typography>
                  <Typography sx={{ fontSize: "0.825rem", color: "#6b7280" }}>
                    {result.summary.created} of {result.summary.total} products created successfully
                  </Typography>
                </Box>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
                {[
                  { label: "Total rows", value: result.summary.total, color: "#6b7280", bg: "#f1f5f9" },
                  { label: "Created",    value: result.summary.created, color: "#15803d", bg: "#f0fdf4" },
                  { label: "Failed",     value: result.summary.failed, color: result.summary.failed > 0 ? "#dc2626" : "#15803d", bg: result.summary.failed > 0 ? "#fef2f2" : "#f0fdf4" },
                ].map(({ label, value, color, bg }) => (
                  <Box key={label} sx={{ flex: 1, p: 2, borderRadius: "12px", bgcolor: bg, textAlign: "center" }}>
                    <Typography sx={{ fontSize: "1.75rem", fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: "#6b7280", mt: 0.5 }}>{label}</Typography>
                  </Box>
                ))}
              </Stack>

              <Stack direction="row" spacing={1.5}>
                <Button variant="contained" startIcon={<FiPackage />}
                  onClick={() => navigate("/admin/products")}
                  sx={{ bgcolor: P, textTransform: "none", fontWeight: 700, borderRadius: "10px",
                    "&:hover": { bgcolor: P_DARK } }}>
                  View Products
                </Button>
                <Button variant="outlined" onClick={reset}
                  sx={{ borderColor: BORDER, color: "#374151", textTransform: "none", fontWeight: 600,
                    borderRadius: "10px" }}>
                  Import More
                </Button>
              </Stack>
            </SC>

            {/* failed rows */}
            {result.failed.length > 0 && (
              <SC>
                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#dc2626", mb: 2 }}>
                  Failed rows ({result.failed.length})
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {["Row #","Product name","Reason"].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.75rem", bgcolor: "#fef2f2" }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.failed.map((f, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ fontSize: "0.78rem" }}>{f.row}</TableCell>
                          <TableCell sx={{ fontSize: "0.78rem", fontWeight: 600 }}>{f.name}</TableCell>
                          <TableCell sx={{ fontSize: "0.78rem", color: "#dc2626" }}>{f.error}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </SC>
            )}
          </Stack>
        )}
      </Box>
    </AdminLayout>
  );
}
