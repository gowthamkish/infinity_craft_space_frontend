import { useState, useEffect, useCallback, useId } from "react";
import {
  Box, Typography, Stack, Tabs, Tab, Card,
  Chip, Button, IconButton, CircularProgress, Alert, Divider,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Tooltip, Checkbox, Skeleton, Snackbar,
  FormControl, Select, MenuItem,
} from "@mui/material";
import {
  FiCheckCircle, FiXCircle, FiMessageSquare, FiAlertTriangle,
  FiTrendingUp, FiStar, FiRefreshCw, FiEdit3, FiShield,
  FiSearch, FiFilter, FiInbox, FiAlertCircle, FiTrash2,
} from "react-icons/fi";
import AdminLayout from "./AdminLayout";
import api from "../../api/axios";
import { BRAND } from "../../theme/muiTheme";

// ─── Design tokens ────────────────────────────────────────────────────────────
const P      = BRAND.rose[800];
const P_DARK = BRAND.rose[900] || "#6b1238";
const P_BG   = "rgba(139,26,74,0.07)";
const BORDER = "#e7e5e4";
const BG     = "#fafaf9";

const STATUS = {
  approved: { label: "Approved", bg: "#dcfce7", color: "#15803d", dot: "#22c55e" },
  rejected: { label: "Rejected", bg: "#fee2e2", color: "#dc2626", dot: "#ef4444" },
  pending:  { label: "Pending",  bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
};
const VERDICT = {
  genuine:    { label: "Genuine",    bg: "#dcfce7", color: "#15803d" },
  suspicious: { label: "Suspicious", bg: "#fef3c7", color: "#b45309" },
  spam:       { label: "Spam",       bg: "#fee2e2", color: "#dc2626" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Small reusable atoms ─────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.5,
      px: 1, py: 0.25, borderRadius: "6px",
      bgcolor: s.bg, color: s.color,
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: s.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "capitalize" }}>
        {s.label}
      </Typography>
    </Box>
  );
}

function VerdictBadge({ verdict, confidence }) {
  const v = VERDICT[verdict];
  if (!v) return null;
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.5,
      px: 1, py: 0.25, borderRadius: "6px",
      bgcolor: v.bg, color: v.color,
    }}>
      <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700 }}>
        AI · {v.label}{confidence != null ? ` · ${Math.round(confidence * 100)}%` : ""}
      </Typography>
    </Box>
  );
}

function Stars({ rating }) {
  return (
    <Stack direction="row" gap={0.25} alignItems="center" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <FiStar key={n} size={12}
          fill={n <= rating ? "#f59e0b" : "none"}
          color={n <= rating ? "#f59e0b" : "#d1d5db"}
          aria-hidden="true"
        />
      ))}
    </Stack>
  );
}

