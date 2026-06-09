// 'use client'

// import { useEffect, useState, useRef } from 'react'
// import { useRouter } from 'next/navigation'
// import gsap from 'gsap'
// import { themes } from '../../lib/themes'

// const moods = [
//   {
//     id: 'empty',
//     emoji: '🌫️',
//     name: 'Empty',
//     description: 'when you feel nothing and that somehow feels like everything',
//   },
//   {
//     id: 'overwhelmed',
//     emoji: '🌊',
//     name: 'Overwhelmed',
//     description: 'when everything is too much, all at once',
//   },
//   {
//     id: 'okayish',
//     emoji: '🌥️',
//     name: 'Okay-ish',
//     description: 'neither here nor there, just existing',
//   },
//   {
//     id: 'heavy',
//     emoji: '🌧️',
//     name: 'Heavy',
//     description: 'when your chest feels too full of something you cannot name',
//   },
//   {
//     id: 'full',
//     emoji: '🌸',
//     name: 'Full',
//     description: 'overflowing with something good',
//   },
// ]

// export default function Dashboard() {
//   const [name, setName] = useState('Friend')
//   const [selectedMood, setSelectedMood] = useState(null)
//   const [hoveredMood, setHoveredMood] = useState(null)
//   const [greeting, setGreeting] = useState('')
//   const [theme, setTheme] = useState(themes.default)

//   const greetingRef = useRef(null)
//   const subtitleRef = useRef(null)
//   const questionRef = useRef(null)
//   const moodGridRef = useRef(null)
//   const router = useRouter()

//   // time-aware greeting
//   useEffect(() => {
//     const hour = new Date().getHours()
//     const storedName = localStorage.getItem('userName') || 'Friend'
//     setName(storedName)

//     if (hour >= 5 && hour < 12) {
//       setGreeting(`Good morning, ${storedName}.`)
//     } else if (hour >= 12 && hour < 17) {
//       setGreeting(`Hey ${storedName}. How's the middle of the day treating you?`)
//     } else if (hour >= 17 && hour < 22) {
//       setGreeting(`Good evening, ${storedName}.`)
//     } else {
//       setGreeting(`Hey. It's quiet out there. How are you doing?`)
//     }
//   }, [])

//   // entrance animations
//   useEffect(() => {
//     if (!greeting) return
//     const tl = gsap.timeline()

//     tl.fromTo(greetingRef.current,
//       { opacity: 0, y: 24 },
//       { opacity: 1, y: 0, duration: 1.4, ease: 'power2.out' }
//     )
//     .fromTo(subtitleRef.current,
//       { opacity: 0, y: 16 },
//       { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' },
//       '-=0.8'
//     )
//     .fromTo(questionRef.current,
//       { opacity: 0, y: 16 },
//       { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
//       '-=0.6'
//     )
//     .fromTo(moodGridRef.current.children,
//       { opacity: 0, y: 20 },
//       { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' },
//       '-=0.4'
//     )
//   }, [greeting])

//   // mood changes theme
//   const handleMoodSelect = (mood) => {
//     setSelectedMood(mood.id)
//     setTheme(themes[mood.id].state1)
//   }

//   const handleContinue = () => {
//     if (selectedMood) {
//       localStorage.setItem('selectedMood', selectedMood)
//       router.push('/activities')
//     }
//   }

//   // current display theme — hovered mood previews, selected mood locks in
//   const displayTheme = hoveredMood
//     ? themes[hoveredMood].state1
//     : theme

//   return (
//     <main style={{
//       minHeight: '100vh',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       fontFamily: 'Georgia, serif',
//       background: displayTheme.background,
//       transition: 'background 1.2s ease',
//       position: 'relative',
//       overflow: 'hidden',
//       padding: '20px',
//     }}>

//       {/* soft glow center */}
//       <div style={{
//         position: 'absolute',
//         width: '500px',
//         height: '500px',
//         borderRadius: '50%',
//         background: `radial-gradient(circle, ${displayTheme.cardBg} 0%, transparent 70%)`,
//         transition: 'background 1.2s ease',
//         pointerEvents: 'none',
//       }} />

