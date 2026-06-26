"use client"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { saveJournalEntry } from "@/lib/supabase"

// ── Question config ──────────────────────────────────────────────────────────
// Stored at the top so they're easy to edit or swap for AI-generated questions.
// Each question has: id, text (shown to user), type ("select" | "text"),
// options (select only), placeholder (text only), label (used in summary).

// Door 1: body-first — start with a physical sensation, work inward
const DOOR1_QUESTIONS = [
  {
    id: "d1q1",
    text: "take a breath.\nwhere do you feel something in your body right now?",
    type: "select",
    options: ["chest", "throat", "stomach", "shoulders", "somewhere else"],
    label: "where in the body",
  },
  {
    id: "d1q2",
    text: "is it heavy or light?",
    type: "select",
    options: ["heavy", "light"],
    label: "weight",
  },
  {
    id: "d1q3",
    text: "is it still, or moving?",
    type: "select",
    options: ["still", "moving"],
    label: "quality",
  },
  {
    id: "d1q4",
    text: "if that feeling had a color, what would it be?",
    type: "text",
    placeholder: "whatever comes first…",
    label: "its color",
  },
  {
    id: "d1q5",
    text: "if it could speak, what would it say?",
    type: "text",
    placeholder: "let the words come…",
    label: "if it could speak",
  },
]

// Door 2: source-tracing — start with knowing the feeling, trace it back to its root
const DOOR2_QUESTIONS = [
  {
    id: "d2q1",
    text: "you know what you're feeling.\nwhen did you first notice it today?",
    type: "text",
    placeholder: "take your time…",
    label: "when it arrived",
  },
  {
    id: "d2q2",
    text: "what was happening right before it showed up?",
    type: "text",
    placeholder: "describe the moment…",
    label: "what preceded it",
  },
  {
    id: "d2q3",
    text: "is this feeling familiar, or new?",
    type: "select",
    options: ["familiar", "new"],
    label: "familiar or new",
  },
  {
    id: "d2q4",
    text: "if you trace it back — what do you think it's really about?",
    type: "text",
    placeholder: "no pressure, whatever surfaces…",
    label: "what it's really about",
  },
  {
    id: "d2q5",
    text: "what does this feeling need you to know?",
    type: "text",
    placeholder: "let it speak…",
    label: "what it needs you to know",
  },
]

// Build warm reflection prose that mirrors the user's own words back to them.
// Returns an array of sentences — each shown as a paragraph in the end card.
// Rules: only their words, only validation. No advice, no diagnosis, no "you should".
function buildReflection(doorNum, answers) {
  if (!answers) return []
  const sentences = []

  if (doorNum === 1) {
    // ── Door 1: body-first path ──
    const bodyPart = answers["d1q1"]  // where in the body
    const weight   = answers["d1q2"]  // heavy / light
    const quality  = answers["d1q3"]  // still / moving
    const color    = answers["d1q4"]  // color (text)
    const voice    = answers["d1q5"]  // what it would say (text)

    // Weave the physical sensation into one sentence
    if (bodyPart && weight && quality) {
      sentences.push(`you said it sits in your ${bodyPart} — ${weight}, and ${quality}.`)
    } else if (bodyPart && weight) {
      sentences.push(`you said it sits in your ${bodyPart}, and it feels ${weight}.`)
    } else if (bodyPart) {
      sentences.push(`you noticed something in your ${bodyPart}.`)
    }

    if (color) {
      sentences.push(`the color you gave it: ${color}.`)
    }

    // Wrap voice in curly quotes so the user's words feel held, not quoted clinically
    if (voice) {
      sentences.push(`if it could speak, it said: “${voice}”`)
    }

    // Closing validation — always present, always in the author's voice
    sentences.push(`you noticed all of that. that’s not nothing.`)

  } else if (doorNum === 2) {
    // ── Door 2: source-tracing path ──
    const when      = answers["d2q1"]  // when they first noticed it
    const before    = answers["d2q2"]  // what happened right before
    const familiar  = answers["d2q3"]  // "familiar" or "new"
    const about     = answers["d2q4"]  // what it's really about
    const needsKnow = answers["d2q5"]  // what it needs them to know

    if (when) {
      sentences.push(`you first noticed it ${when}.`)
    }

    if (before) {
      sentences.push(`right before it showed up: ${before}.`)
    }

    // Rephrase familiar/new warmly — not clinical, not diagnostic
    if (familiar === "familiar") {
      sentences.push(`this feeling knows you — it’s been here before.`)
    } else if (familiar === "new") {
      sentences.push(`this one felt new to you, and you still sat with it.`)
    }

    if (about) {
      sentences.push(`when you traced it back, what you found was: “${about}”`)
    }

    if (needsKnow) {
      sentences.push(`and what it needed you to hear: “${needsKnow}”`)
    }

    sentences.push(`you held the thread all the way back. that matters.`)
  }

  return sentences
}

