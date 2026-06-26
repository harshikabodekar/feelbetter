"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { MOOD_ACTIVITIES, ACTIVITY_MAP } from "@/app/activities/data"
import { saveMood, fetchLast7Days, fetchJournalEntries, fetchVoiceNotes, getSignedUrl } from "@/lib/supabase"

/* ── Mood overlay data (state 1 → state 2) ──────────────────── */
const MOOD_SCREENS = {
  empty: {
    icon: "empty",
    s1: { bg: "linear-gradient(180deg,#b8c2cc 0%,#d6dce0 100%)", fg: "#3a4651", accent: "#8a96a3",
          head: "it's okay to feel nothing right now.",
          sub: "no task. no fixing. just sit here with the quiet.", showSit: true },
    s2: { bg: "linear-gradient(180deg,#e8dfc9 0%,#f5ecd7 100%)", fg: "#5b4a32", accent: "#c9a96b",
          head: "something is still here. you are still here.",
          sub: "warmth seeps in, slowly. nothing to chase. nothing to prove." },
  },
  overwhelmed: {
    icon: "wave",
    s1: { bg: "linear-gradient(180deg,#0d4f5c 0%,#1a6b78 100%)", fg: "#e8f4f6", accent: "#5eb4c2",
          head: "one thing at a time.",
          sub: "the weight is real. but you don't have to lift it all at once." },
    s2: { bg: "linear-gradient(180deg,#b8e0d4 0%,#d8eee5 100%)", fg: "#2d4a45", accent: "#5fa896",
          head: "one breath. one thing. you've got this.",
          sub: "the screen exhales with you. the room widens." },
  },
  okayish: {
    icon: "suncloud",
    s1: { bg: "linear-gradient(180deg,#a8a89c 0%,#c2c2b4 100%)", fg: "#3f3f36", accent: "#7a8a6f",
          head: "an overcast kind of afternoon.",
          sub: "not bad. not bright. just here, and that's enough." },
    s2: { bg: "linear-gradient(180deg,#f5c98f 0%,#fbdcb0 60%,#ffe6c4 100%)", fg: "#5a3b1a", accent: "#e09650",
          head: "the clouds are parting.",
          sub: "golden hour finds you. a little amber, a little peach." },
  },
  heavy: {
    icon: "drop",
    s1: { bg: "linear-gradient(180deg,#1e1b3a 0%,#2d2655 100%)", fg: "#dcd6f0", accent: "#6b5fa3",
          head: "cold, still, underwater.",
          sub: "stay as long as you need. nothing here is asking anything of you." },
    s2: { bg: "linear-gradient(0deg,#d4869a 0%,#a37396 40%,#574a78 100%)", fg: "#fff0f0", accent: "#e8a8b8",
          head: "you've carried this long enough. set it down for a moment.",
          sub: "warm light glows from below. the cold loosens its grip." },
  },
  full: {
    icon: "flower",
    s1: { bg: "linear-gradient(180deg,#7ed4e6 0%,#b5e8f0 100%)", fg: "#0f3a4a", accent: "#1f8aa3",
          head: "light and alive.",
          sub: "bright aqua, open sky. let it spill into everything you do today." },
    s2: { bg: "linear-gradient(135deg,#FFD93D 0%,#FFB347 50%,#FF6B6B 100%)", fg: "#3d1a0d", accent: "#FF6B6B",
          head: "golden hour, exploding.",
          sub: "hold this close. you are allowed to be this full.", showParticles: true },
  },
}

/* ── Overlay mood icons ─────────────────────────────────────── */
function OverlayIcon({ icon, color }) {
  if (icon === "empty") return (
    <svg width="76" height="76" viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="15" r="6"/>
      <circle cx="24" cy="15" r="1.5" fill={color} stroke="none"/>
      <path d="M7 30c4-4 7.5-4 11.5 0s7.5 4 11.5 0 7.5-4 11-1.5"/>
      <path d="M7 37c4-4 7.5-4 11.5 0s7.5 4 11.5 0 7.5-4 11-1.5"/>
    </svg>
  )
  if (icon === "wave") return (
    <svg width="82" height="82" viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18c4.5-6 9-6 13.5 0s9 6 13.5 0 4.5-6 9-3"/>
      <path d="M6 30c4.5-6 9-6 13.5 0s9 6 13.5 0 4.5-6 9-3"/>
      <circle cx="22" cy="24" r="1.9" fill={color} stroke="none"/>
    </svg>
  )
  if (icon === "suncloud") return (
    <svg width="80" height="80" viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="22" cy="18" r="6.5"/>
      <path d="M22 5.5v-2.5M10 18H7.5M34 18h2.5M13.6 9.6l-1.8-1.8M30.4 9.6l1.8-1.8"/>
      <path d="M11 36c0-6.2 5-10.5 11.5-10.5S34 29.8 34 36z" fill={color} stroke="none"/>
    </svg>
  )
  if (icon === "drop") return (
    <svg width="74" height="74" viewBox="0 0 48 48" fill="none">
      <path d="M24 7s-10 11-10 18a10 10 0 0 0 20 0c0-7-10-18-10-18z" fill={color}/>
      <ellipse cx="24" cy="37" rx="12" ry="3.2" stroke={color} strokeWidth="2" opacity=".5"/>
    </svg>
  )
  if (icon === "flower") return (
    <svg width="84" height="84" viewBox="0 0 48 48" fill="none">
      <g fill={color}>
        <ellipse cx="24" cy="13" rx="4.6" ry="9"/>
        <ellipse cx="24" cy="13" rx="4.6" ry="9" transform="rotate(60 24 24)"/>
        <ellipse cx="24" cy="13" rx="4.6" ry="9" transform="rotate(120 24 24)"/>
        <ellipse cx="24" cy="13" rx="4.6" ry="9" transform="rotate(180 24 24)"/>
        <ellipse cx="24" cy="13" rx="4.6" ry="9" transform="rotate(240 24 24)"/>
        <ellipse cx="24" cy="13" rx="4.6" ry="9" transform="rotate(300 24 24)"/>
      </g>
      <circle cx="24" cy="24" r="3" fill="rgba(255,255,255,.5)"/>
    </svg>
  )
  return null
}

/* ── Desktop organic blob definitions ───────────────────────── */
const DESKTOP_BLOBS = [
  { id: "overwhelmed", label: "overwhelmed", iconSize: 58,
    left: 300, top: 24,  width: 402, height: 268,
    borderRadius: "58% 42% 56% 44%/56% 50% 50% 44%",
    background: "linear-gradient(150deg,#0c6b7a,#1c95a8)",
    shadow: "0 22px 48px rgba(12,107,122,.34)", color: "#eafbfe" },
  { id: "empty",       label: "empty",       iconSize: 50,
    left: 8,   top: 62,  width: 248, height: 258,
    borderRadius: "47% 53% 68% 32%/62% 44% 56% 38%",
    background: "linear-gradient(155deg,#94a4af,#c6d4dc)",
    shadow: "0 18px 40px rgba(120,140,155,.3)", color: "#fbfdfe" },
  { id: "heavy",       label: "heavy",       iconSize: 46,
    left: 24,  top: 340, width: 276, height: 236,
    borderRadius: "50% 50% 50% 50%/64% 60% 40% 36%",
    background: "linear-gradient(160deg,#241a5e,#5044a0)",
    shadow: "0 20px 46px rgba(36,26,94,.4)", color: "#efeaff" },
  { id: "okayish",     label: "okay-ish",    iconSize: 42,
    left: 318, top: 316, width: 252, height: 154,
    borderRadius: "52% 48% 60% 40%/58% 46% 54% 42%",
    background: "linear-gradient(150deg,#7e8d60,#aebb8a)",
    shadow: "0 18px 40px rgba(126,141,96,.34)", color: "#fbfdf6" },
  { id: "full",        label: "full",        iconSize: 48,
    left: 588, top: 302, width: 316, height: 222,
    borderRadius: "56% 44% 52% 48%/52% 56% 44% 48%",
    background: "linear-gradient(150deg,#e08a3c,#f6cc8c)",
    shadow: "0 20px 46px rgba(224,138,60,.36)", color: "#fffaf2" },
]

