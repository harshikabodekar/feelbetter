"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { saveJournalEntry, uploadVoiceNote, fetchJournalEntries, fetchVoiceNotes, getSignedUrl } from "@/lib/supabase"

// Mood dot colors — for "your pages" entry cards
const MOOD_COLORS = {
  empty: "#8a9aa8", overwhelmed: "#5eb4c2",
  okayish: "#7a8a6f", heavy: "#6b5fa3", full: "#e08a3c",
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  })
}

// Voice-note card for "your pages" — generates signed URL lazily
function PagesVoiceCard({ note }) {
  const [url,        setUrl]        = useState(null)
  const [urlLoading, setUrlLoading] = useState(true)

  useEffect(() => {
    getSignedUrl(note.file_path)
      .then(signed => {
        if (!signed) console.warn('[feelbetter] PagesVoiceCard: null signed URL for', note.file_path)
        setUrl(signed)
      })
      .catch(err => console.error('[feelbetter] PagesVoiceCard getSignedUrl:', err))
      .finally(() => setUrlLoading(false))
  }, [note.file_path])

  return (
    <div style={{
      background: "rgba(255,255,255,.58)",
      backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
      border: ".5px solid rgba(255,255,255,.9)",
      borderRadius: 18, padding: "18px 22px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        {note.mood && (
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: MOOD_COLORS[note.mood] || "#ccc",
            display: "inline-block",
          }} title={note.mood} />
        )}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#9aacb0", whiteSpace: "nowrap" }}>
          {fmtDate(note.created_at)}
        </span>
      </div>
      {urlLoading ? (
        <p style={{ fontSize: 13, color: "#9aacb0", fontStyle: "italic" }}>loading audio...</p>
      ) : url ? (
        <audio src={url} controls style={{ width: "100%", borderRadius: 8, outline: "none" }} />
      ) : (
        <p style={{ fontSize: 13, color: "#9a8090", fontStyle: "italic" }}>couldn&apos;t load this recording</p>
      )}
    </div>
  )
}

// Writing entry card for "your pages"
function PagesWriteCard({ entry }) {
  const preview = (entry.content || "").slice(0, 200) + ((entry.content || "").length > 200 ? "…" : "")
  return (
    <div style={{
      background: "rgba(255,255,255,.58)",
      backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
      border: ".5px solid rgba(255,255,255,.9)",
      borderRadius: 18, padding: "18px 22px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        {entry.mood && (
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: MOOD_COLORS[entry.mood] || "#ccc",
            display: "inline-block",
          }} title={entry.mood} />
        )}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#9aacb0", whiteSpace: "nowrap" }}>
          {fmtDate(entry.created_at)}
        </span>
      </div>
      <p style={{ fontSize: 15, fontWeight: 300, color: "#3a2a14", lineHeight: 1.75, margin: 0 }}>
        {preview}
      </p>
    </div>
  )
}

// ── Mode definitions — drives the picker cards ────────────────────────────────
const MODES = [
  {
    id: "write",
    label: "write",
    desc: "blank page, open space",
    accent: "#c4a870",
    iconType: "book",
    comingSoon: false,
  },
  {
    id: "voice",
    label: "voice",
    desc: "record yourself, raw and unedited",
    accent: "#b89aac",
    iconType: "mic",
    comingSoon: false,
  },
  {
    id: "video",
    label: "video",
    desc: "record yourself, locked behind your private PIN — coming soon.",
    accent: "#a0a8b0",
    iconType: "video",
    comingSoon: true,
  },
  {
    id: "scrapbook",
    label: "scrapbook",
    desc: "a mood board of a feeling — photos, audio, color, all in one soft collage — coming soon.",
    accent: "#a0a8b0",
    iconType: "grid",
    comingSoon: true,
  },
]

// ── Mode icons ─────────────────────────────────────────────────────────────────
function ModeIcon({ type, color, size = 24 }) {
  const shared = {
    fill: "none", stroke: color,
    strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round",
  }
  if (type === "book") return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...shared}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
  if (type === "mic") return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...shared}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8"  y1="23" x2="16" y2="23" />
    </svg>
  )
  if (type === "video") return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...shared}>
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  )
  if (type === "grid") return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...shared}>
      <rect x="3"  y="3"  width="7" height="7" rx="1" />
      <rect x="14" y="3"  width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3"  y="14" width="7" height="7" rx="1" />
    </svg>
  )
  return null
}

