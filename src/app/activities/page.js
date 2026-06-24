"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ACTIVITIES } from "./data"

// SVG icons for each activity — simple, single-stroke, neutral colour by default
function ActivityIcon({ id, color }) {
  const p = { fill: "none", stroke: color, strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" }
  if (id === "spill") return (
    <svg width="38" height="38" viewBox="0 0 24 24" {...p}>
      <path d="M12 2s-7 7.5-7 12a7 7 0 0 0 14 0c0-4.5-7-12-7-12z" />
      <path d="M9 17a3 3 0 0 0 6 0" />
    </svg>
  )
  if (id === "pages") return (
    <svg width="38" height="38" viewBox="0 0 24 24" {...p}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
  if (id === "compass") return (
    <svg width="38" height="38" viewBox="0 0 24 24" {...p}>
      <circle cx="12" cy="12" r="9" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill={color} opacity=".7" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill={color} stroke="none" />
    </svg>
  )
  if (id === "canvas") return (
    <svg width="38" height="38" viewBox="0 0 24 24" {...p}>
      <path d="M12 19c-2.3 2.5-6 2.5-6 2.5s0-3.7 2.5-6" />
      <path d="m6.5 17.5 9-9" />
      <path d="M16 6l2-2 2 2-2 2-2-2z" fill={color} opacity=".6" stroke="none" />
      <path d="M16 6l2-2 2 2-2 2z" />
    </svg>
  )
  if (id === "echo") return (
    <svg width="38" height="38" viewBox="0 0 24 24" {...p}>
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  )
  return null
}

// Individual card — tracks its own hover state
function ActivityCard({ activity, router }) {
  const [hovered, setHovered] = useState(false)

  const handleClick = () => {
    if (activity.comingSoon) return
    router.push(activity.route)
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      style={{
        position: "relative",
        background: "rgba(255,255,255,.68)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: ".5px solid rgba(255,255,255,.9)",
        borderRadius: 28,
        padding: "40px 28px 36px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        cursor: activity.comingSoon ? "default" : "pointer",
        opacity: activity.comingSoon ? .6 : 1,
        // hover lift + accent glow
        transform: hovered && !activity.comingSoon ? "translateY(-7px)" : "none",
        boxShadow: hovered && !activity.comingSoon
          ? `0 16px 48px ${activity.glow}, 0 4px 16px rgba(0,0,0,.06)`
          : "0 4px 20px rgba(0,0,0,.05)",
        transition: "transform .28s ease, box-shadow .28s ease",
        minHeight: 220,
      }}
    >
      {/* coming soon badge */}
      {activity.comingSoon && (
        <span style={{
          position: "absolute", top: 16, right: 16,
          background: "rgba(180,180,180,.25)",
          color: "#8a9aaa",
          fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase",
          padding: "4px 10px", borderRadius: 20,
          fontWeight: 500,
        }}>
          coming soon
        </span>
      )}

      {/* icon — tinted with accent */}
      <div style={{
        width: 72, height: 72,
        borderRadius: "50%",
        background: hovered && !activity.comingSoon
          ? activity.accent + "44"   // slightly deeper on hover
          : activity.accent + "28",  // very light at rest
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20,
        transition: "background .28s ease",
      }}>
        <ActivityIcon id={activity.id} color={activity.accent} />
      </div>

      {/* name */}
      <div style={{
        fontSize: 22, fontWeight: 500,
        color: "#3c4f57",
        letterSpacing: "-.2px",
        marginBottom: hovered ? 12 : 0,
        transition: "margin .28s ease",
      }}>
        {activity.name}
      </div>

      {/* description — fades in on hover */}
      <div style={{
        fontSize: 15, fontWeight: 300,
        color: "#5a7080",
        lineHeight: 1.5,
        maxHeight: hovered ? 60 : 0,
        opacity: hovered ? 1 : 0,
        overflow: "hidden",
        transition: "opacity .28s ease, max-height .28s ease",
      }}>
        {activity.desc}
      </div>
    </div>
  )
}

export default function ActivitiesPage() {
  const router = useRouter()

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .act-root {
          font-family: var(--font-dm-sans), sans-serif;
          /* same gradient as dashboard — never tints */
          background: linear-gradient(165deg, #e6f5f7 0%, #d3edf2 48%, #e8f6f8 100%);
          min-height: 100vh;
          color: #1a3a42;
        }

        /* ── nav ── */
        .act-nav {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px 28px;
        }
        .act-back {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,.6);
          backdrop-filter: blur(8px);
          cursor: pointer;
          border: .5px solid rgba(255,255,255,.8);
          transition: background .2s;
          flex-shrink: 0;
        }
        .act-back:hover { background: rgba(255,255,255,.88); }
        .act-wordmark {
          font-family: var(--font-dm-serif), serif;
          font-size: 18px;
          color: #1a3a42;
          display: flex; align-items: center; gap: 8px;
        }

        /* ── header ── */
        .act-header {
          padding: 8px 28px 40px;
        }
        .act-title {
          font-family: var(--font-dm-serif), serif;
          font-size: 48px;
          font-weight: 400;
          color: #0f2e35;
          letter-spacing: -1px;
          line-height: 1.08;
          margin-bottom: 10px;
        }
        .act-sub {
          font-size: 18px;
          font-weight: 300;
          color: #5a8a96;
        }

        /* ── grid ── */
        .act-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
          padding: 0 28px 60px;
          max-width: 1400px;
        }

        /* ── footer nudge ── */
        .act-footer {
          text-align: center;
          padding: 0 28px 48px;
          font-size: 15px;
          color: #6a9aaa;
          font-style: italic;
        }

        /* ── desktop ── */
        @media (min-width: 1024px) {
          .act-nav  { padding: 32px clamp(48px, 6vw, 120px) 0; }
          .act-header { padding: 24px clamp(48px, 6vw, 120px) 48px; }
          .act-title  { font-size: 66px; }
          .act-sub    { font-size: 20px; }
          .act-grid   { padding: 0 clamp(48px, 6vw, 120px) 80px; gap: 24px; }
          .act-footer { padding-bottom: 60px; font-size: 16px; }
        }
      `}</style>

      <div className="act-root">

        {/* nav */}
        <nav className="act-nav">
          <div className="act-back" onClick={() => router.back()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2a5a66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </div>
          <div className="act-wordmark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3a8a8f" strokeWidth="1.8" strokeLinecap="round">
              <path d="M2 9c2.4-3 4.3-3 6.7 0s4.3 3 6.7 0 4.3-3 6.6 0" />
              <path d="M2 14.5c2.4-3 4.3-3 6.7 0s4.3 3 6.7 0 4.3-3 6.6 0" />
            </svg>
            feelbetter
          </div>
        </nav>

        {/* header */}
        <header className="act-header">
          <h1 className="act-title">activities</h1>
          <p className="act-sub">small things you can do right now.</p>
        </header>

        {/* card grid */}
        <div className="act-grid">
          {ACTIVITIES.map(activity => (
            <ActivityCard key={activity.id} activity={activity} router={router} />
          ))}
        </div>

        <p className="act-footer">whatever you choose, it counts.</p>
      </div>
    </>
  )
}
