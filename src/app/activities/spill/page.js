"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { saveJournalEntry } from "@/lib/supabase"

// ── Separated into its own component because useSearchParams requires Suspense ──
function SpillContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [text, setText]         = useState("")
  const [response, setResponse] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [pageScale, setPageScale] = useState(1)
  const responseRef = useRef(null)

  // mood is optional — passed as ?mood=heavy when coming from the mood overlay
  const mood = searchParams.get("mood") || null

  // desktop scaling — matches dashboard / activities pages
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      setPageScale(w >= 1024 ? Math.min(1, w / 1920) : 1)
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // scroll the response into view once it arrives
  useEffect(() => {
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [response])

  const handleRelease = async () => {
    if (!text.trim() || loading) return
    setLoading(true)
    setResponse(null)

    // Save what the user wrote to journal_entries — skips silently for guests
    if (user) {
      saveJournalEntry(user.id, { activity: "spill", content: text.trim(), mood })
    }

    try {
      const res = await fetch("/api/spill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      })
      const data = await res.json()
      setResponse(data.response)
    } catch {
      setResponse("i'm here. whatever you wrote, i'm holding it gently.")
    } finally {
      setLoading(false)
    }
  }

  const handleWriteAgain = () => {
    setResponse(null)
    setText("")
  }

  const canSubmit = text.trim().length > 0 && !loading

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .spill-textarea::placeholder {
          color: rgba(90, 138, 150, 0.45);
          font-style: italic;
        }

        @keyframes spillFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: none; }
        }

        .spill-response-card {
          animation: spillFadeUp 0.5s ease both;
        }

        /* loading pulse on the button text */
        @keyframes softPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.55; }
        }
        .loading-text {
          animation: softPulse 1.8s ease-in-out infinite;
        }
      `}</style>

      <div style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        background: "linear-gradient(165deg,#e6f5f7 0%,#d3edf2 48%,#e8f6f8 100%)",
        minHeight: "100vh",
        color: "#1a3a42",
      }}>

        {/* scale wrapper — desktop only, same formula as dashboard */}
        <div style={pageScale < 1 ? {
          transformOrigin: "top left",
          transform: `scale(${pageScale})`,
          width: `${(100 / pageScale).toFixed(3)}vw`,
        } : {}}>

          {/* ── nav ── */}
          <nav style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "28px 40px 0",
          }}>
            <button
              onClick={() => router.back()}
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

          {/* ── main content ── */}
          <main style={{
            maxWidth: 780,
            margin: "0 auto",
            padding: "52px 28px 100px",
          }}>

            {/* heading block */}
            <div style={{ marginBottom: 44 }}>
              {/* raindrop icon */}
              <div style={{ marginBottom: 20 }}>
                <svg width="30" height="36" viewBox="0 0 48 58" fill="none">
                  <path d="M24 4s-16 18-16 30a16 16 0 0 0 32 0C40 22 24 4 24 4z"
                    fill="#7ac4d0" opacity=".65" />
                </svg>
              </div>

              <h1 style={{
                fontFamily: "var(--font-dm-serif), serif",
                fontSize: "clamp(44px, 5.5vw, 70px)",
                fontWeight: 400, color: "#0f2e35",
                letterSpacing: -1.5, lineHeight: 1.02,
                marginBottom: 14,
              }}>
                spill.
              </h1>

              <p style={{
                fontSize: 18, color: "#5a8a96",
                fontWeight: 300, lineHeight: 1.65,
                maxWidth: 460,
              }}>
                let it all out, unfiltered.{" "}
                <span style={{ opacity: .7 }}>this page doesn't judge.</span>
              </p>
            </div>

            {/* ── textarea card ── */}
            <div style={{
              background: "rgba(255,255,255,.58)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: ".5px solid rgba(255,255,255,.92)",
              borderRadius: 28,
              padding: "6px 6px 16px",
              marginBottom: 20,
              boxShadow: "0 8px 36px rgba(60,120,140,.09)",
              transition: "box-shadow .3s",
            }}>
              <textarea
                className="spill-textarea"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="let it out. no one's grading this."
                rows={11}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  resize: "vertical",
                  padding: "30px 34px 10px",
                  fontSize: 18,
                  lineHeight: 1.9,
                  color: "#1a3a42",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontWeight: 300,
                  letterSpacing: ".01em",
                }}
              />

              {/* subtle character count — only visible once typing starts */}
              {text.length > 0 && (
                <div style={{
                  textAlign: "right",
                  paddingRight: 30,
                  fontSize: 12,
                  color: "rgba(90,138,150,.4)",
                  letterSpacing: ".4px",
                }}>
                  {text.length}
                </div>
              )}
            </div>

            {/* ── release button — hidden once response shows ── */}
            {!response && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={handleRelease}
                  disabled={!canSubmit}
                  style={{
                    background: canSubmit
                      ? "rgba(90,160,172,.16)"
                      : "rgba(180,210,218,.12)",
                    color: canSubmit ? "#2a6a78" : "#9ab8bf",
                    border: `1.5px solid ${canSubmit ? "rgba(90,160,172,.38)" : "rgba(160,196,204,.22)"}`,
                    borderRadius: 30,
                    padding: "14px 52px",
                    fontSize: 17,
                    fontWeight: 500,
                    letterSpacing: ".4px",
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    cursor: canSubmit ? "pointer" : "default",
                    transition: "background .25s, color .25s, border .25s",
                  }}
                  onMouseEnter={e => { if (canSubmit && !loading) e.currentTarget.style.background = "rgba(90,160,172,.26)" }}
                  onMouseLeave={e => { if (canSubmit && !loading) e.currentTarget.style.background = "rgba(90,160,172,.16)" }}
                >
                  {loading
                    ? <span className="loading-text">...sitting with you</span>
                    : "release"
                  }
                </button>
              </div>
            )}

            {/* ── response card — fades in after the API replies ── */}
            {response && (
              <div ref={responseRef} className="spill-response-card" style={{
                marginTop: 44,
                background: "rgba(255,255,255,.74)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: ".5px solid rgba(255,255,255,.96)",
                borderRadius: 28,
                padding: "44px 52px 40px",
                boxShadow: "0 12px 52px rgba(60,120,140,.11)",
              }}>
                {/* small wave mark — signals this is a response, not the user's own words */}
                <div style={{ marginBottom: 28 }}>
                  <svg width="32" height="18" viewBox="0 0 56 22" fill="none"
                    stroke="#7ac4d0" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M2 11c5-9 10-9 15 0s10 9 15 0 5-9 10-6" />
                  </svg>
                </div>

                {/* the actual response — serif italic feels warmer and distinct from the UI */}
                <p style={{
                  fontFamily: "var(--font-dm-serif), serif",
                  fontSize: "clamp(20px, 2.3vw, 28px)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "#2e5a64",
                  lineHeight: 1.8,
                  margin: 0,
                }}>
                  {response}
                </p>

                {/* actions after response */}
                <div style={{
                  marginTop: 44,
                  display: "flex", alignItems: "center",
                  gap: 24, flexWrap: "wrap",
                }}>
                  {/* write again — primary action */}
                  <button
                    onClick={handleWriteAgain}
                    style={{
                      background: "rgba(90,160,172,.14)",
                      color: "#2a6a78",
                      border: "1.5px solid rgba(90,160,172,.32)",
                      borderRadius: 24,
                      padding: "11px 34px",
                      fontSize: 15,
                      fontWeight: 500,
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      cursor: "pointer",
                      transition: "background .2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(90,160,172,.24)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(90,160,172,.14)"}
                  >
                    write more
                  </button>

                  {/* secondary — explore other activities */}
                  <span
                    onClick={() => router.push("/activities")}
                    style={{
                      fontSize: 14, color: "#7a9aaa",
                      cursor: "pointer",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    try a different activity
                  </span>

                  {/* tertiary — go home */}
                  <span
                    onClick={() => router.push("/dashboard")}
                    style={{
                      fontSize: 14, color: "#7a9aaa",
                      cursor: "pointer",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    back to dashboard
                  </span>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  )
}

// Suspense wrapper is required by Next.js when useSearchParams is used in a
// client component that may be statically rendered at build time.
export default function SpillPage() {
  return (
    <Suspense fallback={null}>
      <SpillContent />
    </Suspense>
  )
}