/* ── Desktop blob SVG icons ─────────────────────────────────── */
function BlobIcon({ id, size: s }) {
  if (id === "overwhelmed") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M3 10c2-2.6 3.7-2.6 5.5 0s3.7 2.6 5.5 0 3.7-2.6 5.5 0"/>
      <path d="M3 15c2-2.6 3.7-2.6 5.5 0s3.7 2.6 5.5 0 3.7-2.6 5.5 0"/>
    </svg>
  )
  if (id === "empty") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="12" cy="8" r="3.2"/>
      <path d="M4 16c2.2-2.6 4-2.6 6.2 0s4 2.6 6.2 0 4-2.6 5.6-1"/>
    </svg>
  )
  if (id === "heavy") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3s-6 6.4-6 10.4a6 6 0 0 0 12 0C18 9.4 12 3 12 3z"/>
      <path d="M7.5 20.5h9"/>
    </svg>
  )
  if (id === "okayish") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="12" cy="11" r="3.4"/>
      <path d="M12 3.5v2.2M5.2 6.2l1.5 1.5M18.8 6.2l-1.5 1.5M3.5 18h17"/>
    </svg>
  )
  if (id === "full") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="12" cy="12" r="3.6"/>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>
    </svg>
  )
  return null
}

const MOOD_COLORS = {
  empty: "#8a9aa8", overwhelmed: "#5eb4c2",
  okayish: "#7a8a6f", heavy: "#6b5fa3", full: "#e08a3c",
}

// ── Entries panel helpers ─────────────────────────────────────────────────────

// "Jun 23, 9:34pm" — date + time in one readable string
function fmtDate(iso) {
  const d    = new Date(iso)
  const date = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
  const h    = d.getHours(), m = d.getMinutes()
  const ampm = h >= 12 ? "pm" : "am"
  const h12  = h % 12 || 12
  return `${date}, ${h12}:${m < 10 ? "0" + m : m}${ampm}`
}

// Clickable activity card for the Level 1 "home" view — mirrors the activities page style
function EntriesActivityCard({ label, desc, accent, glow, icon, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(255,255,255,.82)" : "rgba(255,255,255,.62)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        border: ".5px solid rgba(255,255,255,.9)",
        borderRadius: 26, padding: "28px 22px 22px",
        cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "flex-start",
        transform: hovered ? "translateY(-5px)" : "none",
        boxShadow: hovered
          ? `0 18px 48px ${glow}, 0 6px 16px rgba(0,0,0,.06)`
          : "0 4px 18px rgba(60,120,140,.07)",
        transition: "transform .25s ease, box-shadow .25s ease, background .2s",
        minHeight: 190,
      }}
    >
      {/* Icon circle */}
      <div style={{
        width: 52, height: 52, borderRadius: "50%",
        background: hovered ? accent + "44" : accent + "28",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 18, color: accent,
        transition: "background .25s",
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 18, fontWeight: 500, color: "#1a3a42", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 300, color: "#5a8080", lineHeight: 1.55, flex: 1 }}>
        {desc}
      </div>
      <div style={{
        marginTop: 18, display: "flex", alignItems: "center", gap: 6,
        fontSize: 13, color: accent, fontWeight: 400,
      }}>
        view entries
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </div>
  )
}

// Small circular refresh button used at the top of each Level 2 view
function PanelRefreshButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="refresh"
      style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "rgba(255,255,255,.5)", backdropFilter: "blur(8px)",
        border: ".5px solid rgba(255,255,255,.85)", borderRadius: 20,
        padding: "9px 18px", cursor: "pointer", fontSize: 13,
        color: "#6a9aaa", fontFamily: "var(--font-dm-sans), sans-serif",
        flexShrink: 0, transition: "background .2s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.82)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.5)"}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 4v6h6M23 20v-6h-6"/>
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
      </svg>
      refresh
    </button>
  )
}

// Loading placeholders while entries fetch
function EntryShimmer() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          background: "rgba(255,255,255,.42)", borderRadius: 18, height: 90,
          animation: "epShimmer 1.8s ease-in-out infinite",
          animationDelay: `${i * 0.15}s`,
        }} />
      ))}
    </div>
  )
}

// Empty state card with a heading and optional sub-line
function PanelEmptyState({ text, sub }) {
  return (
    <div style={{
      background: "rgba(255,255,255,.5)",
      backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
      border: ".5px solid rgba(255,255,255,.9)",
      borderRadius: 22, padding: "36px 28px", textAlign: "center",
    }}>
      <p style={{
        fontFamily: "var(--font-dm-serif), serif",
        fontSize: 20, fontStyle: "italic", color: "#6a9aaa",
        lineHeight: 1.6, margin: 0,
      }}>{text}</p>
      {sub && (
        <p style={{ marginTop: 8, fontSize: 14, color: "#8aaab2", fontWeight: 300 }}>{sub}</p>
      )}
    </div>
  )
}

