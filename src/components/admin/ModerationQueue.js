import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Stack, Tabs, Tab, Card, CardContent,
  Chip, Button, CircularProgress, Alert, Divider, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip,
} from "@mui/material";
import {
  FiCheckCircle, FiXCircle, FiMessageSquare, FiAlertTriangle,
  FiTrendingUp, FiStar, FiRefreshCw, FiEdit3, FiShield,
} from "react-icons/fi";
import AdminLayout from "./AdminLayout";
import api from "../../api/axios";
import { BRAND } from "../../theme/muiTheme";

const ROSE     = BRAND.rose[800];
const ROSE_900 = BRAND.rose[900] || "#6b1238";
const BORDER   = "#e7e5e4";

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <Stack direction="row" gap={0.25} alignItems="center">
      {[1, 2, 3, 4, 5].map((n) => (
        <FiStar key={n} size={12}
          fill={n <= rating ? "#f59e0b" : "none"}
          color={n <= rating ? "#f59e0b" : "#d1d5db"}
        />
      ))}
    </Stack>
  );
}

// ── Verdict chip ──────────────────────────────────────────────────────────────
function VerdictChip({ verdict }) {
  const map = {
    genuine:    { color: "#15803d", bg: "#dcfce7", label: "Genuine"    },
    suspicious: { color: "#b45309", bg: "#fef3c7", label: "Suspicious" },
    spam:       { color: "#dc2626", bg: "#fee2e2", label: "Spam"       },
  };
  const s = map[verdict] || map.genuine;
  return (
    <Chip label={`AI: ${s.label}`} size="small"
      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.68rem", height: 20, borderRadius: "5px" }}
    />
  );
}

// ── Status chip ───────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const map = {
    approved: { bg: "#dcfce7", color: "#15803d" },
    rejected: { bg: "#fee2e2", color: "#dc2626" },
    pending:  { bg: "#fef3c7", color: "#92400e" },
  };
  const s = map[status] || { bg: "#f1f5f9", color: "#475569" };
  return (
    <Chip label={status} size="small"
      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.65rem", height: 20, borderRadius: "5px", textTransform: "capitalize" }}
    />
  );
}

// ── Small badge pill for tabs / buttons ───────────────────────────────────────
function Pill({ count, active }) {
  if (!count) return null;
  return (
    <Box component="span" sx={{
      ml: 0.75, px: 0.625, display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 18, height: 18, borderRadius: "9px",
      bgcolor: active ? ROSE : "#e7e5e4",
      color:   active ? "#fff" : "#78716c",
      fontSize: "0.6rem", fontWeight: 800, lineHeight: 1,
    }}>
      {count}
    </Box>
  );
}

// ── Draft dialog ──────────────────────────────────────────────────────────────
function DraftDialog({ open, onClose, draft, onApprove, type = "response" }) {
  const [edited, setEdited] = useState(draft || "");
  useEffect(() => setEdited(draft || ""), [draft]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: "0.9375rem", pb: 1 }}>
        {type === "response" ? "Review AI-Drafted Response" : "Review AI-Drafted Answer"}
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
          Edit if needed, then approve to post publicly.
        </Typography>
        <TextField
          multiline fullWidth minRows={4}
          value={edited} onChange={(e) => setEdited(e.target.value)}
          sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.875rem", borderRadius: 2 } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} size="small" color="inherit" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button variant="contained" size="small" onClick={() => onApprove(edited)} disabled={!edited.trim()}
          sx={{ bgcolor: ROSE, textTransform: "none", fontWeight: 600, borderRadius: 1.5, "&:hover": { bgcolor: ROSE_900 } }}
        >
          Approve & Post
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Draft preview box (shared between review + Q&A cards) ────────────────────
function DraftBox({ title, content, extra }) {
  return (
    <Box sx={{ border: `1px dashed ${ROSE}`, borderRadius: 2, p: 2, mb: 2, bgcolor: "rgba(139,26,74,0.03)" }}>
      <Stack direction="row" alignItems="center" gap={0.75} mb={0.75}>
        <FiMessageSquare size={12} color={ROSE} />
        <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: ROSE, letterSpacing: "0.03em", textTransform: "uppercase" }}>
          {title}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "#57534e", lineHeight: 1.65 }}>
        {content}
      </Typography>
      {extra}
    </Box>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────
