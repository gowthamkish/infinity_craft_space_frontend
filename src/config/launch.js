/**
 * Pre-launch lock. Until LAUNCH_AT the whole site shows only the launch banner (navigation is blurred
 * and unreachable). It unlocks by itself at the launch moment, with no redeploy.
 *
 * Team preview: open any URL once with  ?preview=<VITE_LAUNCH_PREVIEW_KEY>  to bypass the lock in that
 * browser (e.g. so an admin can log in).  ?preview=off  restores the lock.
 * NOTE: this is a front-end splash gate, not a security boundary — the API is unchanged.
 */
import { useEffect, useState } from "react";

// 20 Nov 2026, 00:00 India Standard Time (UTC+05:30)
export const LAUNCH_AT = new Date("2026-11-20T00:00:00+05:30");

const PREVIEW_KEY = import.meta.env.VITE_LAUNCH_PREVIEW_KEY || "ics-preview";
const STORAGE_KEY = "ics_launch_preview";

function readBypass() {
  try {
    const params = new URLSearchParams(window.location.search);
    const supplied = params.get("preview");
    if (supplied) {
      if (supplied === PREVIEW_KEY) localStorage.setItem(STORAGE_KEY, "1");
      else if (supplied === "off") localStorage.removeItem(STORAGE_KEY);
      params.delete("preview");
      const qs = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash);
    }
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

const bypass = typeof window !== "undefined" ? readBypass() : false;

export const isLaunchLocked = () => !bypass && Date.now() < LAUNCH_AT.getTime();

/** true while the site is locked; flips to false automatically when the launch time passes */
export function useLaunchLock() {
  const [locked, setLocked] = useState(isLaunchLocked);
  useEffect(() => {
    if (!locked) return undefined;
    const ms = LAUNCH_AT.getTime() - Date.now();
    if (ms <= 0) { setLocked(false); return undefined; }
    // setTimeout caps at ~24.8 days, so re-check periodically instead of one long timer
    const id = setInterval(() => { if (!isLaunchLocked()) setLocked(false); }, 1000);
    return () => clearInterval(id);
  }, [locked]);
  return locked;
}
