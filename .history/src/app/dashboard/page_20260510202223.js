'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { themes } from '../../lib/themes'

const moods = [
  {
    id: 'empty',
    emoji: '🌫️',
    name: 'Empty',
    description: 'when you feel nothing and that somehow feels like everything',
    color: '#8a9aaa',
    soft: 'rgba(138,154,170,0.12)',
  },
  {
    id: 'overwhelmed',
    emoji: '🌊',
    name: 'Overwhelmed',
    description: 'when everything is too much, all at once',
    color: '#0e8fa3',
    soft: 'rgba(14,143,163,0.12)',
  },
  {
    id: 'okayish',
    emoji: '🌥️',
    name: 'Okay-ish',
    description: 'neither here nor there, just existing',
    color: '#8a9a7a',
    soft: 'rgba(138,154,122,0.12)',
  },
  {
    id: 'heavy',
    emoji: '🌧️',
    name: 'Heavy',
    description: 'when your chest feels too full of something you cannot name',
    color: '#7b5ea7',
    soft: 'rgba(123,94,167,0.12)',
  },
  {
    id: 'full',
    emoji: '🌸',
    name: 'Full',
    description: 'overflowing with something good',
    color: '#e07a8a',
    soft: 'rgba(224,122,138,0.12)',
  },
]

const sidebarItems = [
  { icon: '👤', label: 'Profile' },
  { icon: '🎭', label: 'Anonymous Mode' },
  { icon: '📊', label: 'Mood Tracker' },
  { icon: '📖', label: 'History' },
  { icon: '🔒', label: 'Privacy Lock' },
  { icon: '🎵', label: 'Sound' },
  { icon: '⚙️', label: 'Settings' },
  { icon: '🚪', label: 'Logout' },
]

