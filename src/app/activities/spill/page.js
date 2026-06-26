"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { saveJournalEntry } from "@/lib/supabase"

// ── AI sub-mode definitions ───────────────────────────────────────────────────
// Each mode changes the system prompt (and the mock response style).
const AI_SUBMODES = [
  {
    id: "validate",
    label: "just validate me",
    desc: "mirror my feelings, no advice",
    accent: "#5aaab8",
    iconColor: "#5aaab8",
    icon: "heart",
  },
  {
    id: "honest",
    label: "be honest with me",
    desc: "gently honest, still warm",
    accent: "#8aaa8c",
    iconColor: "#8aaa8c",
    icon: "eye",
  },
  {
    id: "guide",
    label: "guide me through it",
    desc: "soft, optional steps forward",
    accent: "#a8a078",
    iconColor: "#a8a078",
    icon: "compass",
  },
  {
    id: "sit",
    label: "just sit with me",
    desc: "quiet presence, few words",
    accent: "#8898aa",
    iconColor: "#8898aa",
    icon: "moon",
  },
]

// Small icons for each sub-mode card
function SubModeIcon({ type, color }) {
  const s = { fill: "none", stroke: color, strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" }
  if (type === "heart") return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...s}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
  if (type === "eye") return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...s}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
  if (type === "compass") return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...s}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill={color} opacity=".55" stroke="none" />
    </svg>
  )
  if (type === "moon") return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...s}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  )
  return null
}

// Chevron right — used on clickable mode cards
function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="#9ab8c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

