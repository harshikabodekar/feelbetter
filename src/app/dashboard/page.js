"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

const MOODS = [
  { id: "empty",       label: "empty",       color: "#515d6e", textColor: "#ffffff" },
  { id: "overwhelmed", label: "overwhelmed", color: "#0a6878", textColor: "#ffffff" },
  { id: "okayish",     label: "okay-ish",    color: "#7a8a5a", textColor: "#ffffff" },
  { id: "heavy",       label: "heavy",       color: "#1a1060", textColor: "#ffffff" },
  { id: "full",        label: "full",        color: "#d07030", textColor: "#ffffff" },
]

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

const BG_MAP = {
  default:     "linear-gradient(165deg,#e6f5f7 0%,#d3edf2 48%,#e8f6f8 100%)",
  empty:       "linear-gradient(135deg,#8a9aa8 0%,#ccd8e0 100%)",
  overwhelmed: "linear-gradient(135deg,#0a6878 0%,#a8dce8 100%)",
  okayish:     "linear-gradient(135deg,#7a8a5a 0%,#c8d8a8 100%)",
  heavy:       "linear-gradient(135deg,#1a1060 0%,#a8a0d8 100%)",
  full:        "linear-gradient(135deg,#d07030 0%,#f8c890 100%)",
}

const FOOTER_MAP = {
  default:     "whatever you're feeling, it's welcome here.",
  empty:       "not feeling is also a feeling. you are still here.",
  overwhelmed: "you don't have to solve everything tonight.",
  okayish:     "ordinary days are still days worth living.",
  heavy:       "you are allowed to fall apart sometimes. it doesn't make you broken.",
  full:        "hold this feeling close. you deserve this.",
}

const BREATHE_STEPS = [
  { text: "breathe in... 4",  ms: 4000 },
  { text: "hold... 7",        ms: 7000 },
  { text: "breathe out... 8", ms: 8000 },
]

