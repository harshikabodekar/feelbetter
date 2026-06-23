"use client"; // this page has state, timers and click handlers → client component

import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  MOOD DATA                                                          */
/*  Each mood has two states:                                          */
/*    s1 = "I see you"  (mirrors the feeling)                          */
/*    s2 = "I've got you" (gently shifts to something healing)         */
/*  blob/radius/pos describe the organic card on the dashboard.        */
/* ------------------------------------------------------------------ */
const MOODS = {
  empty: {
    icon: "empty",
    blob: "linear-gradient(155deg,#94a4af,#c6d4dc)",
    radius: "47% 53% 68% 32% / 62% 44% 56% 38%",
    accentDot: "#8a96a3", // used for the sidebar "jump to a feeling" swatch
    pos: { left: 8, top: 62, w: 248, h: 258 },
    s1: { bg: "linear-gradient(180deg,#b8c2cc 0%,#d6dce0 100%)", fg: "#3a4651", accent: "#8a96a3", head: "it's okay to feel nothing right now.", sub: "no task. no fixing. just sit here with the quiet." },
    s2: { bg: "linear-gradient(180deg,#e8dfc9 0%,#f5ecd7 100%)", fg: "#5b4a32", accent: "#c9a96b", head: "something is still here. you are still here.", sub: "warmth seeps in, slowly. nothing to chase. nothing to prove." },
  },
  overwhelmed: {
    icon: "wave",
    blob: "linear-gradient(150deg,#0c6b7a,#1c95a8)",
    radius: "58% 42% 56% 44% / 56% 50% 50% 44%",
    accentDot: "#5eb4c2",
    pos: { left: 300, top: 24, w: 402, h: 268 },
    s1: { bg: "linear-gradient(180deg,#0d4f5c 0%,#1a6b78 100%)", fg: "#e8f4f6", accent: "#5eb4c2", head: "one thing at a time.", sub: "the weight is real. but you don't have to lift it all at once." },
    s2: { bg: "linear-gradient(180deg,#b8e0d4 0%,#d8eee5 100%)", fg: "#2d4a45", accent: "#5fa896", head: "one breath. one thing. you've got this.", sub: "the screen exhales with you. the room widens." },
  },
  okayish: {
    icon: "suncloud",
    blob: "linear-gradient(150deg,#7e8d60,#aebb8a)",
    radius: "52% 48% 60% 40% / 58% 46% 54% 42%",
    accentDot: "#7a8a6f",
    pos: { left: 318, top: 316, w: 252, h: 154 },
    s1: { bg: "linear-gradient(180deg,#a8a89c 0%,#c2c2b4 100%)", fg: "#3f3f36", accent: "#7a8a6f", head: "an overcast kind of afternoon.", sub: "not bad. not bright. just here, and that's enough." },
    s2: { bg: "linear-gradient(180deg,#f5c98f 0%,#fbdcb0 60%,#ffe6c4 100%)", fg: "#5a3b1a", accent: "#e09650", head: "the clouds are parting.", sub: "golden hour finds you. a little amber, a little peach." },
  },
  heavy: {
    icon: "drop",
    blob: "linear-gradient(160deg,#241a5e,#5044a0)",
    radius: "50% 50% 50% 50% / 64% 60% 40% 36%",
    accentDot: "#6b5fa3",
    pos: { left: 24, top: 340, w: 276, h: 236 },
    s1: { bg: "linear-gradient(180deg,#1e1b3a 0%,#2d2655 100%)", fg: "#dcd6f0", accent: "#6b5fa3", head: "cold, still, underwater.", sub: "stay as long as you need. nothing here is asking anything of you." },
    s2: { bg: "linear-gradient(0deg,#d4869a 0%,#a37396 40%,#574a78 100%)", fg: "#fff0f0", accent: "#e8a8b8", head: "you've carried this long enough. set it down for a moment.", sub: "warm light glows from below. the cold loosens its grip." },
  },
  full: {
    icon: "flower",
    blob: "linear-gradient(150deg,#e08a3c,#f6cc8c)",
    radius: "56% 44% 52% 48% / 52% 56% 44% 48%",
    accentDot: "#1f8aa3",
    pos: { left: 588, top: 302, w: 316, h: 222 },
    s1: { bg: "linear-gradient(180deg,#7ed4e6 0%,#b5e8f0 100%)", fg: "#0f3a4a", accent: "#1f8aa3", head: "light and alive.", sub: "bright aqua, open sky. let it spill into everything you do today." },
    s2: { bg: "linear-gradient(135deg,#FFD93D 0%,#FFB347 50%,#FF6B6B 100%)", fg: "#3d1a0d", accent: "#FF6B6B", head: "golden hour, exploding.", sub: "hold this close. you are allowed to be this full." },
  },
};

