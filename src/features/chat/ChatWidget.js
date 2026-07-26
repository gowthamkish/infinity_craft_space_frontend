import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Fab,
  Paper,
  Typography,
  InputBase,
  IconButton,
  Tooltip,
  Slide,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import { useChat } from "./useChat";
import ChatMessage from "./ChatMessage";

/* ── Aria lady avatar — inline SVG, Indian-inspired ─────────────── */
function AriaAvatar({ size = 34, ring = false }) {
  return (
    <Box sx={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
      ...(ring ? { border: "2px solid rgba(255,255,255,0.6)", boxShadow: "0 0 0 2px rgba(201,168,76,0.5)" } : {}),
    }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width={size} height={size}>
        {/* Background circle */}
        <circle cx="40" cy="40" r="40" fill="#F9E4D4"/>

        {/* Hair — back layer */}
        <ellipse cx="40" cy="30" rx="22" ry="24" fill="#1a0a00"/>
        {/* Bun */}
        <circle cx="40" cy="9" r="8" fill="#1a0a00"/>
        <circle cx="40" cy="9" r="5" fill="#2d1100"/>

        {/* Neck */}
        <rect x="34" y="53" width="12" height="10" rx="4" fill="#D4956A"/>

        {/* Face */}
        <ellipse cx="40" cy="40" rx="16" ry="18" fill="#E8A87C"/>

        {/* Forehead bindi */}
        <circle cx="40" cy="25" r="2.2" fill="#8B1A4A"/>
        <circle cx="40" cy="25" r="1" fill="#C9A84C"/>

        {/* Maang tikka chain */}
        <line x1="40" y1="9" x2="40" y2="25" stroke="#C9A84C" strokeWidth="0.8" strokeDasharray="1.5,1"/>

        {/* Eyebrows */}
        <path d="M30 33 Q34 31 38 33" stroke="#3d1f00" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M42 33 Q46 31 50 33" stroke="#3d1f00" strokeWidth="1.8" fill="none" strokeLinecap="round"/>

        {/* Eyes */}
        <ellipse cx="34" cy="36.5" rx="4" ry="3" fill="white"/>
        <ellipse cx="46" cy="36.5" rx="4" ry="3" fill="white"/>
        <circle cx="34.5" cy="37" r="2.2" fill="#2d1100"/>
        <circle cx="46.5" cy="37" r="2.2" fill="#2d1100"/>
        {/* Eye shine */}
        <circle cx="35.4" cy="36.2" r="0.7" fill="white"/>
        <circle cx="47.4" cy="36.2" r="0.7" fill="white"/>
        {/* Eyeliner */}
        <path d="M30 36.5 Q34 34 38 36.5" stroke="#1a0a00" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
        <path d="M42 36.5 Q46 34 50 36.5" stroke="#1a0a00" strokeWidth="0.7" fill="none" strokeLinecap="round"/>

        {/* Nose */}
        <ellipse cx="40" cy="43" rx="1.5" ry="1" fill="#C47A52"/>

        {/* Lips */}
        <path d="M35 48 Q40 51.5 45 48" stroke="#A0392B" strokeWidth="0.5" fill="#C0503E"/>
        <path d="M35 48 Q40 46.5 45 48" stroke="#A0392B" strokeWidth="0.5" fill="#D4614F"/>
        <line x1="35" y1="48" x2="45" y2="48" stroke="#8B1A4A" strokeWidth="0.5"/>

        {/* Cheek blush */}
        <ellipse cx="27" cy="43" rx="4" ry="2.5" fill="rgba(220,100,80,0.18)"/>
        <ellipse cx="53" cy="43" rx="4" ry="2.5" fill="rgba(220,100,80,0.18)"/>

        {/* Ears */}
        <ellipse cx="24" cy="40" rx="3.5" ry="4" fill="#D4956A"/>
        <ellipse cx="56" cy="40" rx="3.5" ry="4" fill="#D4956A"/>

        {/* Jhumka earrings */}
        <circle cx="24" cy="44" r="3" fill="#C9A84C"/>
        <circle cx="24" cy="44" r="1.5" fill="#8B1A4A"/>
        <line x1="22.5" y1="47" x2="22" y2="50" stroke="#C9A84C" strokeWidth="0.8"/>
        <line x1="24" y1="47" x2="24" y2="51" stroke="#C9A84C" strokeWidth="0.8"/>
        <line x1="25.5" y1="47" x2="26" y2="50" stroke="#C9A84C" strokeWidth="0.8"/>
        <circle cx="22" cy="50.5" r="1" fill="#C9A84C"/>
        <circle cx="24" cy="51.5" r="1" fill="#C9A84C"/>
        <circle cx="26" cy="50.5" r="1" fill="#C9A84C"/>

        <circle cx="56" cy="44" r="3" fill="#C9A84C"/>
        <circle cx="56" cy="44" r="1.5" fill="#8B1A4A"/>
        <line x1="54.5" y1="47" x2="54" y2="50" stroke="#C9A84C" strokeWidth="0.8"/>
        <line x1="56" y1="47" x2="56" y2="51" stroke="#C9A84C" strokeWidth="0.8"/>
        <line x1="57.5" y1="47" x2="58" y2="50" stroke="#C9A84C" strokeWidth="0.8"/>
        <circle cx="54" cy="50.5" r="1" fill="#C9A84C"/>
        <circle cx="56" cy="51.5" r="1" fill="#C9A84C"/>
        <circle cx="58" cy="50.5" r="1" fill="#C9A84C"/>

        {/* Saree / top — rose color */}
        <path d="M18 80 Q20 62 28 58 Q34 56 40 57 Q46 56 52 58 Q60 62 62 80 Z" fill="#8B1A4A"/>
        {/* Saree border — gold */}
        <path d="M18 80 Q20 62 28 58" stroke="#C9A84C" strokeWidth="1.5" fill="none"/>
        <path d="M62 80 Q60 62 52 58" stroke="#C9A84C" strokeWidth="1.5" fill="none"/>

        {/* Necklace */}
        <path d="M32 57 Q40 63 48 57" stroke="#C9A84C" strokeWidth="1.2" fill="none"/>
        <circle cx="36" cy="60" r="1.2" fill="#C9A84C"/>
        <circle cx="40" cy="62" r="1.5" fill="#C9A84C"/>
        <circle cx="44" cy="60" r="1.2" fill="#C9A84C"/>
        <circle cx="40" cy="62" r="0.8" fill="#8B1A4A"/>

        {/* Hair highlight */}
        <path d="M25 22 Q30 18 35 20" stroke="#3d1f00" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      </svg>
    </Box>
  );
}