// Build a plain-text summary for saving to Pages and prefilling Spill.
// Includes the reflection prose + the raw labeled answers for a complete record.
function assembleSummary(doorNum, questions, answers) {
  const header = doorNum === 1
    ? "compass — what am i feeling?"
    : "compass — why am i feeling this?"
  const reflection = buildReflection(doorNum, answers).join(" ")
  const rawAnswers = questions
    .map(q => answers[q.id] ? `${q.label}: ${answers[q.id]}` : null)
    .filter(Boolean)
    .join("\n")
  return `${header}\n\n${reflection}\n\n${rawAnswers}`
}

// ── Shared nav bar — back button + feelbetter wordmark ────────────────────────
function CompassNav({ onBack }) {
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

// ── Decorative compass rose — tops the door and end views ─────────────────────
function CompassMark({ opacity = ".58" }) {
  return (
    <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" stroke="#b0bba0" strokeWidth="1.8" opacity={opacity} />
      {/* North needle */}
      <polygon points="24,8 26,24 24,22 22,24" fill="#b0bba0" opacity={opacity} />
      {/* South needle — slightly dimmer */}
      <polygon points="24,40 26,24 24,26 22,24" fill="#b0bba0" opacity={parseFloat(opacity) * 0.45} />
      {/* East/West arms */}
      <polygon points="40,24 24,22 26,24 24,26" fill="#b0bba0" opacity={parseFloat(opacity) * 0.28} />
      <polygon points="8,24  24,22 22,24 24,26" fill="#b0bba0" opacity={parseFloat(opacity) * 0.28} />
      <circle cx="24" cy="24" r="2.2" fill="#b0bba0" opacity={opacity} />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main content — separated so useSearchParams can be wrapped in Suspense
// ─────────────────────────────────────────────────────────────────────────────
function CompassContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { user }     = useAuth()

  // Optional mood from dashboard mood overlay (e.g. ?mood=heavy) — saved with journal entry
  const mood = searchParams.get("mood") || null

  // ── View state machine ──────────────────────────────────────────────────────
  // "door"     → pick which path: body-first or source-tracing
  // "question" → answering one question at a time
  // "end"      → gentle close with summary + save/spill actions
  const [view, setView] = useState("door")

  // Which door was chosen: 1 (body-first) or 2 (source-tracing)
  const [door, setDoor] = useState(null)

  // Which question we're currently on (0-indexed)
  const [step, setStep] = useState(0)

  // All answers collected: { questionId: "answer string" }
  const [answers, setAnswers] = useState({})

  // The answer being built for the current question (text input or selected chip)
  const [currentAnswer, setCurrentAnswer] = useState("")

  // End card state
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  // Captures the complete answer set at the moment we transition to the end view.
  // Using a separate state guarantees all 5 answers are present in end-card handlers,
  // even if React's async state batching means `answers` hasn't fully committed yet.
  const [finalAnswers, setFinalAnswers] = useState(null)

  // Desktop scaling — same formula used across all pages
  const [pageScale, setPageScale] = useState(1)
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      setPageScale(w >= 1024 ? Math.min(1, w / 1920) : 1)
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Derived values
  const questions    = door === 1 ? DOOR1_QUESTIONS : door === 2 ? DOOR2_QUESTIONS : []
  const currentQ     = questions[step]
  const isLastQ      = step === questions.length - 1
  const canNext      = currentAnswer.trim().length > 0

  // ── Choose a door: initialize state, begin question flow ──
  const chooseDoor = (doorNum) => {
    setDoor(doorNum)
    setStep(0)
    setAnswers({})
    setCurrentAnswer("")
    setSaved(false)
    setView("question")
  }

  // ── Select a tap-option chip (for select-type questions) ──
  const selectOption = (opt) => setCurrentAnswer(opt)

  // ── Advance to the next question, or to the end card ──
  const handleNext = () => {
    if (!canNext) return

    const updatedAnswers = { ...answers, [currentQ.id]: currentAnswer.trim() }
    setAnswers(updatedAnswers)
    setCurrentAnswer("")

    if (isLastQ) {
      // Store the complete answer set before entering the end view.
      // This is the ONLY place we transition to "end" — Spill navigation
      // never happens here; it only happens when the user taps "take to spill".
      setFinalAnswers(updatedAnswers)
      setView("end")
    } else {
      setStep(s => s + 1)
    }
  }

  // ── Context-aware back navigation ──
  const handleNavBack = () => {
    if (view === "door") {
      router.back()
      return
    }
    if (view === "question") {
      if (step === 0) {
        // First question → back to door picker
        setView("door")
        setCurrentAnswer("")
        return
      }
      // Previous question → restore that question's saved answer
      const prevQ = questions[step - 1]
      setCurrentAnswer(answers[prevQ.id] || "")
      setStep(s => s - 1)
      return
    }
    if (view === "end") {
      // Back to the last question — restore its saved answer from finalAnswers
      const lastQ = questions[questions.length - 1]
      setCurrentAnswer((finalAnswers || answers)[lastQ.id] || "")
      setStep(questions.length - 1)
      setView("question")
    }
  }

  // The definitive answers to use in end-card actions.
  // finalAnswers is always the right one — it was captured when the user finished.
  const endAnswers = finalAnswers || answers

  // ── Save summary to journal_entries as activity "compass" ──
  const handleSaveToPages = async () => {
    if (!user || saving || saved) return
    setSaving(true)
    const content = assembleSummary(door, questions, endAnswers)
    await saveJournalEntry(user.id, { activity: "compass", content, mood })
    setSaving(false)
    setSaved(true)
  }

  // ── Navigate to Spill with summary pre-filled in the textarea ──
  // Only called when user explicitly taps "take to spill" — never triggered automatically.
  const handleTakeToSpill = () => {
    const content = assembleSummary(door, questions, endAnswers)
    router.push(`/activities/spill?prefill=${encodeURIComponent(content)}`)
  }

  // ── Reset everything back to the door picker ──
  const handleStartOver = () => {
    setView("door")
    setDoor(null)
    setStep(0)
    setAnswers({})
    setFinalAnswers(null)
    setCurrentAnswer("")
    setSaved(false)
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* Door card hover state */
        .compass-door-card {
          background: rgba(255,255,255,.58);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: .5px solid rgba(255,255,255,.9);
          border-radius: 26px;
          padding: 36px 28px;
          cursor: pointer;
          transition: transform .25s ease, box-shadow .25s ease, background .2s;
          box-shadow: 0 5px 26px rgba(60,120,140,.07);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .compass-door-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 52px rgba(80,130,110,.13);
          background: rgba(255,255,255,.78);
        }

        /* View entrance animation */
        @keyframes compassFadeIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: none; }
        }
        .compass-fade { animation: compassFadeIn .36s ease both; }

        /* Textarea placeholder */
        .compass-textarea::placeholder { color: rgba(80,120,110,.4); font-style: italic; }

        /* Save button pulse while saving */
        @keyframes softPulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: .5; }
        }
        .compass-saving { animation: softPulse 1.6s ease-in-out infinite; }
      `}</style>

      {/* Full-screen aqua background — compass never tints */}
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

          <CompassNav onBack={handleNavBack} />

          {/* ════════════════════════════════════════════════════════════════
              VIEW 1: DOOR PICKER — choose your path into the session
          ════════════════════════════════════════════════════════════════ */}
          {view === "door" && (
            <main className="compass-fade" style={{ maxWidth: 700, margin: "0 auto", padding: "52px 28px 100px" }}>

              {/* Page header */}
              <div style={{ marginBottom: 52 }}>
                <div style={{ marginBottom: 20 }}><CompassMark /></div>
                <h1 style={{
                  fontFamily: "var(--font-dm-serif), serif",
                  fontSize: "clamp(44px,5.8vw,72px)",
                  fontWeight: 400, color: "#0f2e35",
                  letterSpacing: -1.8, lineHeight: 1.02, marginBottom: 14,
                }}>compass.</h1>
                <p style={{ fontSize: 17, color: "#5a7a6a", fontWeight: 300, lineHeight: 1.68, maxWidth: 440 }}>
                  the right questions, asked slowly.<br />
                  where would you like to start?
                </p>
              </div>

              {/* Door cards — two paths side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

                {/* Door 1: body-first */}
                <div className="compass-door-card" onClick={() => chooseDoor(1)}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: "rgba(176,187,160,.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                      stroke="#7a9a78" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2s-4 4.5-4 8a4 4 0 0 0 8 0c0-3.5-4-8-4-8z"/>
                      <path d="M9 14a3 3 0 0 0 6 0"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{
                      fontSize: 19, fontWeight: 500, color: "#1a3a42",
                      lineHeight: 1.3, marginBottom: 8,
                    }}>
                      what am i feeling?
                    </div>
                    <div style={{
                      fontSize: 14, fontWeight: 300, color: "#6a8878", lineHeight: 1.6,
                    }}>
                      start with your body — trace a sensation inward.
                    </div>
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 13, color: "#9ab8a8", marginTop: 2,
                  }}>
                    5 questions
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>

                {/* Door 2: source-tracing */}
                <div className="compass-door-card" onClick={() => chooseDoor(2)}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: "rgba(160,176,190,.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                      stroke="#6a8aaa" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="7" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  </div>
                  <div>
                    <div style={{
                      fontSize: 19, fontWeight: 500, color: "#1a3a42",
                      lineHeight: 1.3, marginBottom: 8,
                    }}>
                      why am i feeling this?
                    </div>
                    <div style={{
                      fontSize: 14, fontWeight: 300, color: "#6a7a8a", lineHeight: 1.6,
                    }}>
                      you know the feeling — trace it back to its root.
                    </div>
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 13, color: "#9aaab8", marginTop: 2,
                  }}>
                    5 questions
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </div>
            </main>
          )}

          {/* ════════════════════════════════════════════════════════════════
              VIEW 2: QUESTION — one question, full and spacious. No rushing.
              key={door + "-" + step} forces React to remount on each step
              change, which re-triggers the fade-in animation cleanly.
          ════════════════════════════════════════════════════════════════ */}
          {view === "question" && currentQ && (
            <main
              key={`${door}-${step}`}
              className="compass-fade"
              style={{ maxWidth: 660, margin: "0 auto", padding: "64px 28px 100px" }}
            >
              {/* Gentle breadcrumb — no progress bar, just soft context */}
              <p style={{
                fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase",
                color: "#9ab8b0", marginBottom: 48, fontWeight: 500,
              }}>
                {door === 1 ? "what am i feeling?" : "why am i feeling this?"}
                {" · "}{step + 1} of {questions.length}
              </p>

              {/* Question text — large, unhurried, DM Serif */}
              <h2 style={{
                fontFamily: "var(--font-dm-serif), serif",
                fontSize: "clamp(30px,4vw,50px)",
                fontWeight: 400, color: "#0f2e35",
                lineHeight: 1.2, letterSpacing: -.6,
                marginBottom: 52, whiteSpace: "pre-line",
              }}>
                {currentQ.text}
              </h2>

              {/* ── TAP-SELECT options ── */}
              {currentQ.type === "select" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 56 }}>
                  {currentQ.options.map(opt => {
                    const isSelected = currentAnswer === opt
                    return (
                      <button
                        key={opt}
                        onClick={() => selectOption(opt)}
                        style={{
                          padding: "13px 30px",
                          background: isSelected
                            ? "rgba(176,187,160,.28)"
                            : "rgba(255,255,255,.6)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                          border: isSelected
                            ? "1.5px solid rgba(176,187,160,.72)"
                            : ".5px solid rgba(255,255,255,.9)",
                          borderRadius: 30,
                          fontSize: 16, fontWeight: 300,
                          color: isSelected ? "#3a5a38" : "#3a4a42",
                          cursor: "pointer",
                          transition: "all .2s ease",
                          fontFamily: "var(--font-dm-sans), sans-serif",
                        }}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* ── OPEN TEXT input ── */}
              {currentQ.type === "text" && (
                <textarea
                  className="compass-textarea"
                  value={currentAnswer}
                  onChange={e => setCurrentAnswer(e.target.value)}
                  placeholder={currentQ.placeholder}
                  rows={4}
                  style={{
                    width: "100%", display: "block", marginBottom: 48,
                    background: "rgba(255,255,255,.5)",
                    backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
                    border: ".5px solid rgba(255,255,255,.9)",
                    borderRadius: 18, padding: "20px 24px",
                    fontSize: 17, fontWeight: 300, color: "#1a3a42",
                    lineHeight: 1.82, resize: "none", outline: "none",
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    transition: "border .2s, background .2s",
                  }}
                  onFocus={e => {
                    e.target.style.border = ".5px solid rgba(176,187,160,.6)"
                    e.target.style.background = "rgba(255,255,255,.7)"
                  }}
                  onBlur={e => {
                    e.target.style.border = ".5px solid rgba(255,255,255,.9)"
                    e.target.style.background = "rgba(255,255,255,.5)"
                  }}
                />
              )}

              {/* Next / finish button — dim until user has answered */}
              <button
                onClick={handleNext}
                disabled={!canNext}
                style={{
                  padding: "14px 56px",
                  background: canNext ? "rgba(176,187,160,.18)" : "rgba(200,210,200,.07)",
                  color: canNext ? "#4a7248" : "#9aacaa",
                  border: canNext
                    ? "1.5px solid rgba(176,187,160,.4)"
                    : ".5px solid rgba(200,210,200,.22)",
                  borderRadius: 30, fontSize: 17, fontWeight: 500, letterSpacing: ".3px",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  cursor: canNext ? "pointer" : "default",
                  transition: "all .25s",
                }}
                onMouseEnter={e => { if (canNext) e.currentTarget.style.background = "rgba(176,187,160,.3)" }}
                onMouseLeave={e => { if (canNext) e.currentTarget.style.background = "rgba(176,187,160,.18)" }}
              >
                {isLastQ ? "see what you traced →" : "next →"}
              </button>
            </main>
          )}

          {/* ════════════════════════════════════════════════════════════════
              VIEW 3: END CARD — soft close, full summary, save + spill
          ════════════════════════════════════════════════════════════════ */}
          {view === "end" && (
            <main className="compass-fade" style={{ maxWidth: 680, margin: "0 auto", padding: "64px 28px 100px" }}>

              {/* Closing message */}
              <div style={{ marginBottom: 48 }}>
                <div style={{ marginBottom: 20 }}><CompassMark opacity=".45" /></div>
                <h2 style={{
                  fontFamily: "var(--font-dm-serif), serif",
                  fontSize: "clamp(30px,4.2vw,52px)",
                  fontWeight: 400, color: "#0f2e35",
                  lineHeight: 1.16, letterSpacing: -1, marginBottom: 12,
                }}>
                  you traced something today.
                </h2>
                <p style={{ fontSize: 18, color: "#7a9a88", fontWeight: 300, fontStyle: "italic" }}>
                  that takes courage.
                </p>
              </div>

              {/* Reflection card — warm prose that mirrors the user's own words.
                  buildReflection() weaves their answers into validating sentences.
                  The closing sentence (always last) is styled differently to signal
                  it's the author's voice, not the user's reflected words. */}
              <div style={{
                background: "rgba(255,255,255,.62)",
                backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                border: ".5px solid rgba(255,255,255,.92)",
                borderRadius: 28, padding: "36px 40px",
                marginBottom: 36,
              }}>
                {buildReflection(door, endAnswers).map((sentence, i, arr) => {
                  const isClosing = i === arr.length - 1
                  return (
                    <p key={i} style={{
                      fontSize: isClosing ? 15 : 17,
                      fontWeight: isClosing ? 400 : 300,
                      color: isClosing ? "#6a8a78" : "#1a3a42",
                      fontStyle: isClosing ? "italic" : "normal",
                      lineHeight: 1.85,
                      marginBottom: isClosing ? 0 : 20,
                    }}>
                      {sentence}
                    </p>
                  )
                })}
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>

                {/* Save to pages — logged-in users only */}
                {user && (
                  <button
                    onClick={handleSaveToPages}
                    disabled={saving || saved}
                    className={saving ? "compass-saving" : ""}
                    style={{
                      padding: "14px 36px",
                      background: saved ? "rgba(140,170,140,.2)" : "rgba(255,255,255,.65)",
                      backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                      border: saved
                        ? "1px solid rgba(140,170,140,.45)"
                        : ".5px solid rgba(255,255,255,.9)",
                      borderRadius: 30, fontSize: 16, fontWeight: 400,
                      color: saved ? "#4a7a4a" : "#3a5a5a",
                      cursor: (saving || saved) ? "default" : "pointer",
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      transition: "all .25s",
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                    onMouseEnter={e => { if (!saving && !saved) e.currentTarget.style.background = "rgba(255,255,255,.88)" }}
                    onMouseLeave={e => { if (!saving && !saved) e.currentTarget.style.background = "rgba(255,255,255,.65)" }}
                  >
                    {saved ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        saved to pages
                      </>
                    ) : saving ? "saving…" : "save to pages"}
                  </button>
                )}

                {/* Take to spill — available to everyone */}
                <button
                  onClick={handleTakeToSpill}
                  style={{
                    padding: "14px 36px",
                    background: "rgba(255,255,255,.65)",
                    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                    border: ".5px solid rgba(255,255,255,.9)",
                    borderRadius: 30, fontSize: 16, fontWeight: 400,
                    color: "#3a5a6a", cursor: "pointer",
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    transition: "background .25s",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.88)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.65)"}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2s-7 7.5-7 12a7 7 0 0 0 14 0c0-4.5-7-12-7-12z"/>
                    <path d="M9 17a3 3 0 0 0 6 0"/>
                  </svg>
                  take to spill
                </button>
              </div>

              {/* Guest nudge for save button */}
              {!user && (
                <p style={{ fontSize: 13, color: "#9aacaa", fontWeight: 300, fontStyle: "italic" }}>
                  sign in to save your entries to pages.
                </p>
              )}

              {/* Start over link */}
              <div style={{ marginTop: 40 }}>
                <button
                  onClick={handleStartOver}
                  style={{
                    background: "none", border: "none",
                    fontSize: 14, color: "#8aaab0",
                    cursor: "pointer",
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    textDecoration: "underline", padding: 0,
                  }}
                >
                  start over
                </button>
              </div>
            </main>
          )}

        </div>
      </div>
    </>
  )
}

// Suspense wrapper required because CompassContent uses useSearchParams()
export default function CompassPage() {
  return (
    <Suspense>
      <CompassContent />
    </Suspense>
  )
}