function ReviewCard({ review, onAction, isRefreshing }) {
  const [draftOpen, setDraftOpen] = useState(false);

  const hasDraft   = review.aiDraftResponse?.status === "pending" && review.aiDraftResponse?.comment;
  const hasInsight = !!review.productInsight;
  const verdict    = review.aiModeration?.verdict;
  const confidence = review.aiModeration?.confidence;

  return (
    <Card elevation={0} sx={{
      border: `1px solid ${BORDER}`, borderRadius: 3,
      opacity: isRefreshing ? 0.5 : 1, transition: "opacity 0.2s",
    }}>
      {/* Card header */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 0 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2} mb={1.25}>
          {/* Left: stars + title + meta */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" gap={1} mb={0.5} flexWrap="wrap">
              <Stars rating={review.rating} />
              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1c1917" }}>
                "{review.title}"
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap">
              <Typography variant="caption" sx={{ color: "#78716c" }}>
                by {review.user?.username || review.user?.email}
              </Typography>
              <Typography variant="caption" sx={{ color: "#d4d0ce" }}>·</Typography>
              <Typography variant="caption" sx={{ color: "#78716c" }}>
                {new Date(review.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </Typography>
              {review.isVerifiedPurchase && (
                <Chip label="Verified" size="small"
                  sx={{ height: 16, fontSize: "0.6rem", fontWeight: 600, bgcolor: "#dcfce7", color: "#15803d", borderRadius: "4px" }}
                />
              )}
            </Stack>
          </Box>

          {/* Right: verdict + confidence + status */}
          <Stack direction="row" gap={0.5} alignItems="center" flexShrink={0} flexWrap="wrap" justifyContent="flex-end">
            {verdict    && <VerdictChip verdict={verdict} />}
            {confidence != null && (
              <Tooltip title="AI confidence" arrow>
                <Chip label={`${Math.round(confidence * 100)}%`} size="small"
                  sx={{ height: 20, fontSize: "0.65rem", borderRadius: "5px", bgcolor: "#f1f5f9", color: "#475569" }}
                />
              </Tooltip>
            )}
            <StatusChip status={review.status} />
          </Stack>
        </Stack>
      </Box>

      {/* Card body */}
      <CardContent sx={{ px: 2.5, pt: 1, pb: 0, "&:last-child": { pb: 0 } }}>
        {/* Comment */}
        <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "#57534e", lineHeight: 1.65, mb: 1.5 }}>
          {review.comment}
        </Typography>

        {/* AI reason */}
        {review.aiModeration?.reason && (
          <Box sx={{ bgcolor: "#fafaf9", border: `1px solid ${BORDER}`, borderRadius: 1.5, px: 1.5, py: 0.875, mb: 1.5 }}>
            <Typography variant="caption" sx={{ color: "#78716c", fontStyle: "italic", lineHeight: 1.6, display: "block" }}>
              <strong style={{ fontStyle: "normal" }}>AI:</strong> {review.aiModeration.reason}
            </Typography>
          </Box>
        )}

        {/* Product insight */}
        {hasInsight && (
          <Alert severity="warning" icon={<FiTrendingUp size={14} />}
            sx={{ mb: 1.5, py: 0.625, borderRadius: 2, "& .MuiAlert-message": { fontSize: "0.8rem" } }}
          >
            <strong>Insight:</strong> {review.productInsight}
          </Alert>
        )}

        {/* Draft response */}
        {hasDraft && (
          <DraftBox title="AI Draft Response" content={review.aiDraftResponse.comment} />
        )}

        <Divider sx={{ borderColor: "#f0eeec", mb: 1.5 }} />

        {/* Actions */}
        <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center" pb={2}>
          {review.status === "pending" && (
            <>
              <Button size="small" variant="contained"
                startIcon={<FiCheckCircle size={13} />}
                onClick={() => onAction(review._id, "approve")}
                sx={{
                  bgcolor: "#15803d", fontSize: "0.78rem", textTransform: "none",
                  fontWeight: 600, py: 0.5, px: 1.5, borderRadius: 1.5,
                  "&:hover": { bgcolor: "#166534" },
                }}
              >
                Approve
              </Button>
              <Button size="small" variant="outlined" color="error"
                startIcon={<FiXCircle size={13} />}
                onClick={() => onAction(review._id, "reject")}
                sx={{ fontSize: "0.78rem", textTransform: "none", fontWeight: 600, py: 0.5, px: 1.5, borderRadius: 1.5 }}
              >
                Reject
              </Button>
            </>
          )}
          {hasDraft && (
            <>
              <Button size="small" variant="outlined"
                startIcon={<FiEdit3 size={13} />}
                onClick={() => setDraftOpen(true)}
                sx={{
                  fontSize: "0.78rem", textTransform: "none", fontWeight: 600,
                  py: 0.5, px: 1.5, borderRadius: 1.5,
                  borderColor: ROSE, color: ROSE,
                  "&:hover": { borderColor: ROSE_900, bgcolor: "rgba(139,26,74,0.04)" },
                }}
              >
                Review Draft
              </Button>
              <Button size="small"
                onClick={() => onAction(review._id, "dismiss-draft")}
                sx={{ fontSize: "0.78rem", textTransform: "none", color: "#a8a29e", py: 0.5, px: 1, borderRadius: 1.5,
                  "&:hover": { bgcolor: "#f5f5f4", color: "#78716c" },
                }}
              >
                Dismiss
              </Button>
            </>
          )}
        </Stack>
      </CardContent>

      <DraftDialog
        open={draftOpen} onClose={() => setDraftOpen(false)}
        draft={review.aiDraftResponse?.comment} type="response"
        onApprove={(edited) => { setDraftOpen(false); onAction(review._id, "approve-draft", { editedComment: edited }); }}
      />
    </Card>
  );
}

// ── Q&A draft card ────────────────────────────────────────────────────────────
function QnADraftCard({ item, onAction }) {
  const [draftOpen, setDraftOpen] = useState(false);
  const draft = item.aiDraftAnswer;
  const high  = draft?.confidence >= 0.7;

  return (
    <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 3 }}>
      <Box sx={{ px: 2.5, pt: 2.5, pb: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2} mb={0.75}>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#1c1917", flex: 1, lineHeight: 1.5 }}>
            Q: {item.question}
          </Typography>
          {draft?.confidence != null && (
            <Chip
              label={`${Math.round(draft.confidence * 100)}% confident`}
              size="small"
              sx={{
                height: 20, fontSize: "0.65rem", fontWeight: 700, flexShrink: 0, borderRadius: "5px",
                bgcolor: high ? "#dcfce7" : "#fef3c7",
                color:   high ? "#15803d" : "#b45309",
              }}
            />
          )}
        </Stack>
        <Typography variant="caption" sx={{ color: "#78716c", display: "block", mb: 1.5 }}>
          on <strong style={{ color: "#1c1917", fontWeight: 600 }}>{item.product?.name}</strong>
          {" · "}
          {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </Typography>
      </Box>

      <CardContent sx={{ px: 2.5, pt: 0, pb: 0, "&:last-child": { pb: 0 } }}>
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

        <Divider sx={{ borderColor: "#f0eeec", mb: 1.5 }} />

        <Stack direction="row" gap={1} alignItems="center" pb={2}>
          <Button size="small" variant="outlined"
            startIcon={<FiEdit3 size={13} />}
            onClick={() => setDraftOpen(true)}
            sx={{
              fontSize: "0.78rem", textTransform: "none", fontWeight: 600,
              py: 0.5, px: 1.5, borderRadius: 1.5,
              borderColor: ROSE, color: ROSE,
              "&:hover": { borderColor: ROSE_900, bgcolor: "rgba(139,26,74,0.04)" },
            }}
          >
            Review & Post
          </Button>
          <Button size="small"
            onClick={() => onAction(item._id, "dismiss")}
            sx={{ fontSize: "0.78rem", textTransform: "none", color: "#a8a29e", py: 0.5, px: 1, borderRadius: 1.5,
              "&:hover": { bgcolor: "#f5f5f4", color: "#78716c" },
            }}
          >
            Dismiss
          </Button>
        </Stack>
      </CardContent>

      <DraftDialog
        open={draftOpen} onClose={() => setDraftOpen(false)}
        draft={draft?.content} type="answer"
        onApprove={(edited) => { setDraftOpen(false); onAction(item._id, "approve", { editedContent: edited }); }}
      />
    </Card>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ message }) {
  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <FiCheckCircle size={36} color="#d4d0ce" style={{ marginBottom: 12 }} />
      <Typography variant="body2" sx={{ color: "#a8a29e" }}>
        {message || "Nothing here — all clear!"}
      </Typography>
    </Box>
  );
}