// Section label with an inline SVG icon — used in Pages Level 2 view
function PanelSectionLabel({ icon, color, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
      {icon === "book" && (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" opacity=".85">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      )}
      {icon === "mic" && (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" opacity=".85">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8"  y1="23" x2="16" y2="23"/>
        </svg>
      )}
      <span style={{
        fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase",
        color: "#8a9090", fontWeight: 600,
      }}>{text}</span>
    </div>
  )
}

// A single journal entry card — mood dot + date + content preview
function EntryCard({ entry }) {
  const preview = (entry.content || "").slice(0, 240)
    + ((entry.content || "").length > 240 ? "…" : "")
  return (
    <div style={{
      background: "rgba(255,255,255,.58)",
      backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
      border: ".5px solid rgba(255,255,255,.9)",
      borderRadius: 18, padding: "18px 22px",
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 11, flexWrap: "wrap", gap: 8 }}>
        {entry.mood && (
          <span style={{
            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
            background: MOOD_COLORS[entry.mood] || "#ccc",
            display: "inline-block",
          }} title={entry.mood} />
        )}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#9aacb0", whiteSpace: "nowrap" }}>
          {fmtDate(entry.created_at)}
        </span>
      </div>
      <p style={{ fontSize: 15, fontWeight: 300, color: "#2a3838", lineHeight: 1.8, margin: 0 }}>
        {preview}
      </p>
    </div>
  )
}

// Voice note card — generates signed URL lazily; shows audio player on success
function VoiceNoteCard({ note }) {
  const [url,        setUrl]        = useState(null)
  const [urlLoading, setUrlLoading] = useState(true)

  useEffect(() => {
    getSignedUrl(note.file_path)
      .then(signed => {
        if (!signed) console.warn('[feelbetter] VoiceNoteCard: null URL for', note.file_path)
        setUrl(signed)
      })
      .catch(err => console.error('[feelbetter] VoiceNoteCard getSignedUrl:', err))
      .finally(() => setUrlLoading(false))
  }, [note.file_path])

  return (
    <div style={{
      background: "rgba(255,255,255,.58)",
      backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
      border: ".5px solid rgba(255,255,255,.9)",
      borderRadius: 18, padding: "18px 22px",
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        {note.mood && (
          <span style={{
            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
            background: MOOD_COLORS[note.mood] || "#ccc",
            display: "inline-block",
          }} title={note.mood} />
        )}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#9aacb0", whiteSpace: "nowrap" }}>
          {fmtDate(note.created_at)}
        </span>
      </div>
      {urlLoading
        ? <p style={{ fontSize: 13, color: "#9aacb0", fontStyle: "italic" }}>loading audio...</p>
        : url
          ? <audio src={url} controls style={{ width: "100%", borderRadius: 8, outline: "none" }} />
          : <p style={{ fontSize: 13, color: "#9a8090", fontStyle: "italic" }}>couldn&apos;t load this recording</p>
      }
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Full-screen "your entries" panel — 2-level navigation:
//   Level 1 ("home")    — activity cards: Spill, Pages, Compass
//   Level 2 ("spill")   — all spill journal_entries
//   Level 2 ("pages")   — pages-write journal_entries + voice_notes
//   Level 2 ("compass") — compass journal_entries (reflection summaries)
// Renders outside the scaled fb-root so position:fixed covers the true viewport.
// ─────────────────────────────────────────────────────────────────────────────
function EntriesPanel({ userId, onClose, pageScale }) {
  // Drives the two-level nav
  const [panelView, setPanelView] = useState("home")

  // ── Spill ──
  const [spillLoading, setSpillLoading] = useState(false)
  const [spillEntries, setSpillEntries] = useState([])
  const [spillKey,     setSpillKey]     = useState(0)   // increment → force re-fetch

  // ── Pages ──
  const [pagesLoading, setPagesLoading] = useState(false)
  const [pagesWriting, setPagesWriting] = useState([])
  const [pagesVoices,  setPagesVoices]  = useState([])
  const [pagesKey,     setPagesKey]     = useState(0)

  // ── Compass ──
  const [compassLoading, setCompassLoading] = useState(false)
  const [compassEntries, setCompassEntries] = useState([])
  const [compassKey,     setCompassKey]     = useState(0)

  // Load spill entries when entering the spill drill-in
  useEffect(() => {
    if (panelView !== "spill" || !userId) return
    setSpillLoading(true)
    fetchJournalEntries(userId, { activity: "spill" })
      .catch(err => { console.error('[feelbetter] entries spill:', err); return [] })
      .then(data => setSpillEntries(data || []))
      .finally(() => setSpillLoading(false))
  }, [panelView, userId, spillKey])

  // Load pages entries when entering the pages drill-in
  useEffect(() => {
    if (panelView !== "pages" || !userId) return
    setPagesLoading(true)
    Promise.all([
      fetchJournalEntries(userId, { activity: "pages-write" })
        .catch(err => { console.error('[feelbetter] entries pages-write:', err); return [] }),
      fetchVoiceNotes(userId)
        .catch(err => { console.error('[feelbetter] entries voices:', err); return [] }),
    ])
      .then(([writings, voices]) => {
        setPagesWriting(writings || [])
        setPagesVoices(voices || [])
      })
      .finally(() => setPagesLoading(false))
  }, [panelView, userId, pagesKey])

  // Load compass entries when entering the compass drill-in
  useEffect(() => {
    if (panelView !== "compass" || !userId) return
    setCompassLoading(true)
    fetchJournalEntries(userId, { activity: "compass" })
      .catch(err => { console.error('[feelbetter] entries compass:', err); return [] })
      .then(data => setCompassEntries(data || []))
      .finally(() => setCompassLoading(false))
  }, [panelView, userId, compassKey])

  const goHome = () => setPanelView("home")

  // Shared nav bar — back button context-aware
  const NavBar = () => (
    <nav style={{ display: "flex", alignItems: "center", gap: 16, padding: "28px 40px 0" }}>
      <button
        onClick={panelView === "home" ? onClose : goHome}
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
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="#3a8a8f" strokeWidth="1.8" strokeLinecap="round">
          <path d="M2 9c2.4-3 4.3-3 6.7 0s4.3 3 6.7 0 4.3-3 6.6 0" />
          <path d="M2 14.5c2.4-3 4.3-3 6.7 0s4.3 3 6.7 0 4.3-3 6.6 0" />
        </svg>
        feelbetter
      </span>
    </nav>
  )

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 350,
      background: "linear-gradient(165deg,#e6f5f7 0%,#d3edf2 48%,#e8f6f8 100%)",
      overflowY: "auto",
      fontFamily: "var(--font-dm-sans), sans-serif",
      color: "#1a3a42",
    }}>
      {/* Shimmer keyframe — scoped to this panel */}
      <style>{`@keyframes epShimmer{0%,100%{opacity:1}50%{opacity:.38}}`}</style>

      {/* Desktop scale wrapper — top-left origin, same as the rest of the app */}
      <div style={pageScale < 1 ? {
        transformOrigin: "top left",
        transform: `scale(${pageScale})`,
        width: `${(100 / pageScale).toFixed(3)}vw`,
      } : {}}>

        {/* ══════════════════════════════════════════════════════════════
            LEVEL 1 — HOME: Spill + Pages activity cards
        ══════════════════════════════════════════════════════════════ */}
        {panelView === "home" && (
          <>
            <NavBar />
            <main style={{ maxWidth: 720, margin: "0 auto", padding: "52px 28px 100px" }}>

              {/* Page heading */}
              <div style={{ marginBottom: 48 }}>
                <div style={{ marginBottom: 16 }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                    stroke="#3a8a8f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity=".55">
                    <path d="M4 5c3-1 6-1 8 0 2-1 5-1 8 0v14c-3-1-6-1-8 0-2-1-5-1-8 0V5z"/>
                    <path d="M12 5v14"/>
                  </svg>
                </div>
                <h1 style={{
                  fontFamily: "var(--font-dm-serif), serif",
                  fontSize: "clamp(44px,5.5vw,68px)",
                  fontWeight: 400, color: "#0f2e35",
                  letterSpacing: -1.5, lineHeight: 1.02, marginBottom: 12,
                }}>your entries.</h1>
                <p style={{ fontSize: 17, color: "#5a7a80", fontWeight: 300, lineHeight: 1.65 }}>
                  everything you&apos;ve saved, just for you.
                </p>
              </div>

              {/* Guest message */}
              {!userId && (
                <PanelEmptyState
                  text="sign in to see your entries."
                  sub="your saves will live here once you&apos;re logged in."
                />
              )}

              {/* Activity cards grid — 3 columns for Spill, Pages, Compass */}
              {userId && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <EntriesActivityCard
                    label="spill"
                    desc="your unfiltered thoughts and feelings"
                    accent="#a8c5cc"
                    glow="rgba(122,171,180,.3)"
                    onClick={() => setPanelView("spill")}
                    icon={
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2s-7 7.5-7 12a7 7 0 0 0 14 0c0-4.5-7-12-7-12z"/>
                        <path d="M9 17a3 3 0 0 0 6 0"/>
                      </svg>
                    }
                  />
                  <EntriesActivityCard
                    label="pages"
                    desc="written notes and voice recordings"
                    accent="#dcc9a8"
                    glow="rgba(196,168,122,.3)"
                    onClick={() => setPanelView("pages")}
                    icon={
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                      </svg>
                    }
                  />
                  <EntriesActivityCard
                    label="compass"
                    desc="your traced reflections"
                    accent="#b0bba0"
                    glow="rgba(138,152,120,.3)"
                    onClick={() => setPanelView("compass")}
                    icon={
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"
                          fill="currentColor" opacity=".4" stroke="none"/>
                      </svg>
                    }
                  />
                </div>
              )}
            </main>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            LEVEL 2a — SPILL entries
        ══════════════════════════════════════════════════════════════ */}
        {panelView === "spill" && (
          <>
            <NavBar />
            <main style={{ maxWidth: 720, margin: "0 auto", padding: "52px 28px 100px" }}>

              {/* Breadcrumb */}
              <p style={{
                fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase",
                color: "#7a9aaa", marginBottom: 36, fontWeight: 500,
              }}>
                your entries → spill
              </p>

              {/* Header row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{
                    fontFamily: "var(--font-dm-serif), serif",
                    fontSize: "clamp(38px,4.6vw,58px)",
                    fontWeight: 400, color: "#0f2e35",
                    letterSpacing: -1.2, lineHeight: 1.04, marginBottom: 8,
                  }}>spill.</h2>
                  <p style={{ fontSize: 16, color: "#5a8a80", fontWeight: 300 }}>
                    every thought you let out.
                  </p>
                </div>
                {!spillLoading && (
                  <PanelRefreshButton onClick={() => setSpillKey(k => k + 1)} />
                )}
              </div>

              {spillLoading && <EntryShimmer />}

              {!spillLoading && spillEntries.length === 0 && (
                <PanelEmptyState
                  text="no spills yet."
                  sub="when you spill something, it&apos;ll appear here."
                />
              )}

              {!spillLoading && spillEntries.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                  {spillEntries.map(entry => (
                    <EntryCard key={entry.id} entry={entry} />
                  ))}
                </div>
              )}
            </main>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            LEVEL 2c — COMPASS entries: reflection summaries
        ══════════════════════════════════════════════════════════════ */}
        {panelView === "compass" && (
          <>
            <NavBar />
            <main style={{ maxWidth: 720, margin: "0 auto", padding: "52px 28px 100px" }}>

              {/* Breadcrumb */}
              <p style={{
                fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase",
                color: "#8a9a88", marginBottom: 36, fontWeight: 500,
              }}>
                your entries → compass
              </p>

              {/* Header row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{
                    fontFamily: "var(--font-dm-serif), serif",
                    fontSize: "clamp(38px,4.6vw,58px)",
                    fontWeight: 400, color: "#0f2e35",
                    letterSpacing: -1.2, lineHeight: 1.04, marginBottom: 8,
                  }}>compass.</h2>
                  <p style={{ fontSize: 16, color: "#6a7a60", fontWeight: 300 }}>
                    every feeling you traced.
                  </p>
                </div>
                {!compassLoading && (
                  <PanelRefreshButton onClick={() => setCompassKey(k => k + 1)} />
                )}
              </div>

              {compassLoading && <EntryShimmer />}

              {!compassLoading && compassEntries.length === 0 && (
                <PanelEmptyState
                  text="no compass reflections yet."
                  sub="when you trace a feeling, it'll appear here."
                />
              )}

              {!compassLoading && compassEntries.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                  {compassEntries.map(entry => (
                    <EntryCard key={entry.id} entry={entry} />
                  ))}
                </div>
              )}
            </main>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            LEVEL 2b — PAGES entries: Write sub-section + Voice sub-section
        ══════════════════════════════════════════════════════════════ */}
        {panelView === "pages" && (
          <>
            <NavBar />
            <main style={{ maxWidth: 720, margin: "0 auto", padding: "52px 28px 100px" }}>

              {/* Breadcrumb */}
              <p style={{
                fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase",
                color: "#9a8a70", marginBottom: 36, fontWeight: 500,
              }}>
                your entries → pages
              </p>

              {/* Header row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{
                    fontFamily: "var(--font-dm-serif), serif",
                    fontSize: "clamp(38px,4.6vw,58px)",
                    fontWeight: 400, color: "#0f2e35",
                    letterSpacing: -1.2, lineHeight: 1.04, marginBottom: 8,
                  }}>pages.</h2>
                  <p style={{ fontSize: 16, color: "#7a6a50", fontWeight: 300 }}>
                    written words and voice notes.
                  </p>
                </div>
                {!pagesLoading && (
                  <PanelRefreshButton onClick={() => setPagesKey(k => k + 1)} />
                )}
              </div>

              {pagesLoading && <EntryShimmer />}

              {!pagesLoading && (
                <>
                  {/* ── Write notes sub-section ── */}
                  <section style={{ marginBottom: 44 }}>
                    <PanelSectionLabel icon="book" color="#c4a870" text="write notes" />
                    {pagesWriting.length === 0 ? (
                      <PanelEmptyState
                        text="no written pages yet."
                        sub="your write-mode entries will appear here."
                      />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {pagesWriting.map(entry => (
                          <EntryCard key={entry.id} entry={entry} />
                        ))}
                      </div>
                    )}
                  </section>

                  {/* ── Voice notes sub-section ── */}
                  <section>
                    <PanelSectionLabel icon="mic" color="#b89aac" text="voice notes" />
                    {pagesVoices.length === 0 ? (
                      <PanelEmptyState
                        text="no voice notes yet."
                        sub="your voice recordings will appear here."
                      />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {pagesVoices.map(note => (
                          <VoiceNoteCard key={note.id} note={note} />
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}
            </main>
          </>
        )}

      </div>
    </div>
  )
}

const BREATHE_STEPS = [
  { text: "breathe in... 4",  ms: 4000 },
  { text: "hold... 7",        ms: 7000 },
  { text: "breathe out... 8", ms: 8000 },
]

function getClock() {
  const now = new Date()
  let h = now.getHours(), m = now.getMinutes()
  const ampm = h >= 12 ? "pm" : "am"
  h = h % 12 || 12
  return `it's ${h}:${m < 10 ? "0" + m : m}${ampm}`
}

function getSubGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "how are you waking up today?"
  if (h < 17) return "how's the middle of the day treating you?"
  if (h < 22) return "how is your heart settling today?"
  return "it's quiet out there. how are you doing?"
}

export default function Dashboard() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  const [mounted,       setMounted]       = useState(false)
  const [clock,         setClock]         = useState("")
  const [moodOverlay,   setMoodOverlay]   = useState(null)   // which mood overlay is open
  const [overlayState,  setOverlayState]  = useState(1)      // 1 = "I see you", 2 = "I've got you"
  const [breatheText,   setBreatheText]   = useState("tap to begin a 4·7·8 cycle")
  const [breatheActive, setBreatheActive] = useState(false)
  const [sidebarOpen,   setSidebarOpen]   = useState(false)
  const [isDesktop,     setIsDesktop]     = useState(false)
  const [anonymousMode, setAnonymousMode] = useState(false)
  const [isGuest,       setIsGuest]       = useState(false)
  const [clusterScale,  setClusterScale]  = useState(1)
  const [moodHistory,   setMoodHistory]   = useState([])   // real data from Supabase
  const [pageScale,     setPageScale]     = useState(1)
  const [historyOpen,   setHistoryOpen]   = useState(false)
  const clusterWrapRef = useRef(null)

  useEffect(() => {
    if (user) {
      localStorage.removeItem("isGuest")
      setIsGuest(false)
      // Load real mood history from Supabase whenever the user is available
      fetchLast7Days(user.id).then(moods => setMoodHistory(moods))
    } else {
      const guest = localStorage.getItem("isGuest") === "true"
      setIsGuest(guest)
      if (!loading && !guest) router.replace("/login")
    }
  }, [user, loading])

  useEffect(() => {
    setMounted(true)
    setClock(getClock())
    const t = setInterval(() => setClock(getClock()), 30000)
    const measureCluster = () => {
      if (clusterWrapRef.current)
        setClusterScale(Math.min(1, clusterWrapRef.current.offsetWidth / 920))
    }
    const check = () => {
      const w = window.innerWidth
      setIsDesktop(w >= 1024)
      measureCluster()
      // scale the whole page so content fits at any desktop width without overflowing
      setPageScale(w >= 1024 ? Math.min(1, w / 1920) : 1)
    }
    check()
    window.addEventListener("resize", check)
    return () => { clearInterval(t); window.removeEventListener("resize", check) }
  }, [])

  const handleLogout = async () => { await signOut(); router.push("/login") }

  const fullName  = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there"
  const firstName = fullName.split(" ")[0]
  const initials  = fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  function openMood(id) {
    setMoodOverlay(id)
    setOverlayState(1)
    // Save to DB for logged-in, non-anonymous users; refresh sidebar dots after save
    if (user && !anonymousMode) {
      saveMood(user.id, id, 1).then(() =>
        fetchLast7Days(user.id).then(moods => setMoodHistory(moods))
      )
    }
  }
  function closeOverlay() { setMoodOverlay(null); setOverlayState(1) }

  function startBreathe() {
    if (breatheActive) return
    setBreatheActive(true)
    let i = 0
    function next() {
      if (i >= BREATHE_STEPS.length) {
        setBreatheText("tap to begin a 4·7·8 cycle"); setBreatheActive(false); return
      }
      setBreatheText(BREATHE_STEPS[i].text)
      setTimeout(() => { i++; next() }, BREATHE_STEPS[i - 1]?.ms ?? 4000)
    }
    next()
  }

  /* Overlay state derived values */
  const overlayDef = moodOverlay ? MOOD_SCREENS[moodOverlay] : null
  const isS1       = overlayState === 1
  const st         = overlayDef ? (isS1 ? overlayDef.s1 : overlayDef.s2) : null

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}

        /* ── Dashboard root — background is ALWAYS the default teal, never changes ── */
        .fb-root{
          font-family:var(--font-dm-sans),sans-serif;
          background:linear-gradient(165deg,#e6f5f7 0%,#d3edf2 48%,#e8f6f8 100%);
          min-height:100vh;color:#1a3a42;
          display:flex;flex-direction:column;overflow-x:hidden;
        }
        .fb-wrapper{display:flex;flex:1;position:relative}

        /* ── Mood overlay animations ───────────────────────────────────────────── */
        @keyframes fbFloat{0%{transform:translateY(12px);opacity:0}25%{opacity:.85}100%{transform:translateY(-70px);opacity:0}}
        @keyframes fbRise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes fishBob{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-14px) rotate(4deg)}}
        .fb-overlay-content{animation:fbRise .5s ease both}

        /* ── SIDEBAR base ──────────────────────────────────────────────────────── */
        .fb-sidebar{
          background:rgba(255,255,255,.8);backdrop-filter:blur(10px);
          width:280px;display:none;flex-direction:column;
          border-right:1px solid rgba(255,255,255,.5);
          position:relative;z-index:100;
        }
        .fb-sidebar-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);display:none;z-index:90}
        @media(max-width:1023px){
          .fb-sidebar-overlay.open{display:block}
          .fb-sidebar.open{display:flex;position:fixed;top:0;left:0;width:280px;height:100vh;z-index:100}
        }
        .fb-sidebar-top{padding:22px;border-bottom:1px solid rgba(0,0,0,.08);flex-shrink:0}
        .fb-sidebar-close{display:flex;justify-content:flex-end;margin-bottom:10px}
        .fb-sidebar-close-btn{background:none;border:none;font-size:20px;cursor:pointer;color:#1a3a42;padding:0;width:22px;height:22px;display:none}
        @media(max-width:1023px){.fb-sidebar-close-btn{display:block}}
        .fb-profile{display:flex;align-items:flex-start;gap:12px;margin-bottom:18px}
        .fb-profile-avatar{width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#7ac4d0,#5aaabb);display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:600;flex-shrink:0}
        .fb-profile-info{flex:1}
        .fb-profile-name{font-size:17px;color:#0f2e35;font-weight:500}
        .fb-profile-action{font-size:13px;color:#4a8a96;cursor:pointer;text-decoration:underline;margin-top:3px}
        .fb-anon-toggle{display:flex;align-items:center;gap:10px;padding:10px 0;margin-bottom:14px}
        .fb-anon-icon{width:18px;height:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .fb-anon-label{font-size:14px;color:#1a3a42;flex:1}
        .fb-toggle{width:44px;height:26px;background:#d0d0d0;border-radius:13px;border:none;cursor:pointer;position:relative;transition:background .3s;flex-shrink:0}
        .fb-toggle.on{background:#7ac4d0}
        .fb-toggle-thumb{position:absolute;top:3px;left:3px;width:20px;height:20px;background:#fff;border-radius:50%;transition:left .3s}
        .fb-toggle.on .fb-toggle-thumb{left:21px}
        .fb-sidebar-middle{flex:1;padding:0 22px;overflow-y:auto;scrollbar-width:none;-ms-overflow-style:none}
        .fb-sidebar-middle::-webkit-scrollbar{display:none}
        .fb-sidebar-section{margin-bottom:20px}
        .fb-sidebar-section-label{font-size:12px;letter-spacing:.3px;text-transform:uppercase;color:#4a8a96;font-weight:600;margin-bottom:10px;display:flex;align-items:center;gap:8px}
        .fb-mood-dots{display:flex;gap:8px;flex-wrap:wrap}
        .fb-mood-dot{width:20px;height:20px;border-radius:50%;background:#ccc;cursor:pointer;transition:transform .2s}
        .fb-mood-dot:hover{transform:scale(1.15)}
        .fb-history-item{display:flex;align-items:center;justify-content:space-between;padding:10px 13px;background:rgba(255,255,255,.5);border-radius:10px;cursor:pointer;font-size:14px;color:#1a3a42}
        .fb-history-item:hover{background:rgba(255,255,255,.8)}
        .fb-lock-icon{width:16px;height:16px}
        .fb-sidebar-bottom{padding:20px 22px;border-top:1px solid rgba(0,0,0,.08);flex-shrink:0}
        .fb-logout{font-size:14px;color:#4a8a96;cursor:pointer;display:flex;align-items:center;gap:8px}

        /* ── NAVBAR ────────────────────────────────────────────────────────────── */
        .fb-navbar{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;flex-shrink:0}
        @media(min-width:768px){.fb-navbar{padding:24px 48px}}
        .fb-logo-wrap{display:flex;align-items:center;gap:12px}
        .fb-hamburger{display:flex;flex-direction:column;gap:5px;cursor:pointer}
        .fb-hamburger span{display:block;width:22px;height:1.5px;background:#2a5a66;border-radius:2px}
        .fb-logo{display:flex;align-items:center;gap:8px;font-family:var(--font-dm-serif),serif;font-size:18px;color:#1a3a42;letter-spacing:-.3px}
        .fb-time{font-size:14px;color:#2a5a66;font-weight:300;font-style:italic}

        /* ── MAIN ──────────────────────────────────────────────────────────────── */
        .fb-main{flex:1;padding:24px;overflow-y:auto}
        @media(min-width:768px){.fb-main{padding:32px 48px}}

        .fb-greeting{font-family:var(--font-dm-serif),serif;font-size:42px;color:#0f2e35;font-weight:400;line-height:1.1;margin-bottom:4px;letter-spacing:-1px}
        @media(min-width:768px){.fb-greeting{font-size:56px;margin-bottom:8px;letter-spacing:-1.5px}}
        .fb-subgreeting{font-size:18px;color:#3a6a75;font-weight:300;margin-bottom:32px}
        @media(min-width:768px){.fb-subgreeting{font-size:22px;margin-bottom:40px}}

        /* ── CHECK-IN CARD ─────────────────────────────────────────────────────── */
        .fb-checkin-card{background:rgba(255,255,255,.65);border-radius:32px;padding:32px 24px;border:.5px solid rgba(255,255,255,.95);backdrop-filter:blur(10px);margin-bottom:24px}
        @media(min-width:768px){.fb-checkin-card{padding:40px 32px;margin-bottom:28px}}
        .fb-checkin-label{display:flex;align-items:center;gap:6px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#4a8a96;font-weight:500;margin-bottom:12px}
        .fb-checkin-heading{font-family:var(--font-dm-serif),serif;font-size:30px;color:#0f2e35;line-height:1.2;margin-bottom:12px;font-weight:400}
        @media(min-width:768px){.fb-checkin-heading{font-size:36px;margin-bottom:16px}}
        .fb-checkin-hint{font-size:17px;color:#5a8a96;font-weight:300;font-style:italic;margin-bottom:28px}

        /* ── MOOD GRID (mobile/tablet) ─────────────────────────────────────────── */
        .fb-moods-grid{display:flex;flex-wrap:wrap;gap:20px;justify-content:center}
        @media(min-width:768px){.fb-moods-grid{gap:24px}}
        .fb-mood-btn{border:none;background:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;transition:transform .2s ease,filter .2s ease;padding:0;border-radius:50%;position:relative;width:130px;height:120px;flex-shrink:0}
        @media(min-width:768px){.fb-mood-btn{width:160px;height:140px}}
        .fb-mood-btn:hover{transform:scale(1.08);filter:brightness(1.1)}
        .fb-mood-btn:focus{outline:2px solid rgba(255,255,255,.6);outline-offset:4px}
        .fb-mood-icon{width:28px;height:28px;display:flex;align-items:center;justify-content:center;opacity:.9}
        .fb-mood-label{font-size:13px;font-weight:400;letter-spacing:.5px;white-space:nowrap}

        /* ── BREATHE CARD ──────────────────────────────────────────────────────── */
        .fb-breathe-card{background:rgba(255,255,255,.65);border-radius:32px;padding:40px 28px;display:flex;flex-direction:column;align-items:center;margin-bottom:24px;border:.5px solid rgba(255,255,255,.95);backdrop-filter:blur(10px);width:100%}
        @media(min-width:768px){.fb-breathe-card{margin-bottom:28px}}
        .fb-breathe-outer{width:160px;height:160px;border-radius:50%;background:rgba(178,220,230,.3);display:flex;align-items:center;justify-content:center;margin-bottom:20px;animation:breathePulse 6s ease-in-out infinite}
        .fb-breathe-inner{width:110px;height:110px;border-radius:50%;background:linear-gradient(145deg,#6ab4c2,#4a9aac);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .2s}
        .fb-breathe-inner:hover{transform:scale(1.05)}
        @keyframes breathePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
        .fb-breathe-label{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#3a7a88;font-weight:500;margin-bottom:6px}
        .fb-breathe-hint{font-size:16px;color:#4a8a96;font-weight:300}

        /* ── WHISPER CARD ──────────────────────────────────────────────────────── */
        .fb-whisper-card{background:rgba(255,255,255,.65);border-radius:32px;padding:20px 24px;display:flex;align-items:center;gap:16px;margin-bottom:24px;border:.5px solid rgba(255,255,255,.95);cursor:pointer;width:100%;backdrop-filter:blur(10px);transition:background .2s}
        @media(min-width:768px){.fb-whisper-card{padding:24px 32px;gap:20px;margin-bottom:28px}}
        .fb-whisper-card:hover{background:rgba(255,255,255,.82)}
        .fb-whisper-icon{width:50px;height:50px;border-radius:14px;background:rgba(178,220,230,.4);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        @media(min-width:768px){.fb-whisper-icon{width:54px;height:54px}}
        .fb-whisper-label{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4a8a96;font-weight:500;margin-bottom:3px}
        .fb-whisper-desc{font-size:16px;color:#1a3a42}
        .fb-open-btn{background:#3a7a88;color:#fff;border:none;border-radius:24px;padding:10px 24px;font-size:14px;font-family:var(--font-dm-sans),sans-serif;cursor:pointer;white-space:nowrap;margin-left:auto;transition:background .2s}
        .fb-open-btn:hover{background:#2a6070}

        /* ── WIND-DOWN CARD ────────────────────────────────────────────────────── */
        .fb-winddown-card{background:rgba(255,255,255,.65);border-radius:32px;padding:28px 20px;display:flex;flex-direction:column;gap:20px;margin-bottom:24px;border:.5px solid rgba(255,255,255,.95);width:100%;backdrop-filter:blur(10px)}
        @media(min-width:768px){.fb-winddown-card{padding:32px 40px;flex-direction:row;gap:32px;align-items:center}}
        .fb-winddown-label{display:flex;align-items:center;gap:8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4a8a96;font-weight:500;margin-bottom:8px}
        .fb-winddown-title{font-family:var(--font-dm-serif),serif;font-size:24px;color:#0f2e35;margin-bottom:4px;font-weight:400}
        @media(min-width:768px){.fb-winddown-title{font-size:28px}}
        .fb-winddown-sub{font-size:14px;color:#5a8a96;margin-bottom:16px;font-style:italic}
        .fb-winddown-actions{display:flex;align-items:center;gap:16px}
        .fb-play-btn{display:flex;align-items:center;gap:8px;background:#1a3a42;color:#fff;border:none;border-radius:24px;padding:10px 22px;font-size:14px;font-family:var(--font-dm-sans),sans-serif;cursor:pointer;transition:background .2s}
        .fb-play-btn:hover{background:#0f2e35}
        .fb-browse-link{font-size:14px;color:#4a8a96;cursor:pointer;text-decoration:underline}
        .fb-blob{width:110px;height:110px;border-radius:50%;background:linear-gradient(145deg,#7ac4d0,#5aaabb);flex-shrink:0}
        @media(min-width:768px){.fb-blob{width:130px;height:130px;margin-left:auto}}

        /* ── FOOTER ────────────────────────────────────────────────────────────── */
        .fb-footer{text-align:center;padding:20px 16px 32px;font-size:14px;color:#4a8a96;font-style:italic;font-weight:300;letter-spacing:.3px;flex-shrink:0}
        @media(min-width:768px){.fb-footer{padding:20px 48px 40px;font-size:15px}}

        /* ══════════════════════════════════════════════════════════════════════════
           DESKTOP ≥1024px — all changes below, mobile/tablet untouched above
           ══════════════════════════════════════════════════════════════════════════ */
        @media(min-width:1024px){

          /* Hamburger — bigger lines */
          .fb-hamburger{display:flex;gap:6px}
          .fb-hamburger span{width:30px;height:2.5px;border-radius:3px}

          /* Sidebar → fixed drawer */
          .fb-sidebar{
            display:none;position:fixed;top:0;left:0;z-index:200;
            width:300px;height:100%;flex-direction:column;
            background:linear-gradient(180deg,#dceef2,#cde7ed);
            box-shadow:24px 0 60px rgba(40,90,105,.16);
            padding:20px 20px 18px;overflow-y:auto;border-right:none;
          }
          .fb-sidebar.open{display:flex}
          .fb-sidebar-overlay.open{display:block}
          .fb-sidebar-close-btn{display:block}

          /* Block layout (no sidebar column) */
          .fb-wrapper{display:block}

          /* Navbar — left-anchored, logo and hamburger pushed to left edge */
          .fb-navbar{
            padding:22px clamp(32px,4vw,80px) 0 28px;
            justify-content:flex-start;
          }
          .fb-logo-wrap{gap:16px}
          .fb-logo{font-size:clamp(20px, 1.56vw, 28px);font-weight:600;letter-spacing:-.5px;color:#2f3e45;gap:12px}
          .fb-logo svg{width:34px;height:34px}
          .fb-time{font-style:italic;color:#7693a0;font-size:clamp(18px, 1.35vw, 26px);margin-left:auto}

          /* Main — full width, same scaled padding, no max-width constraint */
          .fb-main{
            padding:0 clamp(32px,4vw,80px) 0;
            overflow:visible;
          }

          /* Greeting */
          .fb-greeting{font-size:clamp(44px, 3.54vw, 68px);line-height:1;color:#2f3e45;margin-top:40px;margin-bottom:0;letter-spacing:0}
          .fb-subgreeting{font-size:clamp(18px, 1.46vw, 28px);color:#7c9098;font-weight:300;margin-top:14px;margin-bottom:0}

          /* Floating island — bleeds off the right edge */
          .fb-checkin-card{
            margin:34px -120px 0 0;
            border-radius:50px 0 0 50px;
            padding:40px 54px 54px;margin-bottom:0;
            background:linear-gradient(180deg,rgba(255,255,255,.74),rgba(255,255,255,.5));
            backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
            box-shadow:0 24px 70px rgba(60,120,140,.13);border:none;
          }
          .fb-checkin-label{font-size:clamp(15px, 1.1vw, 20px);letter-spacing:2px;color:#8aa6ad;margin-bottom:0}
          .fb-checkin-heading{font-size:clamp(36px, 2.92vw, 56px);line-height:1.06;margin-top:16px;margin-bottom:0}
          .fb-checkin-hint{font-size:clamp(17px, 1.35vw, 26px);font-weight:300;color:#8497a0;margin-top:16px;margin-bottom:0}

          /* Desktop mood cluster */
          .fb-moods-cluster-desktop{position:relative;width:920px;height:600px;margin-top:34px}

          /* Breathe card */
          .fb-breathe-card{
            margin-top:24px;margin-bottom:0;border-radius:30px;padding:44px;
            background:linear-gradient(180deg,rgba(255,255,255,.62),rgba(255,255,255,.42));
            backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
            box-shadow:0 16px 44px rgba(70,130,150,.1);border:none;
          }
          .fb-breathe-outer{width:170px;height:170px}
          .fb-breathe-inner{width:116px;height:116px}
          .fb-breathe-label{font-size:clamp(14px, 1.04vw, 20px);letter-spacing:2.5px;color:#7e98a0}
          .fb-breathe-hint{font-size:clamp(17px, 1.46vw, 28px);color:#566970}

          /* Whisper card */
          .fb-whisper-card{
            margin-top:20px;margin-bottom:0;border-radius:34px;padding:26px 36px;gap:20px;
            background:linear-gradient(180deg,rgba(255,255,255,.62),rgba(255,255,255,.42));
            backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
            box-shadow:0 14px 40px rgba(70,130,150,.1);border:none;
          }
          .fb-whisper-icon{width:58px;height:58px;border-radius:50%;background:#bfe0e8;flex-shrink:0}
          .fb-whisper-label{font-size:clamp(14px, 1.04vw, 20px);letter-spacing:2px;color:#8aa6ad}
          .fb-whisper-desc{font-size:clamp(19px, 1.56vw, 30px);color:#3c4f57;font-weight:300;margin-top:6px}
          .fb-open-btn{background:linear-gradient(135deg,#5fa0ac,#7bbac4);font-size:clamp(14px, 1.04vw, 20px);padding:13px 30px;box-shadow:0 8px 20px rgba(95,160,172,.35)}

          /* Wind-down card */
          .fb-winddown-card{
            margin-top:20px;margin-bottom:0;border-radius:34px;padding:36px 40px;gap:28px;
            background:linear-gradient(180deg,rgba(255,255,255,.62),rgba(255,255,255,.42));
            backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
            box-shadow:0 14px 40px rgba(70,130,150,.1);border:none;
            flex-direction:row;align-items:center;
          }
          .fb-winddown-label{font-size:clamp(14px, 1.04vw, 20px);letter-spacing:2px;color:#8aa6ad}
          .fb-winddown-title{font-size:clamp(26px, 2.08vw, 40px)}
          .fb-winddown-sub{font-size:clamp(15px, 1.25vw, 24px)}
          .fb-play-btn{background:#2f3e45;color:#eef4f5;font-size:clamp(14px, 1.04vw, 20px);padding:12px 28px;border-radius:26px}
          .fb-browse-link{font-size:clamp(14px, 1.04vw, 20px)}
          .fb-blob{width:144px;height:144px;background:radial-gradient(circle at 38% 34%,#cfeaf0,#a6d2dc);box-shadow:0 14px 34px rgba(120,180,195,.32);margin-left:auto;flex-shrink:0}

          /* Footer */
          .fb-footer{padding:40px 0 50px;font-size:clamp(14px, 1.04vw, 20px);color:#7c9098}
        }
      `}</style>

      <div
        className="fb-root"
        style={{
          transformOrigin: "top left",
          transform: `scale(${pageScale})`,
          width: pageScale < 1 ? `${(100 / pageScale).toFixed(3)}vw` : undefined,
        }}
      >

        {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
        <nav className="fb-navbar">
          <div className="fb-logo-wrap">
            <div className="fb-hamburger" onClick={() => setSidebarOpen(o => !o)}>
              <span /><span /><span />
            </div>
            <div className="fb-logo">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3a8a8f" strokeWidth="1.8" strokeLinecap="round">
                <path d="M2 9c2.4-3 4.3-3 6.7 0s4.3 3 6.7 0 4.3-3 6.6 0"/>
                <path d="M2 14.5c2.4-3 4.3-3 6.7 0s4.3 3 6.7 0 4.3-3 6.6 0"/>
              </svg>
              feelbetter
            </div>
          </div>
          <div className="fb-time">{mounted ? clock : ""}</div>
        </nav>

        <div className="fb-wrapper">

          {/* overlay */}
          <div className={`fb-sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

          {/* ── SIDEBAR ────────────────────────────────────────────────────── */}
          <aside
            className={`fb-sidebar ${sidebarOpen ? "open" : ""}`}
            style={isDesktop ? { transform: `scale(${pageScale})`, transformOrigin: "top left" } : {}}
          >
            <div className="fb-sidebar-top">
              <div className="fb-sidebar-close">
                <button className="fb-sidebar-close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
              </div>
              <div className="fb-profile">
                <div className="fb-profile-avatar" style={anonymousMode ? { background:"linear-gradient(135deg,#6b7fa8,#4a5a80)" } : {}}>
                  {anonymousMode
                    ? <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                        <circle cx="16" cy="8" r="3.5" fill="rgba(255,255,255,.95)"/>
                        <circle cx="16" cy="8" r="5.5" fill="rgba(255,255,255,.18)"/>
                        <path d="M13.5 10.5 Q9 13 5 17" stroke="rgba(255,255,255,.75)" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M13 11.5 Q8.5 14.5 4.5 18.5" stroke="rgba(255,255,255,.45)" strokeWidth="1.4" strokeLinecap="round"/>
                        <path d="M14 11 Q9.5 13.5 6 17" stroke="rgba(255,255,255,.25)" strokeWidth="1" strokeLinecap="round"/>
                      </svg>
                    : isGuest ? "👤" : initials}
                </div>
                <div className="fb-profile-info">
                  <div className="fb-profile-name">{anonymousMode ? "soul" : isGuest ? "guest" : firstName}</div>
                  <div className="fb-profile-action">{anonymousMode ? "hidden from view" : isGuest ? "not saved" : "tap for settings"}</div>
                </div>
              </div>
              <div className="fb-anon-toggle">
                <div className="fb-anon-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <label className="fb-anon-label">anonymous mode</label>
                <button className={`fb-toggle ${anonymousMode ? "on" : ""}`} onClick={() => setAnonymousMode(a => !a)}>
                  <div className="fb-toggle-thumb" />
                </button>
              </div>
            </div>

            <div className="fb-sidebar-middle">
              <div className="fb-sidebar-section">
                <div className="fb-sidebar-section-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>
                  </svg>
                  last 7 days
                </div>
                <div className="fb-mood-dots">
                  {moodHistory.length > 0 ? (
                    moodHistory.map((m, i) => (
                      <div key={i} className="fb-mood-dot" style={{ backgroundColor: MOOD_COLORS[m] }} />
                    ))
                  ) : (
                    <span style={{ fontSize:14, color:"#7c9098", fontStyle:"italic" }}>
                      {user ? "no check-ins yet this week" : "log in to track moods"}
                    </span>
                  )}
                </div>
              </div>
              <div className="fb-sidebar-section">
                <div className="fb-sidebar-section-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 5c3-1 6-1 8 0 2-1 5-1 8 0v14c-3-1-6-1-8 0-2-1-5-1-8 0V5z"/>
                    <path d="M12 5v14"/>
                  </svg>
                  history
                </div>
                <div
                  className="fb-history-item"
                  onClick={() => setHistoryOpen(true)}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.8)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.5)"}
                >
                  <span>your entries</span>
                  <svg className="fb-lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
              <div className="fb-sidebar-section">
                <div className="fb-sidebar-section-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V6l10-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>
                  </svg>
                  ambient sound
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {["ocean waves","rain","forest","silence"].map((s, i) => (
                    <span key={i} style={{ background:i===0?"#5eb4c2":"rgba(255,255,255,.6)", color:i===0?"#fff":"#4a5d64", fontSize:"22px", padding:"9px 20px", borderRadius:24, cursor:"pointer" }}>{s}</span>
                  ))}
                </div>
              </div>
              <div className="fb-sidebar-section">
                <div className="fb-sidebar-section-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
                  </svg>
                  activities
                </div>
                <div
                  onClick={() => router.push("/activities")}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", background:"rgba(255,255,255,.5)", borderRadius:12, cursor:"pointer", fontSize:22, color:"#1a3a42", transition:"background .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.8)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.5)"}
                >
                  <span>explore activities</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
              <div className="fb-sidebar-section">
                <div className="fb-sidebar-section-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M4 8h8M16 8h4M4 16h4M12 16h8"/>
                    <circle cx="14" cy="8" r="2.2"/><circle cx="10" cy="16" r="2.2"/>
                  </svg>
                  settings
                </div>
              </div>
              <div style={{ background:"rgba(255,255,255,.55)", borderRadius:18, padding:"22px 24px", fontSize:26, lineHeight:1.4, color:"#46606a", display:"flex", alignItems:"flex-start", gap:12, marginBottom:24 }}>
                🌸 you&#39;ve checked in 4 days this week.
              </div>
            </div>

            <div className="fb-sidebar-bottom">
              <div className="fb-logout" onClick={handleLogout}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 5h5v14h-5"/><path d="M3 12h11M11 8l4 4-4 4"/>
                </svg>
                {isGuest ? "sign in" : "logout"}
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
          <div className="fb-main">
            <p className="fb-greeting">{anonymousMode ? "hello there," : `hello ${firstName},`}</p>
            <p className="fb-subgreeting">{mounted ? getSubGreeting() : ""}</p>

            {/* CHECK-IN CARD */}
            <div className="fb-checkin-card">
              <div className="fb-checkin-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20s-7-4.6-9.4-9C1 8 2.6 4.6 6 4.6c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.4 0 5 3.4 3.4 6.4C19 15.4 12 20 12 20z"/>
                </svg>
                DAILY CHECK-IN
              </div>
              <h2 className="fb-checkin-heading">
                {isDesktop ? <><span>how do you</span><br /><span>feel right now?</span></> : "how do you feel right now?"}
              </h2>
              <p className="fb-checkin-hint">pick one. nothing shifts unless you&#39;re ready.</p>

              {/* MOOD CLUSTER — desktop: absolute organic blobs | mobile: flex grid */}
              {isDesktop ? (
                /* outer div measures available width; inner cluster scales to fit */
                <div ref={clusterWrapRef} style={{ width:"100%", height: clusterScale * 600, overflow:"visible" }}>
                <div className="fb-moods-cluster-desktop" style={{ transform:`scale(${clusterScale})`, transformOrigin:"top left" }}>
                  {DESKTOP_BLOBS.map(blob => (
                    <div
                      key={blob.id}
                      onClick={() => openMood(blob.id)}
                      style={{
                        position:"absolute", left:blob.left, top:blob.top,
                        width:blob.width, height:blob.height,
                        borderRadius:blob.borderRadius,
                        background:blob.background,
                        boxShadow:blob.shadow,
                        cursor:"pointer",
                        display:"flex", flexDirection:"column",
                        alignItems:"center", justifyContent:"center",
                        transition:"transform .45s ease, box-shadow .45s ease",
                        color:blob.color,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.035)"; e.currentTarget.style.boxShadow = blob.shadow + ", 0 0 0 3px rgba(255,255,255,.4)" }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = blob.shadow }}
                    >
                      <BlobIcon id={blob.id} size={blob.iconSize} />
                      <div style={{ marginTop:14, fontSize:20, fontWeight:400 }}>{blob.label}</div>
                    </div>
                  ))}
                </div>
                </div>
              ) : (
                <div className="fb-moods-grid">
                  {[
                    { id:"empty",       label:"empty",       color:"#515d6e" },
                    { id:"overwhelmed", label:"overwhelmed", color:"#0a6878" },
                    { id:"okayish",     label:"okay-ish",    color:"#7a8a5a" },
                    { id:"heavy",       label:"heavy",       color:"#1a1060" },
                    { id:"full",        label:"full",        color:"#d07030" },
                  ].map(mood => (
                    <button key={mood.id} onClick={() => openMood(mood.id)} className="fb-mood-btn" style={{ backgroundColor: mood.color }}>
                      <div className="fb-mood-icon" style={{ color:"#fff" }}>
                        {mood.id === "empty"       && <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="16" cy="12" r="4"/><path d="M8 24 Q16 18 24 24"/><path d="M6 27 Q16 21 26 27"/></svg>}
                        {mood.id === "overwhelmed" && <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 14 Q10 10 16 14 Q22 18 28 14"/><path d="M4 20 Q10 16 16 20 Q22 24 28 20"/><circle cx="16" cy="8" r="2.5"/></svg>}
                        {mood.id === "okayish"     && <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="16" cy="12" r="6"/><path d="M10 6 L16 2 L22 6"/><path d="M8 20 L24 20"/></svg>}
                        {mood.id === "heavy"       && <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M16 4 Q20 12 16 20 Q14 24 16 28"/><ellipse cx="16" cy="28" rx="4" ry="2"/></svg>}
                        {mood.id === "full"        && <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="16" cy="16" r="5"/><path d="M16 2 L16 6M16 26 L16 30M2 16 L6 16M26 16 L30 16M6.3 6.3 L9.2 9.2M22.8 22.8 L25.7 25.7M25.7 6.3 L22.8 9.2M9.2 22.8 L6.3 25.7"/></svg>}
                      </div>
                      <span className="fb-mood-label" style={{ color:"#fff" }}>{mood.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* BREATHE CARD */}
            <div className="fb-breathe-card">
              <div className="fb-breathe-outer">
                <div className="fb-breathe-inner" onClick={startBreathe}>
                  <svg viewBox="0 0 28 28" width="26" height="26" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M3 9h11a2.5 2.5 0 1 0-2.5-2.5"/>
                    <path d="M3 14h14a2.5 2.5 0 1 1-2.5 2.5"/>
                  </svg>
                </div>
              </div>
              <div className="fb-breathe-label">BREATHE</div>
              <div className="fb-breathe-hint">{breatheText}</div>
            </div>

            {/* WHISPER CARD */}
            <div className="fb-whisper-card">
              <div className="fb-whisper-icon">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#3a7e8a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 5c3-1 6-1 8 0 2-1 5-1 8 0v14c-3-1-6-1-8 0-2-1-5-1-8 0V5z"/>
                  <path d="M12 5v14"/>
                </svg>
              </div>
              <div style={{ flex:1 }}>
                <div className="fb-whisper-label">WHISPER A THOUGHT</div>
                <div className="fb-whisper-desc">no one reads it but you.</div>
              </div>
              <button className="fb-open-btn">open</button>
            </div>

            {/* WIND-DOWN CARD */}
            <div className="fb-winddown-card">
              <div style={{ flex:1 }}>
                <div className="fb-winddown-label">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5z"/>
                  </svg>
                  TONIGHT&#39;S WIND-DOWN
                </div>
                <div className="fb-winddown-title">a 9-minute story for sleep</div>
                <div className="fb-winddown-sub">&#34;the quiet harbor&#34; · narrated softly</div>
                <div className="fb-winddown-actions">
                  <button className="fb-play-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    play
                  </button>
                  <span className="fb-browse-link">browse library</span>
                </div>
              </div>
              <div className="fb-blob" />
            </div>

            {/* ACTIVITIES NUDGE */}
            <div
              onClick={() => router.push("/activities")}
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"22px 28px", marginTop:20, background:"rgba(255,255,255,.5)", backdropFilter:"blur(10px)", borderRadius:24, border:".5px solid rgba(255,255,255,.85)", cursor:"pointer", transition:"background .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.75)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.5)"}
            >
              <div>
                <div style={{ fontSize:26, letterSpacing:1.6, textTransform:"uppercase", color:"#6a9aaa", fontWeight:500, marginBottom:6 }}>ACTIVITIES</div>
                <div style={{ fontSize:34, color:"#3c4f57", fontWeight:300 }}>something small to do right now</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, color:"#4a8a96", fontSize:29, fontWeight:400, flexShrink:0 }}>
                explore
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="fb-footer">whatever you&#39;re feeling, it&#39;s welcome here.</div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ENTRIES HISTORY PANEL — full-screen, outside the scaled fb-root so
          position:fixed covers the true viewport, not the transformed one
          ══════════════════════════════════════════════════════════════════════ */}
      {historyOpen && (
        <EntriesPanel
          userId={user?.id}
          onClose={() => setHistoryOpen(false)}
          pageScale={pageScale}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          FULL-SCREEN MOOD OVERLAY — renders on top of everything, never inside
          the dashboard layout, so dashboard background never changes
          ══════════════════════════════════════════════════════════════════════ */}
      {moodOverlay && overlayDef && st && (
        <div style={{
          position:"fixed", inset:0, zIndex:300,
          background: st.bg,
          color: st.fg,
          display:"flex", alignItems:"center", justifyContent:"center",
          textAlign:"center",
          fontFamily:"var(--font-dm-sans),sans-serif",
          transition:"background 0.7s ease",
        }}>
          {/* scale wrapper — background stays full-screen, content scales */}
          <div style={{
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: `scale(${pageScale})`,
            transformOrigin: "center center",
            padding: "48px 24px",
          }}>

          {/* floating particles (full s2 only) */}
          {st.showParticles && (
            <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
              {[
                { l:"12%", t:"76%", w:10, d:0,    dur:7 },
                { l:"30%", t:"90%", w:7,  d:0.8,  dur:9 },
                { l:"62%", t:"82%", w:12, d:0.4,  dur:8,  c:"rgba(255,233,160,.85)" },
                { l:"80%", t:"92%", w:8,  d:1.2,  dur:10 },
                { l:"90%", t:"72%", w:9,  d:0.2,  dur:8.5, c:"rgba(255,210,120,.8)" },
                { l:"48%", t:"94%", w:6,  d:1.6,  dur:11 },
              ].map((p, i) => (
                <span key={i} style={{
                  position:"absolute", left:p.l, top:p.t,
                  width:p.w, height:p.w, borderRadius:"50%",
                  background: p.c || "rgba(255,255,255,.7)",
                  animation:`fbFloat ${p.dur}s ease-in-out ${p.d}s infinite`,
                }}/>
              ))}
            </div>
          )}

          {/* close button */}
          <div
            onClick={closeOverlay}
            style={{ position:"absolute", top:30, right:36, cursor:"pointer", opacity:.55, display:"flex" }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M5 5l14 14M19 5L5 19"/>
            </svg>
          </div>

          <div className="fb-overlay-content" style={{ position:"relative", maxWidth:860, display:"flex", flexDirection:"column", alignItems:"center", padding:"0 32px" }}>
            <div style={{ color:st.accent, marginBottom:40, display:"flex", justifyContent:"center" }}>
              <OverlayIcon icon={overlayDef.icon} color={st.accent} />
            </div>

            <div style={{ fontSize:"clamp(44px, 6vw, 72px)", fontWeight:300, lineHeight:1.1, letterSpacing:"-.8px" }}>
              {st.head}
            </div>

            <div style={{ marginTop:28, fontSize:"clamp(19px, 2.4vw, 26px)", fontWeight:300, opacity:.85, lineHeight:1.65 }}>
              {st.sub}
            </div>

            <div style={{ marginTop:56, display:"flex", flexDirection:"column", alignItems:"center", gap:18 }}>
              {isS1 && overlayDef.s1.showSit && (
                <div onClick={closeOverlay} style={{ background:"rgba(255,255,255,.35)", color:st.fg, padding:"16px 40px", borderRadius:34, cursor:"pointer", fontSize:22 }}>
                  just sit here
                </div>
              )}
              <div
                onClick={isS1 ? () => setOverlayState(2) : closeOverlay}
                style={{
                  display:"flex", alignItems:"center", gap:12,
                  background: isS1 ? st.accent : "rgba(255,255,255,.32)",
                  color: isS1 ? "#fff" : st.fg,
                  padding:"18px 48px", borderRadius:40, cursor:"pointer",
                  fontSize:24, fontWeight:500,
                  boxShadow:"0 14px 36px rgba(0,0,0,.15)",
                }}
              >
                {isS1 ? "whenever you're ready" : "carry this with me"}
                {isS1 && <span style={{ fontSize:22 }}>🌸</span>}
              </div>
              {isS1 && (
                <div style={{ fontStyle:"italic", fontSize:20, opacity:.6, marginTop:4 }}>
                  no rush. this stays as long as you need.
                </div>
              )}
            </div>

            {/* state 2 only: suggested activities for this mood */}
            {!isS1 && MOOD_ACTIVITIES[moodOverlay] && (
              <div style={{ marginTop:52, borderTop:"1px solid rgba(255,255,255,.25)", paddingTop:40, display:"flex", flexDirection:"column", alignItems:"center", gap:18 }}>
                <div style={{ fontSize:18, fontWeight:300, opacity:.7, letterSpacing:.3 }}>
                  want to do something with this?
                </div>
                <div style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center" }}>
                  {MOOD_ACTIVITIES[moodOverlay].map(id => {
                    const act = ACTIVITY_MAP[id]
                    return (
                      <div
                        key={id}
                        onClick={() => { closeOverlay(); router.push(`${act.route}?mood=${moodOverlay}`) }}
                        style={{
                          display:"flex", alignItems:"center", gap:10,
                          background:"rgba(255,255,255,.22)",
                          border:"1px solid rgba(255,255,255,.35)",
                          color: st.fg,
                          padding:"13px 28px", borderRadius:32, cursor:"pointer",
                          fontSize:18, fontWeight:400,
                          backdropFilter:"blur(8px)",
                          transition:"background .2s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.36)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.22)"}
                      >
                        <span style={{ fontSize:14, opacity:.7, textTransform:"uppercase", letterSpacing:1 }}>{act.name}</span>
                        <span style={{ fontSize:14, opacity:.6 }}>· {act.desc}</span>
                      </div>
                    )
                  })}
                </div>
                <div
                  onClick={() => { closeOverlay(); router.push("/activities") }}
                  style={{ fontSize:16, opacity:.6, cursor:"pointer", textDecoration:"underline", marginTop:4 }}
                >
                  see all 5 →
                </div>
              </div>
            )}
          </div>
          </div>{/* end scale wrapper */}
        </div>
      )}
    </>
  )
}