// ── Shared nav bar ─────────────────────────────────────────────────────────────
function PagesNav({ onBack }) {
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
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="#3a8a8f" strokeWidth="1.8" strokeLinecap="round">
          <path d="M2 9c2.4-3 4.3-3 6.7 0s4.3 3 6.7 0 4.3-3 6.6 0" />
          <path d="M2 14.5c2.4-3 4.3-3 6.7 0s4.3 3 6.7 0 4.3-3 6.6 0" />
        </svg>
        feelbetter
      </span>
    </nav>
  )
}

// ── Decorative bookmark icon — tops the picker and write view ─────────────────
function BookMark({ color = "#c4a870", opacity = ".6" }) {
  return (
    <svg width="26" height="34" viewBox="0 0 26 34" fill="none">
      <path d="M2 2h22v30l-11-7-11 7V2z" fill={color} opacity={opacity} />
    </svg>
  )
}

// ── Decorative mic icon — tops the voice view ──────────────────────────────────
function MicMark({ color = "#b89aac", opacity = ".6" }) {
  return (
    <svg width="28" height="36" viewBox="0 0 48 60" fill="none">
      <rect x="15" y="2" width="18" height="28" rx="9" fill={color} opacity={opacity} />
      <path d="M10 26c0 7.7 6.3 14 14 14s14-6.3 14-14"
        stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity=".75" />
      <line x1="24" y1="40" x2="24" y2="54" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity=".75" />
      <line x1="16" y1="54" x2="32" y2="54" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity=".75" />
    </svg>
  )
}