// ── Tab definitions ───────────────────────────────────────────────────────────
const REVIEW_TABS = [
  { key: "pending",  label: "Pending",  Icon: FiAlertTriangle },
  { key: "drafts",   label: "Drafts",   Icon: FiMessageSquare },
  { key: "flagged",  label: "Flagged",  Icon: FiXCircle       },
  { key: "insights", label: "Insights", Icon: FiTrendingUp    },
];

const EMPTY_MESSAGES = {
  pending:  "No reviews pending moderation.",
  drafts:   "No AI draft responses awaiting approval.",
  flagged:  "No flagged reviews.",
  insights: "No product insights detected yet.",
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ModerationQueue() {
  const [section,    setSection]    = useState("reviews");
  const [reviewTab,  setReviewTab]  = useState("pending");
  const [reviews,    setReviews]    = useState([]);
  const [qnaDrafts,  setQnaDrafts]  = useState([]);
  const [counts,     setCounts]     = useState({});
  const [loading,    setLoading]    = useState(false);
  const [refreshing, setRefreshing] = useState(null);
  const [error,      setError]      = useState(null);

  const fetchReviews = useCallback(async (tab) => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get(`/api/reviews/admin/queue?tab=${tab}&limit=30`);
      setReviews(data.reviews || []);
    } catch (e) { setError(e.response?.data?.error || "Failed to load reviews"); }
    finally     { setLoading(false); }
  }, []);

  const fetchQnADrafts = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get("/api/qna/admin/drafts?limit=30");
      setQnaDrafts(data.items || []);
    } catch (e) { setError(e.response?.data?.error || "Failed to load Q&A drafts"); }
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
        pending:  p.value?.data?.pagination?.total || 0,
        drafts:   d.value?.data?.pagination?.total || 0,
        flagged:  f.value?.data?.pagination?.total || 0,
        qna:      q.value?.data?.pagination?.total || 0,
      });
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  useEffect(() => {
    if (section === "reviews") fetchReviews(reviewTab);
    if (section === "qna")     fetchQnADrafts();
  }, [section, reviewTab, fetchReviews, fetchQnADrafts]);

  const handleRefresh = () => {
    if (section === "reviews") fetchReviews(reviewTab);
    else fetchQnADrafts();
    fetchCounts();
  };

  const handleReviewAction = async (reviewId, action, body = {}) => {
    setRefreshing(reviewId);
    try {
      if (action === "approve" || action === "reject") {
        await api.put(`/api/reviews/${reviewId}/moderate`, { action });
      } else if (action === "approve-draft") {
        await api.post(`/api/reviews/${reviewId}/approve-draft`, body);
      } else if (action === "dismiss-draft") {
        await api.post(`/api/reviews/${reviewId}/dismiss-draft`);
      }
      await fetchReviews(reviewTab);
      await fetchCounts();
    } catch (e) { setError(e.response?.data?.error || "Action failed"); }
    finally     { setRefreshing(null); }
  };

  const handleQnAAction = async (qnaId, action, body = {}) => {
    try {
      if (action === "approve") await api.post(`/api/qna/${qnaId}/approve-ai-answer`, body);
      else if (action === "dismiss") await api.post(`/api/qna/${qnaId}/dismiss-ai-answer`);
      await fetchQnADrafts();
      await fetchCounts();
    } catch (e) { setError(e.response?.data?.error || "Action failed"); }
  };

  const reviewsBadge = (counts.pending || 0) + (counts.drafts || 0);

  return (
    <AdminLayout>

      {/* ── Page header ── */}
      <Stack
        direction="row" alignItems="flex-start" justifyContent="space-between"
        flexWrap="wrap" gap={2} sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 0.5 }}>
            <FiShield size={22} color={ROSE} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#1c1917", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
              AI Moderation Queue
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: "#57534e" }}>
            Review AI moderation results, approve drafts, and monitor product insights.
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FiRefreshCw size={13} />}
          onClick={handleRefresh}
          sx={{
            borderColor: BORDER, color: "#57534e", textTransform: "none",
            fontSize: "0.8125rem", fontWeight: 500, borderRadius: 2,
            "&:hover": { borderColor: "#c4c0bc", bgcolor: "#f5f5f4" },
          }}
        >
          Refresh
        </Button>
      </Stack>

      {/* ── Error ── */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2.5, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* ── Section switcher + content card ── */}
      <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 3 }}>

        {/* Section header */}
        <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${BORDER}` }}>
          <Stack direction="row" alignItems="center" gap={1}>
            {[
              { key: "reviews", label: "Reviews",    count: reviewsBadge },
              { key: "qna",     label: "Q&A Drafts", count: counts.qna || 0 },
            ].map((s) => {
              const active = section === s.key;
              return (
                <Button
                  key={s.key}
                  size="small"
                  onClick={() => setSection(s.key)}
                  variant={active ? "contained" : "text"}
                  disableElevation
                  sx={{
                    textTransform: "none",
                    fontWeight: active ? 700 : 500,
                    fontSize: "0.8125rem",
                    py: 0.5,
                    px: 1.5,
                    borderRadius: 1.5,
                    ...(active
                      ? { bgcolor: ROSE, color: "#fff", "&:hover": { bgcolor: ROSE_900 } }
                      : { color: "#78716c", "&:hover": { bgcolor: "#f5f5f4", color: "#1c1917" } }),
                  }}
                >
                  {s.label}
                  <Pill count={s.count} active={active} />
                </Button>
              );
            })}
          </Stack>
        </Box>

        {/* ── Reviews section ── */}
        {section === "reviews" && (
          <>
            {/* Review sub-tabs */}
            <Box sx={{ borderBottom: `1px solid ${BORDER}`, px: 0.5 }}>
              <Tabs
                value={reviewTab}
                onChange={(_, v) => setReviewTab(v)}
                sx={{
                  minHeight: 42,
                  "& .MuiTabs-indicator": { bgcolor: ROSE, height: 2 },
                  "& .MuiTab-root": {
                    textTransform: "none", fontSize: "0.8125rem",
                    fontWeight: 500, minHeight: 42, color: "#78716c",
                    px: 2, py: 0,
                    "&.Mui-selected": { color: ROSE, fontWeight: 700 },
                  },
                }}
              >
                {REVIEW_TABS.map(({ key, label, Icon }) => {
                  const active = reviewTab === key;
                  return (
                    <Tab
                      key={key} value={key}
                      label={
                        <Stack direction="row" alignItems="center" gap={0.75}>
                          <Icon size={13} />
                          {label}
                          <Pill count={counts[key]} active={active} />
                        </Stack>
                      }
                    />
                  );
                })}
              </Tabs>
            </Box>

            {/* Review list */}
            <Box sx={{ p: 2.5 }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                  <CircularProgress size={30} sx={{ color: ROSE }} />
                </Box>
              ) : reviews.length === 0 ? (
                <EmptyState message={EMPTY_MESSAGES[reviewTab]} />
              ) : (
                <Stack gap={2}>
                  {reviews.map((r) => (
                    <ReviewCard
                      key={r._id}
                      review={r}
                      onAction={handleReviewAction}
                      isRefreshing={refreshing === r._id}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </>
        )}

        {/* ── Q&A section ── */}
        {section === "qna" && (
          <Box sx={{ p: 2.5 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={30} sx={{ color: ROSE }} />
              </Box>
            ) : qnaDrafts.length === 0 ? (
              <EmptyState message="No Q&A drafts pending approval." />
            ) : (
              <Stack gap={2}>
                {qnaDrafts.map((item) => (
                  <QnADraftCard key={item._id} item={item} onAction={handleQnAAction} />
                ))}
              </Stack>
            )}
          </Box>
        )}

      </Card>
    </AdminLayout>
  );
}
