import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import { FiCopy, FiSend, FiTrash2, FiUsers, FiDownload } from "react-icons/fi";
import AdminLayout from "./AdminLayout";
import api from "../../api/axios";
import { errMsg } from "../../app/baseApi";
import { ToastContext } from "../../context/ToastContext";

const EXAMPLES = [
  "Prepare a Diwali promotion for handcrafted gift collections",
  "Wedding-season campaign for kundan and thread jewellery",
  "Christmas and New Year gifting ideas under a budget",
  "Promote our personalised embroidery hoops",
];
const when = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "—");
const STEP_LABEL = { get_store_facts: "Checked shop facts", get_occasions: "Checked the calendar", list_categories: "Looked at categories", search_products: "Searched products", list_coupons: "Checked real coupons", list_recent_campaigns: "Checked past campaigns", get_audience: "Sized the audience", submit_campaign: "Submitted the campaign" };

function useCopy() {
  const { addToast } = useContext(ToastContext);
  return useCallback(async (text, what = "Copied") => {
    try { await navigator.clipboard.writeText(text); addToast(`${what} to the clipboard`, { type: "success" }); }
    catch { addToast("Couldn't copy — select the text and copy it manually", { type: "error" }); }
  }, [addToast]);
}

const counter = (n, max) => <Typography variant="caption" color={n > max ? "error" : "text.secondary"}>{n}/{max}</Typography>;