//       {/* main content */}
//       <div style={{
//         maxWidth: '680px',
//         width: '100%',
//         position: 'relative',
//         zIndex: 10,
//         textAlign: 'center',
//       }}>

//         {/* greeting */}
//         <h1 ref={greetingRef} style={{
//           fontSize: '2.8rem',
//           color: displayTheme.text,
//           margin: '0 0 10px 0',
//           fontWeight: '700',
//           letterSpacing: '0.03em',
//           opacity: 0,
//           transition: 'color 1.2s ease',
//           textShadow: '0 2px 20px rgba(0,0,0,0.15)',
//         }}>
//           {greeting}
//         </h1>

//         {/* subtitle */}
//         <p ref={subtitleRef} style={{
//           fontSize: '1rem',
//           color: displayTheme.textMuted,
//           margin: '0 0 48px 0',
//           letterSpacing: '0.08em',
//           opacity: 0,
//           transition: 'color 1.2s ease',
//         }}>
//           how are you feeling right now?
//         </p>

//         {/* mood question */}
//         <h2 ref={questionRef} style={{
//           fontSize: '1.1rem',
//           color: displayTheme.textMuted,
//           margin: '0 0 28px 0',
//           fontWeight: '400',
//           letterSpacing: '0.15em',
//           textTransform: 'uppercase',
//           opacity: 0,
//           transition: 'color 1.2s ease',
//         }}>
//           pick what feels closest
//         </h2>

//         {/* mood cards */}
//         <div ref={moodGridRef} style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(2, 1fr)',
//           gap: '14px',
//           marginBottom: '32px',
//         }}>
//           {moods.map((mood) => {
//             const isSelected = selectedMood === mood.id
//             const isHovered = hoveredMood === mood.id
//             const previewTheme = themes[mood.id].state1

//             return (
//               <div
//                 key={mood.id}
//                 onClick={() => handleMoodSelect(mood)}
//                 onMouseEnter={() => setHoveredMood(mood.id)}
//                 onMouseLeave={() => setHoveredMood(null)}
//                 style={{
//                   padding: '22px 20px',
//                   borderRadius: '18px',
//                   cursor: 'pointer',
//                   border: `1.5px solid ${isSelected ? displayTheme.primary : displayTheme.cardBorder}`,
//                   background: isSelected
//                     ? `${previewTheme.cardBg}`
//                     : isHovered
//                       ? `${previewTheme.cardBg}`
//                       : displayTheme.cardBg,
//                   backdropFilter: 'blur(12px)',
//                   transition: 'all 0.4s ease',
//                   transform: isSelected ? 'scale(1.03)' : isHovered ? 'scale(1.02)' : 'scale(1)',
//                   boxShadow: isSelected
//                     ? `0 8px 24px rgba(0,0,0,0.15)`
//                     : isHovered
//                       ? `0 4px 16px rgba(0,0,0,0.1)`
//                       : 'none',
//                   // Full mood gets its own column span
//                   gridColumn: mood.id === 'full' ? 'span 2' : 'span 1',
//                 }}
//               >
//                 <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
//                   {mood.emoji}
//                 </div>
//                 <p style={{
//                   fontSize: '1.1rem',
//                   fontWeight: '700',
//                   color: isSelected || isHovered ? previewTheme.text : displayTheme.text,
//                   margin: '0 0 6px 0',
//                   transition: 'color 0.4s ease',
//                 }}>
//                   {mood.name}
//                 </p>
//                 <p style={{
//                   fontSize: '0.8rem',
//                   color: isSelected || isHovered ? previewTheme.textMuted : displayTheme.textMuted,
//                   margin: '0',
//                   fontStyle: 'italic',
//                   lineHeight: '1.4',
//                   transition: 'color 0.4s ease',
//                 }}>
//                   {mood.description}
//                 </p>
//               </div>
//             )
//           })}
//         </div>

