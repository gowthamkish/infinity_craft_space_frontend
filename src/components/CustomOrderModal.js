import React, { useEffect, useRef } from "react";
import {
  Box, Typography, Button, Stack, Alert,
} from "@mui/material";

const P = "#8B1A4A";

export default function CustomOrderModal({ customItems, onConfirm, onCancel }) {
  const confirmRef = useRef(null);

  useEffect(() => { confirmRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <Box
      role="dialog"
      aria-modal="true"
      aria-labelledby="com-title"
      onClick={onCancel}
      sx={{
        position: "fixed", inset: 0, zIndex: 2000,
        display: "flex", alignItems: "center", justifyContent: "center",
        bgcolor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        p: 2,
      }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: "100%", maxWidth: 420, borderRadius: "20px",
          bgcolor: "#fff", p: 3,
          boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Icon */}
        <Box sx={{
          width: 64, height: 64, borderRadius: "50%", mx: "auto", mb: 2,
          bgcolor: "rgba(139,26,74,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.75rem",
        }}>
          🧵
        </Box>

        {/* Heading */}
        <Typography id="com-title" variant="h6"
          sx={{ fontWeight: 800, textAlign: "center", color: "#1c1917", mb: 0.75 }}>
          Handcrafted Order Notice
        </Typography>
        <Typography variant="body2"
          sx={{ textAlign: "center", color: "#6b7280", mb: 2.5, lineHeight: 1.6 }}>
          Your cart includes <strong style={{ color: "#1c1917" }}>handcrafted / customized items</strong> that
          require extra care during production.
        </Typography>

        {/* Item list */}
        <Box
          component="ul"
          aria-label="Customized items in your cart"
          sx={{ listStyle: "none", p: 0, m: 0, mb: 2.5 }}
        >
          {customItems.map((item) => (
            <Box
              key={item.product._id}
              component="li"
              sx={{
                display: "flex", alignItems: "center", gap: 1.25,
                px: 1.5, py: 1, borderRadius: "10px",
                bgcolor: "#fdf6ec", mb: 0.75,
                border: "1px solid #f5e1cc",
              }}
            >
              <Typography sx={{ color: P, fontSize: "0.75rem" }}>✦</Typography>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: 500, color: "#1c1917" }}>
                {item.product.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#9ca3af", fontWeight: 600 }}>
                × {item.quantity}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Notice banner */}
        <Alert
          icon={<span style={{ fontSize: "1.1rem" }}>⏳</span>}
          severity="warning"
          sx={{ mb: 2.5, borderRadius: "12px", alignItems: "flex-start" }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#92400e", mb: 0.25 }}>
            Dispatch Timeline: 10–12 Business Days
          </Typography>
          <Typography variant="caption" sx={{ color: "#b45309", lineHeight: 1.5 }}>
            Each piece is handcrafted to order. Once dispatched, standard delivery timelines apply. Thank you for your patience!
          </Typography>
        </Alert>

        {/* Actions */}
        <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
          <Button
            fullWidth variant="outlined"
            onClick={onCancel}
            sx={{
              textTransform: "none", fontWeight: 600, borderRadius: "10px", py: 1,
              borderColor: "#e5e7eb", color: "#6b7280",
              "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
            }}
          >
            ← Back to Cart
          </Button>
          <Button
            ref={confirmRef}
            fullWidth variant="contained"
            onClick={onConfirm}
            sx={{
              textTransform: "none", fontWeight: 700, borderRadius: "10px", py: 1,
              bgcolor: P, "&:hover": { bgcolor: "#6b1238" },
              boxShadow: "none",
            }}
          >
            Got it, Continue →
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