function TabPill({ count }) {
  if (!count) return null;
  return (
    <Box component="span" sx={{
      ml: 0.75, px: 0.75, display: "inline-flex", alignItems: "center",
      height: 18, borderRadius: "9px", minWidth: 18,
      bgcolor: "currentColor", opacity: 0, position: "relative",
    }}>
      <Box component="span" sx={{
        position: "absolute", inset: 0, borderRadius: "inherit",
        bgcolor: "rgba(0,0,0,0.08)",
      }} />
      <Typography component="span" sx={{
        fontSize: "0.6rem", fontWeight: 800, lineHeight: 1,
        color: "inherit", position: "relative", zIndex: 1, px: 0.5,
      }}>
        {count > 99 ? "99+" : count}
      </Typography>
    </Box>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <Box sx={{ border: `1px solid ${BORDER}`, borderRadius: "12px", p: 2.5 }}>
      <Stack direction="row" gap={2} alignItems="flex-start">
        <Skeleton variant="rounded" width={20} height={20} sx={{ mt: 0.25, flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" gap={2} mb={1}>
            <Skeleton width="50%" height={16} />
            <Skeleton width={120} height={20} />
          </Stack>
          <Skeleton width="80%" height={14} sx={{ mb: 0.5 }} />
          <Skeleton width="65%" height={14} sx={{ mb: 1.5 }} />
          <Skeleton width="100%" height={56} sx={{ borderRadius: "8px", mb: 1.5 }} />
          <Stack direction="row" gap={1}>
            <Skeleton width={88} height={32} sx={{ borderRadius: "8px" }} />
            <Skeleton width={72} height={32} sx={{ borderRadius: "8px" }} />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyQueue({ message }) {
  return (
    <Box sx={{ textAlign: "center", py: 10, px: 3 }}>
      <Box sx={{
        width: 64, height: 64, borderRadius: "50%", mx: "auto", mb: 2,
        bgcolor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center",
        color: "#22c55e",
      }}>
        <FiCheckCircle size={28} />
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1c1917", mb: 0.5 }}>
        All clear!
      </Typography>
      <Typography variant="body2" sx={{ color: "#a8a29e" }}>
        {message || "Nothing here — the queue is empty."}
      </Typography>
    </Box>
  );
}

// ─── Confirm dialog (for destructive actions) ─────────────────────────────────
function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onClose, loading }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "#57534e" }}>{description}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}
          sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px", borderColor: BORDER, color: "#57534e" }}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" disabled={loading}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px",
            bgcolor: "#dc2626", "&:hover": { bgcolor: "#b91c1c" }, boxShadow: "none" }}>
          {loading ? "Processing…" : (confirmLabel || "Confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Draft edit dialog ────────────────────────────────────────────────────────
function DraftDialog({ open, onClose, draft, onApprove, type = "response" }) {
  const [edited, setEdited] = useState(draft || "");
  const labelId = useId();
  useEffect(() => setEdited(draft || ""), [draft]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: "16px" } }}
      aria-labelledby={labelId}
    >
      <DialogTitle id={labelId} sx={{ fontWeight: 700, pb: 1 }}>
        {type === "response" ? "Review AI-Drafted Response" : "Review AI-Drafted Answer"}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "#6b7280", mb: 2 }}>
          Edit the draft if needed, then approve to post it publicly.
        </Typography>
        <TextField
          multiline fullWidth minRows={4}
          value={edited}
          onChange={(e) => setEdited(e.target.value)}
          aria-label="Draft content"
          sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.875rem", borderRadius: "10px" } }}
        />
        <Typography variant="caption" sx={{ color: "#9ca3af", mt: 1, display: "block" }}>
          {edited.length} characters
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined"
          sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px", borderColor: BORDER, color: "#57534e" }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => onApprove(edited)} disabled={!edited.trim()}
          sx={{ bgcolor: P, textTransform: "none", fontWeight: 700, borderRadius: "10px",
            "&:hover": { bgcolor: P_DARK }, boxShadow: "none" }}>
          Approve & Post
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── AI Draft box ─────────────────────────────────────────────────────────────
function DraftBox({ title, content, extra }) {
  return (
    <Box sx={{
      border: `1.5px dashed ${P}`, borderRadius: "10px", p: 2,
      bgcolor: "rgba(139,26,74,0.025)", mb: 2,
    }}>
      <Stack direction="row" alignItems="center" gap={0.75} mb={0.75}>
        <FiMessageSquare size={13} color={P} aria-hidden="true" />
        <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: P, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {title}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: "#57534e", lineHeight: 1.7, fontSize: "0.875rem" }}>
        {content}
      </Typography>
      {extra}
    </Box>
  );
}