//         {/* continue button */}
//         {selectedMood && (
//           <button
//             onClick={handleContinue}
//             style={{
//               padding: '14px 48px',
//               fontSize: '1rem',
//               fontWeight: '700',
//               border: `1.5px solid ${displayTheme.primary}`,
//               borderRadius: '30px',
//               cursor: 'pointer',
//               background: displayTheme.cardBg,
//               backdropFilter: 'blur(12px)',
//               color: displayTheme.text,
//               letterSpacing: '0.1em',
//               transition: 'all 0.3s ease',
//               fontFamily: 'Georgia, serif',
//             }}
//             onMouseEnter={e => {
//               e.currentTarget.style.transform = 'translateY(-2px)'
//               e.currentTarget.style.boxShadow = `0 6px 20px rgba(0,0,0,0.15)`
//             }}
//             onMouseLeave={e => {
//               e.currentTarget.style.transform = 'translateY(0)'
//               e.currentTarget.style.boxShadow = 'none'
//             }}
//           >
//             continue →
//           </button>
//         )}

//       </div>
//     </main>
//   )
// }
"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// ── mood data ──────────────────────────────────────────────
const MOODS = [
  {
    id: "empty",
    label: "empty",
    bg: "linear-gradient(145deg, #4a5568, #2d3748)",
    height: "160px",
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32" fill="none"
        stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="16" cy="12" r="4" />
        <path d="M8 24 Q16 18 24 24" />
        <path d="M6 27 Q16 21 26 27" />
      </svg>
    ),
  },
  {
    id: "overwhelmed",
    label: "overwhelmed",
    bg: "linear-gradient(145deg, #1a7a8a, #0d5c6e)",
    height: "150px",
    minWidth: "180px",
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32" fill="none"
        stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M4 14 Q10 10 16 14 Q22 18 28 14" />
        <path d="M4 20 Q10 16 16 20 Q22 24 28 20" />
        <circle cx="16" cy="8" r="2.5" />
      </svg>
    ),
  },
  {
    id: "okayish",
    label: "okay-ish",
    bg: "linear-gradient(145deg, #6b7a4a, #4a5730)",
    height: "130px",
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32" fill="none"
        stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="16" cy="12" r="6" />
        <path d="M10 6 L16 2 L22 6" />
        <path d="M8 20 L24 20" />
      </svg>
    ),
  },
  {
    id: "heavy",
    label: "heavy",
    bg: "linear-gradient(145deg, #3d3580, #25205a)",
    height: "170px",
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32" fill="none"
        stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M16 4 Q20 12 16 20 Q14 24 16 28" />
        <ellipse cx="16" cy="28" rx="4" ry="2" />
      </svg>
    ),
  },
  {
    id: "full",
    label: "full",
    bg: "linear-gradient(145deg, #e8813a, #c4672a)",
    height: "155px",
    minWidth: "155px",
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32" fill="none"
        stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="16" cy="16" r="5" />
        <path d="M16 2 L16 6M16 26 L16 30M2 16 L6 16M26 16 L30 16M6.3 6.3 L9.2 9.2M22.8 22.8 L25.7 25.7M25.7 6.3 L22.8 9.2M9.2 22.8 L6.3 25.7" />
      </svg>
    ),
  },
]

const BG_MAP = {
  default: "linear-gradient(160deg, #b2dfe8 0%, #c8eaf0 30%, #d8f0f5 60%, #e8f7f9 100%)",
  empty:   "linear-gradient(160deg, #9aa5b4 0%, #c8d4db 50%, #dde8ee 100%)",
  overwhelmed: "linear-gradient(160deg, #0d7a8e 0%, #1a9aaa 40%, #c8eaf0 100%)",
  okayish: "linear-gradient(160deg, #8a9a6a 0%, #aab880 40%, #d8e8c8 100%)",
  heavy:   "linear-gradient(160deg, #2a2070 0%, #3d3090 40%, #c8c0f0 100%)",
  full:    "linear-gradient(160deg, #e8813a 0%, #f0a060 40%, #f8d8b0 100%)",
}