const PANEL_WIDTH  = 370;
const PANEL_HEIGHT = 540;

export default function ChatWidget() {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [open,  setOpen]  = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef    = useRef(null);
  const inputRef          = useRef(null);

  const { messages, isStreaming, activeTool, sendMessage, clearHistory } = useChat();

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
  }, [input, isStreaming, sendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const PRIMARY      = theme.palette.primary.main;
  const PRIMARY_DARK = theme.palette.primary.dark;
  const canSend      = !!input.trim() && !isStreaming;

  return (
    <>
      {/* ── FAB ──────────────────────────────────────────────────── */}
      {!open && (
        <Tooltip title="Chat with Aria" placement="left">
          <Fab
            onClick={() => setOpen(true)}
            aria-label="Open chat assistant"
            sx={{
              position: "fixed",
              bottom: { xs: 76, sm: 32 },
              right:  { xs: 16,  sm: 32 },
              zIndex: theme.zIndex.snackbar - 1,
              background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK})`,
              color: "white",
              width: 56, height: 56,
              boxShadow: "0 4px 20px rgba(139,26,74,0.4)",
              "&:hover": {
                background: `linear-gradient(135deg, ${PRIMARY_DARK}, #4a0d25)`,
                boxShadow: "0 6px 24px rgba(139,26,74,0.5)",
                transform: "scale(1.06)",
              },
              transition: "all 200ms cubic-bezier(0.4,0,0.2,1)",
              p: 0, overflow: "hidden",
            }}
          >
            <AriaAvatar size={56} />
          </Fab>
        </Tooltip>
      )}

      {/* ── Panel ────────────────────────────────────────────────── */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={isMobile ? 0 : 10}
          sx={{
            position: "fixed",
            bottom:   isMobile ? 0    : 32,
            right:    isMobile ? 0    : 32,
            left:     isMobile ? 0    : "auto",
            top:      isMobile ? 0    : "auto",
            width:    isMobile ? "100%" : PANEL_WIDTH,
            height:   isMobile ? "100%" : PANEL_HEIGHT,
            zIndex:   theme.zIndex.snackbar + 10,
            display:  "flex",
            flexDirection: "column",
            borderRadius: isMobile ? 0 : "20px",
            overflow: "hidden",
            // single clean border — no border on mobile (edge-to-edge)
            border: isMobile ? "none" : `1px solid rgba(139,26,74,0.15)`,
          }}
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              flexShrink: 0,
              // iOS status-bar safe area
              pt: isMobile ? "max(1.25rem, env(safe-area-inset-top))" : 1.5,
            }}
          >
            <AriaAvatar size={38} ring />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.2 }} noWrap>
                Aria — Craft Assistant
              </Typography>
              <Typography sx={{ opacity: 0.8, fontSize: "0.7rem", lineHeight: 1 }}>
                {isStreaming ? "Typing…" : "Online · Usually replies instantly"}
              </Typography>
            </Box>

            <Tooltip title="Clear conversation">
              <IconButton size="small" onClick={clearHistory} aria-label="Clear chat"
                sx={{ color: "rgba(255,255,255,0.8)", "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" } }}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Close">
              <IconButton size="small" onClick={() => setOpen(false)} aria-label="Close chat"
                sx={{ color: "rgba(255,255,255,0.8)", "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* ── Messages ───────────────────────────────────────── */}
          <Box sx={{
            flex: 1,
            overflowY: "auto",
            px: { xs: 1.5, sm: 1.5 },
            py: 1.5,
            bgcolor: "#FDF6EC",
            display: "flex",
            flexDirection: "column",
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(0,0,0,0.12)", borderRadius: 2 },
          }}>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                activeTool={msg.status === "streaming" ? activeTool : null}
              />
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* ── Input area ─────────────────────────────────────── */}
          <Box sx={{
            px: 1.5,
            pt: 1,
            pb: isMobile ? "max(0.75rem, env(safe-area-inset-bottom))" : 0.75,
            bgcolor: "background.paper",
            flexShrink: 0,
            borderTop: "1px solid rgba(0,0,0,0.08)",
          }}>
            {/* Single rounded container — replaces TextField to avoid double-border */}
            <Box sx={{
              display: "flex",
              alignItems: "flex-end",
              gap: 0.75,
              border: `1.5px solid`,
              borderColor: "rgba(0,0,0,0.15)",
              borderRadius: "14px",
              bgcolor: "#fff",
              px: 1.5,
              py: 0.75,
              transition: "border-color 150ms",
              "&:focus-within": {
                borderColor: PRIMARY,
                boxShadow: `0 0 0 3px rgba(139,26,74,0.1)`,
              },
            }}>
              <InputBase
                inputRef={inputRef}
                fullWidth
                multiline
                maxRows={isMobile ? 5 : 4}
                placeholder="Ask about products, orders, delivery…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                inputProps={{ "aria-label": "Type your message" }}
                sx={{
                  fontSize: { xs: "1rem", sm: "0.875rem" },
                  lineHeight: 1.5,
                  flex: 1,
                  "& .MuiInputBase-input": {
                    p: 0,
                    "&::placeholder": { color: "rgba(0,0,0,0.38)", opacity: 1 },
                  },
                }}
              />
              <IconButton
                onClick={handleSend}
                disabled={!canSend}
                size="small"
                aria-label="Send message"
                sx={{
                  flexShrink: 0,
                  width: 34,
                  height: 34,
                  mb: 0.25,
                  background: canSend
                    ? `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK})`
                    : "transparent",
                  color: canSend ? "white" : "rgba(0,0,0,0.26)",
                  borderRadius: "10px",
                  transition: "all 150ms",
                  "&:hover": { transform: canSend ? "scale(1.08)" : "none" },
                }}
              >
                <SendIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Box>

            {/* Branding */}
            <Typography sx={{ fontSize: "0.62rem", color: "rgba(0,0,0,0.35)", mt: 0.6, textAlign: "center" }}>
              Powered by Claude AI · Responses may not always be accurate
            </Typography>
          </Box>
        </Paper>
      </Slide>
    </>
  );
}
