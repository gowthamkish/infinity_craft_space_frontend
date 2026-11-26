import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { FiPlay, FiCheckCircle, FiAlertTriangle, FiXCircle, FiInfo, FiSearch } from "react-icons/fi";
import AdminLayout from "./AdminLayout";
import api from "../../api/axios";
import { errMsg } from "../../app/baseApi";
import { ToastContext } from "../../context/ToastContext";

const when = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) + " IST" : "—");
const scoreColor = (n) => (n >= 80 ? "#16a34a" : n >= 60 ? "#d97706" : "#dc2626");
const scoreWord = (n) => (n >= 80 ? "Healthy" : n >= 60 ? "Needs work" : "Needs attention");
const SEV = { critical: { color: "error", label: "Critical" }, warning: { color: "warning", label: "Warning" }, info: { color: "default", label: "Tip" } };
const STATUS_ICON = {
  pass: <FiCheckCircle color="#16a34a" size={18} />,
  warn: <FiAlertTriangle color="#d97706" size={18} />,
  fail: <FiXCircle color="#dc2626" size={18} />,
  info: <FiInfo color="#64748b" size={18} />,
};
const EXAMPLES = [
  "Find products that are not properly optimised for Google search",
  "What should I fix first?",
  "Why might my products not show up on Google?",
  "Is my website fast enough?",
];

