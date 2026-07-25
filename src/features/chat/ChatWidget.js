/**
 * ChatWidget — floating chat button + panel, available on every page.
 *
 * Styled with the rose/gold brand palette from muiTheme.js.
 * Opens as a slide-in panel anchored bottom-right.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Fab,
  Paper,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Divider,
  Slide,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import MinimizeIcon from "@mui/icons-material/Remove";
import { useChat } from "./useChat";
import ChatMessage from "./ChatMessage";

const PANEL_WIDTH = 360;
const PANEL_HEIGHT = 520;

export default function ChatWidget() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { messages, isStreaming, activeTool, sendMessage, clearHistory } = useChat();

  // Auto-scroll to latest message
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
  }, [input, isStreaming, sendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const unreadCount = messages.filter((m) => m.role === "assistant" && m.status === "done").length - 1;

  return (
    <>
      {/* Floating action button */}
      {!open && (
        <Tooltip title="Chat with Aria" placement="left">
          <Fab
            onClick={() => setOpen(true)}
            sx={{
              position: "fixed",
              bottom: { xs: 72, sm: 32 },
              right: { xs: 16, sm: 32 },
              zIndex: theme.zIndex.snackbar - 1,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              color: "white",
              boxShadow: `0 4px 20px rgba(139,26,74,0.4)`,
              "&:hover": {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, #4a0d25)`,
                boxShadow: `0 6px 24px rgba(139,26,74,0.5)`,
                transform: "scale(1.05)",
              },
              transition: "all 200ms cubic-bezier(0.4,0,0.2,1)",
            }}
            aria-label="Open chat assistant"
          >
            <AutoAwesomeIcon />
          </Fab>
        </Tooltip>
      )}

      {/* Chat panel */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: { xs: 0, sm: 32 },
            right: { xs: 0, sm: 32 },
            width: isMobile ? "100vw" : PANEL_WIDTH,
            height: isMobile ? "100dvh" : PANEL_HEIGHT,
            zIndex: theme.zIndex.snackbar,
            display: "flex",
            flexDirection: "column",
            borderRadius: isMobile ? 0 : "20px",
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.25,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                Aria — Craft Assistant
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontSize: "0.7rem" }}>
                {isStreaming ? "Typing…" : "Online · Usually replies instantly"}
              </Typography>
            </Box>
            <Tooltip title="Clear conversation">
              <IconButton
                size="small"
                onClick={clearHistory}
                sx={{ color: "rgba(255,255,255,0.8)", "&:hover": { color: "white" } }}
                aria-label="Clear chat history"
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {!isMobile && (
              <Tooltip title="Minimize">
                <IconButton
                  size="small"
                  onClick={() => setOpen(false)}
                  sx={{ color: "rgba(255,255,255,0.8)", "&:hover": { color: "white" } }}
                  aria-label="Minimize chat"
                >
                  <MinimizeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Close">
              <IconButton
                size="small"
                onClick={() => setOpen(false)}
                sx={{ color: "rgba(255,255,255,0.8)", "&:hover": { color: "white" } }}
                aria-label="Close chat"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Divider />

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 1.5,
              py: 1.5,
              bgcolor: "background.default",
              display: "flex",
              flexDirection: "column",
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 2 },
            }}
          >
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                activeTool={msg.status === "streaming" ? activeTool : null}
              />
            ))}
            <div ref={messagesEndRef} />
          </Box>

          <Divider />

          {/* Input area */}
          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              bgcolor: "background.paper",
              display: "flex",
              alignItems: "flex-end",
              gap: 0.75,
              flexShrink: 0,
            }}
          >
            <TextField
              inputRef={inputRef}
              fullWidth
              multiline
              maxRows={4}
              size="small"
              placeholder="Ask about products, orders, delivery…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  "& fieldset": { borderColor: "divider" },
                  "&:hover fieldset": { borderColor: "primary.light" },
                  "&.Mui-focused fieldset": { borderColor: "primary.main" },
                },
              }}
              inputProps={{ "aria-label": "Type your message" }}
            />
            <IconButton
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              sx={{
                width: 38,
                height: 38,
                flexShrink: 0,
                background:
                  input.trim() && !isStreaming
                    ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                    : undefined,
                color: input.trim() && !isStreaming ? "white" : "text.disabled",
                borderRadius: "12px",
                transition: "all 150ms",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
              aria-label="Send message"
            >
              <SendIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* Footer branding */}
          <Box sx={{ px: 2, pb: 0.75, bgcolor: "background.paper" }}>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.65rem" }}>
              Powered by Claude AI · Responses may not always be accurate
            </Typography>
          </Box>
        </Paper>
      </Slide>
    </>
  );
}
