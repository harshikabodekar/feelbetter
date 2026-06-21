
"use client"
import { useEffect, useState } from "react"

const MOODS = [
  {
    id: "empty",
    label: "empty",
    iconClass: "text-[#5a6578]",
    glowClass:
      "shadow-[0_8px_28px_rgba(74,85,104,0.35)] hover:shadow-[0_12px_36px_rgba(74,85,104,0.5)]",
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="16" cy="12" r="4" />
        <path d="M8 24 Q16 18 24 24" />
        <path d="M6 27 Q16 21 26 27" />
      </svg>
    ),
  },
  {
    id: "overwhelmed",
    label: "overwhelmed",
    iconClass: "text-[#1a7a8a]",
    glowClass:
      "shadow-[0_8px_28px_rgba(26,122,138,0.4)] hover:shadow-[0_12px_36px_rgba(26,122,138,0.55)]",
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M4 14 Q10 10 16 14 Q22 18 28 14" />
        <path d="M4 20 Q10 16 16 20 Q22 24 28 20" />
        <circle cx="16" cy="8" r="2.5" />
      </svg>
    ),
  },
  {
    id: "okayish",
    label: "okay-ish",
    iconClass: "text-[#6b7a4a]",
    glowClass:
      "shadow-[0_8px_28px_rgba(107,122,74,0.38)] hover:shadow-[0_12px_36px_rgba(107,122,74,0.52)]",
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="16" cy="12" r="6" />
        <path d="M10 6 L16 2 L22 6" />
        <path d="M8 20 L24 20" />
      </svg>
    ),
  },
  {
    id: "heavy",
    label: "heavy",
    iconClass: "text-[#4a4088]",
    glowClass:
      "shadow-[0_8px_28px_rgba(61,53,128,0.4)] hover:shadow-[0_12px_36px_rgba(61,53,128,0.55)]",
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M16 4 Q20 12 16 20 Q14 24 16 28" />
        <ellipse cx="16" cy="28" rx="4" ry="2" />
      </svg>
    ),
  },
  {
    id: "full",
    label: "full",
    iconClass: "text-[#c4672a]",
    glowClass:
      "shadow-[0_8px_28px_rgba(232,129,58,0.4)] hover:shadow-[0_12px_36px_rgba(232,129,58,0.55)]",
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="16" cy="16" r="5" />
        <path d="M16 2 L16 6M16 26 L16 30M2 16 L6 16M26 16 L30 16M6.3 6.3 L9.2 9.2M22.8 22.8 L25.7 25.7M25.7 6.3 L22.8 9.2M9.2 22.8 L6.3 25.7" />
      </svg>
    ),
  },
]

const MOOD_GRID_CLASSES = [
  "col-span-1 md:col-span-2 lg:col-span-1",
  "col-span-1 md:col-span-2 lg:col-span-1",
  "col-span-1 md:col-span-2 lg:col-span-1",
  "col-span-1 md:col-span-2 md:col-start-2 lg:col-span-1 lg:col-start-auto",
  "col-span-2 justify-self-center w-full max-w-[9.5rem] md:col-span-2 md:col-start-4 md:max-w-none lg:col-span-1 lg:col-start-auto lg:max-w-none",
]

const BG_MAP = {
  default:     "linear-gradient(to right, #b8e4ec, #f5f8f8)",
  empty:       "linear-gradient(to right, #b0bec8, #f5f8f8)",
  overwhelmed: "linear-gradient(to right, #128898, #f0f6f8)",
  okayish:     "linear-gradient(to right, #9aaa70, #f4f6f0)",
  heavy:       "linear-gradient(to right, #2d2070, #f2f0f8)",
  full:        "linear-gradient(to right, #e89050, #faf6f0)",
}

const FOOTER_MAP = {
  default:     "not feeling is also a feeling. you are still here.",
  empty:       "not feeling is also a feeling. you are still here.",
  overwhelmed: "you don't have to solve everything tonight.",
  okayish:     "ordinary days are still days worth living.",
  heavy:       "you are allowed to fall apart sometimes.",
  full:        "hold this feeling close. you deserve this.",
}

