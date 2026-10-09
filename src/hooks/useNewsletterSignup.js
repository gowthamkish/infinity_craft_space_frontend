import { useState, useCallback } from "react";
import { useSubscribeNewsletterMutation } from "../services/engagementApi";
import { errMsg } from "../app/baseApi";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Shared newsletter sign-up state for every form (home page, footer).
 * status: "idle" | "loading" | "success" | "error"
 */
export function useNewsletterSignup(source = "other") {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [subscribe] = useSubscribeNewsletterMutation();

  const submit = useCallback(
    async (e) => {
      e?.preventDefault();
      const value = email.trim();
      if (!EMAIL_RE.test(value)) {
        setStatus("error");
        setMessage("Please enter a valid email address.");
        return;
      }
      setStatus("loading");
      setMessage("");
      try {
        const res = await subscribe({ email: value, source }).unwrap();
        setStatus("success");
        setMessage(res?.message || "Thanks for subscribing!");
        setEmail("");
      } catch (err) {
        setStatus("error");
        setMessage(
          err?.status === 429
            ? "Too many attempts. Please try again in a little while."
            : errMsg(err, "Could not subscribe right now. Please try again."),
        );
      }
    },
    [email, source, subscribe],
  );

  const onChange = useCallback((e) => {
    setEmail(e.target.value);
    setStatus((s) => (s === "loading" ? s : "idle")); // clear a stale error/success once they type again
  }, []);

  return { email, onChange, submit, status, message, loading: status === "loading" };
}