const FOOTER_MAP = {
  default:     "not feeling is also a feeling. you are still here.",
  empty:       "not feeling is also a feeling. you are still here.",
  overwhelmed: "you don't have to solve everything tonight.",
  okayish:     "ordinary days are still days worth living.",
  heavy:       "you are allowed to fall apart sometimes.",
  full:        "hold this feeling close. you deserve this.",
}

// ── breathe steps ──────────────────────────────────────────
const BREATHE_STEPS = [
  { text: "breathe in... 4", ms: 4000 },
  { text: "hold... 7",       ms: 7000 },
  { text: "breathe out... 8", ms: 8000 },
]

// ── helpers ────────────────────────────────────────────────
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

// ── component ──────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter()
  const [clock, setClock]         = useState(getClock())
  const [activeMood, setActiveMood] = useState(null)
  const [breatheText, setBreatheText] = useState("tap to begin a 4·7·8 cycle")
  const [breatheActive, setBreatheActive] = useState(false)

  // live clock
  useEffect(() => {
    const t = setInterval(() => setClock(getClock()), 30000)
    return () => clearInterval(t)
  }, [])

  // breathe cycle
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
      setBreatheText(BREATHE_STEPS[i].text)
      setTimeout(() => { i++; next() }, BREATHE_STEPS[i].ms)
    }
    next()
  }

  const bg     = BG_MAP[activeMood] || BG_MAP.default
  const footer = FOOTER_MAP[activeMood] || FOOTER_MAP.default

  // ── styles (inline so no extra css file needed) ──────────
  const s = {
    root: {
      fontFamily: "var(--font-dm-sans), sans-serif",
      background: bg,
      minHeight: "100vh",
      color: "#1a3a42",
      transition: "background 0.8s ease",
    },
    navbar: {
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 32px",
    },
    logoWrap: { display: "flex", alignItems: "center", gap: "16px" },
    hamburger: { display: "flex", flexDirection: "column", gap: "5px", cursor: "pointer" },
    hamburgerLine: { display: "block", width: "22px", height: "1.5px", background: "#2a5a66", borderRadius: "2px" },
    logo: {
      display: "flex", alignItems: "center", gap: "8px",
      fontFamily: "var(--font-dm-serif), serif",
      fontSize: "20px", color: "#1a3a42", letterSpacing: "-0.3px",
    },
    time: { fontSize: "15px", color: "#2a5a66", fontWeight: "300", fontStyle: "italic" },
    main: { padding: "10px 40px 40px", maxWidth: "900px" },
    greeting: {
      fontFamily: "var(--font-dm-serif), serif",
      fontSize: "clamp(36px, 5vw, 52px)",
      color: "#0f2e35", fontWeight: "400",
      lineHeight: "1.1", margin: "0 0 6px",
      letterSpacing: "-1px",
    },
    subGreeting: { fontSize: "17px", color: "#3a6a75", fontWeight: "300", margin: "0 0 32px" },
    card: {
      background: "rgba(255,255,255,0.72)",
      borderRadius: "28px", padding: "32px 32px 28px",
      marginBottom: "20px",
      border: "0.5px solid rgba(255,255,255,0.9)",
    },
    checkinLabel: {
      display: "flex", alignItems: "center", gap: "7px",
      fontSize: "11px", letterSpacing: "1.8px",
      textTransform: "uppercase", color: "#4a8a96",
      fontWeight: "500", marginBottom: "18px",
    },
    checkinTitle: {
      fontFamily: "var(--font-dm-serif), serif",
      fontSize: "clamp(26px, 4vw, 38px)",
      color: "#0f2e35", lineHeight: "1.15",
      margin: "0 0 6px", fontWeight: "400",
    },
    checkinHint: { fontSize: "14px", color: "#5a8a96", fontStyle: "italic", margin: "0 0 28px" },
    moodsRow: {
      display: "flex", gap: "16px", alignItems: "flex-end",
      overflowX: "auto", paddingBottom: "4px",
    },
    moodCard: (mood, active) => ({
      flexShrink: 0, cursor: "pointer",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "flex-end",
      padding: "20px 16px 18px",
      borderRadius: "40px",
      background: mood.bg,
      height: mood.height,
      minWidth: mood.minWidth || "130px",
      transform: active ? "translateY(-6px)" : "translateY(0)",
      boxShadow: active ? "0 16px 40px rgba(0,0,0,0.18)" : "none",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    }),
    moodName: { fontSize: "14px", color: "rgba(255,255,255,0.88)", fontWeight: "300", marginTop: "10px" },
    breatheCard: {
      background: "rgba(255,255,255,0.72)",
      borderRadius: "28px", padding: "40px 32px",
      display: "flex", flexDirection: "column", alignItems: "center",
      marginBottom: "20px",
      border: "0.5px solid rgba(255,255,255,0.9)",
    },
    breatheOuter: {
      width: "160px", height: "160px", borderRadius: "50%",
      background: "rgba(178,220,230,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
      marginBottom: "20px",
      animation: "breathePulse 6s ease-in-out infinite",
    },
    breatheInner: {
      width: "110px", height: "110px", borderRadius: "50%",
      background: "linear-gradient(145deg, #6ab4c2, #4a9aac)",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer",
    },
    breatheLabel: { fontSize: "11px", letterSpacing: "2.5px", textTransform: "uppercase", color: "#3a7a88", fontWeight: "500", marginBottom: "6px" },
    breatheHint: { fontSize: "15px", color: "#4a8a96", fontWeight: "300" },
    whisperCard: {
      background: "rgba(255,255,255,0.72)",
      borderRadius: "28px", padding: "22px 28px",
      display: "flex", alignItems: "center", gap: "18px",
      marginBottom: "20px",
      border: "0.5px solid rgba(255,255,255,0.9)",
      cursor: "pointer",
    },
    whisperIcon: {
      width: "52px", height: "52px", borderRadius: "16px",
      background: "rgba(178,220,230,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    },
    whisperLabel: { fontSize: "11px", letterSpacing: "1.8px", textTransform: "uppercase", color: "#4a8a96", fontWeight: "500", marginBottom: "4px" },
    whisperDesc: { fontSize: "16px", color: "#1a3a42" },
    openBtn: {
      background: "#3a7a88", color: "white", border: "none",
      borderRadius: "24px", padding: "10px 22px",
      fontSize: "14px", fontFamily: "var(--font-dm-sans), sans-serif",
      cursor: "pointer", whiteSpace: "nowrap",
    },
    winddownCard: {
      background: "rgba(255,255,255,0.72)",
      borderRadius: "28px", padding: "28px 32px",
      display: "flex", gap: "20px", alignItems: "center",
      marginBottom: "20px",
      border: "0.5px solid rgba(255,255,255,0.9)",
    },
    winddownLabel: {
      display: "flex", alignItems: "center", gap: "8px",
      fontSize: "11px", letterSpacing: "1.8px",
      textTransform: "uppercase", color: "#4a8a96",
      fontWeight: "500", marginBottom: "10px",
    },
    winddownTitle: {
      fontFamily: "var(--font-dm-serif), serif",
      fontSize: "26px", color: "#0f2e35",
      margin: "0 0 6px", fontWeight: "400",
    },
    winddownSub: { fontSize: "14px", color: "#5a8a96", margin: "0 0 18px", fontStyle: "italic" },
    winddownActions: { display: "flex", alignItems: "center", gap: "16px" },
    playBtn: {
      display: "flex", alignItems: "center", gap: "8px",
      background: "#1a3a42", color: "white", border: "none",
      borderRadius: "24px", padding: "10px 22px",
      fontSize: "14px", fontFamily: "var(--font-dm-sans), sans-serif",
      cursor: "pointer",
    },
    browseLink: { fontSize: "14px", color: "#4a8a96", cursor: "pointer", textDecoration: "underline" },
    blob: {
      width: "110px", height: "110px", borderRadius: "50%",
      background: "linear-gradient(145deg, #7ac4d0, #5aaabb)",
      flexShrink: 0,
    },
    footer: {
      textAlign: "center", padding: "16px 40px 32px",
      fontSize: "14px", color: "#4a8a96",
      fontStyle: "italic", fontWeight: "300",
    },
  }

  return (
    <>
      {/* breathe animation */}
      <style>{`
        @keyframes breathePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .fb-moods::-webkit-scrollbar { display: none; }
        .fb-moods { scrollbar-width: none; }
      `}</style>

      <div style={s.root}>
        {/* navbar */}
        <nav style={s.navbar}>
          <div style={s.logoWrap}>
            <div style={s.hamburger}>
              <span style={s.hamburgerLine} />
              <span style={s.hamburgerLine} />
              <span style={s.hamburgerLine} />
            </div>
            <div style={s.logo}>
              <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                <path d="M1 5C3.5 2.5 6.5 2.5 9 5C11.5 7.5 14.5 7.5 17 5C19.5 2.5 21 3 21 3"
                  stroke="#2a5a66" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M1 10C3.5 7.5 6.5 7.5 9 10C11.5 12.5 14.5 12.5 17 10C19.5 7.5 21 8 21 8"
                  stroke="#2a5a66" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              feelbetter
            </div>
          </div>
          <div style={s.time}>{clock}</div>
        </nav>

        {/* main content */}
        <div style={s.main}>
          <p style={s.greeting}>hello Maya,</p>
          <p style={s.subGreeting}>{getSubGreeting()}</p>

          {/* daily check-in card */}
          <div style={s.card}>
            <div style={s.checkinLabel}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#4a8a96" strokeWidth="1.8" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              daily check-in
            </div>
            <p style={s.checkinTitle}>how do you<br />feel right now?</p>
            <p style={s.checkinHint}>pick one. nothing shifts unless you're ready.</p>

            {/* mood cards row */}
            <div className="fb-moods" style={s.moodsRow}>
              {MOODS.map((mood) => (
                <div
                  key={mood.id}
                  style={s.moodCard(mood, activeMood === mood.id)}
                  onClick={() => setActiveMood(mood.id)}
                >
                  {mood.icon}
                  <span style={s.moodName}>{mood.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* breathe card */}
          <div style={s.breatheCard}>
            <div style={s.breatheOuter}>
              <div style={s.breatheInner} onClick={startBreathe}>
                <svg viewBox="0 0 28 28" width="28" height="28" fill="none"
                  stroke="white" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M4 14 Q8 10 12 14 Q16 18 20 14 Q22 12 24 14" />
                  <path d="M4 18 Q8 14 12 18 Q16 22 20 18 Q22 16 24 18" />
                </svg>
              </div>
            </div>
            <div style={s.breatheLabel}>breathe</div>
            <div style={s.breatheHint}>{breatheText}</div>
          </div>

          {/* whisper a thought */}
          <div style={s.whisperCard}>
            <div style={s.whisperIcon}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
                stroke="#4a8a96" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={s.whisperLabel}>whisper a thought</div>
              <div style={s.whisperDesc}>no one reads it but you.</div>
            </div>
            <button style={s.openBtn}>open</button>
          </div>

          {/* tonight's wind-down */}
          <div style={s.winddownCard}>
            <div style={{ flex: 1 }}>
              <div style={s.winddownLabel}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#4a8a96" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                tonight's wind-down
              </div>
              <div style={s.winddownTitle}>a 9-minute story for sleep</div>
              <div style={s.winddownSub}>"the quiet harbor" · narrated softly</div>
              <div style={s.winddownActions}>
                <button style={s.playBtn}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  play
                </button>
                <span style={s.browseLink}>browse library</span>
              </div>
            </div>
            <div style={s.blob} />
          </div>
        </div>

        {/* footer */}
        <div style={s.footer}>{footer}</div>
      </div>
    </>
  )
}