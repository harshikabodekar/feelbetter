"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"

const MOODS = [
  { id: "empty", label: "empty", color: "#515d6e", textColor: "#ffffff" },
  { id: "overwhelmed", label: "overwhelmed", color: "#0a6878", textColor: "#ffffff" },
  { id: "okayish", label: "okay-ish", color: "#7a8a5a", textColor: "#ffffff" },
  { id: "heavy", label: "heavy", color: "#1a1060", textColor: "#ffffff" },
  { id: "full", label: "full", color: "#d07030", textColor: "#ffffff" },
]

const BG_MAP = {
  default:     "linear-gradient(135deg, #a8d8e0 0%, #b8e4ec 25%, #caeef5 75%, #ddf5f9 100%)",
  empty:       "linear-gradient(135deg, #8a9aa8 0%, #ccd8e0 100%)",
  overwhelmed: "linear-gradient(135deg, #0a6878 0%, #a8dce8 100%)",
  okayish:     "linear-gradient(135deg, #7a8a5a 0%, #c8d8a8 100%)",
  heavy:       "linear-gradient(135deg, #1a1060 0%, #a8a0d8 100%)",
  full:        "linear-gradient(135deg, #d07030 0%, #f8c890 100%)",
}

const FOOTER_MAP = {
  default:     "not feeling is also a feeling. you are still here.",
  empty:       "not feeling is also a feeling. you are still here.",
  overwhelmed: "you don't have to solve everything tonight.",
  okayish:     "ordinary days are still days worth living.",
  heavy:       "you are allowed to fall apart sometimes. it doesn't make you broken.",
  full:        "hold this feeling close. you deserve this.",
}

const BREATHE_STEPS = [
  { text: "breathe in... 4", ms: 4000 },
  { text: "hold... 7",       ms: 7000 },
  { text: "breathe out... 8", ms: 8000 },
]