const MOOD_KEYS = ["empty", "overwhelmed", "okayish", "heavy", "full"];
const LABELS = { empty: "empty", overwhelmed: "overwhelmed", okayish: "okay-ish", heavy: "heavy", full: "full" };

/* ------------------------------------------------------------------ */
/*  Tiny inline SVG icons (kept simple on purpose). `currentColor`     */
/*  means the icon color = the parent element's text color.            */
/* ------------------------------------------------------------------ */
function MoodIcon({ name, size = 76 }) {
  const common = { width: size, height: size, viewBox: "0 0 48 48", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "empty")
    return (
      <svg {...common}>
        <circle cx="24" cy="15" r="6" />
        <circle cx="24" cy="15" r="1.5" fill="currentColor" stroke="none" />
        <path d="M7 30c4-4 7.5-4 11.5 0s7.5 4 11.5 0 7.5-4 11-1.5" />
        <path d="M7 37c4-4 7.5-4 11.5 0s7.5 4 11.5 0 7.5-4 11-1.5" />
      </svg>
    );
  if (name === "wave")
    return (
      <svg {...common} strokeWidth={2.4}>
        <path d="M6 18c4.5-6 9-6 13.5 0s9 6 13.5 0 4.5-6 9-3" />
        <path d="M6 30c4.5-6 9-6 13.5 0s9 6 13.5 0 4.5-6 9-3" />
        <circle cx="22" cy="24" r="1.9" fill="currentColor" stroke="none" />
      </svg>
    );
  if (name === "suncloud")
    return (
      <svg {...common}>
        <circle cx="22" cy="18" r="6.5" />
        <path d="M22 5.5v-2.5M10 18H7.5M34 18h2.5M13.6 9.6l-1.8-1.8M30.4 9.6l1.8-1.8" />
        <path d="M11 36c0-6.2 5-10.5 11.5-10.5S34 29.8 34 36z" fill="currentColor" stroke="none" />
      </svg>
    );
  if (name === "drop")
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path d="M24 7s-10 11-10 18a10 10 0 0 0 20 0c0-7-10-18-10-18z" fill="currentColor" />
        <ellipse cx="24" cy="37" rx="12" ry="3.2" fill="none" stroke="currentColor" strokeWidth="2" opacity=".5" />
      </svg>
    );
  // flower (6 petals + rays)
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <g fill="currentColor">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse key={deg} cx="24" cy="13" rx="4.6" ry="9" transform={`rotate(${deg} 24 24)`} />
        ))}
      </g>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        {[30, 90, 150, 210, 270, 330].map((deg) => (
          <line key={deg} x1="24" y1="6" x2="24" y2="2.5" transform={`rotate(${deg} 24 24)`} />
        ))}
      </g>
      <circle cx="24" cy="24" r="3" fill="#fff" opacity=".5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  DASHBOARD PAGE                                                     */
