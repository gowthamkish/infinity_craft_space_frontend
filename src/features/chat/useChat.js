/**
 * useChat — manages message state and streams tokens from the chat SSE endpoint.
 *
 * The chat endpoint is POST /api/chat, which responds with an SSE stream.
 * We use fetch + ReadableStream instead of EventSource because EventSource
 * only supports GET, and we need to POST the message history.
 */

import { useState, useCallback, useRef } from "react";
import { v4 as uuid } from "uuid";

// Must match the axios instance base (VITE_API_URL) so the _csrf cookie
// set by that origin is sent back on this fetch request.
// VITE_API_URL may point to a different host (e.g. production Render URL while
// axios uses localhost), which would put the cookie and the request on different
// origins and break the double-submit CSRF check.
const API_BASE = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || "";
const CHAT_URL = `${API_BASE}/api/chat`;

// Ensure the _csrf cookie is set on the same origin as CHAT_URL.
// We fetch directly (not through the axios instance) so that the cookie is
// issued by and sent back to exactly the same origin — no cross-origin mismatch.
async function ensureCsrf() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/csrf-token`, {
      credentials: "include",
    });
    if (res.ok) {
      const { csrfToken } = await res.json();
      if (csrfToken) sessionStorage.setItem("_csrf_token", csrfToken);
    }
  } catch { /* proceed — backend will reject with 403 if truly broken */ }
}

// POST to the chat endpoint, retrying once on CSRF 403.
async function chatFetch(history, signal) {
  const doFetch = () =>
    fetch(CHAT_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": getCsrfToken(),
      },
      body: JSON.stringify({ messages: history, sessionId: SESSION_ID }),
      signal,
    });

  let res = await doFetch();

  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    if (body.error === "Invalid CSRF token") {
      // Flush stale token, re-fetch, retry once
      sessionStorage.removeItem("_csrf_token");
      await ensureCsrf();
      res = await doFetch();
    }
  }

  return res;
}

// Stable session ID for the lifetime of this browser session
const SESSION_ID = uuid();

// Reads the same token the axios interceptor writes (sessionStorage._csrf_token)
function getCsrfToken() {
  try {
    return sessionStorage.getItem("_csrf_token") || "";
  } catch {
    return "";
  }
}

export function useChat() {
  const [messages, setMessages] = useState([
    {
      id: uuid(),
      role: "assistant",
      content: "Hi! I'm Aria, your Infinity Craft Space assistant 🌸 How can I help you today? You can ask me about our products, customization options, delivery, or anything else!",
      status: "done",
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const abortRef = useRef(null);

  const sendMessage = useCallback(async (text) => {
    if (isStreaming || !text.trim()) return;

    await ensureCsrf();

    const userMsg = { id: uuid(), role: "user", content: text.trim(), status: "done" };
    const assistantId = uuid();
    const assistantMsg = { id: assistantId, role: "assistant", content: "", status: "streaming" };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    // Build the history array Claude needs (only role + content)
    const history = [...messages, userMsg]
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await chatFetch(history, ctrl.signal);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse complete SSE lines
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep last incomplete line

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "text") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + event.text }
                    : m,
                ),
              );
            } else if (event.type === "tool_start") {
              setActiveTool(event.tool);
            } else if (event.type === "tool_end") {
              setActiveTool(null);
            } else if (event.type === "done") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, status: "done" } : m,
                ),
              );
            } else if (event.type === "error") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: event.message || "Something went wrong.", status: "error" }
                    : m,
                ),
              );
            }
          } catch { /* malformed SSE line */ }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, I couldn't connect right now. Please try again.", status: "error" }
            : m,
        ),
      );
    } finally {
      setIsStreaming(false);
      setActiveTool(null);
      abortRef.current = null;
    }
  }, [isStreaming, messages]);

  const clearHistory = useCallback(() => {
    setMessages([
      {
        id: uuid(),
        role: "assistant",
        content: "Hi! I'm Aria 🌸 How can I help you today?",
        status: "done",
      },
    ]);
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isStreaming, activeTool, sendMessage, clearHistory, abort };
}
