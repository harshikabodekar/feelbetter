'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isDesktop, setIsDesktop]   = useState(false)
  const [pageScale, setPageScale]   = useState(1)

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setIsDesktop(w >= 1024)
      setPageScale(w >= 1024 ? Math.min(1, w / 1440, h / 900) : 1)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const isMobile = !isDesktop

  const router = useRouter()
  const { signIn, signUp, signInWithGoogle, signInAsGuest, error, setError } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields'); return }
    if (isSignUp && !name)   { setError('Please enter your name'); return }
    setSubmitting(true)
    if (isSignUp) {
      const ok = await signUp(email, password, name)
      if (ok) router.push('/dashboard')
    } else {
      const ok = await signIn(email, password)
      if (ok) router.push('/dashboard')
    }
    setSubmitting(false)
  }

  const handleGoogle = async () => { setError(''); await signInWithGoogle() }
  const handleGuest  = ()      => { signInAsGuest(); router.push('/dashboard') }

  // ── Shared styles ────────────────────────────────────────────────────────────
  // Input padding is tighter on mobile: 0.62rem top/bottom ≈ 10px — still a
  // comfortable tap target at ~36px total height, just not bulky.
  // IMPORTANT: keep font-size at 1rem (16px) on mobile — iOS Safari auto-zooms
  // the page when an input's font-size is below 16px, which is disorienting.
  const inputStyle = {
    width: '100%',
    padding: isMobile ? '0.62rem 0.85rem' : '0.9rem 1rem',
    border: '1px solid rgba(168, 230, 232, 0.4)',
    borderRadius: '12px',
    fontSize: '1rem',         // stay at 16px — prevents iOS zoom
    boxSizing: 'border-box',
    fontFamily: 'Georgia, serif',
    background: 'rgba(255, 255, 255, 0.07)',
    color: '#e8f8f9',
    outline: 'none',
    letterSpacing: '0.03em',
  }

  const labelStyle = {
    display: 'block',
    marginBottom: isMobile ? '0.3rem' : '0.5rem',
    color: 'rgba(232, 248, 249, 0.7)',
    fontSize: '0.8rem',
    fontWeight: '600',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'flex-start' : 'center',
      flexDirection: isMobile ? 'column' : 'row',
      fontFamily: 'Georgia, serif',
      background: 'linear-gradient(180deg, #03214a 0%, #06527a 35%, #0e8fa3 65%, #a8e6e8 100%)',
      position: 'relative',
      overflowX: 'hidden',
      overflowY: isMobile ? 'auto' : 'hidden',
      padding: isMobile ? '20px 16px' : '20px',
    }}>

      {/* Background glow blobs */}
      <div style={{
        position: 'absolute', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(14,143,163,0.18) 0%, transparent 70%)',
        borderRadius: '50%', top: '-100px', left: '-100px', filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(168,230,232,0.12) 0%, transparent 70%)',
        borderRadius: '50%', bottom: '-80px', right: '-80px', filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />

      {/* Floating ambient words — very faint on mobile so they don't crowd the form */}
      {['breathe.', 'feel.', 'heal.', 'you are enough.', 'rest here.'].map((word, i) => (
        <p key={i} style={{
          position: 'absolute',
          left: `${4 + i * 2}%`,
          top: `${12 + i * 16}%`,
          color: `rgba(168,230,232,${isMobile ? 0.06 : 0.12})`,
          fontSize: i % 2 === 0 ? '2.8rem' : '1.6rem',
          fontWeight: '700',
          margin: 0,
          letterSpacing: '0.1em',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          transform: `rotate(${i % 2 === 0 ? -6 : 4}deg)`,
          userSelect: 'none',
        }}>{word}</p>
      ))}

      {/* Scale wrapper — desktop only */}
      <div style={isDesktop && pageScale < 1 ? {
        transform: `scale(${pageScale})`,
        transformOrigin: 'center center',
      } : {}}>

        {/* ── Main card ── */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: isDesktop ? '32px' : '20px',
          width: '100%',
          maxWidth: isDesktop ? '1090px' : '520px',
          boxShadow: '0 8px 48px rgba(3, 33, 74, 0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          overflow: 'hidden',
        }}>

          {/* ── TOP (mobile) / LEFT (desktop) — brand panel ───────────────────
              Mobile padding is tight so this header section stays short.
              All decorative extras (long paragraph, wave lines, bottom tag)
              are hidden on mobile — they'd waste vertical space. */}
          <div style={{
            flex: isDesktop ? 1.1 : undefined,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            // Desktop: roomy. Mobile: compact top-strip — just the brand mark + quote.
            padding: isDesktop ? '52px 56px' : '22px 20px 18px',
            borderRight: isDesktop ? '1px solid rgba(168, 230, 232, 0.15)' : 'none',
            borderBottom: isMobile ? '1px solid rgba(168, 230, 232, 0.12)' : 'none',
            position: 'relative',
          }}>

            {/* Logo */}
            <div style={{ marginBottom: isDesktop ? '40px' : '8px' }}>
              <div style={{
                fontSize: isDesktop ? '2.1rem' : '1.2rem',
                marginBottom: '6px', letterSpacing: '0.3em',
              }}>
                {isDesktop ? '𓆝 𓆟 𓆞 𓆝 𓆟' : '𓆝 𓆟 𓆞'}
              </div>
              <h2 style={{
                color: '#e8f8f9',
                // Desktop: bold 3rem wordmark. Mobile: 1.35rem — readable, not oversized.
                fontSize: isDesktop ? '3rem' : '1.35rem',
                fontWeight: '700', margin: 0, letterSpacing: '0.1em',
              }}>feelbetter</h2>
            </div>

            {/* Quote */}
            <h1 style={{
              // Desktop: 3rem headline. Mobile: 1.05rem — same message, much smaller footprint.
              fontSize: isDesktop ? '3rem' : '1.05rem',
              color: '#e8f8f9',
              fontWeight: '700',
              lineHeight: '1.35',
              margin: isDesktop ? '0 0 24px 0' : '0 0 6px 0',
              letterSpacing: '0.02em',
              textShadow: '0 2px 30px rgba(14,143,163,0.5)',
            }}>
              All of your<br />
              feelings are<br />
              <span style={{ color: '#a8e6e8' }}>valid.</span>
            </h1>

            {/* Long intro paragraph — desktop only */}
            {isDesktop && (
              <p style={{
                color: 'rgba(232,248,249,0.65)',
                fontSize: '1.7rem',
                lineHeight: '1.7',
                margin: '0 0 40px 0',
                letterSpacing: '0.02em',
              }}>
                A safe space where you can breathe,<br />
                vent, and simply feel without judgment.
              </p>
            )}

            {/* One-line tagline — mobile only, replaces the long paragraph */}
            {isMobile && (
              <p style={{
                color: 'rgba(232,248,249,0.48)',
                fontSize: '0.8rem',
                margin: 0,
                letterSpacing: '0.06em',
              }}>
                a safe space to breathe, vent, and feel.
              </p>
            )}

            {/* Decorative wave lines — desktop only */}
            {isDesktop && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[100, 70, 85].map((w, i) => (
                  <div key={i} style={{
                    height: '2px', width: `${w}px`,
                    background: `rgba(168,230,232,${0.5 - i * 0.12})`,
                    borderRadius: '2px',
                  }} />
                ))}
              </div>
            )}

            {/* Bottom tagline — desktop only */}
            {isDesktop && (
              <p style={{
                position: 'absolute', bottom: '32px', left: '56px',
                color: 'darkcyan',
                fontSize: '1.2rem', letterSpacing: '0.2em',
                textTransform: 'uppercase', margin: 0,
              }}>
                breathe · feel · heal
              </p>
            )}
          </div>

          {/* ── BOTTOM (mobile) / RIGHT (desktop) — sign-in form ─────────────
              Tighter padding and spacing on mobile so the whole form fits
              comfortably on a 375px screen without scrolling. */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            // Desktop: generous 52px padding. Mobile: 20px sides, tighter vertical.
            padding: isDesktop ? '52px 56px' : '20px 20px 28px',
          }}>

            <h2 style={{
              color: '#e8f8f9',
              // Desktop: 1.9rem. Mobile: 1.1rem — still a clear heading, not oversized.
              fontSize: isDesktop ? '1.9rem' : '1.1rem',
              fontWeight: '700',
              margin: '0 0 4px 0',
              letterSpacing: '0.04em',
            }}>
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h2>

            <p style={{
              color: 'rgba(232,248,249,0.55)',
              // Desktop: 1.1rem. Mobile: 0.82rem — compact subtitle.
              fontSize: isDesktop ? '1.1rem' : '0.82rem',
              // Tighter gap below the subtitle on mobile.
              margin: isDesktop ? '0 0 28px 0' : '0 0 14px 0',
              letterSpacing: '0.03em',
            }}>
              {isSignUp ? 'Start your journey today.' : 'We\'ve kept your space warm.'}
            </p>

            {/* Form fields */}
            <div style={{ width: '100%' }}>

              {isSignUp && (
                // Tighter field gap on mobile: 0.75rem vs 1.2rem on desktop.
                <div style={{ marginBottom: isMobile ? '0.75rem' : '1.2rem' }}>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" value={name}
                    onChange={e => setName(e.target.value)}
                    style={inputStyle} placeholder="Your name"
                    onFocus={e => e.target.style.borderColor = 'rgba(168,230,232,0.8)'}
                    onBlur={e  => e.target.style.borderColor = 'rgba(168,230,232,0.4)'}
                  />
                </div>
              )}

              <div style={{ marginBottom: isMobile ? '0.75rem' : '1.2rem' }}>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle} placeholder="you@example.com"
                  onFocus={e => e.target.style.borderColor = 'rgba(168,230,232,0.8)'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(168,230,232,0.4)'}
                />
              </div>

              {/* Extra gap below password before the action buttons */}
              <div style={{ marginBottom: isMobile ? '1rem' : '1.8rem' }}>
                <label style={labelStyle}>Password</label>
                <input type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={inputStyle} placeholder="••••••••"
                  onFocus={e => e.target.style.borderColor = 'rgba(168,230,232,0.8)'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(168,230,232,0.4)'}
                />
              </div>

              {error && (
                <div style={{
                  color: '#ff8a8a', marginBottom: '0.75rem', fontSize: '0.85rem',
                  textAlign: 'center', padding: '0.6rem',
                  background: 'rgba(255,107,107,0.1)', borderRadius: '10px',
                  border: '1px solid rgba(255,107,107,0.25)',
                }}>{error}</div>
              )}

              {/* Primary button — slightly shorter on mobile (0.72rem vs 1rem padding)
                  but still a comfortable ~38px tap target. */}
              <button onClick={handleSubmit} disabled={submitting} style={{
                width: '100%',
                padding: isDesktop ? '1rem' : '0.72rem',
                background: 'linear-gradient(135deg, #0e8fa3 0%, #06527a 100%)',
                color: '#e8f8f9',
                border: '1px solid rgba(168,230,232,0.4)',
                borderRadius: '12px',
                fontSize: '1rem', fontWeight: '700',
                letterSpacing: '0.08em',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                boxShadow: '0 4px 20px rgba(14,143,163,0.35)',
                marginBottom: isMobile ? '10px' : '14px',
                fontFamily: 'Georgia, serif',
              }}>
                {submitting ? '...' : (isSignUp ? 'Create Account' : 'Sign In') + ' →'}
              </button>

              {/* OR divider */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                margin: isMobile ? '2px 0 10px' : '6px 0 14px',
              }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(168,230,232,0.2)' }} />
                <span style={{ color: 'rgba(232,248,249,0.4)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(168,230,232,0.2)' }} />
              </div>

              {/* Google — secondary buttons get 0.7rem padding on mobile */}
              <button onClick={handleGoogle} style={{
                width: '100%',
                padding: isDesktop ? '0.85rem' : '0.7rem',
                background: 'rgba(255,255,255,0.07)',
                color: '#e8f8f9',
                border: '1px solid rgba(168,230,232,0.3)',
                borderRadius: '12px',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '600',
                letterSpacing: '0.05em', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '10px',
                marginBottom: isMobile ? '8px' : '12px',
                fontFamily: 'Georgia, serif',
              }}>
                <svg width="17" height="17" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
                </svg>
                Continue with Google
              </button>

              {/* Guest */}
              <button onClick={handleGuest} style={{
                width: '100%',
                padding: isDesktop ? '0.85rem' : '0.7rem',
                background: 'transparent',
                color: 'rgba(232,248,249,0.55)',
                border: '1px solid rgba(168,230,232,0.15)',
                borderRadius: '12px',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '600',
                letterSpacing: '0.05em', cursor: 'pointer',
                fontFamily: 'Georgia, serif',
              }}>
                Continue as Guest
              </button>
            </div>

            {/* Sign-in ↔ Sign-up toggle */}
            <p style={{
              textAlign: 'center',
              color: 'rgba(232,248,249,0.55)',
              fontSize: '0.85rem',
              margin: isMobile ? '12px 0 0' : '20px 0 0',
            }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp); setError('')
                  setName(''); setEmail(''); setPassword('')
                }}
                style={{
                  color: '#a8e6e8', fontWeight: '700', cursor: 'pointer',
                  background: 'none', border: 'none', fontSize: 'inherit',
                  fontFamily: 'inherit',
                }}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}
