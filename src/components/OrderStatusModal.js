import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Stack, Chip, IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const STATUS_CONFIG = {
  confirmed:        { emoji: "✅", label: "Order Confirmed",   color: "#10b981", bg: "#ecfdf5", desc: "Your order has been confirmed and is being prepared."   },
  processing:       { emoji: "⏳", label: "Order in Progress", color: "#6366f1", bg: "#eef2ff", desc: "Our team is carefully packing your items."               },
  shipped:          { emoji: "🚚", label: "Order Shipped",     color: "#3b82f6", bg: "#eff6ff", desc: "Your order is on its way to you!"                         },
  out_for_delivery: { emoji: "🛵", label: "Out for Delivery",  color: "#f59e0b", bg: "#fffbeb", desc: "Your order will be delivered today."                      },
  delivered:        { emoji: "🎉", label: "Order Delivered",   color: "#10b981", bg: "#ecfdf5", desc: "Your order has been delivered. Enjoy!"                    },
  cancelled:        { emoji: "❌", label: "Order Cancelled",   color: "#ef4444", bg: "#fef2f2", desc: "Your order has been cancelled."                           },
  returned:         { emoji: "🔄", label: "Return Initiated",  color: "#f59e0b", bg: "#fffbeb", desc: "Your return request is being processed."                  },
};

export default function OrderStatusModal({ event, onClose }) {
  const navigate    = useNavigate();
  const timerRef    = useRef(null);
  const progressRef = useRef(null);

  const { order, previousStatus } = event || {};
  const cfg     = STATUS_CONFIG[order?.status];
  const prevCfg = previousStatus ? STATUS_CONFIG[previousStatus] : null;

  useEffect(() => {
    if (!cfg) return;
    timerRef.current = setTimeout(onClose, 10_000);
    if (progressRef.current) {
      progressRef.current.style.transition = "width 10s linear";
      requestAnimationFrame(() => {
        if (progressRef.current) progressRef.current.style.width = "0%";
      });
    }
    return () => clearTimeout(timerRef.current);
  }, [cfg, onClose]);

  if (!order || !cfg) return null;

  const shortId = order._id?.toString().slice(-6).toUpperCase();

  return (
    /* Backdrop */
    <Box
      onClick={onClose}
      sx={{
        position: "fixed", inset: 0, zIndex: 2000,
        display: "flex", alignItems: "center", justifyContent: "center",
        bgcolor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        p: 2,
      }}
    >
      {/* Panel */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: "100%", maxWidth: 400, borderRadius: "20px",
          bgcolor: "#fff", overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
        }}
      >
        {/* Progress bar */}
        <Box sx={{ height: 4, bgcolor: "#f3f4f6" }}>
          <Box
            ref={progressRef}
            sx={{ height: "100%", bgcolor: cfg.color, width: "100%", transition: "none", borderRadius: "0 2px 2px 0" }}
          />
        </Box>

        {/* Content */}
        <Box sx={{ px: 3, pt: 3, pb: 3 }}>
          {/* Close */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
            <IconButton size="small" onClick={onClose} aria-label="Close"
              sx={{ color: "#9ca3af", "&:hover": { color: "#374151", bgcolor: "#f3f4f6" } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Emoji */}
          <Box sx={{
            width: 72, height: 72, borderRadius: "50%", mx: "auto", mb: 2,
            bgcolor: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem",
          }}>
            {cfg.emoji}
          </Box>

          {/* Text */}
          <Box sx={{ textAlign: "center", mb: 2.5 }}>
            <Typography variant="caption" sx={{ color: "#9ca3af", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", mb: 0.5 }}>
              Order Update
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#1c1917", mb: 0.75 }}>
              {cfg.label}
            </Typography>
            <Typography variant="body2" sx={{ color: "#6b7280", lineHeight: 1.6 }}>
              {cfg.desc}
            </Typography>
          </Box>

          {/* Status transition */}
          <Stack direction="row" alignItems="center" justifyContent="center" gap={1} sx={{ mb: 1.75, flexWrap: "wrap" }}>
            {prevCfg && (
              <>
                <Chip
                  label={`${prevCfg.emoji} ${previousStatus.replace(/_/g, " ")}`}
                  size="small"
                  sx={{ bgcolor: "#f3f4f6", color: "#6b7280", fontWeight: 500, fontSize: "0.75rem", textTransform: "capitalize" }}
                />
                <Typography sx={{ color: "#9ca3af", fontWeight: 700 }}>→</Typography>
              </>
            )}
            <Chip
              label={`${cfg.emoji} ${order.status.replace(/_/g, " ")}`}
              size="small"
              sx={{ bgcolor: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.color}40`, fontWeight: 700, fontSize: "0.75rem", textTransform: "capitalize" }}
            />
          </Stack>

          {/* Order ID */}
          <Typography sx={{ textAlign: "center", fontSize: "0.75rem", color: "#9ca3af", mb: 2.5 }}>
            Order #{shortId}
          </Typography>

          {/* Actions */}
          <Stack direction="row" gap={1.25}>
            <Button
              fullWidth variant="contained"
              onClick={() => { navigate("/orders"); onClose(); }}
              sx={{
                textTransform: "none", fontWeight: 700, borderRadius: "10px", py: 1,
                bgcolor: cfg.color, "&:hover": { filter: "brightness(0.9)", bgcolor: cfg.color },
                boxShadow: "none",
              }}
            >
              View Order
            </Button>
            <Button
              fullWidth variant="outlined"
              onClick={onClose}
              sx={{
                textTransform: "none", fontWeight: 600, borderRadius: "10px", py: 1,
                borderColor: "#e5e7eb", color: "#6b7280",
                "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
              }}
            >
              Dismiss
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