const MOOD_COLORS = {
  empty: "#8a9aa8", overwhelmed: "#0a6878",
  okayish: "#7a8a5a", heavy: "#1a1060", full: "#d07030",
}

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
  const router   = useRouter()
  const { user, loading, signOut } = useAuth()

  const [clock,        setClock]        = useState(getClock())
  const [activeMood,   setActiveMood]   = useState(null)
  const [breatheText,  setBreatheText]  = useState("tap to begin a 4·7·8 cycle")
  const [breatheActive,setBreatheActive]= useState(false)
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [isDesktop,    setIsDesktop]    = useState(false)
  const [anonymousMode,setAnonymousMode]= useState(false)
  const [isGuest,      setIsGuest]      = useState(false)

  useEffect(() => {
    const guest = localStorage.getItem("isGuest") === "true"
    setIsGuest(guest)
    if (!loading && !user && !guest) router.replace("/login")
  }, [user, loading])

  useEffect(() => {
    const t = setInterval(() => setClock(getClock()), 30000)
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener("resize", check)
    return () => { clearInterval(t); window.removeEventListener("resize", check) }
  }, [])

  const handleLogout = async () => { await signOut(); router.push("/login") }

  const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there"
  const firstName = fullName.split(" ")[0]
  const initials  = fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  function startBreathe() {
    if (breatheActive) return
    setBreatheActive(true)
    let i = 0
    function next() {
      if (i >= BREATHE_STEPS.length) {
        setBreatheText("tap to begin a 4·7·8 cycle"); setBreatheActive(false); return
      }
      const step = BREATHE_STEPS[i]
      setBreatheText(step.text)
      setTimeout(() => { i++; next() }, step.ms)
    }
    next()
  }

  const bg     = BG_MAP[activeMood]    || BG_MAP.default
  const footer = FOOTER_MAP[activeMood] || FOOTER_MAP.default

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}

        .fb-root{
          font-family:var(--font-dm-sans),sans-serif;
          background:${bg};min-height:100vh;color:#1a3a42;
          transition:background .9s ease;display:flex;flex-direction:column;
          overflow-x:hidden;
        }
        .fb-wrapper{display:flex;flex:1;position:relative}

        /* ── SIDEBAR base (mobile overlay) ─────────────────── */
        .fb-sidebar{
          background:rgba(255,255,255,.8);backdrop-filter:blur(10px);
          width:280px;display:none;flex-direction:column;
          border-right:1px solid rgba(255,255,255,.5);
          position:relative;z-index:100;
        }
        .fb-sidebar-overlay{
          position:fixed;inset:0;background:rgba(0,0,0,.4);display:none;z-index:90;
        }
        @media(max-width:1023px){
          .fb-sidebar-overlay.open{display:block}
          .fb-sidebar.open{
            display:flex;position:fixed;top:0;left:0;
            width:280px;height:100vh;z-index:100;
          }
        }
        .fb-sidebar-top{padding:28px;border-bottom:1px solid rgba(0,0,0,.08);flex-shrink:0}
        .fb-sidebar-close{display:flex;justify-content:flex-end;margin-bottom:16px}
        .fb-sidebar-close-btn{
          background:none;border:none;font-size:24px;cursor:pointer;
          color:#1a3a42;padding:0;width:24px;height:24px;display:none;
        }
        @media(max-width:1023px){.fb-sidebar-close-btn{display:block}}
        .fb-profile{display:flex;align-items:flex-start;gap:14px;margin-bottom:24px}
        .fb-profile-avatar{
          width:56px;height:56px;border-radius:50%;
          background:linear-gradient(135deg,#7ac4d0,#5aaabb);
          display:flex;align-items:center;justify-content:center;
          color:#fff;font-size:18px;font-weight:600;flex-shrink:0;
        }
        .fb-profile-info{flex:1}
        .fb-profile-name{font-size:18px;color:#0f2e35;font-weight:500}
        .fb-profile-action{font-size:13px;color:#4a8a96;cursor:pointer;text-decoration:underline}
        .fb-anon-toggle{display:flex;align-items:center;gap:14px;padding:14px 0;margin-bottom:24px}
        .fb-anon-icon{width:20px;height:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .fb-anon-label{font-size:15px;color:#1a3a42;flex:1}
        .fb-toggle{width:48px;height:26px;background:#d0d0d0;border-radius:13px;border:none;cursor:pointer;position:relative;transition:background .3s;flex-shrink:0}
        .fb-toggle.on{background:#7ac4d0}
        .fb-toggle-thumb{position:absolute;top:3px;left:3px;width:20px;height:20px;background:#fff;border-radius:50%;transition:left .3s}
        .fb-toggle.on .fb-toggle-thumb{left:25px}
        .fb-sidebar-middle{flex:1;padding:0 28px;overflow-y:auto}
        .fb-sidebar-section{margin-bottom:28px}
        .fb-sidebar-section-label{
          font-size:13px;letter-spacing:1.5px;text-transform:uppercase;
          color:#4a8a96;font-weight:500;margin-bottom:14px;
          display:flex;align-items:center;gap:8px;
        }
        .fb-mood-dots{display:flex;gap:10px}
        .fb-mood-dot{width:24px;height:24px;border-radius:50%;background:#ccc;cursor:pointer;transition:transform .2s}
        .fb-mood-dot:hover{transform:scale(1.15)}
        .fb-history-item{
          display:flex;align-items:center;justify-content:space-between;
          padding:14px;background:rgba(255,255,255,.5);border-radius:8px;
          cursor:pointer;font-size:16px;color:#1a3a42;
        }
        .fb-history-item:hover{background:rgba(255,255,255,.8)}
        .fb-lock-icon{width:18px;height:18px}
        .fb-sidebar-bottom{padding:28px;border-top:1px solid rgba(0,0,0,.08);flex-shrink:0}
        .fb-logout{font-size:16px;color:#4a8a96;cursor:pointer;display:flex;align-items:center;gap:8px}

        /* ── NAVBAR ─────────────────────────────────────────── */
        .fb-navbar{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;flex-shrink:0}
        @media(min-width:768px){.fb-navbar{padding:24px 48px}}
        .fb-logo-wrap{display:flex;align-items:center;gap:12px}
        .fb-hamburger{display:flex;flex-direction:column;gap:5px;cursor:pointer}
        .fb-hamburger span{display:block;width:22px;height:1.5px;background:#2a5a66;border-radius:2px}
        .fb-logo{
          display:flex;align-items:center;gap:8px;
          font-family:var(--font-dm-serif),serif;
          font-size:18px;color:#1a3a42;letter-spacing:-.3px;
        }
        .fb-time{font-size:14px;color:#2a5a66;font-weight:300;font-style:italic}

        /* ── MAIN ───────────────────────────────────────────── */
        .fb-main{flex:1;padding:24px;overflow-y:auto}
        @media(min-width:768px){.fb-main{padding:32px 48px}}

        .fb-greeting{
          font-family:var(--font-dm-serif),serif;font-size:42px;
          color:#0f2e35;font-weight:400;line-height:1.1;
          margin-bottom:4px;letter-spacing:-1px;
        }
        @media(min-width:768px){.fb-greeting{font-size:56px;margin-bottom:8px;letter-spacing:-1.5px}}
        .fb-subgreeting{font-size:16px;color:#3a6a75;font-weight:300;margin-bottom:32px}
        @media(min-width:768px){.fb-subgreeting{font-size:18px;margin-bottom:40px}}

        /* ── CHECK-IN CARD ──────────────────────────────────── */
        .fb-checkin-card{
          background:rgba(255,255,255,.65);border-radius:32px;padding:32px 24px;
          border:.5px solid rgba(255,255,255,.95);backdrop-filter:blur(10px);margin-bottom:24px;
        }
        @media(min-width:768px){.fb-checkin-card{padding:40px 32px;margin-bottom:28px}}
        .fb-checkin-label{
          display:flex;align-items:center;gap:6px;font-size:11px;
          letter-spacing:2px;text-transform:uppercase;color:#4a8a96;font-weight:500;margin-bottom:12px;
        }
        .fb-checkin-heading{
          font-family:var(--font-dm-serif),serif;font-size:28px;
          color:#0f2e35;line-height:1.2;margin-bottom:12px;font-weight:400;
        }
        @media(min-width:768px){.fb-checkin-heading{font-size:32px;margin-bottom:16px}}
        .fb-checkin-hint{font-size:15px;color:#5a8a96;font-weight:300;font-style:italic;margin-bottom:28px}

        /* ── MOOD GRID (mobile/tablet) ──────────────────────── */
        .fb-moods-grid{display:flex;flex-wrap:wrap;gap:20px;justify-content:center}
        @media(min-width:768px){.fb-moods-grid{gap:24px}}
        .fb-mood-btn{
          border:none;background:none;cursor:pointer;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:8px;transition:transform .2s ease,filter .2s ease;
          padding:0;border-radius:50%;position:relative;
          width:130px;height:120px;flex-shrink:0;
        }
        @media(min-width:768px){.fb-mood-btn{width:160px;height:140px}}
        .fb-mood-btn:hover{transform:scale(1.08);filter:brightness(1.1)}
        .fb-mood-btn:focus{outline:2px solid rgba(255,255,255,.6);outline-offset:4px}
        .fb-mood-icon{width:28px;height:28px;display:flex;align-items:center;justify-content:center;opacity:.9}
        .fb-mood-label{font-size:13px;font-weight:400;letter-spacing:.5px;white-space:nowrap}

        /* ── BREATHE CARD ───────────────────────────────────── */
        .fb-breathe-card{
          background:rgba(255,255,255,.65);border-radius:32px;padding:40px 28px;
          display:flex;flex-direction:column;align-items:center;
          margin-bottom:24px;border:.5px solid rgba(255,255,255,.95);
          backdrop-filter:blur(10px);width:100%;
        }
        @media(min-width:768px){.fb-breathe-card{margin-bottom:28px}}
        .fb-breathe-outer{
          width:160px;height:160px;border-radius:50%;
          background:rgba(178,220,230,.3);display:flex;align-items:center;
          justify-content:center;margin-bottom:20px;
          animation:breathePulse 6s ease-in-out infinite;
        }
        .fb-breathe-inner{
          width:110px;height:110px;border-radius:50%;
          background:linear-gradient(145deg,#6ab4c2,#4a9aac);
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;transition:transform .2s;
        }
        .fb-breathe-inner:hover{transform:scale(1.05)}
        @keyframes breathePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
        .fb-breathe-label{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#3a7a88;font-weight:500;margin-bottom:6px}
        .fb-breathe-hint{font-size:16px;color:#4a8a96;font-weight:300}

        /* ── WHISPER CARD ───────────────────────────────────── */
        .fb-whisper-card{
          background:rgba(255,255,255,.65);border-radius:32px;padding:20px 24px;
          display:flex;align-items:center;gap:16px;margin-bottom:24px;
          border:.5px solid rgba(255,255,255,.95);cursor:pointer;
          width:100%;backdrop-filter:blur(10px);transition:background .2s;
        }
        @media(min-width:768px){.fb-whisper-card{padding:24px 32px;gap:20px;margin-bottom:28px}}
        .fb-whisper-card:hover{background:rgba(255,255,255,.82)}
        .fb-whisper-icon{
          width:50px;height:50px;border-radius:14px;
          background:rgba(178,220,230,.4);
          display:flex;align-items:center;justify-content:center;flex-shrink:0;
        }
        @media(min-width:768px){.fb-whisper-icon{width:54px;height:54px}}
        .fb-whisper-label{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4a8a96;font-weight:500;margin-bottom:3px}
        .fb-whisper-desc{font-size:16px;color:#1a3a42}
        .fb-open-btn{
          background:#3a7a88;color:#fff;border:none;border-radius:24px;
          padding:10px 24px;font-size:14px;font-family:var(--font-dm-sans),sans-serif;
          cursor:pointer;white-space:nowrap;margin-left:auto;transition:background .2s;
        }
        .fb-open-btn:hover{background:#2a6070}

        /* ── WIND-DOWN CARD ─────────────────────────────────── */
        .fb-winddown-card{
          background:rgba(255,255,255,.65);border-radius:32px;padding:28px 20px;
          display:flex;flex-direction:column;gap:20px;margin-bottom:24px;
          border:.5px solid rgba(255,255,255,.95);width:100%;backdrop-filter:blur(10px);
        }
        @media(min-width:768px){.fb-winddown-card{padding:32px 40px;flex-direction:row;gap:32px;align-items:center}}
        .fb-winddown-label{display:flex;align-items:center;gap:8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4a8a96;font-weight:500;margin-bottom:8px}
        .fb-winddown-title{font-family:var(--font-dm-serif),serif;font-size:24px;color:#0f2e35;margin-bottom:4px;font-weight:400}
        @media(min-width:768px){.fb-winddown-title{font-size:28px}}
        .fb-winddown-sub{font-size:14px;color:#5a8a96;margin-bottom:16px;font-style:italic}
        .fb-winddown-actions{display:flex;align-items:center;gap:16px}
        .fb-play-btn{
          display:flex;align-items:center;gap:8px;background:#1a3a42;color:#fff;
          border:none;border-radius:24px;padding:10px 22px;font-size:14px;
          font-family:var(--font-dm-sans),sans-serif;cursor:pointer;transition:background .2s;
        }
        .fb-play-btn:hover{background:#0f2e35}
        .fb-browse-link{font-size:14px;color:#4a8a96;cursor:pointer;text-decoration:underline}
        .fb-blob{
          width:110px;height:110px;border-radius:50%;
          background:linear-gradient(145deg,#7ac4d0,#5aaabb);flex-shrink:0;
        }
        @media(min-width:768px){.fb-blob{width:130px;height:130px;margin-left:auto}}

        /* ── FOOTER ─────────────────────────────────────────── */
        .fb-footer{text-align:center;padding:20px 16px 32px;font-size:14px;color:#4a8a96;font-style:italic;font-weight:300;letter-spacing:.3px;flex-shrink:0}
        @media(min-width:768px){.fb-footer{padding:20px 48px 40px;font-size:15px}}

        /* ══════════════════════════════════════════════════════
           DESKTOP ≥1024px — ALL CHANGES BELOW THIS LINE
           ══════════════════════════════════════════════════════ */
        @media(min-width:1024px){

          /* Hamburger stays visible (opens drawer) */
          .fb-hamburger{display:flex}

          /* Sidebar → fixed drawer on desktop */
          .fb-sidebar{
            display:none;position:fixed;top:0;left:0;z-index:200;
            width:342px;height:100%;flex-direction:column;
            background:linear-gradient(180deg,#dceef2,#cde7ed);
            box-shadow:24px 0 60px rgba(40,90,105,.16);
            padding:28px 28px 24px;overflow-y:auto;border-right:none;
          }
          .fb-sidebar.open{display:flex}
          .fb-sidebar-overlay.open{display:block}
          .fb-sidebar-close-btn{display:block}

          /* Wrapper: block (no side-by-side column) */
          .fb-wrapper{display:block}

          /* Navbar: centered strip */
          .fb-navbar{max-width:1180px;margin:0 auto;padding:30px 56px 0}

          /* Logo sizing */
          .fb-logo{font-size:23px;font-weight:600;letter-spacing:-.3px;color:#2f3e45}
          .fb-time{font-style:italic;color:#7693a0;font-size:17px}

          /* Main: centered, no extra padding top */
          .fb-main{
            max-width:1180px;margin:0 auto;
            padding:0 56px 0;overflow:visible;
          }

          /* Greeting */
          .fb-greeting{font-size:66px;line-height:1;color:#2f3e45;margin-top:58px;margin-bottom:0;letter-spacing:0}
          .fb-subgreeting{font-size:22px;color:#7c9098;font-weight:300;margin-top:16px;margin-bottom:0}

          /* Floating island check-in */
          .fb-checkin-card{
            margin:46px -150px 0 0;
            border-radius:60px 0 0 60px;
            padding:46px 60px 60px;margin-bottom:0;
            background:linear-gradient(180deg,rgba(255,255,255,.74),rgba(255,255,255,.5));
            backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
            box-shadow:0 24px 70px rgba(60,120,140,.13);border:none;
          }
          .fb-checkin-label{font-size:12.5px;letter-spacing:2.2px;color:#8aa6ad;margin-bottom:0}
          .fb-checkin-heading{font-size:46px;line-height:1.08;margin-top:14px;margin-bottom:0}
          .fb-checkin-hint{font-size:17px;font-weight:300;color:#8497a0;margin-top:14px;margin-bottom:0}

          /* Desktop mood cluster */
          .fb-moods-cluster-desktop{position:relative;width:920px;height:600px;margin-top:34px}

          /* Breathe card */
          .fb-breathe-card{
            margin-top:34px;margin-bottom:0;border-radius:36px;padding:48px;
            background:linear-gradient(180deg,rgba(255,255,255,.62),rgba(255,255,255,.42));
            backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
            box-shadow:0 16px 44px rgba(70,130,150,.1);border:none;
          }
          .fb-breathe-outer{width:200px;height:200px}
          .fb-breathe-inner{width:200px;height:200px}
          .fb-breathe-label{font-size:13px;letter-spacing:3px;color:#7e98a0}
          .fb-breathe-hint{font-size:19px;color:#566970}

          /* Whisper card */
          .fb-whisper-card{
            margin-top:24px;margin-bottom:0;border-radius:42px;padding:26px 36px;gap:22px;
            background:linear-gradient(180deg,rgba(255,255,255,.62),rgba(255,255,255,.42));
            backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
            box-shadow:0 14px 40px rgba(70,130,150,.1);border:none;
          }
          .fb-whisper-icon{
            width:56px;height:56px;border-radius:50%;
            background:#bfe0e8;flex-shrink:0;
          }
          .fb-whisper-label{font-size:12.5px;letter-spacing:2.2px;color:#8aa6ad}
          .fb-whisper-desc{font-size:21px;color:#3c4f57;font-weight:300;margin-top:5px}
          .fb-open-btn{
            background:linear-gradient(135deg,#5fa0ac,#7bbac4);
            font-size:15px;padding:11px 28px;
            box-shadow:0 8px 20px rgba(95,160,172,.35);
          }

          /* Wind-down card */
          .fb-winddown-card{
            margin-top:24px;margin-bottom:0;border-radius:42px;padding:34px 40px;gap:28px;
            background:linear-gradient(180deg,rgba(255,255,255,.62),rgba(255,255,255,.42));
            backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
            box-shadow:0 14px 40px rgba(70,130,150,.1);border:none;
            flex-direction:row;align-items:center;
          }
          .fb-winddown-label{font-size:12.5px;letter-spacing:2.2px;color:#8aa6ad}
          .fb-winddown-title{font-size:32px}
          .fb-winddown-sub{font-size:16px}
          .fb-play-btn{
            display:flex;align-items:center;gap:9px;
            background:#2f3e45;color:#eef4f5;
            font-size:15px;padding:11px 24px;border-radius:30px;
          }
          .fb-browse-link{font-size:15px}
          .fb-blob{
            width:150px;height:150px;
            background:radial-gradient(circle at 38% 34%,#cfeaf0,#a6d2dc);
            box-shadow:0 14px 34px rgba(120,180,195,.32);
            margin-left:auto;flex-shrink:0;
          }

          /* Footer */
          .fb-footer{padding:54px 0 66px;font-size:16.5px;color:#7c9098}
        }
      `}</style>

      <div className="fb-root">

        {/* ── NAVBAR ─────────────────────────────────────────── */}
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
          <div className="fb-time">{clock}</div>
        </nav>

        <div className="fb-wrapper">

          {/* overlay */}
          <div className={`fb-sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

          {/* ── SIDEBAR ──────────────────────────────────────── */}
          <aside className={`fb-sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="fb-sidebar-top">
              <div className="fb-sidebar-close">
                <button className="fb-sidebar-close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
              </div>
              <div className="fb-profile">
                <div className="fb-profile-avatar">{isGuest ? "👤" : initials}</div>
                <div className="fb-profile-info">
                  <div className="fb-profile-name">{isGuest ? "guest" : fullName}</div>
                  <div className="fb-profile-action">{isGuest ? "not saved" : "tap for settings"}</div>
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
                  {["empty","overwhelmed","okayish","empty","heavy","full","overwhelmed"].map((m, i) => (
                    <div key={i} className="fb-mood-dot" style={{ backgroundColor: MOOD_COLORS[m] }} />
                  ))}
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
                <div className="fb-history-item">
                  <span>your entries</span>
                  <svg className="fb-lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
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
                    <span key={i} style={{
                      background: i === 0 ? "#5eb4c2" : "rgba(255,255,255,.6)",
                      color: i === 0 ? "#fff" : "#4a5d64",
                      fontSize: "12.5px", padding: "5px 13px", borderRadius: 20, cursor: "pointer"
                    }}>{s}</span>
                  ))}
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
            </div>

            <div style={{ flex:1, minHeight:20 }} />
            <div style={{ background:"rgba(255,255,255,.5)", borderRadius:16, padding:"12px 15px", fontSize:13.5, color:"#46606a", display:"flex", alignItems:"center", gap:9 }}>
              🌸 you&#39;ve checked in 4 days this week.
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

          {/* ── MAIN CONTENT ─────────────────────────────────── */}
          <div className="fb-main">
            <p className="fb-greeting">{anonymousMode ? "hello there," : `hello ${firstName},`}</p>
            <p className="fb-subgreeting">{getSubGreeting()}</p>

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

              {/* MOOD CLUSTER — desktop: absolute organic blobs, mobile: flex grid */}
              {isDesktop ? (
                <div className="fb-moods-cluster-desktop">
                  {DESKTOP_BLOBS.map(blob => (
                    <div
                      key={blob.id}
                      onClick={() => setActiveMood(blob.id)}
                      style={{
                        position:"absolute", left:blob.left, top:blob.top,
                        width:blob.width, height:blob.height,
                        borderRadius:blob.borderRadius,
                        background:blob.background,
                        boxShadow: activeMood === blob.id
                          ? `${blob.shadow}, 0 0 0 3px rgba(255,255,255,.6)`
                          : blob.shadow,
                        cursor:"pointer",
                        display:"flex", flexDirection:"column",
                        alignItems:"center", justifyContent:"center",
                        transition:"transform .45s ease, box-shadow .45s ease",
                        color:blob.color,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.035)" }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)" }}
                    >
                      <BlobIcon id={blob.id} size={blob.iconSize} />
                      <div style={{ marginTop:14, fontSize:20, fontWeight:400 }}>{blob.label}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="fb-moods-grid">
                  {MOODS.map(mood => (
                    <button
                      key={mood.id}
                      onClick={() => setActiveMood(mood.id)}
                      className="fb-mood-btn"
                      style={{ backgroundColor: mood.color }}
                      aria-pressed={activeMood === mood.id}
                    >
                      <div className="fb-mood-icon" style={{ color: mood.textColor }}>
                        {mood.id === "empty"       && <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="16" cy="12" r="4"/><path d="M8 24 Q16 18 24 24"/><path d="M6 27 Q16 21 26 27"/></svg>}
                        {mood.id === "overwhelmed" && <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 14 Q10 10 16 14 Q22 18 28 14"/><path d="M4 20 Q10 16 16 20 Q22 24 28 20"/><circle cx="16" cy="8" r="2.5"/></svg>}
                        {mood.id === "okayish"     && <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="16" cy="12" r="6"/><path d="M10 6 L16 2 L22 6"/><path d="M8 20 L24 20"/></svg>}
                        {mood.id === "heavy"       && <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M16 4 Q20 12 16 20 Q14 24 16 28"/><ellipse cx="16" cy="28" rx="4" ry="2"/></svg>}
                        {mood.id === "full"        && <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="16" cy="16" r="5"/><path d="M16 2 L16 6M16 26 L16 30M2 16 L6 16M26 16 L30 16M6.3 6.3 L9.2 9.2M22.8 22.8 L25.7 25.7M25.7 6.3 L22.8 9.2M9.2 22.8 L6.3 25.7"/></svg>}
                      </div>
                      <span className="fb-mood-label" style={{ color: mood.textColor }}>{mood.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* BREATHE CARD */}
            <div className="fb-breathe-card" onClick={isDesktop ? startBreathe : undefined}>
              <div className="fb-breathe-outer">
                <div className="fb-breathe-inner" onClick={!isDesktop ? startBreathe : undefined}>
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    play
                  </button>
                  <span className="fb-browse-link">browse library</span>
                </div>
              </div>
              <div className="fb-blob" />
            </div>
          </div>
        </div>

        <div className="fb-footer">{footer}</div>
      </div>
    </>
  )
}