/* ── Who is in this audience (admin only) ── */
function MembersDialog({ title, url, onClose }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { api.get(url).then(({ data }) => setRows(data.members)).catch((e) => setErr(errMsg(e, "Could not load the list"))); }, [url]);
  const csv = () => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const body = [["Name", "Email", "Phone", "Why", "Opted in to marketing"], ...rows.map((r) => [r.name, r.email, r.phone, r.reason, r.optedIn === undefined ? "yes (subscriber)" : r.optedIn ? "yes" : "no"])].map((r) => r.map(esc).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const notOpted = rows ? rows.filter((r) => r.optedIn === false).length : 0;
  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        {err && <Alert severity="error">{err}</Alert>}
        {!rows && !err && <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress /></Box>}
        {rows && (
          <>
            {notOpted > 0 && <Alert severity="warning" sx={{ mb: 2 }}>{notOpted} of {rows.length} haven't opted in to marketing emails. Only send promotions to people who have agreed — contact the others only about their own orders.</Alert>}
            {rows.length === 0 ? <Typography color="text.secondary">Nobody in this group yet.</Typography> : rows.map((r, i) => (
              <Box key={i} sx={{ display: "flex", gap: 1.5, py: 1, borderTop: i ? "1px solid #f1f5f9" : "none", alignItems: "center", flexWrap: "wrap" }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{r.name || r.email}</Typography>
                  <Typography variant="caption" color="text.secondary">{r.name ? `${r.email} · ` : ""}{r.reason}</Typography>
                </Box>
                {r.optedIn === false ? <Chip size="small" color="warning" variant="outlined" label="Not opted in" /> : <Chip size="small" color="success" variant="outlined" label="Opted in" />}
              </Box>
            ))}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {rows?.length > 0 && <Button startIcon={<FiDownload />} onClick={csv} sx={{ textTransform: "none" }}>Download CSV</Button>}
        <Button onClick={onClose} variant="contained" sx={{ textTransform: "none" }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function SegmentList({ segments, recommended = [], baseUrl, loading }) {
  const [open, setOpen] = useState(null);
  const rec = new Map(recommended.map((r) => [r.segmentId, r.why]));
  if (loading) return <CircularProgress size={22} />;
  return (
    <>
      {segments.map((s) => (
        <Box key={s.id} sx={{ display: "flex", gap: 1.5, py: 1.5, borderTop: "1px solid #f1f5f9", alignItems: "center", flexWrap: "wrap" }}>
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <Typography sx={{ fontWeight: 600 }}>{s.label}</Typography>
              {rec.has(s.id) && <Chip size="small" color="primary" label="Recommended" />}
            </Box>
            <Typography variant="body2" color="text.secondary">{rec.get(s.id) || s.why}</Typography>
          </Box>
          <Chip label={`${s.count} ${s.count === 1 ? "person" : "people"}`} />
          <Chip variant="outlined" color={s.reachable ? "success" : "default"} label={`${s.reachable} opted in`} />
          <Button size="small" startIcon={<FiUsers />} disabled={s.count === 0} onClick={() => setOpen(s)} sx={{ textTransform: "none" }}>View list</Button>
        </Box>
      ))}
      {open && <MembersDialog title={open.label} url={`${baseUrl}/${open.id}`} onClose={() => setOpen(null)} />}
    </>
  );
}

/* ── One finished campaign ── */
function CampaignView({ initial, onDeleted, onChanged }) {
  const { addToast } = useContext(ToastContext);
  const copy = useCopy();
  const [c, setC] = useState(initial.campaign);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");
  const [testing, setTesting] = useState(false);
  const [segs, setSegs] = useState(null);

  useEffect(() => { setC(initial.campaign); setDirty(false); }, [initial]);
  useEffect(() => { api.get(`/api/marketing/campaigns/${initial._id}/audience`).then(({ data }) => setSegs(data.segments)).catch(() => setSegs([])); }, [initial._id]);
  const loadPreview = useCallback(() => api.get(`/api/marketing/campaigns/${initial._id}/email-preview`).then(({ data }) => setPreview(data.html)).catch(() => {}), [initial._id]);
  useEffect(() => { loadPreview(); }, [loadPreview]);

  const edit = (fn) => { setC((prev) => { const next = JSON.parse(JSON.stringify(prev)); fn(next); return next; }); setDirty(true); };

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/api/marketing/campaigns/${initial._id}`, { title: c.title, summary: c.summary, timing: c.timing, instagram: c.instagram, whatsapp: c.whatsapp, email: c.email });
      setDirty(false);
      addToast("Changes saved", { type: "success" });
      loadPreview();
      onChanged?.();
    } catch (e) { addToast(errMsg(e, "Could not save"), { type: "error" }); }
    finally { setSaving(false); }
  };

  const sendTest = async () => {
    if (dirty) await save();
    setTesting(true);
    try { const { data } = await api.post(`/api/marketing/campaigns/${initial._id}/test-email`); addToast(`Test email sent to ${data.to}`, { type: "success" }); }
    catch (e) { addToast(errMsg(e, "Could not send the test email"), { type: "error" }); }
    finally { setTesting(false); }
  };

  const remove = async () => {
    if (!window.confirm("Delete this campaign?")) return;
    try { await api.delete(`/api/marketing/campaigns/${initial._id}`); onDeleted(); } catch (e) { addToast(errMsg(e, "Could not delete"), { type: "error" }); }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 260 }}>
          <TextField variant="standard" fullWidth value={c.title} onChange={(e) => edit((n) => { n.title = e.target.value; })} inputProps={{ style: { fontSize: 22, fontWeight: 700 } }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}><b>Goal:</b> {c.goal}</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {dirty && <Button variant="contained" onClick={save} disabled={saving} sx={{ textTransform: "none" }}>{saving ? "Saving…" : "Save changes"}</Button>}
          <IconButton onClick={remove} aria-label="Delete campaign" color="error"><FiTrash2 size={18} /></IconButton>
        </Box>
      </Box>

      {c.dateNote && <Alert severity="warning" sx={{ mt: 2 }}><b>Check the date:</b> {c.dateNote}</Alert>}
      <TextField fullWidth multiline margin="normal" label="The idea" value={c.summary} onChange={(e) => edit((n) => { n.summary = e.target.value; })} />
      <TextField fullWidth multiline margin="none" label="Suggested timing" value={c.timing} onChange={(e) => edit((n) => { n.timing = e.target.value; })} />
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
        {c.offer.couponCode && <Chip color="success" label={`Offer: coupon ${c.offer.couponCode}`} />}
        {c.offer.freeShipping && <Chip color="success" label="Offer: free shipping" />}
        {!c.offer.couponCode && !c.offer.freeShipping && <Chip variant="outlined" label="No discount in this campaign" />}
        {c.products.map((p) => <Chip key={p.id} size="small" variant="outlined" label={p.name} />)}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 3, borderBottom: "1px solid #e2e8f0" }} variant="scrollable">
        <Tab label={`Instagram (${c.instagram.length})`} sx={{ textTransform: "none" }} /><Tab label="WhatsApp" sx={{ textTransform: "none" }} /><Tab label="Email" sx={{ textTransform: "none" }} /><Tab label="Who to send to" sx={{ textTransform: "none" }} />
      </Tabs>

      <Box sx={{ pt: 2.5 }}>
        {tab === 0 && c.instagram.map((p, i) => (
          <Box key={i} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, p: 2, mb: 2 }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}><Chip size="small" color="primary" label={p.format} /><Typography variant="caption" color="text.secondary">Post {i + 1}</Typography></Box>
            <TextField fullWidth size="small" label="First line (the hook)" value={p.hook} onChange={(e) => edit((n) => { n.instagram[i].hook = e.target.value; })} sx={{ mb: 1.5 }} />
            <TextField fullWidth multiline minRows={4} label="Caption" value={p.caption} onChange={(e) => edit((n) => { n.instagram[i].caption = e.target.value; })} helperText={counter(p.caption.length, 2200)} />
            <TextField fullWidth size="small" label="Hashtags" value={p.hashtags.map((h) => `#${h}`).join(" ")} onChange={(e) => edit((n) => { n.instagram[i].hashtags = e.target.value.split(/\s+/).map((h) => h.replace(/^#+/, "")).filter(Boolean); })} sx={{ mt: 1.5 }} />
            <TextField fullWidth multiline size="small" label="Photo / video idea" value={p.visualIdea} onChange={(e) => edit((n) => { n.instagram[i].visualIdea = e.target.value; })} sx={{ mt: 1.5 }} />
            <Button size="small" startIcon={<FiCopy />} onClick={() => copy(`${p.caption}\n\n${p.hashtags.map((h) => `#${h}`).join(" ")}`, "Caption and hashtags copied")} sx={{ textTransform: "none", mt: 1 }}>Copy caption + hashtags</Button>
          </Box>
        ))}

        {tab === 1 && (
          <Box sx={{ display: "grid", gap: 2 }}>
            <Alert severity="info">Send WhatsApp promotions only to customers who agreed to receive them. Paste these into WhatsApp Business (broadcast list or status) — nothing is sent from here.</Alert>
            {[["broadcast", "Broadcast message", 4, 700], ["status", "Status update", 2, 220], ["followUp", "Follow-up (for people who didn't reply)", 3, 320]].map(([k, label, rows, max]) => (
              <Box key={k}>
                <TextField fullWidth multiline minRows={rows} label={label} value={c.whatsapp[k]} onChange={(e) => edit((n) => { n.whatsapp[k] = e.target.value; })} helperText={counter(c.whatsapp[k].length, max)} />
                <Button size="small" startIcon={<FiCopy />} onClick={() => copy(c.whatsapp[k], `${label} copied`)} sx={{ textTransform: "none" }}>Copy</Button>
              </Box>
            ))}
          </Box>
        )}

        {tab === 2 && (
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, alignItems: "start" }}>
            <Box sx={{ display: "grid", gap: 1.5 }}>
              <TextField size="small" label="Subject" value={c.email.subject} onChange={(e) => edit((n) => { n.email.subject = e.target.value; })} helperText={counter(c.email.subject.length, 70)} />
              <TextField size="small" label="Preview text (shown next to the subject)" value={c.email.preheader} onChange={(e) => edit((n) => { n.email.preheader = e.target.value; })} />
              {c.email.paragraphs.map((p, i) => <TextField key={i} multiline label={`Paragraph ${i + 1}`} value={p} onChange={(e) => edit((n) => { n.email.paragraphs[i] = e.target.value; })} />)}
              <TextField size="small" label="Button text" value={c.email.ctaLabel} onChange={(e) => edit((n) => { n.email.ctaLabel = e.target.value; })} />
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button variant="contained" startIcon={<FiSend />} onClick={sendTest} disabled={testing} sx={{ textTransform: "none" }}>{testing ? "Sending…" : "Send me a test email"}</Button>
                <Button startIcon={<FiCopy />} onClick={() => copy(`Subject: ${c.email.subject}\n\n${c.email.paragraphs.join("\n\n")}\n\n${c.email.ctaLabel}`, "Email text copied")} sx={{ textTransform: "none" }}>Copy text</Button>
              </Box>
              <Typography variant="caption" color="text.secondary">The test goes only to the shop's own inbox. Campaigns are not sent to customers from here.</Typography>
            </Box>
            <Box sx={{ border: "1px solid #e2e8f0", borderRadius: 2, overflow: "hidden" }}>
              <Typography variant="caption" sx={{ display: "block", p: 1, bgcolor: "#f8fafc" }}>Preview{dirty ? " (save to refresh)" : ""}</Typography>
              {preview ? <iframe title="Email preview" sandbox="" srcDoc={preview} style={{ width: "100%", height: 620, border: 0, display: "block" }} /> : <Box sx={{ p: 3, textAlign: "center" }}><CircularProgress size={22} /></Box>}
            </Box>
          </Box>
        )}

        {tab === 3 && (
          <>
            <Alert severity="info" sx={{ mb: 1 }}>These are groups of customers who may like this campaign. Email promotions should go only to people who have opted in.</Alert>
            <SegmentList segments={segs || []} recommended={c.audience} baseUrl={`/api/marketing/campaigns/${initial._id}/audience`} loading={!segs} />
          </>
        )}
      </Box>
    </Paper>
  );
}

/* ── Abandoned carts ── */
function AbandonedCarts() {
  const copy = useCopy();
  const { addToast } = useContext(ToastContext);
  const [idle, setIdle] = useState(24);
  const [carts, setCarts] = useState(null);
  const [picked, setPicked] = useState({});
  const [coupons, setCoupons] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState(null);

  useEffect(() => { setCarts(null); setOut(null); api.get("/api/marketing/abandoned-carts", { params: { idleHours: idle } }).then(({ data }) => { setCarts(data.carts); setPicked(Object.fromEntries(data.carts.map((c) => [c.cartId, true]))); }).catch(() => setCarts([])); }, [idle]);
  useEffect(() => { api.get("/api/marketing/coupons").then(({ data }) => setCoupons(data.coupons)).catch(() => {}); }, []);

  const ids = Object.keys(picked).filter((k) => picked[k]);
  const draft = async () => {
    setBusy(true);
    try { const { data } = await api.post("/api/marketing/abandoned-carts/drafts", { cartIds: ids, couponCode: coupon || undefined }); setOut(data); }
    catch (e) { addToast(errMsg(e, "Could not draft the reminders"), { type: "error" }); }
    finally { setBusy(false); }
  };
  const draftOf = (id) => out?.drafts.find((d) => d.cartId === id);

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mb: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Abandoned-cart reminders</Typography>
          <Typography variant="body2" color="text.secondary">Customers who put products in their cart and haven't bought. The AI drafts a personal reminder for each — nothing is sent automatically.</Typography>
        </Box>
        <TextField select size="small" label="Idle for at least" value={idle} onChange={(e) => setIdle(Number(e.target.value))} sx={{ minWidth: 140 }}>
          {[[1, "1 hour"], [6, "6 hours"], [24, "1 day"], [72, "3 days"], [168, "1 week"]].map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
        </TextField>
      </Box>

      {carts === null ? <CircularProgress size={22} /> : carts.length === 0 ? <Typography color="text.secondary" sx={{ py: 3 }}>No abandoned carts right now.</Typography> : (
        <>
          {carts.map((cart) => {
            const d = draftOf(cart.cartId);
            return (
              <Box key={cart.cartId} sx={{ display: "flex", gap: 1, py: 1.5, borderTop: "1px solid #f1f5f9", alignItems: "flex-start" }}>
                <Checkbox checked={Boolean(picked[cart.cartId])} onChange={(e) => setPicked({ ...picked, [cart.cartId]: e.target.checked })} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                    <Typography sx={{ fontWeight: 600 }}>{cart.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{cart.email} · idle {cart.idleHours < 48 ? `${cart.idleHours}h` : `${Math.round(cart.idleHours / 24)} days`}</Typography>
                    <Chip size="small" variant="outlined" color={cart.optedIn ? "success" : "warning"} label={cart.optedIn ? "Opted in to emails" : "Not opted in"} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">{cart.items.map((i) => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`).join(", ")} · ₹{cart.subtotal.toLocaleString("en-IN")}</Typography>
                  {d && (
                    <Box sx={{ mt: 1.5, p: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 2, display: "grid", gap: 1 }}>
                      {d.warnings.length > 0 && <Alert severity="warning">Please review: {d.warnings.join("; ")}</Alert>}
                      <Typography variant="caption" color="text.secondary">Email subject</Typography>
                      <Typography sx={{ fontWeight: 600 }}>{d.emailSubject}</Typography>
                      <Typography sx={{ whiteSpace: "pre-wrap", fontSize: 14 }}>{d.emailBody}{"\n\n"}Complete your order: {out.link}</Typography>
                      <Box><Button size="small" startIcon={<FiCopy />} onClick={() => copy(`Subject: ${d.emailSubject}\n\n${d.emailBody}\n\nComplete your order: ${out.link}`, "Email copied")} sx={{ textTransform: "none" }}>Copy email</Button></Box>
                      <Typography variant="caption" color="text.secondary">WhatsApp</Typography>
                      <Typography sx={{ whiteSpace: "pre-wrap", fontSize: 14 }}>{d.whatsapp}</Typography>
                      <Box><Button size="small" startIcon={<FiCopy />} onClick={() => copy(`${d.whatsapp} ${out.link}`, "WhatsApp message copied")} sx={{ textTransform: "none" }}>Copy WhatsApp</Button></Box>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mt: 2, pt: 2, borderTop: "1px solid #e2e8f0" }}>
            <TextField select size="small" label="Include a coupon?" value={coupon} onChange={(e) => setCoupon(e.target.value)} sx={{ minWidth: 220 }} helperText={coupons.length ? "Only real, active coupons" : "No active coupons"}>
              <MenuItem value="">No coupon</MenuItem>
              {coupons.map((c) => <MenuItem key={c.code} value={c.code}>{c.code} — {c.discountType === "percentage" ? `${c.discountValue}% off` : `₹${c.discountValue} off`}</MenuItem>)}
            </TextField>
            <Button variant="contained" onClick={draft} disabled={busy || ids.length === 0} sx={{ textTransform: "none" }}>{busy ? "Writing…" : `✨ Draft reminders for ${ids.length}`}</Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>Only first names and product names are sent to the AI — never email addresses or phone numbers.</Typography>
        </>
      )}
    </Paper>
  );
}

export default function MarketingHub() {
  const { addToast } = useContext(ToastContext);
  const [tab, setTab] = useState(0);
  const [brief, setBrief] = useState("");
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(null); // full campaign document
  const [starting, setStarting] = useState(false);
  const [segs, setSegs] = useState(null);
  const poll = useRef(null);

  const loadList = useCallback(() => api.get("/api/marketing/campaigns").then(({ data }) => setList(data.campaigns)).catch(() => {}), []);
  const openCampaign = useCallback(async (id) => {
    try { const { data } = await api.get(`/api/marketing/campaigns/${id}`); setOpen(data.campaign); return data.campaign; } catch { return null; }
  }, []);

  useEffect(() => { document.title = "Marketing – Admin"; loadList(); }, [loadList]);
  useEffect(() => { if (tab === 2 && !segs) api.get("/api/marketing/segments").then(({ data }) => setSegs(data.segments)).catch(() => setSegs([])); }, [tab, segs]);

  // While the agent writes, check back every few seconds
  const running = open?.status === "running";
  useEffect(() => {
    if (!running) return undefined;
    poll.current = setInterval(async () => { const c = await openCampaign(open._id); if (c && c.status !== "running") { loadList(); } }, 3000);
    return () => clearInterval(poll.current);
  }, [running, open?._id, openCampaign, loadList]);

  const start = async (text) => {
    const b = (text ?? brief).trim();
    if (b.length < 8) return;
    setStarting(true);
    try {
      const { data } = await api.post("/api/marketing/campaigns", { brief: b });
      setBrief("");
      await openCampaign(data.id);
      loadList();
    } catch (e) { addToast(errMsg(e, "Could not start the campaign"), { type: "error" }); }
    finally { setStarting(false); }
  };

  return (
    <AdminLayout>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>Marketing</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Tell the agent what you want to promote. It checks your real products, offers and the calendar, then writes Instagram, WhatsApp and email drafts and suggests who to send them to. You review everything — nothing is sent to customers from here.</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: "1px solid #e2e8f0" }}>
        <Tab label="Campaigns" sx={{ textTransform: "none" }} /><Tab label="Abandoned carts" sx={{ textTransform: "none" }} /><Tab label="Audiences" sx={{ textTransform: "none" }} />
      </Tabs>

      {tab === 0 && (
        <>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField fullWidth size="small" placeholder="e.g. Prepare a Diwali promotion for handcrafted gift collections" value={brief} onChange={(e) => setBrief(e.target.value)} onKeyDown={(e) => e.key === "Enter" && start()} inputProps={{ maxLength: 600 }} disabled={running} />
              <Button variant="contained" onClick={() => start()} disabled={starting || running || brief.trim().length < 8} sx={{ textTransform: "none", whiteSpace: "nowrap" }}>{running ? "Writing…" : "Create campaign"}</Button>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.5 }}>
              {EXAMPLES.map((e) => <Chip key={e} size="small" variant="outlined" label={e} onClick={() => start(e)} disabled={starting || running} />)}
            </Box>
            {list.length > 0 && (
              <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                <Typography variant="caption" color="text.secondary">Earlier:</Typography>
                {list.slice(0, 8).map((l) => <Chip key={l._id} size="small" color={open?._id === l._id ? "primary" : "default"} label={l.status === "failed" ? `⚠ ${l.brief.slice(0, 30)}` : l.title || l.brief.slice(0, 36)} onClick={() => openCampaign(l._id)} />)}
              </Box>
            )}
          </Paper>

          {open?.status === "running" && (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}><CircularProgress size={24} /><Box><Typography sx={{ fontWeight: 600 }}>Working on: {open.brief}</Typography><Typography variant="body2" color="text.secondary">This takes one to two minutes.</Typography></Box></Box>
              <Box sx={{ mt: 2 }}>{open.steps.map((s, i) => <Typography key={i} variant="body2" color="text.secondary">✓ {STEP_LABEL[s.tool] || s.tool}{s.note && s.note !== "ok" ? ` — ${s.note}` : ""}</Typography>)}</Box>
            </Paper>
          )}
          {open?.status === "failed" && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => start(open.brief)}>Try again</Button>}>This campaign couldn't be written: {open.error}</Alert>}
          {open?.status === "succeeded" && open.campaign && <CampaignView key={open._id} initial={open} onDeleted={() => { setOpen(null); loadList(); }} onChanged={loadList} />}
          {!open && list.length === 0 && <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>No campaigns yet. Describe one above, or tap an example.</Typography>}
        </>
      )}

      {tab === 1 && <AbandonedCarts />}

      {tab === 2 && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Your audiences</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Groups of customers worked out from your orders, carts and newsletter. “Opted in” means they agreed to marketing emails.</Typography>
          <SegmentList segments={segs || []} baseUrl="/api/marketing/segments" loading={!segs} />
        </Paper>
      )}
    </AdminLayout>
  );
}