const MOOD_COLORS = {
  empty:       "#8a9aa8",
  overwhelmed: "#0a6878",
  okayish:     "#7a8a5a",
  heavy:       "#1a1060",
  full:        "#d07030",
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
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  const [clock, setClock] = useState(getClock())
  const [activeMood, setActiveMood] = useState(null)
  const [breatheText, setBreatheText] = useState("tap to begin a 4·7·8 cycle")
  const [breatheActive, setBreatheActive] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [anonymousMode, setAnonymousMode] = useState(false)
  const [isGuest, setIsGuest] = useState(false)
  const [moodHistory, setMoodHistory] = useState([])

  useEffect(() => {
    const guest = localStorage.getItem('isGuest') === 'true'
    setIsGuest(guest)

    if (!loading && !user && !guest) {
      router.replace('/login')
    }
  }, [user, loading])

  useEffect(() => {
    if (user && localStorage.getItem('isGuest') !== 'true') {
      fetchLast7Days()
    }
  }, [user])

  async function fetchLast7Days() {
    const { data, error } = await supabase
      .from('mood_entries')
      .select('mood, created_at')
      .order('created_at', { ascending: false })
      .limit(7)
    if (!error && data) setMoodHistory(data.reverse())
  }

  async function saveMood(moodId) {
    setActiveMood(moodId)
    if (!user || localStorage.getItem('isGuest') === 'true') return
    await supabase.from('mood_entries').insert({ user_id: user.id, mood: moodId })
    fetchLast7Days()
  }

  useEffect(() => {
    const t = setInterval(() => setClock(getClock()), 30000)
    setIsDesktop(window.innerWidth >= 1024)
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener("resize", handleResize)
    return () => {
      clearInterval(t)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  // Derive display name: real user → guest → fallback
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there'
  const firstName = fullName.split(' ')[0]
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

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

  const bg = BG_MAP[activeMood] || BG_MAP.default
  const footer = FOOTER_MAP[activeMood] || FOOTER_MAP.default

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .fb-root {
          font-family: var(--font-dm-sans), sans-serif;
          min-height: 100vh;
          color: #1a3a42;
          transition: background 0.9s ease;
          display: flex;
          flex-direction: column;
        }

        .fb-wrapper {
          display: flex;
          flex: 1;
          position: relative;
        }

        /* SIDEBAR */
        .fb-sidebar {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          width: 280px;
          display: none;
          flex-direction: column;
          border-right: 1px solid rgba(255, 255, 255, 0.5);
          position: relative;
          z-index: 100;
        }

        @media (min-width: 1024px) {
          .fb-sidebar {
            display: flex;
            width: 400px;
            min-height: 100vh;
          }

          /* feelbetter brand lives in sidebar on desktop */
          .fb-sidebar-brand {
            display: block;
            font-family: var(--font-dm-serif), serif;
            font-size: 26px;
            color: #0f2e35;
            font-weight: 400;
            letter-spacing: 0.06em;
            padding-bottom: 20px;
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.07);
          }

          /* navbar logo hidden on desktop — brand is now in the sidebar */
          .fb-logo {
            display: none;
          }
        }

        /* brand hidden on mobile/tablet */
        .fb-sidebar-brand {
          display: none;
        }

        .fb-sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          display: none;
          z-index: 90;
        }

        @media (max-width: 1023px) {
          .fb-sidebar-overlay.open {
            display: block;
          }

          .fb-sidebar.open {
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            width: 280px;
            height: 100vh;
            z-index: 100;
          }
        }

        .fb-sidebar-top {
          padding: 28px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          flex-shrink: 0;
        }

        .fb-sidebar-close {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 16px;
        }

        .fb-sidebar-close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #1a3a42;
          padding: 0;
          width: 24px;
          height: 24px;
          display: none;
        }

        @media (max-width: 1023px) {
          .fb-sidebar-close-btn {
            display: block;
          }
        }

        .fb-profile {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 24px;
        }

        .fb-profile-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7ac4d0, #5aaabb);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .fb-profile-info {
          flex: 1;
        }

        .fb-profile-name {
          font-size: 18px;
          color: #0f2e35;
          font-weight: 500;
        }

        .fb-profile-action {
          font-size: 13px;
          color: #4a8a96;
          cursor: pointer;
          text-decoration: underline;
        }

        .fb-anon-toggle {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 0;
          margin-bottom: 24px;
        }

        .fb-anon-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .fb-anon-label {
          font-size: 15px;
          color: #1a3a42;
          flex: 1;
        }

        .fb-toggle {
          width: 48px;
          height: 26px;
          background: #d0d0d0;
          border-radius: 13px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: background 0.3s;
          flex-shrink: 0;
        }

        .fb-toggle.on {
          background: #7ac4d0;
        }

        .fb-toggle-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: left 0.3s;
        }

        .fb-toggle.on .fb-toggle-thumb {
          left: 25px;
        }

        .fb-sidebar-middle {
          flex: 1;
          padding: 0 28px;
          overflow-y: auto;
        }

        .fb-sidebar-section {
          margin-bottom: 28px;
        }

        .fb-sidebar-section-label {
          font-size: 13px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #4a8a96;
          font-weight: 500;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .fb-mood-dots {
          display: flex;
          gap: 10px;
        }

        .fb-mood-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ccc;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .fb-mood-dot:hover {
          transform: scale(1.15);
        }

        .fb-history-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          color: #1a3a42;
        }

        .fb-history-item:hover {
          background: rgba(255, 255, 255, 0.8);
        }

        .fb-lock-icon {
          width: 18px;
          height: 18px;
        }

        .fb-sound-selector {
          font-size: 16px;
          color: #1a3a42;
          cursor: pointer;
          padding: 10px 0;
        }

        .fb-settings-item {
          font-size: 16px;
          color: #1a3a42;
          cursor: pointer;
          padding: 10px 0;
        }

        .fb-sidebar-bottom {
          padding: 28px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          flex-shrink: 0;
        }

        .fb-logout {
          font-size: 16px;
          color: #4a8a96;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* NAVBAR */
        .fb-navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .fb-navbar {
            padding: 24px 48px;
          }
        }

        @media (min-width: 1024px) {
          .fb-navbar {
            padding: 24px 48px;
          }
        }

        .fb-logo-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .fb-hamburger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
        }

        @media (min-width: 1024px) {
          .fb-hamburger {
            display: none;
          }
        }

        .fb-hamburger span {
          display: block;
          width: 22px;
          height: 1.5px;
          background: #2a5a66;
          border-radius: 2px;
        }

        .fb-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-dm-serif), serif;
          font-size: 32px;
          color: #1a3a42;
          letter-spacing: -0.3px;
        }

        .fb-time {
          font-size: 14px;
          color: #2a5a66;
          font-weight: 300;
          font-style: italic;
        }

        /* MAIN CONTENT */
        .fb-main {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
        }

        @media (min-width: 768px) {
          .fb-main {
            padding: 32px 48px;
          }
        }

        .fb-greeting {
          font-family: var(--font-dm-serif), serif;
          font-size: 42px;
          color: #0f2e35;
          font-weight: 400;
          line-height: 1.1;
          margin-bottom: 4px;
          letter-spacing: -1px;
        }

        @media (min-width: 768px) {
          .fb-greeting {
            font-size: 56px;
            margin-bottom: 8px;
            letter-spacing: -1.5px;
          }
        }

        .fb-subgreeting {
          font-size: 16px;
          color: #3a6a75;
          font-weight: 300;
          margin-bottom: 32px;
        }

        @media (min-width: 768px) {
          .fb-subgreeting {
            font-size: 18px;
            margin-bottom: 40px;
          }
        }

        /* DAILY CHECK-IN CARD */
        .fb-checkin-card {
          background: rgba(255, 255, 255, 0.65);
          border-radius: 32px;
          padding: 32px 24px;
          border: 0.5px solid rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          margin-bottom: 24px;
        }

        @media (min-width: 768px) {
          .fb-checkin-card {
            padding: 40px 32px;
            margin-bottom: 28px;
          }
        }

        .fb-checkin-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #4a8a96;
          font-weight: 500;
          margin-bottom: 12px;
        }

        .fb-checkin-heading {
          font-family: var(--font-dm-serif), serif;
          font-size: 28px;
          color: #0f2e35;
          line-height: 1.2;
          margin-bottom: 12px;
          font-weight: 400;
          text-align: left;
        }

        @media (min-width: 768px) {
          .fb-checkin-heading {
            font-size: 32px;
            margin-bottom: 16px;
          }
        }

        .fb-checkin-hint {
          font-size: 15px;
          color: #5a8a96;
          font-weight: 300;
          font-style: italic;
          margin-bottom: 28px;
        }

        /* MOOD BLOBS */
        .fb-moods-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: center;
        }

        @media (min-width: 768px) {
          .fb-moods-grid {
            gap: 24px;
          }
        }

        .fb-mood-btn {
          border: none;
          background: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.2s ease, filter 0.2s ease;
          padding: 0;
          border-radius: 50%;
          position: relative;
          width: 130px;
          height: 120px;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .fb-mood-btn {
            width: 160px;
            height: 140px;
          }
        }

        .fb-mood-btn:hover {
          transform: scale(1.08);
          filter: brightness(1.1);
        }

        .fb-mood-btn:focus {
          outline: 2px solid rgba(255, 255, 255, 0.6);
          outline-offset: 4px;
        }

        .fb-mood-icon {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.9;
        }

        .fb-mood-label {
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        /* BREATHE CARD */
        .fb-breathe-card {
          background: rgba(255, 255, 255, 0.65);
          border-radius: 32px;
          padding: 40px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 24px;
          border: 0.5px solid rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          width: 100%;
        }

        @media (min-width: 768px) {
          .fb-breathe-card {
            margin-bottom: 28px;
          }
        }

        .fb-breathe-outer {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: rgba(178, 220, 230, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          animation: breathePulse 6s ease-in-out infinite;
        }

        .fb-breathe-inner {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: linear-gradient(145deg, #6ab4c2, #4a9aac);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .fb-breathe-inner:hover {
          transform: scale(1.05);
        }

        @keyframes breathePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        .fb-breathe-label {
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #3a7a88;
          font-weight: 500;
          margin-bottom: 6px;
        }

        .fb-breathe-hint {
          font-size: 16px;
          color: #4a8a96;
          font-weight: 300;
        }

        /* WHISPER CARD */
        .fb-whisper-card {
          background: rgba(255, 255, 255, 0.65);
          border-radius: 32px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          border: 0.5px solid rgba(255, 255, 255, 0.95);
          cursor: pointer;
          width: 100%;
          backdrop-filter: blur(10px);
          transition: background 0.2s;
        }

        @media (min-width: 768px) {
          .fb-whisper-card {
            padding: 24px 32px;
            gap: 20px;
            margin-bottom: 28px;
          }
        }

        .fb-whisper-card:hover {
          background: rgba(255, 255, 255, 0.82);
        }

        .fb-whisper-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: rgba(178, 220, 230, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .fb-whisper-icon {
            width: 54px;
            height: 54px;
          }
        }

        .fb-whisper-label {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #4a8a96;
          font-weight: 500;
          margin-bottom: 3px;
        }

        .fb-whisper-desc {
          font-size: 16px;
          color: #1a3a42;
        }

        .fb-open-btn {
          background: #3a7a88;
          color: white;
          border: none;
          border-radius: 24px;
          padding: 10px 24px;
          font-size: 14px;
          font-family: var(--font-dm-sans), sans-serif;
          cursor: pointer;
          white-space: nowrap;
          margin-left: auto;
          transition: background 0.2s;
        }

        .fb-open-btn:hover {
          background: #2a6070;
        }

        /* WIND-DOWN CARD */
        .fb-winddown-card {
          background: rgba(255, 255, 255, 0.65);
          border-radius: 32px;
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 24px;
          border: 0.5px solid rgba(255, 255, 255, 0.95);
          width: 100%;
          backdrop-filter: blur(10px);
        }

        @media (min-width: 768px) {
          .fb-winddown-card {
            padding: 32px 40px;
            flex-direction: row;
            gap: 32px;
            align-items: center;
          }
        }

        .fb-winddown-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #4a8a96;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .fb-winddown-title {
          font-family: var(--font-dm-serif), serif;
          font-size: 24px;
          color: #0f2e35;
          margin-bottom: 4px;
          font-weight: 400;
        }

        @media (min-width: 768px) {
          .fb-winddown-title {
            font-size: 28px;
          }
        }

        .fb-winddown-sub {
          font-size: 14px;
          color: #5a8a96;
          margin-bottom: 16px;
          font-style: italic;
        }

        .fb-winddown-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .fb-play-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #1a3a42;
          color: white;
          border: none;
          border-radius: 24px;
          padding: 10px 22px;
          font-size: 14px;
          font-family: var(--font-dm-sans), sans-serif;
          cursor: pointer;
          transition: background 0.2s;
        }

        .fb-play-btn:hover {
          background: #0f2e35;
        }

        .fb-browse-link {
          font-size: 14px;
          color: #4a8a96;
          cursor: pointer;
          text-decoration: underline;
        }

        .fb-blob {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: linear-gradient(145deg, #7ac4d0, #5aaabb);
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .fb-blob {
            width: 130px;
            height: 130px;
            margin-left: auto;
          }
        }

        .fb-footer {
          text-align: center;
          padding: 20px 16px 32px;
          font-size: 14px;
          color: #4a8a96;
          font-style: italic;
          font-weight: 300;
          letter-spacing: 0.3px;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .fb-footer {
            padding: 20px 48px 40px;
            font-size: 15px;
          }
        }

        @media (min-width: 1024px) {
          /* ── Main content ── */
          .fb-main {
            padding: 48px 72px 72px 52px;
          }

          /* ── Navbar ── */
          .fb-time {
            font-size: 18px;
          }

          /* ── Greeting ── */
          .fb-greeting {
            font-size: 80px;
            letter-spacing: -2px;
            margin-bottom: 10px;
          }
          .fb-subgreeting {
            font-size: 22px;
            margin-bottom: 48px;
          }

          /* ── Daily check-in card ── */
          .fb-checkin-card {
            padding: 48px 40px;
            margin-bottom: 32px;
          }
          .fb-checkin-label {
            font-size: 13px;
            letter-spacing: 2.5px;
            margin-bottom: 16px;
          }
          .fb-checkin-heading {
            font-size: 42px;
            margin-bottom: 12px;
          }
          .fb-checkin-hint {
            font-size: 18px;
            margin-bottom: 36px;
          }

          /* ── Mood blobs — 3-2 layout ── */
          .fb-mood-btn {
            width: 180px;
            height: 158px;
            flex-shrink: 0;
          }
          .fb-mood-icon {
            width: 34px;
            height: 34px;
          }
          .fb-mood-label {
            font-size: 15px;
          }
          .fb-moods-grid {
            max-width: 640px;
            margin: 0 auto;
            gap: 28px;
            justify-content: center;
            flex-wrap: wrap;
          }
          .fb-mood-btn:nth-child(4) {
            margin-right: 100px;
          }

          /* ── Breathe card ── */
          .fb-breathe-card {
            padding: 56px 40px;
            margin-bottom: 32px;
          }
          .fb-breathe-outer {
            width: 220px;
            height: 220px;
            margin-bottom: 28px;
          }
          .fb-breathe-inner {
            width: 152px;
            height: 152px;
          }
          .fb-breathe-label {
            font-size: 13px;
            letter-spacing: 3.5px;
            margin-bottom: 10px;
          }
          .fb-breathe-hint {
            font-size: 20px;
          }

          /* ── Whisper card ── */
          .fb-whisper-card {
            padding: 32px 48px;
            gap: 24px;
            margin-bottom: 32px;
          }
          .fb-whisper-icon {
            width: 64px;
            height: 64px;
            border-radius: 18px;
          }
          .fb-whisper-label {
            font-size: 13px;
            letter-spacing: 2.5px;
            margin-bottom: 6px;
          }
          .fb-whisper-desc {
            font-size: 20px;
          }
          .fb-open-btn {
            padding: 12px 32px;
            font-size: 16px;
          }

          /* ── Wind-down card ── */
          .fb-winddown-card {
            padding: 40px 56px;
            margin-bottom: 32px;
          }
          .fb-winddown-label {
            font-size: 13px;
            letter-spacing: 2.5px;
            margin-bottom: 12px;
          }
          .fb-winddown-title {
            font-size: 34px;
            margin-bottom: 6px;
          }
          .fb-winddown-sub {
            font-size: 17px;
            margin-bottom: 22px;
          }
          .fb-play-btn {
            padding: 12px 28px;
            font-size: 16px;
          }
          .fb-browse-link {
            font-size: 16px;
          }
          .fb-blob {
            width: 160px;
            height: 160px;
          }

          /* ── Footer ── */
          .fb-footer {
            font-size: 17px;
            padding: 28px 72px 52px;
          }
        }
      `}</style>

      <div className="fb-root" style={{ background: bg }}>
        {/* navbar */}
        <nav className="fb-navbar">
          <div className="fb-logo-wrap">
            <div className="fb-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span /><span /><span />
            </div>
            <div className="fb-logo">
              <svg width="36" height="27" viewBox="0 0 22 16" fill="none">
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

        <div className="fb-wrapper">
          {/* sidebar overlay (mobile) */}
          <div 
            className={`fb-sidebar-overlay ${sidebarOpen ? "open" : ""}`}
            onClick={() => setSidebarOpen(false)}
          />

          {/* sidebar */}
          <aside className={`fb-sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="fb-sidebar-top">
              <div className="fb-sidebar-close">
                <button className="fb-sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
                  ✕
                </button>
              </div>

              {/* feelbetter brand — desktop only, above the user's name */}
              <div className="fb-sidebar-brand">feelbetter</div>

              <div className="fb-profile">
                <div className="fb-profile-avatar">{isGuest ? "👤" : initials}</div>
                <div className="fb-profile-info">
                  <div className="fb-profile-name">{isGuest ? "guest" : fullName}</div>
                  <div className="fb-profile-action">{isGuest ? "not saved" : "tap for settings"}</div>
                </div>
              </div>

              <div className="fb-anon-toggle">
                <div className="fb-anon-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <label className="fb-anon-label">anonymous mode</label>
                <button 
                  className={`fb-toggle ${anonymousMode ? "on" : ""}`}
                  onClick={() => setAnonymousMode(!anonymousMode)}
                >
                  <div className="fb-toggle-thumb" />
                </button>
              </div>
            </div>

            <div className="fb-sidebar-middle">
              <div className="fb-sidebar-section">
                <div className="fb-sidebar-section-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5">
                    <polyline points="12 1 19 5 19 19 12 23 5 19 5 5 12 1" />
                  </svg>
                  last 7 days
                </div>
                <div className="fb-mood-dots">
                  {[
                    ...Array.from({ length: Math.max(0, 7 - moodHistory.length) }).map((_, i) => (
                      <div key={`empty-${i}`} className="fb-mood-dot" style={{ backgroundColor: '#d0d8dc' }} />
                    )),
                    ...moodHistory.map((entry, i) => (
                      <div key={`entry-${i}`} className="fb-mood-dot"
                        style={{ backgroundColor: MOOD_COLORS[entry.mood] || '#d0d8dc' }}
                        title={entry.mood}
                      />
                    )),
                  ]}
                </div>
              </div>

              <div className="fb-sidebar-section">
                <div className="fb-sidebar-section-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                  history
                </div>
                <div className="fb-history-item">
                  <span>your entries</span>
                  <svg className="fb-lock-icon" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              </div>

              <div className="fb-sidebar-section">
                <div className="fb-sidebar-section-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5">
                    <polygon points="11 5 6 9 9 9 9 15 13 15 13 9 16 9 11 5" />
                    <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" />
                  </svg>
                  ocean waves
                </div>
                <div className="fb-sound-selector">ocean waves</div>
              </div>

              <div className="fb-sidebar-section">
                <div className="fb-sidebar-section-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="1" />
                    <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
                  </svg>
                  settings
                </div>
                <div className="fb-settings-item">font size</div>
              </div>
            </div>

            <div className="fb-sidebar-bottom">
              <div className="fb-logout" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M16 17l5-5m0 0l-5-5" />
                </svg>
                {isGuest ? "sign in" : "logout"}
              </div>
            </div>
          </aside>

          {/* main content */}
          <div className="fb-main">
            <p className="fb-greeting">{anonymousMode ? "hello there," : `hello ${firstName},`}</p>
            <p className="fb-subgreeting">{getSubGreeting()}</p>

            {/* DAILY CHECK-IN CARD */}
            <div className="fb-checkin-card">
              <div className="fb-checkin-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#4a8a96" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                daily check-in
              </div>
              <h2 className="fb-checkin-heading">how do you feel right now?</h2>
              <p className="fb-checkin-hint">pick one. nothing shifts unless you're ready.</p>

              <div className="fb-moods-grid">
                {MOODS.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => saveMood(mood.id)}
                    className="fb-mood-btn"
                    style={{ backgroundColor: mood.color }}
                    aria-pressed={activeMood === mood.id}
                  >
                    <div className="fb-mood-icon" style={{ color: mood.textColor }}>
                      {mood.id === "empty" && (
                        <svg viewBox="0 0 32 32" width="28" height="28" fill="none"
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <circle cx="16" cy="12" r="4" />
                          <path d="M8 24 Q16 18 24 24" />
                          <path d="M6 27 Q16 21 26 27" />
                        </svg>
                      )}
                      {mood.id === "overwhelmed" && (
                        <svg viewBox="0 0 32 32" width="28" height="28" fill="none"
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M4 14 Q10 10 16 14 Q22 18 28 14" />
                          <path d="M4 20 Q10 16 16 20 Q22 24 28 20" />
                          <circle cx="16" cy="8" r="2.5" />
                        </svg>
                      )}
                      {mood.id === "okayish" && (
                        <svg viewBox="0 0 32 32" width="28" height="28" fill="none"
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <circle cx="16" cy="12" r="6" />
                          <path d="M10 6 L16 2 L22 6" />
                          <path d="M8 20 L24 20" />
                        </svg>
                      )}
                      {mood.id === "heavy" && (
                        <svg viewBox="0 0 32 32" width="28" height="28" fill="none"
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M16 4 Q20 12 16 20 Q14 24 16 28" />
                          <ellipse cx="16" cy="28" rx="4" ry="2" />
                        </svg>
                      )}
                      {mood.id === "full" && (
                        <svg viewBox="0 0 32 32" width="28" height="28" fill="none"
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <circle cx="16" cy="16" r="5" />
                          <path d="M16 2 L16 6M16 26 L16 30M2 16 L6 16M26 16 L30 16M6.3 6.3 L9.2 9.2M22.8 22.8 L25.7 25.7M25.7 6.3 L22.8 9.2M9.2 22.8 L6.3 25.7" />
                        </svg>
                      )}
                    </div>
                    <span className="fb-mood-label" style={{ color: mood.textColor }}>
                      {mood.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* BREATHE CARD */}
            <div className="fb-breathe-card">
              <div className="fb-breathe-outer">
                <div className="fb-breathe-inner" onClick={startBreathe}>
                  <svg viewBox="0 0 28 28" width="26" height="26" fill="none"
                    stroke="white" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M4 14 Q8 10 12 14 Q16 18 20 14 Q22 12 24 14" />
                    <path d="M4 18 Q8 14 12 18 Q16 22 20 18 Q22 16 24 18" />
                  </svg>
                </div>
              </div>
              <div className="fb-breathe-label">breathe</div>
              <div className="fb-breathe-hint">{breatheText}</div>
            </div>

            {/* WHISPER CARD */}
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

            {/* WIND-DOWN CARD */}
            <div className="fb-winddown-card">
              <div>
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
        </div>

        <div className="fb-footer">{footer}</div>
      </div>
    </>
  )
}