// ── Shared nav back button + feelbetter wordmark ──────────────────────────────
function SpillNav({ onBack }) {
  return (
    <nav style={{ display: "flex", alignItems: "center", gap: 16, padding: "28px 40px 0" }}>
      <button
        onClick={onBack}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 40, height: 40, borderRadius: "50%",
          background: "rgba(255,255,255,.6)", backdropFilter: "blur(8px)",
          border: ".5px solid rgba(255,255,255,.8)",
          cursor: "pointer", flexShrink: 0, transition: "background .2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.88)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.6)"}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#2a5a66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>
      <span style={{
        fontFamily: "var(--font-dm-serif), serif",
        fontSize: 18, color: "#1a3a42",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3a8a8f" strokeWidth="1.8" strokeLinecap="round">
          <path d="M2 9c2.4-3 4.3-3 6.7 0s4.3 3 6.7 0 4.3-3 6.6 0" />
          <path d="M2 14.5c2.4-3 4.3-3 6.7 0s4.3 3 6.7 0 4.3-3 6.6 0" />
        </svg>
        feelbetter
      </span>
    </nav>
  )
}

// ── Raindrop icon — used at the top of several views ─────────────────────────
function Raindrop({ fill = "#7ac4d0", opacity = ".65" }) {
  return (
    <svg width="30" height="36" viewBox="0 0 48 58" fill="none">
      <path d="M24 4s-16 18-16 30a16 16 0 0 0 32 0C40 22 24 4 24 4z" fill={fill} opacity={opacity} />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main content — separated so useSearchParams can be wrapped in Suspense
// ─────────────────────────────────────────────────────────────────────────────
function SpillContent() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const { user }    = useAuth()

  // ── View state machine ──
  // "picker" → "ai-submode" → "ai-write"
  // "picker" → "scream"
  const [view,    setView]    = useState("picker")
  const [aiMode,  setAiMode]  = useState(null)  // "validate" | "honest" | "guide" | "sit"

  // ── AI write state ──
  // searchParams.get("prefill") is set when coming from Compass "take to spill"
  const [text,      setText]      = useState(searchParams.get("prefill") || "")
  const [response,  setResponse]  = useState(null)
  const [loading,   setLoading]   = useState(false)

  // ── Scream state ──
  const [screamText,       setScreamText]       = useState("")
  const [screamDissolving, setScreamDissolving] = useState(false)
  const [screamDone,       setScreamDone]       = useState(false)

  // ── Desktop scaling ──
  const [pageScale, setPageScale] = useState(1)

  const responseRef = useRef(null)

  // mood is optional — passed as ?mood=heavy from the dashboard mood overlay
  const mood = searchParams.get("mood") || null

  // Desktop scaling — same formula as dashboard and activities pages
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      setPageScale(w >= 1024 ? Math.min(1, w / 1920) : 1)
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Scroll response into view when it arrives
  useEffect(() => {
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [response])

  // ── Reset everything and return to mode picker ──
  const goToPicker = () => {
    setView("picker")
    setAiMode(null)
    setText("")
    setResponse(null)
    setScreamText("")
    setScreamDone(false)
    setScreamDissolving(false)
  }

  // ── Back button logic — context-aware ──
  const handleNavBack = () => {
    if (view === "picker")    return router.back()
    if (view === "ai-submode") return setView("picker")
    if (view === "ai-write")  return setView("ai-submode")  // go back to sub-mode, keep text
    if (view === "scream")    return setView("picker")
  }

  // ── AI: send text to API ──
  const handleRelease = async () => {
    if (!text.trim() || loading) return
    setLoading(true)
    setResponse(null)

    // Save to journal_entries before calling API — skips silently for guests
    if (user) {
      saveJournalEntry(user.id, { activity: "spill", content: text.trim(), mood })
    }

    try {
      const res = await fetch("/api/spill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), mode: aiMode }),
      })
      const data = await res.json()
      setResponse(data.response)
    } catch {
      setResponse("i'm here. whatever you wrote, i'm holding it gently.")
    } finally {
      setLoading(false)
    }
  }

  // ── Scream: dissolve animation then clear ──
  const handleLetItGo = () => {
    if (!screamText.trim() || screamDissolving) return
    setScreamDissolving(true)
    // After the CSS animation completes, clear and show confirmation
    setTimeout(() => {
      setScreamText("")
      setScreamDissolving(false)
      setScreamDone(true)
    }, 900)
  }

  const canRelease = text.trim().length > 0 && !loading
  const canScream  = screamText.trim().length > 0 && !screamDissolving

  // ── Shared button styles ──
  const primaryBtnStyle = (accent, hue) => ({
    background: `rgba(${hue},.16)`,
    color: accent,
    border: `1.5px solid rgba(${hue},.38)`,
    borderRadius: 30, padding: "14px 52px",
    fontSize: 17, fontWeight: 500, letterSpacing: ".4px",
    fontFamily: "var(--font-dm-sans), sans-serif",
    cursor: "pointer",
    transition: "background .25s, border .25s",
  })

  const currentSubMode = AI_SUBMODES.find(m => m.id === aiMode)

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Mode picker cards ── */
        .spill-mode-card {
          background: rgba(255,255,255,.58);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: .5px solid rgba(255,255,255,.9);
          border-radius: 26px;
          padding: 28px 32px;
          display: flex;
          align-items: center;
          gap: 24px;
          cursor: pointer;
          transition: transform .25s ease, box-shadow .25s ease, background .2s;
          box-shadow: 0 6px 28px rgba(60,120,140,.08);
        }
        .spill-mode-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 52px rgba(60,120,140,.14);
          background: rgba(255,255,255,.76);
        }
        .spill-mode-card.disabled {
          opacity: .5;
          cursor: default;
          pointer-events: none;
        }

        /* ── Sub-mode picker cards ── */
        .spill-submode-card {
          background: rgba(255,255,255,.55);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: .5px solid rgba(255,255,255,.88);
          border-radius: 20px;
          padding: 22px 24px;
          cursor: pointer;
          transition: transform .22s ease, box-shadow .22s ease, background .2s;
          box-shadow: 0 4px 20px rgba(60,120,140,.07);
        }
        .spill-submode-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 40px rgba(60,120,140,.12);
          background: rgba(255,255,255,.74);
        }

        /* ── Textarea placeholder styling ── */
        .spill-textarea::placeholder  { color: rgba(90,138,150,.45); font-style: italic; }
        .scream-textarea::placeholder { color: rgba(110,90,110,.4);  font-style: italic; }

        /* ── Scream dissolve ── */
        @keyframes screamDissolve {
          0%   { opacity: 1; filter: blur(0);   transform: scale(1); }
          50%  { opacity: .5; filter: blur(3px); transform: scale(1.005); }
          100% { opacity: 0; filter: blur(10px); transform: scale(1.02); }
        }
        .scream-dissolving { animation: screamDissolve .85s ease forwards; }

        /* ── Response card entrance ── */
        @keyframes spillFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: none; }
        }
        .spill-response-card { animation: spillFadeUp .5s ease both; }

        /* ── Done card entrance ── */
        @keyframes doneFadeIn {
          from { opacity: 0; transform: scale(.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        .scream-done-card { animation: doneFadeIn .6s ease .1s both; }

        /* ── View entrance ── */
        @keyframes viewFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: none; }
        }
        .view-fade { animation: viewFadeIn .32s ease both; }

        /* ── Loading pulse ── */
        @keyframes softPulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: .5; }
        }
        .loading-text { animation: softPulse 1.8s ease-in-out infinite; }
      `}</style>

      {/* Full-screen aqua background — never tints */}
      <div style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        background: "linear-gradient(165deg,#e6f5f7 0%,#d3edf2 48%,#e8f6f8 100%)",
        minHeight: "100vh",
        color: "#1a3a42",
      }}>
        {/* Desktop scale wrapper */}
        <div style={pageScale < 1 ? {
          transformOrigin: "top left",
          transform: `scale(${pageScale})`,
          width: `${(100 / pageScale).toFixed(3)}vw`,
        } : {}}>

          <SpillNav onBack={handleNavBack} />

          {/* ════════════════════════════════════════════════════════════════
              VIEW 1: MODE PICKER
          ════════════════════════════════════════════════════════════════ */}
          {view === "picker" && (
            <main className="view-fade" style={{ maxWidth: 700, margin: "0 auto", padding: "52px 28px 100px" }}>

              {/* Header */}
              <div style={{ marginBottom: 48 }}>
                <div style={{ marginBottom: 18 }}><Raindrop /></div>
                <h1 style={{
                  fontFamily: "var(--font-dm-serif), serif",
                  fontSize: "clamp(44px,5.5vw,68px)",
                  fontWeight: 400, color: "#0f2e35",
                  letterSpacing: -1.5, lineHeight: 1.02, marginBottom: 14,
                }}>
                  spill.
                </h1>
                <p style={{ fontSize: 18, color: "#5a8a96", fontWeight: 300, lineHeight: 1.65 }}>
                  how do you want to let it out today?
                </p>
              </div>

              {/* Mode cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* ── Mode 1: Talk to AI ── */}
                <div className="spill-mode-card" onClick={() => setView("ai-submode")}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: "rgba(90,170,184,.14)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke="#5aaab8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <line x1="9" y1="10" x2="15" y2="10" />
                      <line x1="9" y1="14" x2="12" y2="14" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 500, color: "#1a3a42", marginBottom: 5 }}>
                      talk to ai
                    </div>
                    <div style={{ fontSize: 14, color: "#5a8a96", fontWeight: 300, lineHeight: 1.5 }}>
                      let it out, receive a warm response
                    </div>
                  </div>
                  <ChevronRight />
                </div>

                {/* ── Mode 2: Talk with Someone — disabled, coming soon ── */}
                <div className="spill-mode-card disabled" style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", top: 14, right: 14,
                    background: "rgba(160,180,188,.22)",
                    color: "#7a9aaa", fontSize: 11, letterSpacing: 1.4,
                    textTransform: "uppercase", padding: "4px 10px",
                    borderRadius: 20, fontWeight: 500,
                  }}>
                    coming soon
                  </span>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: "rgba(160,178,188,.1)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke="#99acb2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 500, color: "#4a6a72", marginBottom: 5 }}>
                      talk with someone
                    </div>
                    <div style={{ fontSize: 14, color: "#7a9aaa", fontWeight: 300, lineHeight: 1.55 }}>
                      anonymous, mood-matched, real human connection — coming soon.
                    </div>
                  </div>
                </div>

                {/* ── Mode 3: Scream Box ── */}
                <div className="spill-mode-card" onClick={() => setView("scream")}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: "rgba(148,130,152,.13)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {/* burst / radial lines icon — feels raw but still soft */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke="#9a8898" strokeWidth="1.8" strokeLinecap="round">
                      <circle cx="12" cy="12" r="3" fill="#9a8898" stroke="none" opacity=".7" />
                      <line x1="12" y1="2"  x2="12" y2="5" />
                      <line x1="12" y1="19" x2="12" y2="22" />
                      <line x1="2"  y1="12" x2="5"  y2="12" />
                      <line x1="19" y1="12" x2="22" y2="12" />
                      <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
                      <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
                      <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" />
                      <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 500, color: "#1a3a42", marginBottom: 5 }}>
                      scream box
                    </div>
                    <div style={{ fontSize: 14, color: "#5a8a96", fontWeight: 300, lineHeight: 1.5 }}>
                      raw release, no record — gone forever.
                    </div>
                  </div>
                  <ChevronRight />
                </div>

              </div>
            </main>
          )}

          {/* ════════════════════════════════════════════════════════════════
              VIEW 2: AI SUB-MODE PICKER
          ════════════════════════════════════════════════════════════════ */}
          {view === "ai-submode" && (
            <main className="view-fade" style={{ maxWidth: 700, margin: "0 auto", padding: "52px 28px 100px" }}>

              {/* Breadcrumb */}
              <p style={{
                fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase",
                color: "#7a9aaa", marginBottom: 28, fontWeight: 500,
              }}>
                spill → talk to ai
              </p>

              <h2 style={{
                fontFamily: "var(--font-dm-serif), serif",
                fontSize: "clamp(30px,3.8vw,48px)",
                fontWeight: 400, color: "#0f2e35",
                letterSpacing: -.8, lineHeight: 1.1, marginBottom: 12,
              }}>
                how do you want me<br />to show up?
              </h2>
              <p style={{ fontSize: 16, color: "#5a8a96", fontWeight: 300, marginBottom: 40 }}>
                this shapes how i listen.
              </p>

              {/* 2-column grid on desktop, 1-column on mobile */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                gap: 14,
              }}>
                {AI_SUBMODES.map(mode => (
                  <div
                    key={mode.id}
                    className="spill-submode-card"
                    onClick={() => { setAiMode(mode.id); setView("ai-write") }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: mode.accent + "20",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <SubModeIcon type={mode.icon} color={mode.accent} />
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 500, color: "#1a3a42" }}>
                        {mode.label}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 13, color: "#7a9aaa", fontWeight: 300,
                      lineHeight: 1.55, paddingLeft: 48,
                    }}>
                      {mode.desc}
                    </div>
                  </div>
                ))}
              </div>
            </main>
          )}

          {/* ════════════════════════════════════════════════════════════════
              VIEW 3: AI WRITE (the spill textarea + response)
          ════════════════════════════════════════════════════════════════ */}
          {view === "ai-write" && (
            <main className="view-fade" style={{ maxWidth: 780, margin: "0 auto", padding: "52px 28px 100px" }}>

              {/* Active sub-mode chip + change link */}
              <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                {currentSubMode && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: currentSubMode.accent + "18",
                    border: `1px solid ${currentSubMode.accent}33`,
                    borderRadius: 20, padding: "6px 14px 6px 10px",
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: currentSubMode.accent + "28",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <SubModeIcon type={currentSubMode.icon} color={currentSubMode.accent} />
                    </div>
                    <span style={{ fontSize: 13, color: currentSubMode.accent, fontWeight: 500 }}>
                      {currentSubMode.label}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => { setView("ai-submode"); setResponse(null) }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, color: "#8a9aaa",
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    textDecoration: "underline", textUnderlineOffset: 3,
                    padding: 0,
                  }}
                >
                  change
                </button>
              </div>

              {/* Heading */}
              <div style={{ marginBottom: 36 }}>
                <div style={{ marginBottom: 16 }}><Raindrop /></div>
                <h2 style={{
                  fontFamily: "var(--font-dm-serif), serif",
                  fontSize: "clamp(40px,5vw,62px)",
                  fontWeight: 400, color: "#0f2e35",
                  letterSpacing: -1.3, lineHeight: 1.03, marginBottom: 12,
                }}>
                  spill.
                </h2>
                <p style={{ fontSize: 17, color: "#5a8a96", fontWeight: 300 }}>
                  let it all out, unfiltered. this page doesn't judge.
                </p>
              </div>

              {/* Textarea card */}
              <div style={{
                background: "rgba(255,255,255,.58)",
                backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
                border: ".5px solid rgba(255,255,255,.92)",
                borderRadius: 28, padding: "6px 6px 16px",
                marginBottom: 20, boxShadow: "0 8px 36px rgba(60,120,140,.09)",
              }}>
                <textarea
                  className="spill-textarea"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="let it out. no one's grading this."
                  rows={11}
                  style={{
                    width: "100%", background: "transparent",
                    border: "none", outline: "none", resize: "vertical",
                    padding: "30px 34px 10px",
                    fontSize: 18, lineHeight: 1.9, color: "#1a3a42",
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontWeight: 300, letterSpacing: ".01em",
                  }}
                />
                {text.length > 0 && (
                  <div style={{ textAlign: "right", paddingRight: 30, fontSize: 12, color: "rgba(90,138,150,.4)" }}>
                    {text.length}
                  </div>
                )}
              </div>

              {/* Release button — hidden once response shows */}
              {!response && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={handleRelease}
                    disabled={!canRelease}
                    style={{
                      background: canRelease ? "rgba(90,160,172,.16)" : "rgba(180,210,218,.1)",
                      color: canRelease ? "#2a6a78" : "#9ab8bf",
                      border: `1.5px solid ${canRelease ? "rgba(90,160,172,.38)" : "rgba(160,196,204,.2)"}`,
                      borderRadius: 30, padding: "14px 52px",
                      fontSize: 17, fontWeight: 500, letterSpacing: ".4px",
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      cursor: canRelease ? "pointer" : "default",
                      transition: "background .25s, color .25s, border .25s",
                    }}
                    onMouseEnter={e => { if (canRelease && !loading) e.currentTarget.style.background = "rgba(90,160,172,.26)" }}
                    onMouseLeave={e => { if (canRelease && !loading) e.currentTarget.style.background = "rgba(90,160,172,.16)" }}
                  >
                    {loading ? <span className="loading-text">...sitting with you</span> : "release"}
                  </button>
                </div>
              )}

              {/* Response card */}
              {response && (
                <div ref={responseRef} className="spill-response-card" style={{
                  marginTop: 44,
                  background: "rgba(255,255,255,.74)",
                  backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
                  border: ".5px solid rgba(255,255,255,.96)",
                  borderRadius: 28, padding: "44px 52px 40px",
                  boxShadow: "0 12px 52px rgba(60,120,140,.11)",
                }}>
                  <div style={{ marginBottom: 26 }}>
                    <svg width="32" height="18" viewBox="0 0 56 22" fill="none"
                      stroke="#7ac4d0" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M2 11c5-9 10-9 15 0s10 9 15 0 5-9 10-6" />
                    </svg>
                  </div>
                  <p style={{
                    fontFamily: "var(--font-dm-serif), serif",
                    fontSize: "clamp(20px,2.3vw,28px)",
                    fontStyle: "italic", fontWeight: 400,
                    color: "#2e5a64", lineHeight: 1.8, margin: 0,
                  }}>
                    {response}
                  </p>
                  <div style={{ marginTop: 44, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                    <button
                      onClick={() => { setResponse(null); setText("") }}
                      style={{
                        background: "rgba(90,160,172,.14)", color: "#2a6a78",
                        border: "1.5px solid rgba(90,160,172,.32)", borderRadius: 24,
                        padding: "11px 34px", fontSize: 15, fontWeight: 500,
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        cursor: "pointer", transition: "background .2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(90,160,172,.24)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(90,160,172,.14)"}
                    >
                      write more
                    </button>
                    <span onClick={goToPicker} style={{ fontSize: 14, color: "#7a9aaa", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
                      try a different mode
                    </span>
                    <span onClick={() => router.push("/dashboard")} style={{ fontSize: 14, color: "#7a9aaa", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
                      back to dashboard
                    </span>
                  </div>
                </div>
              )}
            </main>
          )}

          {/* ════════════════════════════════════════════════════════════════
              VIEW 4: SCREAM BOX
          ════════════════════════════════════════════════════════════════ */}
          {view === "scream" && (
            <main className="view-fade" style={{ maxWidth: 780, margin: "0 auto", padding: "52px 28px 100px" }}>

              {/* Breadcrumb */}
              <p style={{
                fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase",
                color: "#7a9aaa", marginBottom: 28, fontWeight: 500,
              }}>
                spill → scream box
              </p>

              {!screamDone ? (
                <>
                  {/* Heading */}
                  <div style={{ marginBottom: 40 }}>
                    <div style={{ marginBottom: 16 }}>
                      <Raindrop fill="#9a8898" opacity=".55" />
                    </div>
                    <h2 style={{
                      fontFamily: "var(--font-dm-serif), serif",
                      fontSize: "clamp(40px,5vw,62px)",
                      fontWeight: 400, color: "#0f2e35",
                      letterSpacing: -1.3, lineHeight: 1.03, marginBottom: 12,
                    }}>
                      let it go.
                    </h2>
                    <p style={{ fontSize: 17, color: "#6a7a8a", fontWeight: 300, lineHeight: 1.6 }}>
                      raw and unfiltered.{" "}
                      <span style={{ opacity: .7 }}>nothing is saved — it disappears.</span>
                    </p>
                  </div>

                  {/* Scream textarea — wrapped in div that gets the dissolve animation */}
                  <div
                    className={screamDissolving ? "scream-dissolving" : ""}
                    style={{
                      background: "rgba(255,255,255,.52)",
                      backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
                      border: ".5px solid rgba(255,255,255,.88)",
                      borderRadius: 28, padding: "6px 6px 16px",
                      marginBottom: 20, boxShadow: "0 8px 36px rgba(100,80,100,.07)",
                    }}
                  >
                    <textarea
                      className="scream-textarea"
                      value={screamText}
                      onChange={e => { if (!screamDissolving) setScreamText(e.target.value) }}
                      placeholder="scream it. nobody's listening."
                      rows={11}
                      style={{
                        width: "100%", background: "transparent",
                        border: "none", outline: "none", resize: "vertical",
                        padding: "30px 34px 10px",
                        fontSize: 19, lineHeight: 1.85, color: "#2a1a2e",
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        fontWeight: 300, letterSpacing: ".01em",
                      }}
                    />
                  </div>

                  {/* Let it go button */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={handleLetItGo}
                      disabled={!canScream}
                      style={{
                        background: canScream ? "rgba(148,130,152,.16)" : "rgba(200,190,200,.1)",
                        color: canScream ? "#6a5870" : "#b0a8b2",
                        border: `1.5px solid ${canScream ? "rgba(148,130,152,.38)" : "rgba(200,190,200,.2)"}`,
                        borderRadius: 30, padding: "14px 52px",
                        fontSize: 17, fontWeight: 500, letterSpacing: ".4px",
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        cursor: canScream ? "pointer" : "default",
                        transition: "background .25s, color .25s, border .25s",
                      }}
                      onMouseEnter={e => { if (canScream) e.currentTarget.style.background = "rgba(148,130,152,.26)" }}
                      onMouseLeave={e => { if (canScream) e.currentTarget.style.background = "rgba(148,130,152,.16)" }}
                    >
                      let it go.
                    </button>
                  </div>
                </>
              ) : (
                /* ── Confirmation — shown after the scream dissolves ── */
                <div className="scream-done-card" style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", textAlign: "center",
                  padding: "60px 20px",
                }}>
                  <div style={{ marginBottom: 28, opacity: .45 }}>
                    <Raindrop fill="#9a8898" opacity="1" />
                  </div>
                  <p style={{
                    fontFamily: "var(--font-dm-serif), serif",
                    fontSize: "clamp(28px,3.8vw,44px)",
                    fontStyle: "italic", color: "#3a2a42",
                    lineHeight: 1.45, marginBottom: 16,
                  }}>
                    it's gone. you let it go.
                  </p>
                  <p style={{
                    fontSize: 16, color: "#7a7a8a", fontWeight: 300, lineHeight: 1.7,
                    maxWidth: 380, marginBottom: 52,
                  }}>
                    nothing was saved. it was just yours to release.
                  </p>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
                    <button
                      onClick={() => setScreamDone(false)}
                      style={{
                        background: "rgba(148,130,152,.14)", color: "#6a5870",
                        border: "1.5px solid rgba(148,130,152,.32)", borderRadius: 24,
                        padding: "11px 34px", fontSize: 15, fontWeight: 500,
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        cursor: "pointer", transition: "background .2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(148,130,152,.24)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(148,130,152,.14)"}
                    >
                      scream again
                    </button>
                    <span
                      onClick={goToPicker}
                      style={{ fontSize: 14, color: "#7a9aaa", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3, display: "flex", alignItems: "center" }}
                    >
                      try a different mode
                    </span>
                    <span
                      onClick={() => router.push("/dashboard")}
                      style={{ fontSize: 14, color: "#7a9aaa", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3, display: "flex", alignItems: "center" }}
                    >
                      back to dashboard
                    </span>
                  </div>
                </div>
              )}
            </main>
          )}

        </div>
      </div>
    </>
  )
}

// Suspense is required by Next.js App Router when using useSearchParams
// in a component that may be statically rendered at build time.
export default function SpillPage() {
  return (
    <Suspense fallback={null}>
      <SpillContent />
    </Suspense>
  )
}
