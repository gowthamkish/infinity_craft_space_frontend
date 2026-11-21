import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import { FiCpu, FiPlay, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { ToastContext } from "../../context/ToastContext";
import { errMsg } from "../../app/baseApi";
import {
  useGetBlogAgentConfigQuery,
  useUpdateBlogAgentConfigMutation,
  useRunBlogAgentMutation,
  useGetBlogAgentRunsQuery,
} from "../../services/blogApi";

const INTERVALS = [1, 2, 3, 4, 5, 7, 10, 14, 30];
const HOURS = Array.from({ length: 24 }, (_, h) => h);
const hourLabel = (h) => `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? "AM" : "PM"}`;
const when = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) + " IST" : "—";

/** Admin → Blog: control and watch the blog_agent that writes a post every few days. */
export default function BlogAgentPanel() {
  const { addToast } = useContext(ToastContext);
  const { data: cfg } = useGetBlogAgentConfigQuery(undefined, { pollingInterval: 10000 });
  const running = Boolean(cfg?.running);
  // Poll the run list quickly while the agent is working, slowly otherwise
  const { data: runs = [] } = useGetBlogAgentRunsQuery(undefined, { pollingInterval: running ? 4000 : 30000 });
  const [save, { isLoading: saving }] = useUpdateBlogAgentConfigMutation();
  const [runNow, { isLoading: starting }] = useRunBlogAgentMutation();

  const [form, setForm] = useState(null);
  const [showRuns, setShowRuns] = useState(false);
  useEffect(() => {
    if (cfg && !form) setForm({ intervalDays: cfg.intervalDays, runHourIST: cfg.runHourIST, autoPublish: cfg.autoPublish, focusNotes: cfg.focusNotes || "" });
  }, [cfg, form]);

  if (!cfg || !form) return null;
  const dirty = form.intervalDays !== cfg.intervalDays || form.runHourIST !== cfg.runHourIST || form.autoPublish !== cfg.autoPublish || form.focusNotes !== (cfg.focusNotes || "");

  const apply = async (changes, okMsg) => {
    try {
      await save(changes).unwrap();
      if (okMsg) addToast(okMsg, { type: "success" });
    } catch (e) {
      addToast(errMsg(e, "Could not save"), { type: "error" });
    }
  };

  const start = async () => {
    try {
      await runNow().unwrap();
      addToast("The agent is writing a post — this takes a minute or two.", { type: "info" });
    } catch (e) {
      addToast(errMsg(e, "Could not start the agent"), { type: "error" });
    }
  };

  const last = runs[0];
  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        <FiCpu size={20} />
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>Blog agent</Typography>
        <FormControlLabel
          control={<Switch checked={cfg.enabled} onChange={(e) => apply({ enabled: e.target.checked }, e.target.checked ? "Blog agent is on" : "Blog agent is off")} />}
          label={cfg.enabled ? "On" : "Off"}
        />
        <Button variant="contained" startIcon={<FiPlay />} onClick={start} disabled={running || starting || !cfg.apiKeyConfigured} sx={{ textTransform: "none" }}>
          {running ? "Writing…" : "Write a post now"}
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {cfg.enabled
          ? <>Writes a new post every <b>{cfg.intervalDays} day{cfg.intervalDays > 1 ? "s" : ""}</b> around <b>{hourLabel(cfg.runHourIST)}</b>. Next run: <b>{when(cfg.nextRunAt)}</b>.</>
          : "The agent is switched off — it will not write anything until you turn it on."}{" "}
        {cfg.autoPublish ? "Posts are published automatically." : "Posts are saved as drafts for you to review."}
      </Typography>

      {!cfg.apiKeyConfigured && <Alert severity="error" sx={{ mt: 1.5 }}>ANTHROPIC_API_KEY is not set on the server, so the agent can't write.</Alert>}
      {cfg.consecutiveFailures > 0 && <Alert severity="warning" sx={{ mt: 1.5 }}>The last {cfg.consecutiveFailures} run(s) failed. It will retry automatically{!cfg.enabled ? " once you switch it back on" : ""}. See the run history below.</Alert>}
      {last?.status === "succeeded" && last.postId && (
        <Alert severity="success" sx={{ mt: 1.5 }}>
          Latest post: <Link to={`/admin/blog/${last.postId}`}>{last.postTitle}</Link> — {last.published ? "published" : "waiting for your review"}.
        </Alert>
      )}

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, mt: 2.5 }}>
        <TextField select size="small" label="Write a post every" value={form.intervalDays} onChange={(e) => setForm((f) => ({ ...f, intervalDays: Number(e.target.value) }))}>
          {INTERVALS.map((n) => <MenuItem key={n} value={n}>{n === 1 ? "day" : `${n} days`}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Start writing at (India time)" value={form.runHourIST} onChange={(e) => setForm((f) => ({ ...f, runHourIST: Number(e.target.value) }))}>
          {HOURS.map((h) => <MenuItem key={h} value={h}>{hourLabel(h)}</MenuItem>)}
        </TextField>
        <TextField size="small" label="Topic focus (optional)" placeholder="e.g. wedding-season gifting" value={form.focusNotes} onChange={(e) => setForm((f) => ({ ...f, focusNotes: e.target.value }))} inputProps={{ maxLength: 500 }} sx={{ gridColumn: { sm: "1 / -1" } }} />
      </Box>

      <FormControlLabel
        sx={{ mt: 1 }}
        control={<Switch checked={form.autoPublish} onChange={(e) => setForm((f) => ({ ...f, autoPublish: e.target.checked }))} />}
        label="Publish automatically without my review"
      />
      {form.autoPublish && <Alert severity="warning" sx={{ mt: 1 }}>The agent is told to use only facts from your catalog, and the server checks prices and links — but it is still AI writing. Reviewing drafts first is safer.</Alert>}

      <Box sx={{ display: "flex", gap: 1.5, mt: 2, alignItems: "center", flexWrap: "wrap" }}>
        <Button variant="outlined" disabled={!dirty || saving} onClick={() => apply(form, "Schedule saved")} sx={{ textTransform: "none" }}>Save schedule</Button>
        <Typography variant="caption" color="text.secondary">Changes apply immediately — no redeploy needed. Model: {cfg.model}</Typography>
      </Box>

      <Button size="small" onClick={() => setShowRuns((v) => !v)} endIcon={showRuns ? <FiChevronUp /> : <FiChevronDown />} sx={{ textTransform: "none", mt: 1.5 }}>
        Recent runs ({runs.length})
      </Button>
      <Collapse in={showRuns}>
        {runs.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No runs yet.</Typography>
        ) : runs.map((r) => (
          <Box key={r._id} sx={{ py: 1, borderTop: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <Chip size="small" label={r.status === "running" ? "Writing…" : r.status === "succeeded" ? "Done" : "Failed"} color={r.status === "succeeded" ? "success" : r.status === "failed" ? "error" : "info"} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.postId ? <Link to={`/admin/blog/${r.postId}`}>{r.postTitle}</Link> : r.pillar || "—"}</Typography>
              <Typography variant="caption" color="text.secondary">{when(r.startedAt)} · {r.trigger === "manual" ? "started by you" : "scheduled"}{r.usage?.outputTokens ? ` · ${r.usage.turns} steps` : ""}</Typography>
            </Box>
            {r.error && <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>{r.error}</Typography>}
            {r.steps?.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                {r.steps.map((s) => `${s.tool.replace(/_/g, " ")}${s.note && s.note !== "ok" ? ` (${s.note})` : ""}`).join(" → ")}
              </Typography>
            )}
          </Box>
        ))}
      </Collapse>
    </Paper>
  );
}