// ─── Review card ─────────────────────────────────────────────────────────────
function ReviewCard({ review, onAction, isRefreshing, selected, onSelect }) {
  const [draftOpen,   setDraftOpen]   = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming,  setConfirming]  = useState(false);
  const checkId = useId();

  const hasDraft   = review.aiDraftResponse?.status === "pending" && review.aiDraftResponse?.comment;
  const hasInsight = !!review.productInsight;
  const verdict    = review.aiModeration?.verdict;
  const confidence = review.aiModeration?.confidence;
  const isPending  = review.status === "pending";

  const handleReject = async () => {
    setConfirming(true);
    try {
      await onAction(review._id, "reject");
    } finally {
      setConfirming(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Card
        elevation={0}
        aria-selected={selected}
        sx={{
          border: `1px solid ${selected ? P : BORDER}`,
          borderRadius: "12px",
          opacity: isRefreshing ? 0.5 : 1,
          transition: "opacity 0.2s, border-color 0.15s",
          bgcolor: selected ? "rgba(139,26,74,0.02)" : "#fff",
          "&:focus-within": { outline: `2px solid ${P}`, outlineOffset: 2 },
        }}
      >
        {/* Card header */}
        <Box sx={{ px: 2.5, pt: 2.5, pb: 0 }}>
          <Stack direction="row" alignItems="flex-start" gap={2}>
            {/* Checkbox */}
            <Checkbox
              id={checkId}
              size="small"
              checked={selected}
              onChange={(e) => onSelect(review._id, e.target.checked)}
              inputProps={{ "aria-label": `Select review by ${review.user?.username || review.user?.email}` }}
              sx={{ p: 0, mt: 0.125, flexShrink: 0, color: BORDER, "&.Mui-checked": { color: P } }}
            />

            {/* Main content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Row 1: stars + title + badges */}
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2} mb={0.75}>
                <Stack direction="row" alignItems="center" gap={1.25} flexWrap="wrap">
                  <Stars rating={review.rating} />
                  {review.title && (
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#1c1917", lineHeight: 1.4 }}>
                      "{review.title}"
                    </Typography>
                  )}
                  {review.isVerifiedPurchase && (
                    <Chip label="Verified Purchase" size="small"
                      sx={{ height: 18, fontSize: "0.6rem", fontWeight: 700,
                        bgcolor: "#dcfce7", color: "#15803d", borderRadius: "5px" }} />
                  )}
                </Stack>
                {/* Badges right-aligned */}
                <Stack direction="row" gap={0.75} alignItems="center" flexShrink={0} flexWrap="wrap" justifyContent="flex-end">
                  {verdict && <VerdictBadge verdict={verdict} confidence={confidence} />}
                  <StatusBadge status={review.status} />
                </Stack>
              </Stack>

              {/* Row 2: meta */}
              <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 1.5 }} flexWrap="wrap">
                <Typography variant="caption" sx={{ color: "#78716c" }}>
                  {review.user?.username || review.user?.email}
                </Typography>
                <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#d4d0ce", flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: "#78716c" }}>
                  {formatDate(review.createdAt)}
                </Typography>
                {review.product?.name && (
                  <>
                    <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#d4d0ce", flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: "#78716c" }}>
                      on <Box component="span" sx={{ fontWeight: 600, color: "#1c1917" }}>{review.product.name}</Box>
                    </Typography>
                  </>
                )}
              </Stack>

              {/* Review body */}
              <Typography variant="body2" sx={{ color: "#57534e", lineHeight: 1.7, mb: 1.5 }}>
                {review.comment}
              </Typography>

              {/* AI reason */}
              {review.aiModeration?.reason && (
                <Box sx={{
                  bgcolor: BG, border: `1px solid ${BORDER}`,
                  borderRadius: "8px", px: 1.75, py: 1, mb: 1.5,
                }}>
                  <Typography variant="caption" sx={{ color: "#78716c", lineHeight: 1.65, display: "block" }}>
                    <Box component="span" sx={{ fontWeight: 700, color: "#57534e" }}>AI reasoning: </Box>
                    {review.aiModeration.reason}
                  </Typography>
                </Box>
              )}

              {/* Product insight */}
              {hasInsight && (
                <Alert severity="warning" icon={<FiTrendingUp size={14} aria-hidden="true" />}
                  sx={{ mb: 1.5, borderRadius: "8px", py: 0.75, "& .MuiAlert-message": { fontSize: "0.8125rem" } }}>
                  <Box component="span" sx={{ fontWeight: 700 }}>Insight: </Box>{review.productInsight}
                </Alert>
              )}

              {/* AI Draft */}
              {hasDraft && (
                <DraftBox title="AI Draft Response" content={review.aiDraftResponse.comment} />
              )}
            </Box>
          </Stack>

          <Divider sx={{ mt: 2, borderColor: "#f0eeec" }} />
        </Box>

        {/* Card footer / actions */}
        <Box sx={{ px: 2.5, py: 1.75 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
            {/* Primary actions */}
            <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
              {isPending && (
                <>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<FiCheckCircle size={14} aria-hidden="true" />}
                    onClick={() => onAction(review._id, "approve")}
                    aria-label="Approve review"
                    sx={{
                      minHeight: 36, bgcolor: "#15803d", textTransform: "none",
                      fontWeight: 700, fontSize: "0.8125rem", px: 2, borderRadius: "8px",
                      boxShadow: "none", "&:hover": { bgcolor: "#166534", boxShadow: "none" },
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<FiXCircle size={14} aria-hidden="true" />}
                    onClick={() => setConfirmOpen(true)}
                    aria-label="Reject review"
                    sx={{
                      minHeight: 36, textTransform: "none",
                      fontWeight: 700, fontSize: "0.8125rem", px: 2, borderRadius: "8px",
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
              {hasDraft && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<FiEdit3 size={14} aria-hidden="true" />}
                    onClick={() => setDraftOpen(true)}
                    aria-label="Review and edit AI draft"
                    sx={{
                      minHeight: 36, textTransform: "none", fontWeight: 600, fontSize: "0.8125rem",
                      px: 2, borderRadius: "8px", borderColor: P, color: P,
                      "&:hover": { borderColor: P_DARK, bgcolor: P_BG },
                    }}
                  >
                    Review Draft
                  </Button>
                  <Tooltip title="Discard this AI draft" arrow>
                    <IconButton
                      size="small"
                      onClick={() => onAction(review._id, "dismiss-draft")}
                      aria-label="Dismiss AI draft"
                      sx={{
                        width: 36, height: 36, borderRadius: "8px",
                        color: "#9ca3af", border: `1px solid ${BORDER}`,
                        "&:hover": { bgcolor: "#fef2f2", color: "#dc2626", borderColor: "#fca5a5" },
                      }}
                    >
                      <FiTrash2 size={14} aria-hidden="true" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Stack>

            {/* Review ID (right-aligned) */}
            <Typography variant="caption" sx={{ color: "#c4c0bc", fontFamily: "monospace" }}>
              #{review._id?.slice(-8).toUpperCase()}
            </Typography>
          </Stack>
        </Box>
      </Card>

      {/* Reject confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Reject this review?"
        description="The review will be hidden from the product page and the author will not be notified. This action can be undone by re-approving later."
        confirmLabel="Reject Review"
        loading={confirming}
        onConfirm={handleReject}
        onClose={() => setConfirmOpen(false)}
      />

      {/* Draft edit dialog */}
      <DraftDialog
        open={draftOpen}
        onClose={() => setDraftOpen(false)}
        draft={review.aiDraftResponse?.comment}
        type="response"
        onApprove={(edited) => {
          setDraftOpen(false);
          onAction(review._id, "approve-draft", { editedComment: edited });
        }}
      />
    </>
  );
}

// ─── Q&A Draft card ───────────────────────────────────────────────────────────
function QnADraftCard({ item, onAction, selected, onSelect }) {
  const [draftOpen, setDraftOpen] = useState(false);
  const checkId = useId();
  const draft   = item.aiDraftAnswer;
  const high    = draft?.confidence >= 0.7;

  return (
    <>
      <Card elevation={0} sx={{
        border: `1px solid ${selected ? P : BORDER}`,
        borderRadius: "12px",
        bgcolor: selected ? "rgba(139,26,74,0.02)" : "#fff",
        transition: "border-color 0.15s",
      }}>
        {/* Header */}
        <Box sx={{ px: 2.5, pt: 2.5, pb: 0 }}>
          <Stack direction="row" alignItems="flex-start" gap={2}>
            <Checkbox
              id={checkId}
              size="small"
              checked={selected}
              onChange={(e) => onSelect(item._id, e.target.checked)}
              inputProps={{ "aria-label": "Select Q&A draft" }}
              sx={{ p: 0, mt: 0.25, flexShrink: 0, color: BORDER, "&.Mui-checked": { color: P } }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2} mb={0.75}>
                <Typography sx={{ fontSize: "0.9375rem", fontWeight: 700, color: "#1c1917", lineHeight: 1.5, flex: 1 }}>
                  {item.question}
                </Typography>
                {draft?.confidence != null && (
                  <Chip
                    label={`${Math.round(draft.confidence * 100)}% confidence`}
                    size="small"
                    sx={{
                      height: 20, fontSize: "0.65rem", fontWeight: 700, flexShrink: 0, borderRadius: "5px",
                      bgcolor: high ? "#dcfce7" : "#fef3c7",
                      color:   high ? "#15803d" : "#b45309",
                    }}
                  />
                )}
              </Stack>
              <Stack direction="row" alignItems="center" gap={0.75} mb={1.75} flexWrap="wrap">
                <Typography variant="caption" sx={{ color: "#78716c" }}>
                  on <Box component="span" sx={{ fontWeight: 600, color: "#1c1917" }}>{item.product?.name}</Box>
                </Typography>
                <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#d4d0ce", flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: "#78716c" }}>
                  {formatDate(item.createdAt)}
                </Typography>
              </Stack>

              {draft?.content && (
                <DraftBox
                  title="Aria's Draft Answer"
                  content={draft.content}
                  extra={draft.sources?.length > 0 && (
                    <Typography variant="caption" sx={{ color: "#a8a29e", mt: 0.75, display: "block" }}>
                      Sources: {draft.sources.join(", ")}
                    </Typography>
                  )}
                />
              )}
            </Box>
          </Stack>
          <Divider sx={{ mt: 1.5, borderColor: "#f0eeec" }} />
        </Box>

        {/* Footer */}
        <Box sx={{ px: 2.5, py: 1.75 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
            <Stack direction="row" gap={1} alignItems="center">
              <Button size="small" variant="outlined"
                startIcon={<FiEdit3 size={14} aria-hidden="true" />}
                onClick={() => setDraftOpen(true)}
                aria-label="Review and post Aria's draft answer"
                sx={{
                  minHeight: 36, textTransform: "none", fontWeight: 600, fontSize: "0.8125rem",
                  px: 2, borderRadius: "8px", borderColor: P, color: P,
                  "&:hover": { borderColor: P_DARK, bgcolor: P_BG },
                }}
              >
                Review & Post
              </Button>
              <Tooltip title="Discard this draft" arrow>
                <IconButton
                  size="small"
                  onClick={() => onAction(item._id, "dismiss")}
                  aria-label="Dismiss draft answer"
                  sx={{
                    width: 36, height: 36, borderRadius: "8px",
                    color: "#9ca3af", border: `1px solid ${BORDER}`,
                    "&:hover": { bgcolor: "#fef2f2", color: "#dc2626", borderColor: "#fca5a5" },
                  }}
                >
                  <FiTrash2 size={14} aria-hidden="true" />
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography variant="caption" sx={{ color: "#c4c0bc", fontFamily: "monospace" }}>
              #{item._id?.slice(-8).toUpperCase()}
            </Typography>
          </Stack>
        </Box>
      </Card>

      <DraftDialog
        open={draftOpen}
        onClose={() => setDraftOpen(false)}
        draft={draft?.content}
        type="answer"
        onApprove={(edited) => {
          setDraftOpen(false);
          onAction(item._id, "approve", { editedContent: edited });
        }}
      />
    </>
  );
}

// ─── Bulk action bar ──────────────────────────────────────────────────────────
function BulkBar({ count, onApprove, onReject, onClear }) {
  if (count === 0) return null;
  return (
    <Box
      role="region"
      aria-label="Bulk actions"
      sx={{
        position: "sticky", top: 0, zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 2, px: 2.5, py: 1.5,
        bgcolor: "#1c1917", borderRadius: "10px", mb: 2,
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
      }}
    >
      <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.875rem" }}>
        {count} selected
      </Typography>
      <Stack direction="row" gap={1} alignItems="center">
        <Button size="small" onClick={onApprove}
          startIcon={<FiCheckCircle size={14} />}
          sx={{
            textTransform: "none", fontWeight: 700, fontSize: "0.8125rem",
            bgcolor: "#15803d", color: "#fff", borderRadius: "8px", px: 2, minHeight: 36,
            "&:hover": { bgcolor: "#166534" }, boxShadow: "none",
          }}
        >
          Approve all
        </Button>
        <Button size="small" onClick={onReject}
          startIcon={<FiXCircle size={14} />}
          sx={{
            textTransform: "none", fontWeight: 700, fontSize: "0.8125rem",
            bgcolor: "#dc2626", color: "#fff", borderRadius: "8px", px: 2, minHeight: 36,
            "&:hover": { bgcolor: "#b91c1c" }, boxShadow: "none",
          }}
        >
          Reject all
        </Button>
        <Button size="small" onClick={onClear}
          sx={{
            textTransform: "none", fontWeight: 600, fontSize: "0.8125rem",
            color: "rgba(255,255,255,0.6)", borderRadius: "8px", px: 1.5, minHeight: 36,
            "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
          }}
        >
          Clear
        </Button>
      </Stack>
    </Box>
  );
}

// ─── Review tab definitions ───────────────────────────────────────────────────
const REVIEW_TABS = [
  { key: "pending",  label: "Pending",  Icon: FiAlertTriangle },
  { key: "drafts",   label: "Drafts",   Icon: FiMessageSquare },
  { key: "flagged",  label: "Flagged",  Icon: FiXCircle       },
  { key: "insights", label: "Insights", Icon: FiTrendingUp    },
];

const EMPTY_MSGS = {
  pending:  "No reviews awaiting moderation.",
  drafts:   "No AI draft responses awaiting approval.",
  flagged:  "No flagged reviews.",
  insights: "No product insights detected.",
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function ModerationQueue() {
  const [section,    setSection]    = useState("reviews");
  const [reviewTab,  setReviewTab]  = useState("pending");
  const [reviews,    setReviews]    = useState([]);
  const [qnaDrafts,  setQnaDrafts]  = useState([]);
  const [counts,     setCounts]     = useState({});
  const [loading,    setLoading]    = useState(false);
  const [refreshing, setRefreshing] = useState(null);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [sortBy,     setSortBy]     = useState("newest");
  const [selected,   setSelected]   = useState(new Set());
  const [toast,      setToast]      = useState(null);

  // ── Data fetching ────────────────────────────────────────────────────────────
  const fetchReviews = useCallback(async (tab) => {
    setLoading(true); setError(null); setSelected(new Set());
    try {
      const { data } = await api.get(`/api/reviews/admin/queue?tab=${tab}&limit=30`);
      setReviews(data.reviews || []);
    } catch (e) { setError(e.response?.data?.error || "Failed to load reviews."); }
    finally     { setLoading(false); }
  }, []);

  const fetchQnADrafts = useCallback(async () => {
    setLoading(true); setError(null); setSelected(new Set());
    try {
      const { data } = await api.get("/api/qna/admin/drafts?limit=30");
      setQnaDrafts(data.items || []);
    } catch (e) { setError(e.response?.data?.error || "Failed to load Q&A drafts."); }
    finally     { setLoading(false); }
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      const [p, d, f, q] = await Promise.allSettled([
        api.get("/api/reviews/admin/queue?tab=pending&limit=1"),
        api.get("/api/reviews/admin/queue?tab=drafts&limit=1"),
        api.get("/api/reviews/admin/queue?tab=flagged&limit=1"),
        api.get("/api/qna/admin/drafts?limit=1"),
      ]);
      setCounts({
        pending: p.value?.data?.pagination?.total || 0,
        drafts:  d.value?.data?.pagination?.total || 0,
        flagged: f.value?.data?.pagination?.total || 0,
        qna:     q.value?.data?.pagination?.total || 0,
      });
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);
  useEffect(() => {
    if (section === "reviews") fetchReviews(reviewTab);
    if (section === "qna")     fetchQnADrafts();
  }, [section, reviewTab, fetchReviews, fetchQnADrafts]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handleReviewAction = async (reviewId, action, body = {}) => {
    setRefreshing(reviewId);
    try {
      if (action === "approve" || action === "reject") {
        await api.put(`/api/reviews/${reviewId}/moderate`, { action });
        setToast(action === "approve" ? "Review approved." : "Review rejected.");
      } else if (action === "approve-draft") {
        await api.post(`/api/reviews/${reviewId}/approve-draft`, body);
        setToast("Draft posted successfully.");
      } else if (action === "dismiss-draft") {
        await api.post(`/api/reviews/${reviewId}/dismiss-draft`);
        setToast("Draft dismissed.");
      }
      await fetchReviews(reviewTab);
      await fetchCounts();
    } catch (e) { setError(e.response?.data?.error || "Action failed."); }
    finally     { setRefreshing(null); }
  };

  const handleQnAAction = async (qnaId, action, body = {}) => {
    try {
      if (action === "approve") { await api.post(`/api/qna/${qnaId}/approve-ai-answer`, body); setToast("Answer posted."); }
      else if (action === "dismiss") { await api.post(`/api/qna/${qnaId}/dismiss-ai-answer`); setToast("Draft dismissed."); }
      await fetchQnADrafts();
      await fetchCounts();
    } catch (e) { setError(e.response?.data?.error || "Action failed."); }
  };

  // ── Bulk helpers ─────────────────────────────────────────────────────────────
  const toggleSelect = (id, checked) => {
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const handleBulkApprove = async () => {
    for (const id of selected) await handleReviewAction(id, "approve");
    setSelected(new Set());
  };

  const handleBulkReject = async () => {
    for (const id of selected) await handleReviewAction(id, "reject");
    setSelected(new Set());
  };

  // ── Derived data ─────────────────────────────────────────────────────────────
  const filteredReviews = reviews
    .filter((r) => !search || r.comment?.toLowerCase().includes(search.toLowerCase())
      || r.user?.username?.toLowerCase().includes(search.toLowerCase())
      || r.title?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "newest"
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt));

  const reviewsBadge = (counts.pending || 0) + (counts.drafts || 0);

  // ── Stats strip ──────────────────────────────────────────────────────────────
  const stats = [
    { label: "Pending",  value: counts.pending || 0, color: "#f59e0b" },
    { label: "Flagged",  value: counts.flagged  || 0, color: "#ef4444" },
    { label: "Drafts",   value: counts.drafts   || 0, color: P        },
    { label: "Q&A",      value: counts.qna      || 0, color: "#6366f1" },
  ];

  return (
    <AdminLayout>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between"
        flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
        <Box>
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 0.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: "10px", bgcolor: P_BG,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: P, flexShrink: 0,
            }}>
              <FiShield size={20} aria-hidden="true" />
            </Box>
            <Typography variant="h4" component="h1"
              sx={{ fontWeight: 800, color: "#1c1917", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
              AI Moderation Queue
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: "#6b7280", pl: 7 }}>
            Review AI moderation results, approve drafts, and monitor product insights.
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FiRefreshCw size={13} aria-hidden="true" />}
          onClick={() => { if (section === "reviews") fetchReviews(reviewTab); else fetchQnADrafts(); fetchCounts(); }}
          disabled={loading}
          aria-label="Refresh queue"
          sx={{
            height: 32, borderColor: BORDER, color: "#57534e",
            textTransform: "none", fontSize: "0.8125rem", fontWeight: 600,
            borderRadius: "8px", px: 1.5, flexShrink: 0,
            "&:hover": { borderColor: "#c4c0bc", bgcolor: BG },
          }}
        >
          Refresh
        </Button>
      </Stack>

      {/* ── Stats strip ─────────────────────────────────────────────────── */}
      <Stack direction="row" gap={1.5} sx={{ mb: 3 }} flexWrap="wrap">
        {stats.map(({ label, value, color }) => (
          <Box key={label} sx={{
            display: "flex", alignItems: "center", gap: 1,
            px: 2, py: 1.25, borderRadius: "10px",
            border: `1px solid ${BORDER}`, bgcolor: "#fff",
            minWidth: 88,
          }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
            <Box>
              <Typography sx={{ fontSize: "1.125rem", fontWeight: 800, color: "#1c1917", lineHeight: 1.2 }}>
                {value}
              </Typography>
              <Typography sx={{ fontSize: "0.6875rem", color: "#9ca3af", fontWeight: 500 }}>
                {label}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && (
        <Alert severity="error" icon={<FiAlertCircle size={16} />} onClose={() => setError(null)}
          sx={{ mb: 2.5, borderRadius: "10px" }}>
          {error}
        </Alert>
      )}

      {/* ── Main card ───────────────────────────────────────────────────── */}
      <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: "14px", overflow: "visible" }}>

        {/* Section switcher */}
        <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${BORDER}`,
          display: "flex", alignItems: "center", gap: 1 }}>
          {[
            { key: "reviews", label: "Reviews",    count: reviewsBadge },
            { key: "qna",     label: "Q&A Drafts", count: counts.qna || 0 },
          ].map(({ key, label, count }) => {
            const active = section === key;
            return (
              <Box
                key={key}
                component="button"
                onClick={() => setSection(key)}
                aria-pressed={active}
                sx={{
                  display: "inline-flex", alignItems: "center",
                  px: 1.75, py: 0.625, borderRadius: "20px",
                  border: `1.5px solid ${active ? P : BORDER}`,
                  bgcolor: active ? P : "#fff",
                  color: active ? "#fff" : "#57534e",
                  cursor: "pointer", fontFamily: "inherit",
                  fontSize: "0.8125rem", fontWeight: active ? 700 : 500,
                  transition: "all 140ms",
                  "&:hover": { borderColor: P, color: active ? "#fff" : P },
                  "&:focus-visible": { outline: `2px solid ${P}`, outlineOffset: 2 },
                }}
              >
                {label}
                {count > 0 && (
                  <Box component="span" sx={{
                    ml: 0.75, px: 0.75, display: "inline-flex", alignItems: "center",
                    height: 18, borderRadius: "9px", minWidth: 18,
                    bgcolor: active ? "rgba(255,255,255,0.25)" : P_BG,
                    color: active ? "#fff" : P,
                    fontSize: "0.6rem", fontWeight: 800,
                  }}>
                    {count > 99 ? "99+" : count}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {/* ── Reviews section ─────────────────────────────────────────── */}
        {section === "reviews" && (
          <>
            {/* Sub-tabs */}
            <Box sx={{ borderBottom: `1px solid ${BORDER}`, px: 1 }}>
              <Tabs
                value={reviewTab}
                onChange={(_, v) => setReviewTab(v)}
                aria-label="Review filter tabs"
                sx={{
                  minHeight: 48,
                  "& .MuiTabs-indicator": { bgcolor: P, height: 2.5, borderRadius: "2px 2px 0 0" },
                  "& .MuiTab-root": {
                    textTransform: "none", fontSize: "0.8125rem", fontWeight: 500,
                    minHeight: 48, color: "#78716c", px: 2, py: 0,
                    "&.Mui-selected": { color: P, fontWeight: 700 },
                    "&:focus-visible": { outline: `2px solid ${P}`, outlineOffset: -2, borderRadius: "4px" },
                  },
                }}
              >
                {REVIEW_TABS.map(({ key, label, Icon }) => (
                  <Tab
                    key={key} value={key}
                    label={
                      <Stack direction="row" alignItems="center" gap={1} component="span"
                        sx={{ display: "inline-flex" }}>
                        <Icon size={13} aria-hidden="true" />
                        {label}
                        {counts[key] > 0 && (
                          <Box component="span" sx={{
                            px: 0.75, display: "inline-flex", alignItems: "center", height: 18,
                            borderRadius: "9px", minWidth: 18,
                            bgcolor: reviewTab === key ? P_BG : "#f1f5f9",
                            color:   reviewTab === key ? P : "#78716c",
                            fontSize: "0.6rem", fontWeight: 800,
                          }}>
                            {counts[key] > 99 ? "99+" : counts[key]}
                          </Box>
                        )}
                      </Stack>
                    }
                  />
                ))}
              </Tabs>
            </Box>

            {/* Search + sort toolbar */}
            <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${BORDER}`,
              display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <TextField
                size="small"
                placeholder="Search reviews, users…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                inputProps={{ "aria-label": "Search reviews" }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <FiSearch size={14} color="#9ca3af" aria-hidden="true" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  flexGrow: 1, maxWidth: 360,
                  "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: BG },
                }}
              />
              <Stack direction="row" alignItems="center" gap={0.75}>
                <FiFilter size={14} color="#9ca3af" aria-hidden="true" />
                <FormControl size="small">
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    inputProps={{ "aria-label": "Sort reviews" }}
                    sx={{
                      borderRadius: "10px", fontSize: "0.8125rem", bgcolor: BG,
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER },
                    }}
                  >
                    <MenuItem value="newest" sx={{ fontSize: "0.8125rem" }}>Newest first</MenuItem>
                    <MenuItem value="oldest" sx={{ fontSize: "0.8125rem" }}>Oldest first</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              {filteredReviews.length > 0 && (
                <Typography variant="caption" sx={{ color: "#9ca3af", ml: "auto" }}>
                  {filteredReviews.length} result{filteredReviews.length !== 1 ? "s" : ""}
                </Typography>
              )}
            </Box>

            {/* Bulk bar + list */}
            <Box sx={{ p: 2.5 }}>
              <BulkBar
                count={selected.size}
                onApprove={handleBulkApprove}
                onReject={handleBulkReject}
                onClear={() => setSelected(new Set())}
              />

              {loading ? (
                <Stack gap={2}>
                  {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
                </Stack>
              ) : filteredReviews.length === 0 ? (
                <EmptyQueue message={search ? `No reviews match "${search}".` : EMPTY_MSGS[reviewTab]} />
              ) : (
                <Stack gap={2}>
                  {filteredReviews.map((r) => (
                    <ReviewCard
                      key={r._id}
                      review={r}
                      onAction={handleReviewAction}
                      isRefreshing={refreshing === r._id}
                      selected={selected.has(r._id)}
                      onSelect={toggleSelect}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </>
        )}

        {/* ── Q&A section ─────────────────────────────────────────────── */}
        {section === "qna" && (
          <Box sx={{ p: 2.5 }}>
            <BulkBar
              count={selected.size}
              onApprove={() => {}}
              onReject={() => {}}
              onClear={() => setSelected(new Set())}
            />
            {loading ? (
              <Stack gap={2}>
                {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
              </Stack>
            ) : qnaDrafts.length === 0 ? (
              <EmptyQueue message="No Q&A drafts pending approval." />
            ) : (
              <Stack gap={2}>
                {qnaDrafts.map((item) => (
                  <QnADraftCard
                    key={item._id}
                    item={item}
                    onAction={handleQnAAction}
                    selected={selected.has(item._id)}
                    onSelect={toggleSelect}
                  />
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Card>

      {/* ── Success toast ───────────────────────────────────────────────── */}
      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message={toast}
        ContentProps={{
          sx: {
            bgcolor: "#1c1917", color: "#fff", borderRadius: "10px",
            fontSize: "0.875rem", fontWeight: 500,
            "& .MuiSnackbarContent-message": { display: "flex", alignItems: "center", gap: 1 },
          },
        }}
      />
    </AdminLayout>
  );
}
