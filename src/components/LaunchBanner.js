/**
 * Grand website launch hero, rendered directly below the navbar (inside <Header />).
 *  - Always visible (no dismiss) and fills the first screen below the navbar.
 *  - Counts down to the launch moment in the INTENDED timezone (India, UTC+05:30), so every visitor
 *    sees the same time left whatever their own clock's timezone.
 *  - Motion (confetti, ribbon shimmer, scissors) is switched off for prefers-reduced-motion in the CSS.
 */
import { useEffect, useMemo, useState } from "react";
import { FiBell } from "react-icons/fi";
import "./LaunchBanner.css";

// 20 Nov 2026, 00:00 India Standard Time (UTC+05:30)
export const LAUNCH_AT = new Date("2026-11-20T00:00:00+05:30");

const pad = (n) => String(n).padStart(2, "0");

function remaining(now) {
  const ms = Math.max(0, LAUNCH_AT.getTime() - now);
  const total = Math.floor(ms / 1000);
  return {
    done: ms === 0,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

// Deterministic (no Math.random) so the layout is stable between renders
const CONFETTI = Array.from({ length: 34 }, (_, i) => ({
  left: `${(i * 29 + 5) % 100}%`,
  w: 6 + ((i * 3) % 6),
  h: 10 + ((i * 7) % 9),
  delay: `${-((i * 1.3) % 11)}s`,
  duration: `${9 + ((i * 5) % 8)}s`,
  hue: i % 3,
}));
const BOKEH = Array.from({ length: 9 }, (_, i) => ({
  left: `${(i * 41 + 8) % 96}%`,
  top: `${(i * 23 + 6) % 88}%`,
  size: 70 + ((i * 37) % 130),
  delay: `${-i * 1.8}s`,
}));

function focusNewsletter() {
  const input = document.querySelector('input[aria-label="Email for newsletter"]');
  if (!input) return;
  input.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => input.focus({ preventScroll: true }), 500);
}

function Scissors() {
  return (
    <svg className="lb-scissors" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="lbGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1b8" /><stop offset=".5" stopColor="#e2b04a" /><stop offset="1" stopColor="#a8741a" />
        </linearGradient>
      </defs>
      <g className="lb-blade lb-blade--a"><path d="M60 62 L104 8 L110 12 L68 70 Z" fill="url(#lbGold)" /><circle cx="42" cy="86" r="14" fill="none" stroke="url(#lbGold)" strokeWidth="7" /><path d="M52 76 L62 64" stroke="url(#lbGold)" strokeWidth="7" strokeLinecap="round" /></g>
      <g className="lb-blade lb-blade--b"><path d="M60 62 L16 8 L10 12 L52 70 Z" fill="url(#lbGold)" /><circle cx="78" cy="86" r="14" fill="none" stroke="url(#lbGold)" strokeWidth="7" /><path d="M68 76 L58 64" stroke="url(#lbGold)" strokeWidth="7" strokeLinecap="round" /></g>
      <circle cx="60" cy="63" r="5" fill="#8a5a10" />
    </svg>
  );
}

export default function LaunchBanner() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000); // always derived from the real clock → no drift
    return () => clearInterval(id);
  }, []);

  const t = useMemo(() => remaining(now), [now]);
  const units = [["Days", t.days], ["Hours", t.hours], ["Minutes", t.minutes], ["Seconds", t.seconds]];
  // Screen readers get a calm once-a-minute summary instead of a ticking clock
  const spoken = `${t.days} days, ${t.hours} hours and ${t.minutes} minutes until the grand website launch on 20 November 2026`;

  return (
    <section className="lb" aria-label="Grand website launch announcement">
      <div className="lb-bokeh" aria-hidden="true">
        {BOKEH.map((b, i) => (
          <i key={i} style={{ left: b.left, top: b.top, width: b.size, height: b.size, animationDelay: b.delay }} />
        ))}
      </div>
      <div className="lb-confetti" aria-hidden="true">
        {CONFETTI.map((c, i) => (
          <i key={i} className={`c${c.hue}`} style={{ left: c.left, width: c.w, height: c.h, animationDelay: c.delay, animationDuration: c.duration }} />
        ))}
      </div>

      <div className="lb-inner">
        {/* Visual: ribbon across a podium that carries the brand logo, with scissors about to cut */}
        <div className="lb-visual" aria-hidden="true">
          <svg className="lb-ribbon" viewBox="0 0 640 460" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="lbRibbon" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#a8741a" /><stop offset=".25" stopColor="#f7dc8a" /><stop offset=".5" stopColor="#c8932c" />
                <stop offset=".75" stopColor="#f7dc8a" /><stop offset="1" stopColor="#a8741a" />
              </linearGradient>
            </defs>
            <path className="lb-ribbon-path" d="M-30 330 C 110 150, 240 330, 330 250 S 520 120, 680 200" fill="none" stroke="url(#lbRibbon)" strokeWidth="38" strokeLinecap="round" />
            <path d="M-30 330 C 110 150, 240 330, 330 250 S 520 120, 680 200" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 14" />
          </svg>
          <div className="lb-scissors-wrap"><Scissors /></div>
          <div className="lb-podium">
            <div className="lb-medal"><img src="/ICS_Logo.jpeg" alt="" width="200" height="200" /></div>
            <div className="lb-cylinder"><span>Launch</span></div>
          </div>
        </div>

        <div className="lb-copy">
          <span className="lb-eyebrow">{t.done ? "We're live" : "You're invited · 20 November 2026"}</span>
          <h2 className="lb-title">
            <span>Grand</span>
            <span>Website Launch</span>
          </h2>
          <p className="lb-tag">{t.done ? "InfinityCraftSpace is now open" : "Something Amazing Is Coming!"}</p>
          <p className="lb-sub">
            {t.done
              ? "Welcome to a new space for creativity — explore handcrafted gifts made with love."
              : "A new space for creativity, discovery and endless possibilities — handcrafted gifts, made with love and delivered across India."}
          </p>

          {!t.done && (
            <div className="lb-clock">
              <div className="lb-timer" role="timer" aria-live="off" aria-label="Time left until launch">
                {units.map(([label, value], i) => (
                  <div className="lb-unit-wrap" key={label}>
                    <div className="lb-unit"><b>{pad(value)}</b><span>{label}</span></div>
                    {i < units.length - 1 && <span className="lb-colon" aria-hidden="true">:</span>}
                  </div>
                ))}
              </div>
              <span className="sr-only" role="status" aria-live="polite" key={`${t.days}-${t.hours}-${t.minutes}`}>{spoken}</span>
            </div>
          )}

          <button type="button" className="lb-cta" onClick={focusNewsletter}>
            <FiBell size={18} aria-hidden="true" /> {t.done ? "Join our newsletter" : "Notify me on launch"}
          </button>
        </div>
      </div>
    </section>
  );
}