/* ------------------------------------------------------------------ */
export default function Dashboard() {
  const [now, setNow] = useState("it's 7:05pm");
  const [sub, setSub] = useState("how is your heart settling today?");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anon, setAnon] = useState(false);
  const [breathing, setBreathing] = useState(false);

  // null = dashboard view; otherwise we show that mood's full-screen experience
  const [moodKey, setMoodKey] = useState(null);
  const [moodState, setMoodState] = useState(1); // 1 = "I see you", 2 = "I've got you"

  // Live clock + time-aware sub-greeting, refreshed every 30s
  useEffect(() => {
    function tick() {
      const d = new Date();
      let h = d.getHours();
      const m = d.getMinutes();
      const ap = h >= 12 ? "pm" : "am";
      let hh = h % 12;
      if (hh === 0) hh = 12;
      setNow(`it's ${hh}:${String(m).padStart(2, "0")}${ap}`);

      const tod = h < 12 ? "morning" : h < 17 ? "afternoon" : h < 23 ? "evening" : "late";
      const subs = {
        morning: "how are you waking up today?",
        afternoon: "how's the middle of the day treating you?",
        evening: "how is your heart settling today?",
        late: "it's quiet out there — how are you doing?",
      };
      setSub(subs[tod]);
    }
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  // Anonymous mode swaps the name everywhere → "a soul"
  const name = anon ? "a soul" : "Maya";
  const fullName = anon ? "a soul" : "Maya Chen";
  const initials = anon ? "·" : "MC";

  // Open a mood experience (also closes the drawer if it was open)
  function openMood(key) {
    setMoodKey(key);
    setMoodState(1);
    setDrawerOpen(false);
  }

  // Current mood + active state object (only when a mood is open)
  const mood = moodKey ? MOODS[moodKey] : null;
  const st = mood ? (moodState === 1 ? mood.s1 : mood.s2) : null;

  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans text-[#2f3e45]"
         style={{ background: "linear-gradient(165deg,#e6f5f7 0%,#d3edf2 48%,#e8f6f8 100%)" }}>

      {/* ===== MAIN CONTENT (dashboard stays default, never tinted) ===== */}
      <div className="relative z-10 mx-auto max-w-[1180px] px-14 pt-8">

        {/* navbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button aria-label="menu" onClick={() => setDrawerOpen(true)} className="flex text-[#3a4d55]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="flex text-[#3a8a8f]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 9c2.4-3 4.3-3 6.7 0s4.3 3 6.7 0 4.3-3 6.6 0" /><path d="M2 14.5c2.4-3 4.3-3 6.7 0s4.3 3 6.7 0 4.3-3 6.6 0" /></svg>
              </span>
              <span className="text-[23px] font-semibold tracking-tight">feelbetter</span>
            </div>
          </div>
          <div className="text-[17px] italic text-[#7693a0]">{now}</div>
        </div>

        {/* greeting */}
        <div className="mt-14">
          <div className="font-serif text-[66px] leading-none">hello {name},</div>
          <div className="mt-4 text-[22px] font-light text-[#7c9098]">{sub}</div>
        </div>

        {/* floating-island check-in (big left radius, bleeds off the right edge) */}
        <div className="mt-12 ml-6 p-[46px_60px_60px] shadow-[0_24px_70px_rgba(60,120,140,0.13)] backdrop-blur-xl"
             style={{ marginRight: "-150px", borderRadius: "60px 0 0 60px", background: "linear-gradient(180deg,rgba(255,255,255,.74),rgba(255,255,255,.5))" }}>
          <div className="flex items-center gap-2 text-[12.5px] font-medium tracking-[2.2px] text-[#8aa6ad]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.6-9.4-9C1 8 2.6 4.6 6 4.6c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.4 0 5 3.4 3.4 6.4C19 15.4 12 20 12 20z" /></svg>
            DAILY CHECK-IN
          </div>
          <div className="mt-3.5 font-serif text-[46px] leading-[1.08]">how do you<br />feel right now?</div>
          <div className="mt-3.5 text-[17px] font-light italic text-[#8497a0]">pick one. nothing shifts unless you're ready.</div>

          {/* organic mood-blob cluster (absolute positioned) */}
          <div className="relative mt-9 h-[600px] w-[920px]">
            {MOOD_KEYS.map((key) => {
              const m = MOODS[key];
              return (
                <button
                  key={key}
                  onClick={() => openMood(key)}
                  className="absolute flex flex-col items-center justify-center text-white transition-transform duration-300 hover:scale-[1.04]"
                  style={{
                    left: m.pos.left, top: m.pos.top, width: m.pos.w, height: m.pos.h,
                    borderRadius: m.radius, background: m.blob,
                    boxShadow: "0 20px 44px rgba(40,60,80,.28)",
                  }}
                >
                  <MoodIcon name={m.icon} size={52} />
                  <span className="mt-3 text-[20px]">{LABELS[key]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* breathe card — gentle always-on pulse */}
        <button onClick={() => setBreathing((b) => !b)}
                className="mt-9 flex w-full flex-col items-center rounded-[36px] p-12 shadow-[0_16px_44px_rgba(70,130,150,0.1)] backdrop-blur-md"
                style={{ background: "linear-gradient(180deg,rgba(255,255,255,.62),rgba(255,255,255,.42))" }}>
          <div className="relative flex h-[200px] w-[200px] items-center justify-center">
            <div className="absolute h-[200px] w-[200px] rounded-full" style={{ background: "rgba(150,205,215,.18)" }} />
            <div className="flex h-[200px] w-[200px] animate-fbIdle items-center justify-center rounded-full text-[#f3fbfd] shadow-[0_10px_30px_rgba(120,190,205,.4)]"
                 style={{ background: "radial-gradient(circle at 38% 32%,#bfe2ea,#8fc6d2)" }}>
              <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 9h11a2.5 2.5 0 1 0-2.5-2.5" /><path d="M3 14h14a2.5 2.5 0 1 1-2.5 2.5" /></svg>
            </div>
          </div>
          <div className="mt-6 text-[13px] font-medium tracking-[3px] text-[#7e98a0]">BREATHE</div>
          <div className="mt-2 text-[19px] font-light text-[#566970]">
            {breathing ? "breathe with the circle 🌊" : "tap to begin a 4·7·8 cycle"}
          </div>
        </button>

        {/* whisper a thought */}
        <div className="mt-6 flex items-center gap-6 rounded-[42px] p-[26px_36px] shadow-[0_14px_40px_rgba(70,130,150,0.1)] backdrop-blur-md"
             style={{ background: "linear-gradient(180deg,rgba(255,255,255,.62),rgba(255,255,255,.42))" }}>
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-[#bfe0e8] text-[#3a7e8a]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5c3-1 6-1 8 0 2-1 5-1 8 0v14c-3-1-6-1-8 0-2-1-5-1-8 0V5z" /><path d="M12 5v14" /></svg>
          </div>
          <div className="flex-1">
            <div className="text-[12.5px] font-medium tracking-[2.2px] text-[#8aa6ad]">WHISPER A THOUGHT</div>
            <div className="mt-1 text-[21px] font-light text-[#3c4f57]">no one reads it but you.</div>
          </div>
          <button className="flex-none rounded-[30px] px-7 py-2.5 text-[15px] text-white shadow-[0_8px_20px_rgba(95,160,172,0.35)]"
                  style={{ background: "linear-gradient(135deg,#5fa0ac,#7bbac4)" }}>open</button>
        </div>

        {/* tonight's wind-down */}
        <div className="mt-6 flex items-center gap-7 rounded-[42px] p-[34px_40px] shadow-[0_14px_40px_rgba(70,130,150,0.1)] backdrop-blur-md"
             style={{ background: "linear-gradient(180deg,rgba(255,255,255,.62),rgba(255,255,255,.42))" }}>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[12.5px] font-medium tracking-[2.2px] text-[#8aa6ad]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5z" /></svg>
              TONIGHT'S WIND-DOWN
            </div>
            <div className="mt-3 font-serif text-[32px]">a 9-minute story for sleep</div>
            <div className="mt-2 text-[16px] font-light text-[#7c9098]">"the quiet harbor" · narrated softly</div>
            <div className="mt-5 flex items-center gap-6">
              <button className="flex items-center gap-2.5 rounded-[30px] bg-[#2f3e45] px-6 py-2.5 text-[15px] text-[#eef4f5]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3l1.6 5L19 9.6l-5.4 1.5L12 16l-1.6-4.9L5 9.6l5.4-1.6z" /></svg>
                play
              </button>
              <span className="cursor-pointer text-[15px] text-[#6a838c]">browse library</span>
            </div>
          </div>
          <div className="h-[150px] w-[150px] flex-none rounded-full shadow-[0_14px_34px_rgba(120,180,195,.32)]"
               style={{ background: "radial-gradient(circle at 38% 34%,#cfeaf0,#a6d2dc)" }} />
        </div>

        {/* footer quote (stays neutral — dashboard never changes) */}
        <div className="py-14 text-center text-[16.5px] font-light italic text-[#7c9098]">
          whatever you're feeling, it's welcome here.
        </div>
      </div>

      {/* ===== SIDEBAR (drawer) ===== */}
      {/* dim backdrop */}
      <div onClick={() => setDrawerOpen(false)}
           className={`fixed inset-0 z-40 bg-[rgba(20,45,52,0.32)] transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      {/* panel */}
      <div className={`fixed left-0 top-0 z-50 flex h-full w-[342px] flex-col overflow-y-auto p-[28px_28px_24px] shadow-[24px_0_60px_rgba(40,90,105,0.16)] transition-transform duration-[420ms] ${drawerOpen ? "translate-x-0" : "-translate-x-[112%]"}`}
           style={{ background: "linear-gradient(180deg,#dceef2,#cde7ed)" }}>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex text-[#3a8a8f]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 9c2.4-3 4.3-3 6.7 0s4.3 3 6.7 0 4.3-3 6.6 0" /><path d="M2 14.5c2.4-3 4.3-3 6.7 0s4.3 3 6.7 0 4.3-3 6.6 0" /></svg></span>
            <span className="text-[20px] font-semibold">feelbetter</span>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="flex text-[#5a747c]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg>
          </button>
        </div>

        {/* profile */}
        <div className="mt-8 flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full text-[15px] font-semibold text-white" style={{ background: "radial-gradient(circle at 36% 32%,#bfe2ea,#86c0cd)" }}>{initials}</div>
          <div>
            <div className="text-[17px] font-medium">{fullName}</div>
            <div className="text-[13px] text-[#7c9098]">tap for settings</div>
          </div>
        </div>

        {/* anonymous mode toggle */}
        <button onClick={() => setAnon((a) => !a)} className="mt-7 flex items-center justify-between">
          <span className="flex items-center gap-3 text-[16px] text-[#3c4f57]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 16c0-4 4-7 8-7s8 3 8 7" /><circle cx="12" cy="6" r="3" /></svg>
            anonymous mode
          </span>
          <span className="relative h-6 w-[42px] rounded-full transition-colors duration-300" style={{ background: anon ? "#5b9aa6" : "#c2d2d6" }}>
            <span className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all duration-300" style={{ left: anon ? 21 : 3 }} />
          </span>
        </button>

        {/* jump to a feeling — 5 mood-accent swatches */}
        <div className="mt-7">
          <div className="text-[12px] font-medium tracking-[1.6px] text-[#7e98a0]">JUMP TO A FEELING</div>
          <div className="mt-3 flex gap-3">
            {MOOD_KEYS.map((key) => (
              <button key={key} title={LABELS[key]} onClick={() => openMood(key)}
                      className="h-[34px] w-[34px] rounded-full transition-transform duration-200 hover:scale-110"
                      style={{ background: MOODS[key].accentDot }} />
            ))}
          </div>
        </div>

        {/* last 7 days (recolored with the mood palette) */}
        <div className="mt-6">
          <div className="flex items-center gap-2 text-[13px] text-[#7e98a0]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
            last 7 days
          </div>
          <div className="mt-3.5 flex gap-2.5">
            {["#8a96a3", "#5eb4c2", "#7a8a6f", "#6b5fa3", "#1f8aa3", "#5eb4c2", "#c9a96b"].map((c, i) => (
              <span key={i} className="h-[22px] w-[22px] rounded-full" style={{ background: c }} />
            ))}
          </div>
        </div>

        <div className="mt-6 h-px bg-[rgba(120,150,160,0.22)]" />

        {/* menu */}
        <div className="mt-5 flex flex-col gap-5 text-[16px] text-[#3c4f57]">
          <div className="flex cursor-pointer items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5c3-1 6-1 8 0 2-1 5-1 8 0v14c-3-1-6-1-8 0-2-1-5-1-8 0V5z" /><path d="M12 5v14" /></svg>
            history
          </div>
          <div className="flex cursor-pointer items-center justify-between">
            <span className="flex items-center gap-3"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>privacy lock</span>
            <span className="text-[11.5px] text-[#90a8af]">4-digit PIN</span>
          </div>
          <div>
            <div className="flex items-center gap-3"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V6l10-2v12" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></svg>ambient sound</div>
            <div className="mt-3 flex flex-wrap gap-2 pl-8">
              <span className="rounded-[20px] bg-[#5eb4c2] px-3 py-1 text-[12.5px] text-white">ocean waves</span>
              {["rain", "forest", "silence"].map((s) => (
                <span key={s} className="cursor-pointer rounded-[20px] bg-white/60 px-3 py-1 text-[12.5px] text-[#4a5d64]">{s}</span>
              ))}
            </div>
          </div>
          <div className="flex cursor-pointer items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 8h8M16 8h4M4 16h4M12 16h8" /><circle cx="14" cy="8" r="2.2" /><circle cx="10" cy="16" r="2.2" /></svg>
            settings
          </div>
        </div>

        <div className="min-h-[20px] flex-1" />

        <div className="flex items-center gap-2 rounded-[16px] bg-white/50 p-[12px_15px] text-[13.5px] text-[#46606a]">🌸 you've checked in 4 days this week.</div>

        <button className="mt-4 flex items-center gap-2.5 text-[14px] text-[#90a8af]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 5h5v14h-5" /><path d="M3 12h11M11 8l4 4-4 4" /></svg>
          logout
        </button>
      </div>

      {/* ===== FULL-SCREEN MOOD EXPERIENCE ===== */}
      {mood && st && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-12 text-center"
             style={{ background: st.bg, color: st.fg }}>

          {/* floating particles — only Full · State 2 */}
          {moodKey === "full" && moodState === 2 && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {[
                { l: "12%", t: "76%", s: 10, d: "0s", bg: "rgba(255,255,255,.7)" },
                { l: "30%", t: "90%", s: 7, d: ".8s", bg: "rgba(255,255,255,.6)" },
                { l: "62%", t: "82%", s: 12, d: ".4s", bg: "rgba(255,233,160,.85)" },
                { l: "80%", t: "92%", s: 8, d: "1.2s", bg: "rgba(255,255,255,.65)" },
                { l: "90%", t: "72%", s: 9, d: ".2s", bg: "rgba(255,210,120,.8)" },
              ].map((p, i) => (
                <span key={i} className="absolute animate-fbFloat rounded-full"
                      style={{ left: p.l, top: p.t, width: p.s, height: p.s, background: p.bg, animationDelay: p.d }} />
              ))}
            </div>
          )}

          {/* close */}
          <button onClick={() => setMoodKey(null)} className="absolute right-9 top-7 flex opacity-50">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg>
          </button>

          {/* content — key forces the entry fade to replay on state change */}
          <div key={`${moodKey}-${moodState}`} className="relative flex max-w-[820px] animate-fbRise flex-col items-center">
            <div className="mb-9 flex justify-center" style={{ color: st.accent }}>
              <MoodIcon name={mood.icon} size={80} />
            </div>
            <div className="max-w-[800px] text-[clamp(34px,4.6vw,54px)] font-light leading-[1.12] tracking-[-0.5px]">{st.head}</div>
            <div className="mt-5 max-w-[620px] text-[clamp(16px,2vw,21px)] font-light leading-[1.45] opacity-80">{st.sub}</div>

            <div className="mt-11 flex flex-col items-center gap-4">
              {/* "just sit here" only on Empty · State 1 */}
              {moodKey === "empty" && moodState === 1 && (
                <button onClick={() => setMoodKey(null)} className="rounded-[30px] bg-white/40 px-8 py-3 text-[16px]" style={{ color: st.fg }}>just sit here</button>
              )}

              {/* primary button: State1 advances → State2; State2 closes */}
              <button
                onClick={() => (moodState === 1 ? setMoodState(2) : setMoodKey(null))}
                className="flex items-center gap-2.5 rounded-[34px] px-9 py-[15px] text-[17px] font-medium shadow-[0_12px_32px_rgba(0,0,0,0.14)]"
                style={moodState === 1
                  ? { background: st.accent, color: "#fff" }
                  : { background: "rgba(255,255,255,.32)", color: st.fg }}>
                {moodState === 1 ? "whenever you're ready" : "carry this with me"}
                {moodState === 1 && <span className="text-[16px]">🌸</span>}
              </button>

              {moodState === 1 && <div className="text-[14px] italic opacity-60">no rush. this stays as long as you need.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}