// ── Chevron right — used on active mode cards ──────────────────────────────────
function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="#9ab8c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main content — inner component so useSearchParams can live inside Suspense
// ─────────────────────────────────────────────────────────────────────────────
function PagesContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { user }     = useAuth()

  // View state machine: "picker" | "write" | "voice" | "your-pages"
  const [view, setView] = useState("picker")

  // ── Your pages mode ──
  const [pagesLoading,    setPagesLoading]    = useState(false)
  const [pagesWriting,    setPagesWriting]    = useState([])
  const [pagesVoices,     setPagesVoices]     = useState([])
  const [pagesRefreshKey, setPagesRefreshKey] = useState(0)  // increment to force a re-fetch

  // ── Write mode ──
  const [writeText,   setWriteText]   = useState("")
  const [writeSaving, setWriteSaving] = useState(false)
  const [writeSaved,  setWriteSaved]  = useState(false)

  // ── Voice mode ──
  // idle → recording → review → saved
  const [voiceState,  setVoiceState]  = useState("idle")
  const [audioBlob,   setAudioBlob]   = useState(null)
  const [audioUrl,    setAudioUrl]    = useState(null)
  const [recordSecs,  setRecordSecs]  = useState(0)
  const [micDenied,   setMicDenied]   = useState(false)
  const [voiceSaving, setVoiceSaving] = useState(false)

  // Refs for MediaRecorder — outside state so they don't trigger re-renders
  const mediaRecorderRef = useRef(null)
  const audioChunksRef   = useRef([])
  const streamRef        = useRef(null)  // held so we can stop the mic later
  const timerRef         = useRef(null)

  // Desktop scale
  const [pageScale, setPageScale] = useState(1)

  // mood passed as ?mood=heavy when coming from the dashboard mood overlay
  const mood = searchParams.get("mood") || null

  // ── Desktop scaling — same formula everywhere ──
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      setPageScale(w >= 1024 ? Math.min(1, w / 1920) : 1)
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // ── Recording timer — counts up once recording starts ──
  useEffect(() => {
    if (voiceState === "recording") {
      setRecordSecs(0)
      timerRef.current = setInterval(() => setRecordSecs(s => s + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [voiceState])

  // ── Release object URL when the component unmounts or URL changes ──
  useEffect(() => {
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl) }
  }, [audioUrl])

  // ── Load "your pages" data when view opens or refresh is triggered ──
  useEffect(() => {
    if (view !== "your-pages" || !user) return
    setPagesLoading(true)

    const writingFetch = fetchJournalEntries(user.id, { activity: "pages-write" })
      .catch(err => { console.error('[feelbetter] your-pages writings:', err); return [] })

    const voiceFetch = fetchVoiceNotes(user.id)
      .catch(err => { console.error('[feelbetter] your-pages voices:', err); return [] })

    Promise.all([writingFetch, voiceFetch])
      .then(([writings, voices]) => {
        console.log(`[feelbetter] your-pages: ${writings.length} writings, ${voices.length} voice notes`)
        setPagesWriting(writings)
        setPagesVoices(voices)
      })
      .catch(err => console.error('[feelbetter] your-pages unexpected:', err))
      .finally(() => setPagesLoading(false))
  }, [view, user, pagesRefreshKey])

  // ── Reset all state and return to mode picker ──
  const goToPicker = () => {
    if (mediaRecorderRef.current && voiceState === "recording") {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl)

    setView("picker")
    setWriteText(""); setWriteSaving(false); setWriteSaved(false)
    setVoiceState("idle"); setAudioBlob(null); setAudioUrl(null)
    setRecordSecs(0); setMicDenied(false); setVoiceSaving(false)
  }

  // The nav back arrow is context-aware:
  // picker → previous page, any sub-view → back to picker
  const handleNavBack = () => {
    if (view === "picker") router.back()
    else goToPicker()
  }

  // ── Write: save to journal_entries ──
  const handleSaveWrite = async () => {
    if (!writeText.trim() || writeSaving) return
    setWriteSaving(true)
    if (user) {
      await saveJournalEntry(user.id, {
        activity: "pages-write",
        content:  writeText.trim(),
        mood,
      })
    }
    setWriteSaving(false)
    setWriteSaved(true)
  }

  // ── Voice: request mic and start MediaRecorder ──
  const startRecording = async () => {
    setMicDenied(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Pick the best MIME type the browser supports
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg", "audio/mp4"]
        .find(t => MediaRecorder.isTypeSupported(t)) || ""

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      mediaRecorderRef.current = recorder
      audioChunksRef.current   = []

      recorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType || "audio/webm" })
        const url  = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        // Release the mic
        stream.getTracks().forEach(t => t.stop())
        streamRef.current = null
        setVoiceState("review")
      }

      recorder.start()
      setVoiceState("recording")
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setMicDenied(true)
      } else {
        console.error("[feelbetter] startRecording:", err)
      }
    }
  }

  // ── Voice: stop recording (onstop above handles the rest) ──
  const stopRecording = () => {
    if (mediaRecorderRef.current && voiceState === "recording") {
      mediaRecorderRef.current.stop()
    }
  }

  // ── Voice: upload blob → Storage, insert row → voice_notes ──
  const handleSaveVoice = async () => {
    if (!audioBlob || voiceSaving) return
    setVoiceSaving(true)
    if (user) {
      await uploadVoiceNote(user.id, audioBlob, mood)
    }
    setVoiceSaving(false)
    setVoiceState("saved")
  }

  // Discard the current recording and go back to idle
  const discardRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setAudioBlob(null)
    setVoiceState("idle")
  }

  const formatTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`

  const canSaveWrite = writeText.trim().length > 0 && !writeSaving && !writeSaved

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Mode picker cards ── */
        .pages-mode-card {
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
        .pages-mode-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 52px rgba(60,120,140,.13);
          background: rgba(255,255,255,.76);
        }
        .pages-mode-card.disabled {
          opacity: .5;
          cursor: default;
          pointer-events: none;
        }

        /* ── Write textarea placeholder ── */
        .pages-write-area::placeholder {
          color: rgba(140,110,70,.4);
          font-style: italic;
        }

        /* ── Record button pulse while recording ── */
        @keyframes recordPulse {
          0%, 100% { box-shadow: 0 0 0 0   rgba(200,100,110,.35), 0 8px 28px rgba(200,100,110,.15); }
          50%       { box-shadow: 0 0 0 18px rgba(200,100,110,.0),  0 8px 28px rgba(200,100,110,.25); }
        }
        .record-pulse { animation: recordPulse 2s ease-in-out infinite; }

        /* ── View entrance ── */
        @keyframes viewFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: none; }
        }
        .view-fade { animation: viewFadeIn .32s ease both; }

        /* ── Write confirmation entrance ── */
        @keyframes confirmFade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: none; }
        }
        .confirm-fade { animation: confirmFade .42s ease both; }

        /* ── Voice saved card entrance ── */
        @keyframes savedFadeIn {
          from { opacity: 0; transform: scale(.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        .saved-card { animation: savedFadeIn .5s ease .1s both; }

        /* ── Loading pulse on button text ── */
        @keyframes softPulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: .5; }
        }
        .loading-text { animation: softPulse 1.8s ease-in-out infinite; }

        /* ── Native audio element ── */
        audio { width: 100%; border-radius: 12px; outline: none; }
      `}</style>

      {/* Full-screen aqua background — never tints in Pages */}
      <div style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        background: "linear-gradient(165deg,#e6f5f7 0%,#d3edf2 48%,#e8f6f8 100%)",
        minHeight: "100vh",
        color: "#1a3a42",
      }}>

        {/* Desktop scale wrapper — top-left origin, same as dashboard */}
        <div style={pageScale < 1 ? {
          transformOrigin: "top left",
          transform: `scale(${pageScale})`,
          width: `${(100 / pageScale).toFixed(3)}vw`,
        } : {}}>

          <PagesNav onBack={handleNavBack} />

          {/* ══════════════════════════════════════════════════════════════
              VIEW 1 — MODE PICKER
          ══════════════════════════════════════════════════════════════ */}
          {view === "picker" && (
            <main className="view-fade" style={{ maxWidth: 700, margin: "0 auto", padding: "52px 28px 100px" }}>

              {/* Header */}
              <div style={{ marginBottom: 48 }}>
                <div style={{ marginBottom: 18 }}><BookMark /></div>
                <h1 style={{
                  fontFamily: "var(--font-dm-serif), serif",
                  fontSize: "clamp(44px,5.5vw,68px)",
                  fontWeight: 400, color: "#0f2e35",
                  letterSpacing: -1.5, lineHeight: 1.02, marginBottom: 14,
                }}>
                  pages.
                </h1>
                <p style={{ fontSize: 18, color: "#7a6a50", fontWeight: 300, lineHeight: 1.65 }}>
                  how do you want to capture this moment?
                </p>
              </div>

              {/* Mode cards — generated from MODES array */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {MODES.map(mode => (
                  <div
                    key={mode.id}
                    className={`pages-mode-card${mode.comingSoon ? " disabled" : ""}`}
                    onClick={!mode.comingSoon ? () => setView(mode.id) : undefined}
                    style={{ position: "relative" }}
                  >
                    {/* Coming-soon badge — top right corner */}
                    {mode.comingSoon && (
                      <span style={{
                        position: "absolute", top: 14, right: 14,
                        background: "rgba(160,168,176,.2)",
                        color: "#7a9aaa", fontSize: 11, letterSpacing: 1.4,
                        textTransform: "uppercase", padding: "4px 10px",
                        borderRadius: 20, fontWeight: 500,
                      }}>
                        coming soon
                      </span>
                    )}

                    {/* Icon circle */}
                    <div style={{
                      width: 52, height: 52, borderRadius: "50%",
                      background: mode.accent + "22",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <ModeIcon type={mode.iconType} color={mode.accent} size={24} />
                    </div>

                    {/* Label + description */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 17, fontWeight: 500, marginBottom: 5,
                        color: mode.comingSoon ? "#6a8090" : "#1a3a42",
                      }}>
                        {mode.label}
                      </div>
                      <div style={{
                        fontSize: 14, fontWeight: 300, lineHeight: 1.5,
                        color: mode.comingSoon ? "#8a9aaa" : "#5a7a80",
                      }}>
                        {mode.desc}
                      </div>
                    </div>

                    {/* Chevron — only on active cards */}
                    {!mode.comingSoon && <ChevronRight />}
                  </div>
                ))}
              </div>

              {/* "see your pages" button — only for logged-in users */}
              {user && (
                <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
                  <button
                    onClick={() => setView("your-pages")}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 10,
                      background: "rgba(255,255,255,.62)",
                      backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
                      border: ".5px solid rgba(255,255,255,.9)",
                      borderRadius: 20, padding: "14px 28px",
                      cursor: "pointer", fontSize: 15, fontWeight: 400,
                      color: "#3a6a75", fontFamily: "var(--font-dm-sans), sans-serif",
                      boxShadow: "0 4px 18px rgba(60,120,140,.09)",
                      transition: "background .2s, box-shadow .2s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(255,255,255,.88)"
                      e.currentTarget.style.boxShadow = "0 8px 28px rgba(60,120,140,.14)"
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(255,255,255,.62)"
                      e.currentTarget.style.boxShadow = "0 4px 18px rgba(60,120,140,.09)"
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                    see your pages
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              )}
            </main>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 2 — WRITE
          ══════════════════════════════════════════════════════════════ */}
          {view === "write" && (
            <main className="view-fade" style={{ maxWidth: 780, margin: "0 auto", padding: "52px 28px 100px" }}>

              <p style={{ fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", color: "#9a8a70", marginBottom: 28, fontWeight: 500 }}>
                pages → write
              </p>

              <div style={{ marginBottom: 40 }}>
                <div style={{ marginBottom: 16 }}><BookMark /></div>
                <h2 style={{
                  fontFamily: "var(--font-dm-serif), serif",
                  fontSize: "clamp(40px,5vw,62px)",
                  fontWeight: 400, color: "#0f2e35",
                  letterSpacing: -1.3, lineHeight: 1.03, marginBottom: 12,
                }}>
                  write.
                </h2>
                <p style={{ fontSize: 17, color: "#7a6a50", fontWeight: 300 }}>
                  blank page. no pressure. just whatever comes.
                </p>
              </div>

              {/* Textarea card */}
              <div style={{
                background: "rgba(255,255,255,.58)",
                backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
                border: ".5px solid rgba(255,255,255,.92)",
                borderRadius: 28, padding: "6px 6px 16px",
                marginBottom: 22, boxShadow: "0 8px 36px rgba(140,120,60,.07)",
              }}>
                <textarea
                  className="pages-write-area"
                  value={writeText}
                  // Block typing after save — user must explicitly press "write more" to reset
                  onChange={e => !writeSaved && setWriteText(e.target.value)}
                  placeholder="blank page. no prompts. just you."
                  rows={13}
                  style={{
                    width: "100%", background: "transparent",
                    border: "none", outline: "none", resize: "vertical",
                    padding: "30px 34px 10px",
                    fontSize: 18, lineHeight: 1.9, color: "#3a2a14",
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontWeight: 300, letterSpacing: ".01em",
                  }}
                />
                {writeText.length > 0 && (
                  <div style={{ textAlign: "right", paddingRight: 30, fontSize: 12, color: "rgba(140,110,70,.35)" }}>
                    {writeText.length}
                  </div>
                )}
              </div>

              {/* Save button — swaps to confirmation after save */}
              {!writeSaved ? (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={handleSaveWrite}
                    disabled={!canSaveWrite}
                    style={{
                      background: canSaveWrite ? "rgba(196,168,112,.18)" : "rgba(220,210,190,.1)",
                      color:      canSaveWrite ? "#7a5a20"               : "#b0a888",
                      border: `1.5px solid ${canSaveWrite ? "rgba(196,168,112,.4)" : "rgba(210,200,180,.2)"}`,
                      borderRadius: 30, padding: "14px 52px",
                      fontSize: 17, fontWeight: 500, letterSpacing: ".4px",
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      cursor: canSaveWrite ? "pointer" : "default",
                      transition: "background .25s, color .25s, border .25s",
                    }}
                    onMouseEnter={e => { if (canSaveWrite) e.currentTarget.style.background = "rgba(196,168,112,.28)" }}
                    onMouseLeave={e => { if (canSaveWrite) e.currentTarget.style.background = "rgba(196,168,112,.18)" }}
                  >
                    {writeSaving ? <span className="loading-text">saving...</span> : "save"}
                  </button>
                </div>
              ) : (
                /* Confirmation + post-save actions */
                <div className="confirm-fade" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 22 }}>
                  <p style={{
                    fontFamily: "var(--font-dm-serif), serif",
                    fontSize: "clamp(18px,2vw,24px)",
                    fontStyle: "italic", color: "#7a5a20", lineHeight: 1.5,
                  }}>
                    saved. just for you.
                  </p>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => { setWriteSaved(false); setWriteText("") }}
                      style={{
                        background: "rgba(196,168,112,.14)", color: "#7a5a20",
                        border: "1.5px solid rgba(196,168,112,.32)", borderRadius: 24,
                        padding: "11px 32px", fontSize: 15, fontWeight: 500,
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        cursor: "pointer", transition: "background .2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(196,168,112,.24)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(196,168,112,.14)"}
                    >
                      write more
                    </button>
                    <span onClick={goToPicker} style={{ fontSize: 14, color: "#9a9080", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
                      try a different mode
                    </span>
                    <span onClick={() => router.push("/dashboard")} style={{ fontSize: 14, color: "#9a9080", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
                      back to dashboard
                    </span>
                  </div>
                </div>
              )}

              {/* Guest nudge — they can write but nothing is saved */}
              {!user && !writeSaved && writeText.length > 0 && (
                <p style={{ marginTop: 16, fontSize: 14, color: "#9a9080", fontStyle: "italic", fontWeight: 300, textAlign: "right" }}>
                  sign in to save your writing to your account.
                </p>
              )}
            </main>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 3 — VOICE
          ══════════════════════════════════════════════════════════════ */}
          {view === "voice" && (
            <main className="view-fade" style={{ maxWidth: 700, margin: "0 auto", padding: "52px 28px 100px" }}>

              <p style={{ fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", color: "#9a8090", marginBottom: 28, fontWeight: 500 }}>
                pages → voice
              </p>

              {/* Heading — subtitle changes with voiceState */}
              <div style={{ marginBottom: 52 }}>
                <div style={{ marginBottom: 16 }}><MicMark /></div>
                <h2 style={{
                  fontFamily: "var(--font-dm-serif), serif",
                  fontSize: "clamp(40px,5vw,62px)",
                  fontWeight: 400, color: "#0f2e35",
                  letterSpacing: -1.3, lineHeight: 1.03, marginBottom: 12,
                }}>
                  voice.
                </h2>
                <p style={{ fontSize: 17, color: "#7a6070", fontWeight: 300 }}>
                  {voiceState === "idle"      && "tap to speak. stop whenever."}
                  {voiceState === "recording" && "recording. tap to stop."}
                  {voiceState === "review"    && "listen back. save if it feels right."}
                  {voiceState === "saved"     && "your voice is safe here."}
                </p>
              </div>

              {/* ── Mic permission denied ── */}
              {micDenied && (
                <div style={{
                  background: "rgba(255,255,255,.62)", backdropFilter: "blur(12px)",
                  border: ".5px solid rgba(255,255,255,.9)", borderRadius: 24,
                  padding: "28px 32px", marginBottom: 32, textAlign: "center",
                }}>
                  <p style={{ fontSize: 16, color: "#7a5a50", fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
                    your microphone is blocked. allow mic access in your browser settings, then refresh the page.
                  </p>
                  <button
                    onClick={() => setMicDenied(false)}
                    style={{
                      background: "rgba(184,154,172,.14)", color: "#6a4a5a",
                      border: "1px solid rgba(184,154,172,.28)", borderRadius: 20,
                      padding: "9px 26px", fontSize: 14,
                      fontFamily: "var(--font-dm-sans), sans-serif", cursor: "pointer",
                    }}
                  >
                    got it
                  </button>
                </div>
              )}

              {/* ── IDLE: big record button ── */}
              {voiceState === "idle" && !micDenied && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
                  <button
                    onClick={startRecording}
                    style={{
                      width: 112, height: 112, borderRadius: "50%",
                      background: "rgba(184,154,172,.16)",
                      border: "2px solid rgba(184,154,172,.38)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 8px 28px rgba(184,154,172,.18)",
                      transition: "background .25s, transform .2s, box-shadow .25s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(184,154,172,.28)"
                      e.currentTarget.style.transform = "scale(1.04)"
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(184,154,172,.16)"
                      e.currentTarget.style.transform = "scale(1)"
                    }}
                  >
                    <ModeIcon type="mic" color="#b89aac" size={42} />
                  </button>
                  <p style={{ fontSize: 15, color: "#9a8090", fontWeight: 300, fontStyle: "italic" }}>
                    tap to start
                  </p>
                </div>
              )}

              {/* ── RECORDING: stop button + live timer ── */}
              {voiceState === "recording" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>

                  {/* Live timer */}
                  <div style={{
                    fontFamily: "var(--font-dm-serif), serif",
                    fontSize: 56, color: "#5a3a48",
                    letterSpacing: -1, lineHeight: 1,
                    minWidth: 120, textAlign: "center",
                  }}>
                    {formatTime(recordSecs)}
                  </div>

                  {/* Recording indicator dots */}
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(200,100,110,.7)", animation: "softPulse 1.2s ease-in-out infinite" }} />
                    <span style={{ fontSize: 13, color: "#9a8090", letterSpacing: .5 }}>recording</span>
                  </div>

                  {/* Stop button */}
                  <button
                    onClick={stopRecording}
                    className="record-pulse"
                    style={{
                      width: 112, height: 112, borderRadius: "50%",
                      background: "rgba(200,100,110,.14)",
                      border: "2px solid rgba(200,100,110,.32)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", transition: "background .25s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(200,100,110,.24)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(200,100,110,.14)"}
                  >
                    {/* Square stop icon */}
                    <div style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: "rgba(200,100,110,.72)",
                    }} />
                  </button>

                  <p style={{ fontSize: 15, color: "#9a8090", fontWeight: 300, fontStyle: "italic" }}>
                    tap to stop
                  </p>
                </div>
              )}

              {/* ── REVIEW: audio player + save / try-again ── */}
              {voiceState === "review" && audioUrl && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                  {/* Player card */}
                  <div style={{
                    background: "rgba(255,255,255,.62)",
                    backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
                    border: ".5px solid rgba(255,255,255,.9)", borderRadius: 24,
                    padding: "28px 32px",
                    boxShadow: "0 8px 28px rgba(120,80,100,.07)",
                  }}>
                    <p style={{
                      fontSize: 12, letterSpacing: 1.3, textTransform: "uppercase",
                      color: "#9a8090", marginBottom: 18, fontWeight: 500,
                    }}>
                      your recording — {formatTime(recordSecs)}
                    </p>
                    {/* Native audio player — functional and accessible */}
                    <audio src={audioUrl} controls />
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                    <button
                      onClick={handleSaveVoice}
                      disabled={voiceSaving}
                      style={{
                        background: "rgba(184,154,172,.18)", color: "#6a4a5a",
                        border: "1.5px solid rgba(184,154,172,.38)", borderRadius: 30,
                        padding: "14px 44px", fontSize: 17, fontWeight: 500,
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        cursor: voiceSaving ? "default" : "pointer",
                        transition: "background .25s",
                      }}
                      onMouseEnter={e => { if (!voiceSaving) e.currentTarget.style.background = "rgba(184,154,172,.28)" }}
                      onMouseLeave={e => { if (!voiceSaving) e.currentTarget.style.background = "rgba(184,154,172,.18)" }}
                    >
                      {voiceSaving ? <span className="loading-text">saving...</span> : "save it"}
                    </button>
                    <button
                      onClick={discardRecording}
                      style={{
                        background: "transparent", color: "#9a9090",
                        border: "1px solid rgba(160,150,160,.22)", borderRadius: 30,
                        padding: "13px 32px", fontSize: 15, fontWeight: 400,
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        cursor: "pointer", transition: "background .2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(160,150,160,.1)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      try again
                    </button>
                  </div>

                  {/* Guest nudge on review screen */}
                  {!user && (
                    <p style={{ fontSize: 14, color: "#9a8090", fontStyle: "italic", fontWeight: 300 }}>
                      sign in to save your voice notes to your account.
                    </p>
                  )}
                </div>
              )}

              {/* ── SAVED: confirmation ── */}
              {voiceState === "saved" && (
                <div className="saved-card" style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", textAlign: "center", padding: "32px 20px",
                }}>
                  <div style={{ marginBottom: 28, opacity: .55 }}>
                    <MicMark color="#b89aac" opacity="1" />
                  </div>
                  <p style={{
                    fontFamily: "var(--font-dm-serif), serif",
                    fontSize: "clamp(24px,3vw,36px)",
                    fontStyle: "italic", color: "#4a2a38",
                    lineHeight: 1.5, marginBottom: 14,
                  }}>
                    your voice is safe here.
                  </p>
                  <p style={{ fontSize: 15, color: "#7a7080", fontWeight: 300, marginBottom: 48 }}>
                    saved privately to your account.
                  </p>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
                    <button
                      onClick={discardRecording}
                      style={{
                        background: "rgba(184,154,172,.14)", color: "#6a4a5a",
                        border: "1.5px solid rgba(184,154,172,.32)", borderRadius: 24,
                        padding: "11px 34px", fontSize: 15, fontWeight: 500,
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        cursor: "pointer", transition: "background .2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(184,154,172,.24)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(184,154,172,.14)"}
                    >
                      record another
                    </button>
                    <span onClick={goToPicker} style={{ fontSize: 14, color: "#9a9080", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3, display: "flex", alignItems: "center" }}>
                      try a different mode
                    </span>
                    <span onClick={() => router.push("/dashboard")} style={{ fontSize: 14, color: "#9a9080", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3, display: "flex", alignItems: "center" }}>
                      back to dashboard
                    </span>
                  </div>
                </div>
              )}

            </main>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 4 — YOUR PAGES (saved entries for this activity)
          ══════════════════════════════════════════════════════════════ */}
          {view === "your-pages" && (
            <main className="view-fade" style={{ maxWidth: 720, margin: "0 auto", padding: "52px 28px 100px" }}>

              {/* Header row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 44, gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ marginBottom: 16 }}><BookMark /></div>
                  <h2 style={{
                    fontFamily: "var(--font-dm-serif), serif",
                    fontSize: "clamp(40px,5vw,62px)",
                    fontWeight: 400, color: "#0f2e35",
                    letterSpacing: -1.3, lineHeight: 1.03, marginBottom: 12,
                  }}>
                    your pages.
                  </h2>
                  <p style={{ fontSize: 17, color: "#7a6a50", fontWeight: 300 }}>
                    everything you&apos;ve written and recorded, just for you.
                  </p>
                </div>

                {/* Refresh button — re-fetches after a new save */}
                {!pagesLoading && (
                  <button
                    onClick={() => setPagesRefreshKey(k => k + 1)}
                    title="refresh"
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: "rgba(255,255,255,.5)", backdropFilter: "blur(8px)",
                      border: ".5px solid rgba(255,255,255,.85)", borderRadius: 20,
                      padding: "9px 18px", cursor: "pointer", fontSize: 13,
                      color: "#6a9aaa", fontFamily: "var(--font-dm-sans), sans-serif",
                      transition: "background .2s", flexShrink: 0, marginTop: 4,
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
                )}
              </div>

              {/* Loading shimmer */}
              {pagesLoading && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{
                      background: "rgba(255,255,255,.4)", borderRadius: 18,
                      height: 90, animation: "softPulse 1.8s ease-in-out infinite",
                      animationDelay: `${i * 0.15}s`,
                    }} />
                  ))}
                </div>
              )}

              {/* Content */}
              {!pagesLoading && (
                // If nothing at all was saved, show a single clean empty state
                pagesWriting.length === 0 && pagesVoices.length === 0 ? (
                  <div style={{
                    background: "rgba(255,255,255,.54)",
                    backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
                    border: ".5px solid rgba(255,255,255,.9)",
                    borderRadius: 26, padding: "56px 40px", textAlign: "center",
                  }}>
                    <p style={{
                      fontFamily: "var(--font-dm-serif), serif",
                      fontSize: 22, fontStyle: "italic", color: "#6a9aaa",
                      lineHeight: 1.65,
                    }}>
                      nothing here yet.<br />
                      <span style={{ fontSize: 16, fontWeight: 300, color: "#8aaab2" }}>
                        your pages will live here once you write or record something.
                      </span>
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Writing section — only shown when there are entries */}
                    {pagesWriting.length > 0 && (
                      <section style={{ marginBottom: 44 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                          <div style={{ opacity: .7 }}><ModeIcon type="book" color="#c4a870" size={16} /></div>
                          <span style={{ fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", color: "#9a8a70", fontWeight: 600 }}>
                            writing
                          </span>
                          <span style={{ marginLeft: "auto", fontSize: 12, color: "#b0a898" }}>
                            {pagesWriting.length} {pagesWriting.length === 1 ? "entry" : "entries"}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {pagesWriting.map(entry => (
                            <PagesWriteCard key={entry.id} entry={entry} />
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Voice section — only shown when there are recordings */}
                    {pagesVoices.length > 0 && (
                      <section>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                          <div style={{ opacity: .7 }}><ModeIcon type="mic" color="#b89aac" size={16} /></div>
                          <span style={{ fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", color: "#9a8090", fontWeight: 600 }}>
                            voice notes
                          </span>
                          <span style={{ marginLeft: "auto", fontSize: 12, color: "#b0a8b0" }}>
                            {pagesVoices.length} {pagesVoices.length === 1 ? "recording" : "recordings"}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {pagesVoices.map(note => (
                            <PagesVoiceCard key={note.id} note={note} />
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Partial empty hints — if one section has data but the other is empty */}
                    {pagesWriting.length > 0 && pagesVoices.length === 0 && (
                      <p style={{ marginTop: 32, fontSize: 14, color: "#9aacb0", fontStyle: "italic", fontWeight: 300, textAlign: "center" }}>
                        no voice recordings yet. try the voice mode to add one.
                      </p>
                    )}
                    {pagesVoices.length > 0 && pagesWriting.length === 0 && (
                      <p style={{ marginTop: 32, fontSize: 14, color: "#9aacb0", fontStyle: "italic", fontWeight: 300, textAlign: "center" }}>
                        no writings yet. try the write mode to add one.
                      </p>
                    )}
                  </>
                )
              )}
            </main>
          )}

        </div>
      </div>
    </>
  )
}

// Suspense is required by Next.js App Router when useSearchParams is used
// inside a client component that could be statically rendered at build time.
export default function PagesPage() {
  return (
    <Suspense fallback={null}>
      <PagesContent />
    </Suspense>
  )
}