const BREATHE_STEPS = [
  { text: "breathe in... 4", ms: 4000 },
  { text: "hold... 7",       ms: 7000 },
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
  const [clock, setClock]           = useState(getClock())
  const [activeMood, setActiveMood] = useState(null)
  const [breatheText, setBreatheText] = useState("tap to begin a 4·7·8 cycle")
  const [breatheActive, setBreatheActive] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setClock(getClock()), 30000)
    return () => clearInterval(t)
  }, [])

  function startBreathe() {
    if (breatheActive) return
    setBreatheActive(true)
    let i = 0
    function next() {
      if (i >= BREATHE_STEPS.length) {
        setBreatheText("tap to begin a 4·7·8 cycle")
        setBreatheActive(false)
        return
      }
      const step = BREATHE_STEPS[i]
      setBreatheText(step.text)
      setTimeout(() => { i++; next() }, step.ms)
    }
    next()
  }

  const bg     = BG_MAP[activeMood]     || BG_MAP.default
  const footer = FOOTER_MAP[activeMood] || FOOTER_MAP.default

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .fb-root {
          font-family: var(--font-dm-sans), sans-serif;
          background: ${bg};
          min-height: 100vh;
          color: #1a3a42;
          transition: background 0.9s ease;
        }

        .fb-navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 48px;
        }

        .fb-logo-wrap { display: flex; align-items: center; gap: 14px; }

        .fb-hamburger {
          display: flex; flex-direction: column; gap: 5px; cursor: pointer;
        }
        .fb-hamburger span {
          display: block; width: 22px; height: 1.5px;
          background: #2a5a66; border-radius: 2px;
        }

        .fb-logo {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--font-dm-serif), serif;
          font-size: 20px; color: #1a3a42; letter-spacing: -0.3px;
        }

        .fb-time {
          font-size: 15px; color: #2a5a66;
          font-weight: 300; font-style: italic;
        }

        .fb-main {
          padding: 8px 48px 48px;
          max-width: 100%;
        }

        .fb-greeting {
          font-family: var(--font-dm-serif), serif;
          font-size: 56px;
          color: #0f2e35;
          font-weight: 400;
          line-height: 1.05;
          margin-bottom: 8px;
          letter-spacing: -1.5px;
        }

        .fb-subgreeting {
          font-size: 18px; color: #3a6a75;
          font-weight: 300; margin-bottom: 36px;
        }

        .fb-breathe-card {
          background: rgba(255,255,255,0.65);
          border-radius: 32px;
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
          border: 0.5px solid rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          width: 100%;
        }

        .fb-breathe-outer {
          width: 170px; height: 170px; border-radius: 50%;
          background: rgba(178,220,230,0.3);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 22px;
          animation: breathePulse 6s ease-in-out infinite;
        }

        .fb-breathe-inner {
          width: 115px; height: 115px; border-radius: 50%;
          background: linear-gradient(145deg, #6ab4c2, #4a9aac);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .fb-breathe-inner:hover { transform: scale(1.05); }

        @keyframes breathePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .fb-breathe-label {
          font-size: 11px; letter-spacing: 3px;
          text-transform: uppercase; color: #3a7a88;
          font-weight: 500; margin-bottom: 8px;
        }

        .fb-breathe-hint {
          font-size: 16px; color: #4a8a96; font-weight: 300;
        }

        .fb-whisper-card {
          background: rgba(255,255,255,0.65);
          border-radius: 32px; padding: 24px 32px;
          display: flex; align-items: center; gap: 20px;
          margin-bottom: 20px;
          border: 0.5px solid rgba(255,255,255,0.95);
          cursor: pointer; width: 100%;
          backdrop-filter: blur(10px);
          transition: background 0.2s;
        }
        .fb-whisper-card:hover { background: rgba(255,255,255,0.82); }

        .fb-whisper-icon {
          width: 54px; height: 54px; border-radius: 16px;
          background: rgba(178,220,230,0.4);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .fb-whisper-label {
          font-size: 11px; letter-spacing: 2px;
          text-transform: uppercase; color: #4a8a96;
          font-weight: 500; margin-bottom: 5px;
        }

        .fb-whisper-desc { font-size: 17px; color: #1a3a42; }

        .fb-open-btn {
          background: #3a7a88; color: white; border: none;
          border-radius: 24px; padding: 11px 26px;
          font-size: 14px; font-family: var(--font-dm-sans), sans-serif;
          cursor: pointer; white-space: nowrap; margin-left: auto;
          transition: background 0.2s;
        }
        .fb-open-btn:hover { background: #2a6070; }

        .fb-winddown-card {
          background: rgba(255,255,255,0.65);
          border-radius: 32px; padding: 32px 40px;
          display: flex; gap: 24px; align-items: center;
          margin-bottom: 20px;
          border: 0.5px solid rgba(255,255,255,0.95);
          width: 100%;
          backdrop-filter: blur(10px);
        }

        .fb-winddown-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 11px; letter-spacing: 2px;
          text-transform: uppercase; color: #4a8a96;
          font-weight: 500; margin-bottom: 12px;
        }

        .fb-winddown-title {
          font-family: var(--font-dm-serif), serif;
          font-size: 28px; color: #0f2e35;
          margin-bottom: 6px; font-weight: 400;
        }

        .fb-winddown-sub {
          font-size: 14px; color: #5a8a96;
          margin-bottom: 20px; font-style: italic;
        }

        .fb-winddown-actions { display: flex; align-items: center; gap: 18px; }

        .fb-play-btn {
          display: flex; align-items: center; gap: 8px;
          background: #1a3a42; color: white; border: none;
          border-radius: 24px; padding: 11px 24px;
          font-size: 14px; font-family: var(--font-dm-sans), sans-serif;
          cursor: pointer; transition: background 0.2s;
        }
        .fb-play-btn:hover { background: #0f2e35; }

        .fb-browse-link {
          font-size: 14px; color: #4a8a96;
          cursor: pointer; text-decoration: underline;
        }

        .fb-blob {
          width: 120px; height: 120px; border-radius: 50%;
          background: linear-gradient(145deg, #7ac4d0, #5aaabb);
          flex-shrink: 0; margin-left: auto;
        }

        .fb-footer {
          text-align: center; padding: 16px 48px 36px;
          font-size: 14px; color: #4a8a96;
          font-style: italic; font-weight: 300; letter-spacing: 0.3px;
        }

      `}</style>

      <div className="fb-root">

        {/* navbar */}
        <nav className="fb-navbar">
          <div className="fb-logo-wrap">
            <div className="fb-hamburger">
              <span /><span /><span />
            </div>
            <div className="fb-logo">
              <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                <path d="M1 5C3.5 2.5 6.5 2.5 9 5C11.5 7.5 14.5 7.5 17 5C19.5 2.5 21 3 21 3"
                  stroke="#2a5a66" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M1 10C3.5 7.5 6.5 7.5 9 10C11.5 12.5 14.5 12.5 17 10C19.5 7.5 21 8 21 8"
                  stroke="#2a5a66" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              feelbetter
            </div>
          </div>
          <div className="fb-time">{clock}</div>
        </nav>

        {/* main */}
        <div className="fb-main">
          <section className="min-h-screen flex flex-col pb-8">
            <p className="fb-greeting">hello Maya,</p>
            <p className="fb-subgreeting">{getSubGreeting()}</p>

            <div className="flex flex-col flex-1 justify-center gap-10 md:gap-12 mt-4 md:mt-8">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#4a8a96] font-medium">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="#4a8a96" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  daily check-in
                </div>
                <p className="font-[family-name:var(--font-dm-serif)] text-[2rem] md:text-[2.625rem] leading-tight text-[#0f2e35]">
                  how do you<br />feel right now?
                </p>
                <p className="text-[15px] text-[#5a8a96] italic font-light">
                  pick one. nothing shifts unless you&apos;re ready.
                </p>
              </div>

              <div
                className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-5 gap-4 md:gap-5 lg:gap-6 w-full max-w-5xl mx-auto px-1 sm:px-2"
                role="group"
                aria-label="Choose your mood"
              >
                {MOODS.map((mood, index) => (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => setActiveMood(mood.id)}
                    className={[
                      "flex flex-col items-center justify-center gap-3",
                      "w-full min-h-[7.5rem] px-5 py-5 rounded-full",
                      "backdrop-blur-md bg-white/25 border border-white/10",
                      "transition-all duration-300 ease-out cursor-pointer",
                      "hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                      mood.glowClass,
                      MOOD_GRID_CLASSES[index],
                      activeMood === mood.id ? "scale-105 ring-2 ring-white/40" : "",
                    ].join(" ")}
                    aria-pressed={activeMood === mood.id}
                  >
                    <span className={`flex items-center justify-center ${mood.iconClass}`}>
                      {mood.icon}
                    </span>
                    <span className="text-[0.75rem] font-light text-[#1a3a42]/85 lowercase tracking-wide">
                      {mood.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* breathe */}
          <div className="fb-breathe-card">
            <div className="fb-breathe-outer">
              <div className="fb-breathe-inner" onClick={startBreathe}>
                <svg viewBox="0 0 28 28" width="28" height="28" fill="none"
                  stroke="white" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M4 14 Q8 10 12 14 Q16 18 20 14 Q22 12 24 14" />
                  <path d="M4 18 Q8 14 12 18 Q16 22 20 18 Q22 16 24 18" />
                </svg>
              </div>
            </div>
            <div className="fb-breathe-label">breathe</div>
            <div className="fb-breathe-hint">{breatheText}</div>
          </div>

          {/* whisper */}
          <div className="fb-whisper-card">
            <div className="fb-whisper-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
                stroke="#4a8a96" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <div>
              <div className="fb-whisper-label">whisper a thought</div>
              <div className="fb-whisper-desc">no one reads it but you.</div>
            </div>
            <button className="fb-open-btn">open</button>
          </div>

          {/* wind-down */}
          <div className="fb-winddown-card">
            <div style={{ flex: 1 }}>
              <div className="fb-winddown-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#4a8a96" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                tonight's wind-down
              </div>
              <div className="fb-winddown-title">a 9-minute story for sleep</div>
              <div className="fb-winddown-sub">"the quiet harbor" · narrated softly</div>
              <div className="fb-winddown-actions">
                <button className="fb-play-btn">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  play
                </button>
                <span className="fb-browse-link">browse library</span>
              </div>
            </div>
            <div className="fb-blob" />
          </div>
        </div>

        <div className="fb-footer">{footer}</div>
      </div>
    </>
  )
}