function ScoreRing({ value, size = 120, label }) {
  const c = scoreColor(value);
  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <CircularProgress variant="determinate" value={100} size={size} thickness={4} sx={{ color: "#e2e8f0", position: "absolute" }} />
      <CircularProgress variant="determinate" value={value} size={size} thickness={4} sx={{ color: c, position: "absolute" }} />
      <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <Box>
          <Typography sx={{ fontSize: size / 3.2, fontWeight: 800, lineHeight: 1, color: c }}>{value}</Typography>
          <Typography variant="caption" color="text.secondary">{label || "out of 100"}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* ── "Suggest SEO" popup for one product ── */
function SuggestDialog({ product, onClose, onApplied }) {
  const { addToast } = useContext(ToastContext);
  const [state, setState] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [f, setF] = useState({ seoTitle: "", seoDescription: "", keywords: "", description: "", useDescription: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let live = true;
    api.post(`/api/seo-agent/suggest/${product.productId}`)
      .then(({ data: d }) => {
        if (!live) return;
        setData(d);
        const thin = !d.product.currentDescription || d.product.currentDescription.trim().split(/\s+/).length < 20;
        setF({ seoTitle: d.suggestion.seoTitle, seoDescription: d.suggestion.seoDescription, keywords: d.suggestion.keywords.join(", "), description: d.suggestion.description, useDescription: thin });
        setState("ready");
      })
      .catch((e) => { if (live) { setError(errMsg(e, "Could not get suggestions")); setState("error"); } });
    return () => { live = false; };
  }, [product.productId]);

  const apply = async () => {
    setSaving(true);
    try {
      await api.post(`/api/seo-agent/apply/${product.productId}`, {
        seoTitle: f.seoTitle,
        seoDescription: f.seoDescription,
        keywords: f.keywords.split(",").map((k) => k.trim()).filter(Boolean),
        ...(f.useDescription ? { description: f.description } : {}),
      });
      addToast("Saved to the product", { type: "success" });
      onApplied(product.productId);
      onClose();
    } catch (e) {
      setError(errMsg(e, "Could not save"));
    } finally {
      setSaving(false);
    }
  };

  const counter = (n, good) => <Typography variant="caption" color={n > good ? "error" : "text.secondary"}>{n}/{good} characters</Typography>;
  return (
    <Dialog open onClose={saving ? undefined : onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle>
        ✨ Suggested SEO for “{product.name}”
        <Typography variant="body2" color="text.secondary">The AI looked at the product details and photos. Nothing is saved until you press Save.</Typography>
      </DialogTitle>
      <DialogContent dividers>
        {state === "loading" && <Box sx={{ textAlign: "center", py: 6 }}><CircularProgress /><Typography sx={{ mt: 2 }}>Writing suggestions… about 10 seconds.</Typography></Box>}
        {state === "error" && <Alert severity="error">{error}</Alert>}
        {state === "ready" && (
          <Box sx={{ display: "grid", gap: 2 }}>
            {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
            {data.warnings.length > 0 && <Alert severity="warning">The AI's answer didn't fully pass our checks: {data.warnings.join("; ")}. Please edit before saving.</Alert>}
            {data.suggestion.notes && <Alert severity="info"><b>Please double-check:</b> {data.suggestion.notes}</Alert>}

            <Box>
              <TextField fullWidth size="small" label="Search title (what Google shows as the blue link)" value={f.seoTitle} onChange={(e) => setF({ ...f, seoTitle: e.target.value })} inputProps={{ maxLength: 70 }} />
              {counter(f.seoTitle.length, 60)}
            </Box>
            <Box>
              <TextField fullWidth size="small" multiline minRows={2} label="Search summary (the grey text under it)" value={f.seoDescription} onChange={(e) => setF({ ...f, seoDescription: e.target.value })} inputProps={{ maxLength: 170 }} />
              {counter(f.seoDescription.length, 155)}
            </Box>
            <Box>
              <TextField fullWidth size="small" label="Keywords (separated by commas)" value={f.keywords} onChange={(e) => setF({ ...f, keywords: e.target.value })} helperText="Phrases shoppers might type. These are suggestions from how people search, not measured search numbers." />
            </Box>
            <Box>
              <TextField fullWidth multiline minRows={4} label="Better product description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
              <FormControlLabel control={<Checkbox checked={f.useDescription} onChange={(e) => setF({ ...f, useDescription: e.target.checked })} />} label={data.product.currentDescription ? "Replace the current product description with this one" : "Use this as the product description"} />
              {data.product.currentDescription && <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>Current: {data.product.currentDescription.slice(0, 160)}{data.product.currentDescription.length > 160 ? "…" : ""}</Typography>}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none" }}>Cancel</Button>
        {state === "ready" && <Button variant="contained" onClick={apply} disabled={saving || !f.seoTitle.trim()} sx={{ textTransform: "none" }}>{saving ? "Saving…" : "Save to product"}</Button>}
      </DialogActions>
    </Dialog>
  );
}

export default function SeoHealth() {
  const { addToast } = useContext(ToastContext);
  const [st, setSt] = useState(null); // response of /latest
  const [history, setHistory] = useState([]);
  const [loadErr, setLoadErr] = useState("");
  const [starting, setStarting] = useState(false);
  const [q, setQ] = useState("");
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [sev, setSev] = useState("all");
  const [search, setSearch] = useState("");
  const [shown, setShown] = useState(15);
  const [suggest, setSuggest] = useState(null);
  const [done, setDone] = useState({}); // productId -> true once updated
  const timer = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/api/seo-agent/latest");
      setSt(data);
      setLoadErr("");
      return data;
    } catch (e) {
      setLoadErr(errMsg(e, "Could not load the report"));
      return null;
    }
  }, []);
  const loadHistory = useCallback(() => api.get("/api/seo-agent/history").then(({ data }) => setHistory(data.history || [])).catch(() => {}), []);

  useEffect(() => { document.title = "SEO & Website Health – Admin"; load(); loadHistory(); }, [load, loadHistory]);

  // While an audit runs, check back every few seconds
  const running = Boolean(st?.running) || starting;
  useEffect(() => {
    if (!running) return undefined;
    timer.current = setInterval(async () => {
      const d = await load();
      if (d && !d.running) { setStarting(false); loadHistory(); setDone({}); }
    }, 3500);
    return () => clearInterval(timer.current);
  }, [running, load, loadHistory]);

  const runAudit = async () => {
    setStarting(true);
    try {
      await api.post("/api/seo-agent/run");
      addToast("Checking your site… this takes about a minute.", { type: "info" });
      load();
    } catch (e) {
      setStarting(false);
      addToast(errMsg(e, "Could not start the check"), { type: "error" });
    }
  };

  const ask = async (text) => {
    const question = (text ?? q).trim();
    if (question.length < 3) return;
    setQ(question);
    setAsking(true);
    setAnswer(null);
    try {
      const { data } = await api.post("/api/seo-agent/ask", { question });
      setAnswer({ question, text: data.answer });
    } catch (e) {
      setAnswer({ question, error: errMsg(e, "Could not get an answer") });
    } finally {
      setAsking(false);
    }
  };

  const report = st?.report;
  const filtered = useMemo(() => {
    const list = report?.productIssues || [];
    const needle = search.trim().toLowerCase();
    return list.filter((p) => (sev === "all" || p.issues.some((i) => i.severity === sev)) && (!needle || p.name.toLowerCase().includes(needle)));
  }, [report, sev, search]);

  const prev = history.length > 1 ? history[1] : null;
  const delta = report && prev?.scores ? report.scores.overall - prev.scores.overall : null;

  return (
    <AdminLayout>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>SEO &amp; Website Health</Typography>
          <Typography variant="body2" color="text.secondary">Checks how easy it is for Google to find and understand your shop, and what to fix. Runs automatically every week.</Typography>
        </Box>
        <Button variant="contained" startIcon={running ? <CircularProgress size={16} color="inherit" /> : <FiPlay />} onClick={runAudit} disabled={running} sx={{ textTransform: "none" }}>
          {running ? "Checking…" : "Run a check now"}
        </Button>
      </Box>

      {loadErr && <Alert severity="error" sx={{ mb: 2 }}>{loadErr}</Alert>}
      {st?.lastRun?.status === "failed" && <Alert severity="warning" sx={{ mb: 2 }}>The last check failed: {st.lastRun.error}</Alert>}
      {!st?.apiKeyConfigured && st && <Alert severity="info" sx={{ mb: 2 }}>The AI features (suggestions and questions) need ANTHROPIC_API_KEY on the server. The checks themselves work without it.</Alert>}

      {!st ? (
        <Typography color="text.secondary">Loading…</Typography>
      ) : !report ? (
        <Paper variant="outlined" sx={{ p: 5, textAlign: "center" }}>
          <FiSearch size={28} />
          <Typography variant="h6" sx={{ my: 1 }}>No check has run yet</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Run your first check to see how your products and website look to Google.</Typography>
          <Button variant="contained" onClick={runAudit} disabled={running} sx={{ textTransform: "none" }}>{running ? "Checking…" : "Run the first check"}</Button>
        </Paper>
      ) : (
        <>
          {/* Score */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap" }}>
              <ScoreRing value={report.scores.overall} />
              <Box sx={{ flex: 1, minWidth: 240 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{scoreWord(report.scores.overall)}{delta !== null && delta !== 0 && <Chip size="small" sx={{ ml: 1 }} color={delta > 0 ? "success" : "error"} label={`${delta > 0 ? "▲" : "▼"} ${Math.abs(delta)} since the last check`} />}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Checked {when(st.reportAt)} · {report.counts.products} products · {report.counts.critical} critical issues · {report.counts.warning} warnings
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {[["Products", report.scores.products], ["Links & photos", report.scores.links], ["Sitemap & Google", report.scores.indexing], ["Speed", report.scores.performance]].map(([label, v]) => v !== null && v !== undefined && (
                    <Chip key={label} variant="outlined" label={`${label}: ${v}`} sx={{ borderColor: scoreColor(v), color: scoreColor(v), fontWeight: 600 }} />
                  ))}
                </Box>
                {history.length > 1 && <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>History: {history.slice().reverse().map((h) => h.scores?.overall).join(" → ")}</Typography>}
              </Box>
            </Box>
          </Paper>

          {/* Ask */}
          <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Ask the SEO agent</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField fullWidth size="small" placeholder="e.g. Find products that are not properly optimised for Google search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()} inputProps={{ maxLength: 500 }} disabled={!st.apiKeyConfigured} />
              <Button variant="contained" onClick={() => ask()} disabled={asking || q.trim().length < 3 || !st.apiKeyConfigured} sx={{ textTransform: "none", whiteSpace: "nowrap" }}>{asking ? "Thinking…" : "Ask"}</Button>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.5 }}>
              {EXAMPLES.map((e) => <Chip key={e} size="small" variant="outlined" label={e} onClick={() => ask(e)} disabled={asking || !st.apiKeyConfigured} />)}
            </Box>
            {asking && <Box sx={{ mt: 2, display: "flex", gap: 1, alignItems: "center" }}><CircularProgress size={18} /><Typography variant="body2">Looking through your latest check…</Typography></Box>}
            {answer && (
              <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: answer.error ? "#fef2f2" : "#f8fafc", border: "1px solid #e2e8f0" }}>
                <Typography variant="caption" color="text.secondary">You asked: {answer.question}</Typography>
                <Typography sx={{ whiteSpace: "pre-wrap", mt: 0.5, fontSize: 14.5, lineHeight: 1.6 }} color={answer.error ? "error" : "text.primary"}>{answer.error || answer.text}</Typography>
                {!answer.error && <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>Based on the check from {when(st.reportAt)}. Search rankings and traffic aren't measured here.</Typography>}
              </Box>
            )}
          </Paper>

          {/* Fix first */}
          {report.actions.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Fix these first</Typography>
              {report.actions.map((a, i) => (
                <Box key={i} sx={{ display: "flex", gap: 1.5, py: 1.25, borderTop: i ? "1px solid #f1f5f9" : "none" }}>
                  <Typography sx={{ fontWeight: 800, color: "#94a3b8", width: 22 }}>{i + 1}</Typography>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                      <Typography sx={{ fontWeight: 600 }}>{a.title}</Typography>
                      <Chip size="small" color={SEV[a.severity].color} label={SEV[a.severity].label} />
                      <Chip size="small" variant="outlined" label={a.area} />
                    </Box>
                    {a.fix && <Typography variant="body2" color="text.secondary">{a.fix}</Typography>}
                  </Box>
                </Box>
              ))}
            </Paper>
          )}

          {/* Site checks */}
          <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Sitemap, indexing &amp; speed</Typography>
            {[...report.indexingChecks, ...report.performance.checks].map((c) => (
              <Box key={c.id} sx={{ display: "flex", gap: 1.5, py: 1.1, borderTop: "1px solid #f1f5f9" }}>
                <Box sx={{ pt: 0.25 }}>{STATUS_ICON[c.status]}</Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14.5 }}>{c.title}</Typography>
                  {c.detail && <Typography variant="body2" color="text.secondary">{c.detail}</Typography>}
                  {c.fix && c.status !== "pass" && <Typography variant="body2" sx={{ mt: 0.25 }}><b>How to fix:</b> {c.fix}</Typography>}
                </Box>
              </Box>
            ))}
            {report.performance.lighthouse?.some((l) => !l.error) && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>Speed tests use Google PageSpeed on a mobile phone.</Typography>
            )}
          </Paper>

          {/* Links */}
          <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Broken links &amp; photos</Typography>
            {report.linkIssues.length === 0 ? (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>{STATUS_ICON.pass}<Typography variant="body2">No broken product photos or links found ({report.imagesChecked} photos checked{report.imagesUnverified ? `, ${report.imagesUnverified} could not be reached this time` : ""}).</Typography></Box>
            ) : report.linkIssues.slice(0, 30).map((l, i) => (
              <Box key={i} sx={{ display: "flex", gap: 1.5, py: 1, borderTop: i ? "1px solid #f1f5f9" : "none" }}>
                <Box sx={{ pt: 0.25 }}>{l.severity === "critical" ? STATUS_ICON.fail : STATUS_ICON.warn}</Box>
                <Box><Typography sx={{ fontWeight: 600, fontSize: 14 }}>{l.where}</Typography><Typography variant="body2" color="text.secondary">{l.message} {l.fix}</Typography></Box>
              </Box>
            ))}
          </Paper>

          {/* Products */}
          <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5, mb: 1.5 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Products that need attention ({filtered.length})</Typography>
                <Typography variant="caption" color="text.secondary">{report.productsClean} of {report.counts.products} products have no issues. Worst first.</Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField size="small" placeholder="Search products" value={search} onChange={(e) => { setSearch(e.target.value); setShown(15); }} />
                <TextField select size="small" value={sev} onChange={(e) => { setSev(e.target.value); setShown(15); }} sx={{ minWidth: 130 }}>
                  <MenuItem value="all">All issues</MenuItem>
                  <MenuItem value="critical">Critical only</MenuItem>
                  <MenuItem value="warning">Warnings</MenuItem>
                </TextField>
              </Box>
            </Box>
            {filtered.slice(0, shown).map((p) => (
              <Box key={p.productId} sx={{ display: "flex", gap: 1.5, alignItems: "center", py: 1.25, borderTop: "1px solid #f1f5f9", flexWrap: "wrap" }}>
                <Chip size="small" label={p.score} sx={{ fontWeight: 700, bgcolor: `${scoreColor(p.score)}1a`, color: scoreColor(p.score), minWidth: 42 }} />
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Typography component={Link} to={`/admin/addProduct/${p.productId}`} sx={{ fontWeight: 600, fontSize: 14.5, color: "inherit", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>{p.name}</Typography>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
                    {p.issues.map((i) => (
                      <Tooltip key={i.code} title={`${i.message} ${i.fix || ""}`}>
                        <Chip size="small" variant="outlined" color={SEV[i.severity].color} label={i.code.replace(/_/g, " ")} />
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
                {done[p.productId]
                  ? <Chip size="small" color="success" label="Updated — re-run the check to refresh" />
                  : <Button size="small" variant="outlined" onClick={() => setSuggest(p)} disabled={!st.apiKeyConfigured} sx={{ textTransform: "none" }}>✨ Suggest SEO</Button>}
              </Box>
            ))}
            {filtered.length > shown && <Button onClick={() => setShown((n) => n + 20)} sx={{ textTransform: "none", mt: 1 }}>Show more ({filtered.length - shown} left)</Button>}
            {filtered.length === 0 && <Typography color="text.secondary" sx={{ py: 2 }}>Nothing matches.</Typography>}
          </Paper>

          {!st.pageSpeedConfigured && <Typography variant="caption" color="text.secondary">Tip: add a free PAGESPEED_API_KEY on the server to test real phone loading speed.</Typography>}
        </>
      )}

      {suggest && <SuggestDialog product={suggest} onClose={() => setSuggest(null)} onApplied={(id) => setDone((d) => ({ ...d, [id]: true }))} />}
    </AdminLayout>
  );
}