export default function Dashboard() {
  const [name, setName] = useState('Friend')
  const [selectedMood, setSelectedMood] = useState(null)
  const [hoveredMood, setHoveredMood] = useState(null)
  const [greeting, setGreeting] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [time, setTime] = useState('')
  const [bgTheme, setBgTheme] = useState(null)

  const greetingRef = useRef(null)
  const subtitleRef = useRef(null)
  const cardsRef = useRef(null)
  const overlayRef = useRef(null)
  const sidebarRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const storedName = localStorage.getItem('userName') || 'Friend'
    setName(storedName)

    const hour = new Date().getHours()
    const mins = new Date().getMinutes()
    const ampm = hour >= 12 ? 'pm' : 'am'
    const displayHour = hour % 12 || 12
    setTime(`it's ${displayHour}:${String(mins).padStart(2, '0')}${ampm}`)

    if (hour >= 5 && hour < 12) setGreeting(`Good morning, ${storedName}.`)
    else if (hour >= 12 && hour < 17) setGreeting(`Hey ${storedName}. How's your afternoon?`)
    else if (hour >= 17 && hour < 22) setGreeting(`Good evening, ${storedName}.`)
    else setGreeting(`Hey. It's quiet out there.`)
  }, [])

  useEffect(() => {
    if (!greeting || !cardsRef.current) return
    const tl = gsap.timeline()
    tl.fromTo(greetingRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.4, ease: 'power3.out' }
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' },
      '-=0.9'
    )
    .fromTo(cardsRef.current.children,
      { opacity: 0, y: 32, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out' },
      '-=0.6'
    )
  }, [greeting])

  // sidebar open/close
  useEffect(() => {
    if (sidebarOpen) {
      gsap.to(sidebarRef.current, { x: 0, duration: 0.45, ease: 'power3.out' })
      gsap.to(overlayRef.current, { opacity: 1, pointerEvents: 'all', duration: 0.3 })
    } else {
      gsap.to(sidebarRef.current, { x: '-100%', duration: 0.35, ease: 'power3.in' })
      gsap.to(overlayRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.25 })
    }
  }, [sidebarOpen])

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood.id)
    setBgTheme(themes[mood.id].state1)
  }

  const handleContinue = () => {
    if (selectedMood) {
      localStorage.setItem('selectedMood', selectedMood)
      router.push('/activities')
    }
  }

  const currentBg = bgTheme
    ? bgTheme.background
    : 'linear-gradient(135deg, #f5f0e8 0%, #ede8dc 40%, #e8e2d4 70%, #f0ebe0 100%)'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #f5f0e8;
        }

        .dashboard-main {
          min-height: 100vh;
          font-family: 'Lato', sans-serif;
          background: ${currentBg};
          transition: background 1.4s ease;
          position: relative;
          overflow: hidden;
        }

        /* linen texture overlay */
        .dashboard-main::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(180,160,120,0.03) 2px,
              rgba(180,160,120,0.03) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 3px,
              rgba(180,160,120,0.02) 3px,
              rgba(180,160,120,0.02) 6px
            );
          pointer-events: none;
          z-index: 1;
        }

        /* paper grain */
        .dashboard-main::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.4;
          pointer-events: none;
          z-index: 1;
        }

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          z-index: 100;
          background: rgba(245,240,232,0.7);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(180,160,120,0.15);
        }

        .hamburger {
          width: 40px;
          height: 40px;
          border: none;
          background: rgba(180,160,120,0.12);
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition: background 0.2s;
        }
        .hamburger:hover { background: rgba(180,160,120,0.22); }
        .hamburger span {
          display: block;
          width: 20px;
          height: 2px;
          background: #6b5a3e;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .navbar-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #4a3728;
          letter-spacing: 0.05em;
        }

        .navbar-time {
          font-family: 'Lato', sans-serif;
          font-size: 0.8rem;
          color: rgba(74,55,40,0.5);
          letter-spacing: 0.08em;
        }

        /* sidebar overlay */
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(30,20,10,0.35);
          z-index: 200;
          opacity: 0;
          pointer-events: none;
          backdrop-filter: blur(2px);
        }

        /* sidebar */
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 280px;
          background: rgba(245,240,232,0.97);
          backdrop-filter: blur(20px);
          z-index: 300;
          transform: translateX(-100%);
          display: flex;
          flex-direction: column;
          padding: 0;
          border-right: 1px solid rgba(180,160,120,0.2);
          box-shadow: 8px 0 40px rgba(30,20,10,0.15);
        }

        .sidebar-header {
          padding: 24px 24px 20px;
          border-bottom: 1px solid rgba(180,160,120,0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sidebar-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: #4a3728;
        }

        .sidebar-close {
          width: 32px;
          height: 32px;
          border: none;
          background: rgba(180,160,120,0.12);
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          color: #6b5a3e;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-profile {
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 14px;
          border-bottom: 1px solid rgba(180,160,120,0.12);
        }

        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c4a882, #a08060);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          color: white;
          font-weight: 700;
          flex-shrink: 0;
        }

        .profile-name {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          font-weight: 600;
          color: #4a3728;
        }

        .profile-sub {
          font-size: 0.75rem;
          color: rgba(74,55,40,0.5);
          margin-top: 2px;
          letter-spacing: 0.04em;
        }

        /* mood dots tracker */
        .mood-tracker {
          padding: 16px 24px;
          border-bottom: 1px solid rgba(180,160,120,0.12);
        }
        .tracker-label {
          font-size: 0.7rem;
          color: rgba(74,55,40,0.5);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 10px;
        }
        .tracker-dots {
          display: flex;
          gap: 8px;
        }
        .tracker-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(180,160,120,0.2);
        }

        .sidebar-nav {
          flex: 1;
          padding: 12px 16px;
          overflow-y: auto;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s;
          margin-bottom: 2px;
        }
        .sidebar-item:hover { background: rgba(180,160,120,0.12); }
        .sidebar-item-icon { font-size: 1.1rem; width: 24px; text-align: center; }
        .sidebar-item-label {
          font-size: 0.9rem;
          color: #4a3728;
          font-weight: 400;
          letter-spacing: 0.02em;
        }

        /* main content */
        .content {
          position: relative;
          z-index: 10;
          padding: 100px 40px 40px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .greeting-section {
          text-align: center;
          margin-bottom: 56px;
          max-width: 600px;
        }

        .greeting-text {
          font-family: 'Playfair Display', serif;
          font-size: 3.2rem;
          font-weight: 700;
          color: #2c1f0e;
          line-height: 1.2;
          margin-bottom: 14px;
          opacity: 0;
        }

        .greeting-sub {
          font-family: 'Lato', sans-serif;
          font-size: 1rem;
          color: rgba(44,31,14,0.55);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 300;
          opacity: 0;
        }

        /* decorative elements */
        .deco-line {
          width: 60px;
          height: 1px;
          background: rgba(44,31,14,0.2);
          margin: 20px auto;
        }

        /* mood cards grid */
        .mood-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          max-width: 820px;
          width: 100%;
          margin-bottom: 40px;
        }

        .mood-card {
          background: rgba(255,252,245,0.7);
          border: 1.5px solid rgba(180,160,120,0.2);
          border-radius: 24px;
          padding: 32px 20px 28px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          text-align: center;
          backdrop-filter: blur(8px);
          position: relative;
          overflow: hidden;
        }

        .mood-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .mood-card:hover {
          transform: translateY(-6px) scale(1.02);
          border-color: rgba(180,160,120,0.5);
          box-shadow: 0 16px 40px rgba(30,20,10,0.12);
        }

        .mood-card.selected {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 20px 50px rgba(30,20,10,0.18);
        }

        .mood-card-emoji {
          font-size: 3.2rem;
          margin-bottom: 14px;
          display: block;
          line-height: 1;
        }

        .mood-card-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #2c1f0e;
          margin-bottom: 10px;
          letter-spacing: 0.02em;
        }

        .mood-card-desc {
          font-family: 'Lato', sans-serif;
          font-size: 0.8rem;
          color: rgba(44,31,14,0.5);
          font-style: italic;
          line-height: 1.5;
          font-weight: 300;
        }

        /* full mood spans */
        .mood-card.full-mood {
          grid-column: span 3;
          padding: 28px 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          text-align: left;
        }

        .mood-card.full-mood .mood-card-name { margin-bottom: 6px; }

        /* continue button */
        .continue-btn {
          padding: 16px 56px;
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          font-weight: 600;
          border: 1.5px solid rgba(44,31,14,0.25);
          border-radius: 50px;
          cursor: pointer;
          background: rgba(44,31,14,0.06);
          color: #2c1f0e;
          letter-spacing: 0.08em;
          transition: all 0.35s ease;
        }

        .continue-btn:hover {
          background: rgba(44,31,14,0.1);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(30,20,10,0.12);
        }

        /* footer quote */
        .footer-quote {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          text-align: center;
          padding: 16px;
          font-family: 'Playfair Display', serif;
          font-size: 0.85rem;
          font-style: italic;
          color: rgba(44,31,14,0.38);
          letter-spacing: 0.04em;
          z-index: 10;
          background: rgba(245,240,232,0.5);
          backdrop-filter: blur(8px);
          border-top: 1px solid rgba(180,160,120,0.1);
        }

        /* decorative floating words */
        .float-word {
          position: fixed;
          font-family: 'Playfair Display', serif;
          font-style: italic;
          color: rgba(44,31,14,0.055);
          pointer-events: none;
          z-index: 2;
          font-weight: 700;
          user-select: none;
        }
      `}</style>

      <div className="dashboard-main">

        {/* floating decorative words */}
        <span className="float-word" style={{ fontSize: '5rem', top: '8%', left: '2%', transform: 'rotate(-8deg)' }}>breathe.</span>
        <span className="float-word" style={{ fontSize: '3.5rem', top: '35%', right: '3%', transform: 'rotate(6deg)' }}>feel.</span>
        <span className="float-word" style={{ fontSize: '4rem', bottom: '18%', left: '5%', transform: 'rotate(-4deg)' }}>heal.</span>
        <span className="float-word" style={{ fontSize: '2.8rem', top: '60%', right: '6%', transform: 'rotate(8deg)' }}>rest.</span>

        {/* overlay */}
        <div ref={overlayRef} className="overlay" onClick={() => setSidebarOpen(false)} />

        {/* sidebar */}
        <div ref={sidebarRef} className="sidebar">
          <div className="sidebar-header">
            <span className="sidebar-logo">🌊 feelbetter</span>
            <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>

          <div className="sidebar-profile">
            <div className="avatar">{name.charAt(0).toUpperCase()}</div>
            <div>
              <div className="profile-name">{name}</div>
              <div className="profile-sub">feeling explorer 🌸</div>
            </div>
          </div>

          <div className="mood-tracker">
            <div className="tracker-label">last 7 days</div>
            <div className="tracker-dots">
              {['#8a9aaa', '#0e8fa3', '#c4a882', '#7b5ea7', '#0e8fa3', '#c4a882', '#e07a8a'].map((c, i) => (
                <div key={i} className="tracker-dot" style={{ background: c }} />
              ))}
            </div>
          </div>

          <nav className="sidebar-nav">
            {sidebarItems.map(item => (
              <div key={item.label} className="sidebar-item">
                <span className="sidebar-item-icon">{item.icon}</span>
                <span className="sidebar-item-label">{item.label}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* navbar */}
        <nav className="navbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>
            <span /><span /><span />
          </button>
          <span className="navbar-logo">feelbetter</span>
          <span className="navbar-time">{time}</span>
        </nav>

        {/* main content */}
        <div className="content">

          <div className="greeting-section">
            <h1 ref={greetingRef} className="greeting-text">{greeting}</h1>
            <div className="deco-line" />
            <p ref={subtitleRef} className="greeting-sub">how are you feeling right now?</p>
          </div>

          {/* mood cards */}
          <div ref={cardsRef} className="mood-grid">
            {moods.map((mood) => {
              const isSelected = selectedMood === mood.id
              const isFull = mood.id === 'full'

              return (
                <div
                  key={mood.id}
                  className={`mood-card ${isSelected ? 'selected' : ''} ${isFull ? 'full-mood' : ''}`}
                  onClick={() => handleMoodSelect(mood)}
                  style={{
                    borderColor: isSelected ? mood.color : undefined,
                    background: isSelected ? mood.soft : undefined,
                    boxShadow: isSelected ? `0 20px 50px ${mood.color}22` : undefined,
                  }}
                >
                  <span className="mood-card-emoji">{mood.emoji}</span>
                  <div>
                    <div className="mood-card-name">{mood.name}</div>
                    <div className="mood-card-desc">{mood.description}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* continue */}
          {selectedMood && (
            <button className="continue-btn" onClick={handleContinue}>
              continue →
            </button>
          )}

        </div>

        {/* footer quote */}
        <div className="footer-quote">
          {selectedMood
            ? moods.find(m => m.id === selectedMood)?.id === 'heavy'
              ? 'you are allowed to fall apart sometimes. it doesn\'t make you broken.'
              : moods.find(m => m.id === selectedMood)?.id === 'empty'
              ? 'not feeling is also a feeling. you are still here.'
              : moods.find(m => m.id === selectedMood)?.id === 'overwhelmed'
              ? 'you don\'t have to solve everything tonight.'
              : moods.find(m => m.id === selectedMood)?.id === 'okayish'
              ? 'ordinary days are still days worth living.'
              : 'hold this feeling close. you deserve this.'
            : 'a safe space for your feelings — always.'
          }
        </div>

      </div>
    </>
  )
}