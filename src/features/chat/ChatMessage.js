/**
 * ChatMessage — renders a single message bubble.
 *
 * When the assistant message contains a JSON product list (wrapped in a special
 * marker), it renders inline product cards. Otherwise, it renders text with
 * basic markdown-like formatting (bold, line breaks).
 */

import React, { useMemo } from "react";
import { Box, Typography, Avatar, CircularProgress, Chip } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";

// Render assistant text with **bold** and line breaks
function FormattedText({ text }) {
  const segments = useMemo(() => {
    if (!text) return [];
    return text.split(/(\*\*[^*]+\*\*)/).map((seg, i) => {
      if (seg.startsWith("**") && seg.endsWith("**")) {
        return <strong key={i}>{seg.slice(2, -2)}</strong>;
      }
      return seg.split("\n").map((line, j, arr) => (
        <React.Fragment key={`${i}-${j}`}>
          {line}
          {j < arr.length - 1 && <br />}
        </React.Fragment>
      ));
    });
  }, [text]);

  return <>{segments}</>;
}

function TypingDots() {
  return (
    <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", py: 0.5 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: "primary.main",
            opacity: 0.6,
            animation: "chatDot 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
            "@keyframes chatDot": {
              "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.3 },
              "40%": { transform: "scale(1)", opacity: 0.9 },
            },
          }}
        />
      ))}
    </Box>
  );
}

export default function ChatMessage({ message, activeTool }) {
  const isUser = message.role === "user";
  const isEmpty = !message.content && message.status === "streaming";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        gap: 1,
        mb: 1.5,
        alignItems: "flex-end",
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 28,
          height: 28,
          bgcolor: isUser ? "secondary.main" : "primary.main",
          flexShrink: 0,
        }}
      >
        {isUser ? (
          <PersonIcon sx={{ fontSize: 16 }} />
        ) : (
          <AutoAwesomeIcon sx={{ fontSize: 14 }} />
        )}
      </Avatar>

      {/* Bubble */}
      <Box
        sx={{
          maxWidth: "78%",
          px: 1.5,
          py: 1,
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          bgcolor: isUser ? "primary.main" : "background.paper",
          color: isUser ? "primary.contrastText" : "text.primary",
          border: isUser ? "none" : "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          wordBreak: "break-word",
        }}
      >
        {isEmpty ? (
          activeTool ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <CircularProgress size={12} thickness={5} color="inherit" sx={{ opacity: 0.6 }} />
              <Typography variant="caption" sx={{ opacity: 0.7, fontSize: "0.75rem" }}>
                {toolLabel(activeTool)}
              </Typography>
            </Box>
          ) : (
            <TypingDots />
          )
        ) : (
          <Typography variant="body2" sx={{ fontSize: "0.875rem", lineHeight: 1.55 }}>
            <FormattedText text={message.content} />
            {message.status === "streaming" && (
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: "2px",
                  height: "1em",
                  bgcolor: "primary.main",
                  ml: 0.25,
                  verticalAlign: "text-bottom",
                  animation: "blink 1s step-end infinite",
                  "@keyframes blink": { "50%": { opacity: 0 } },
                }}
              />
            )}
          </Typography>
        )}

        {message.status === "error" && (
          <Chip
            label="retry?"
            size="small"
            variant="outlined"
            color="error"
            sx={{ mt: 0.5, height: 18, fontSize: "0.7rem" }}
          />
        )}
      </Box>
    </Box>
  );
}

function toolLabel(tool) {
  const labels = {
    search_products: "Searching products…",
    get_product_details: "Getting product details…",
    answer_policy_question: "Looking up policy…",
    check_order_status: "Checking order…",
    get_delivery_estimate: "Estimating delivery…",
  };
  return labels[tool] || "Thinking…";
}
