'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields'); return }
    if (isSignUp && !name) { setError('Please enter your name'); return }
    
    // Save user info to localStorage
    if (isSignUp && name) {
      localStorage.setItem('userName', name)
    }
    
    router.push('/dashboard')
  }

  const inputStyle = {
    width: '100%',
    padding: 'clamp(0.75rem, 3vw, 0.9rem) clamp(0.75rem, 3vw, 1rem)',
    border: '1px solid rgba(168, 230, 232, 0.4)',
    borderRadius: 'clamp(8px, 2vw, 12px)',
    fontSize: 'clamp(0.875rem, 3vw, 1rem)',
    boxSizing: 'border-box',
    fontFamily: 'Georgia, serif',
    background: 'rgba(255, 255, 255, 0.07)',
    color: '#e8f8f9',
    outline: 'none',
    letterSpacing: '0.03em',
  }

  const labelStyle = {
    display: 'block',
    marginBottom: 'clamp(0.35rem, 2vw, 0.5rem)',
    color: 'rgba(232, 248, 249, 0.7)',
    fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
    fontWeight: '600',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      background: 'linear-gradient(180deg, #03214a 0%, #06527a 35%, #0e8fa3 65%, #a8e6e8 100%)',
      position: 'relative',
      overflow: 'auto',
      padding: 'clamp(20px, 5vw, 40px)',
    }}>

      {/* background glow blobs */}
      <div style={{
        position: 'absolute', width: 'clamp(300px, 50vw, 600px)', height: 'clamp(300px, 50vw, 600px)',
        background: 'radial-gradient(circle, rgba(14,143,163,0.18) 0%, transparent 70%)',
        borderRadius: '50%', top: '-10%', left: '-10%', filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute', width: 'clamp(200px, 40vw, 400px)', height: 'clamp(200px, 40vw, 400px)',
        background: 'radial-gradient(circle, rgba(168,230,232,0.12) 0%, transparent 70%)',
        borderRadius: '50%', bottom: '-10%', right: '-10%', filter: 'blur(40px)',
      }} />

      {/* floating decorative words — left side ambience */}
      {['breathe.', 'feel.', 'heal.', 'you are enough.', 'rest here.'].map((word, i) => (
        <p key={i} style={{
          position: 'absolute',
          left: `${4 + i * 2}%`,
          top: `${12 + i * 16}%`,
          color: 'rgba(168,230,232,0.12)',
          fontSize: i % 2 === 0 ? 'clamp(1.5rem, 5vw, 2.8rem)' : 'clamp(1rem, 4vw, 1.6rem)',
          fontWeight: '700',
          margin: 0,
          letterSpacing: '0.1em',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          transform: `rotate(${i % 2 === 0 ? -6 : 4}deg)`,
          display: typeof window !== 'undefined' && window.innerWidth < 768 ? 'none' : 'block',
        }}>{word}</p>
      ))}

      {/* main glass card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: 'clamp(16px, 5vw, 32px)',
        width: '100%',
        maxWidth: '90vw',
        minHeight: 'auto',
        boxShadow: '0 8px 48px rgba(3, 33, 74, 0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: typeof window !== 'undefined' && window.innerWidth < 768 ? 'column' : 'row',
        overflow: 'hidden',
      }}>

        {/* LEFT — brand side */}
        <div style={{
          flex: typeof window !== 'undefined' && window.innerWidth < 768 ? '1' : '1.1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(30px, 8vw, 60px) clamp(25px, 7vw, 50px)',
          borderRight: typeof window !== 'undefined' && window.innerWidth < 768 ? 'none' : '1px solid rgba(168, 230, 232, 0.15)',
          borderBottom: typeof window !== 'undefined' && window.innerWidth < 768 ? '1px solid rgba(168, 230, 232, 0.15)' : 'none',
          position: 'relative',
        }}>

          {/* logo */}
          <div style={{ marginBottom: 'clamp(24px, 5vw, 40px)', textAlign: 'left' }}>
            <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: 'clamp(8px, 2vw, 12px)', letterSpacing: '0.3em' }}>
              𓆝 𓆟 𓆞 𓆝 𓆟
            </div>
            <h2 style={{
              color: '#e8f8f9', fontSize: 'clamp(1.75rem, 6vw, 3rem)', fontWeight: '700',
              margin: 0, letterSpacing: '0.1em',
            }}>feelbetter</h2>
          </div>

          {/* big quote */}
          <h1 style={{
            fontSize: 'clamp(1.5rem, 6vw, 2.93rem)',
            color: '#e8f8f9',
            fontWeight: '700',
            lineHeight: '1.35',
            margin: '0 0 clamp(16px, 3vw, 24px) 0',
            letterSpacing: '0.02em',
            textShadow: '0 2px 30px rgba(14,143,163,0.5)',
          }}>
            All of your<br />
            feelings are<br />
            <span style={{ color: '#a8e6e8' }}>valid.</span>
          </h1>

          <p style={{
            color: 'rgba(232,248,249,0.65)',
            fontSize: 'clamp(1rem, 4vw, 1.75rem)',
            lineHeight: '1.7',
            margin: '0 0 clamp(24px, 5vw, 40px) 0',
            letterSpacing: '0.02em',
          }}>
            A safe space where you can breathe,<br />
            vent, and simply feel without judgment.
          </p>

          {/* decorative wave lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 2vw, 8px)' }}>
            {[100, 70, 85].map((w, i) => (
              <div key={i} style={{
                height: '2px', width: `${w}px`,
                background: `rgba(168,230,232,${0.5 - i * 0.12})`,
                borderRadius: '2px',
              }} />
            ))}
          </div>

          {/* bottom tag */}
          <p style={{
            position: 'absolute', bottom: 'clamp(20px, 5vw, 32px)', left: 'clamp(25px, 7vw, 50px)',
            color: 'darkcyan',
            fontSize: 'clamp(1rem, 3vw, 1.25rem)', letterSpacing: '0.2em',
            textTransform: 'uppercase', margin: 0,
          }}>
            breathe · feel · heal
          </p>
        </div>

        {/* RIGHT — form side */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(30px, 8vw, 60px) clamp(25px, 7vw, 50px)',
        }}>

          <h2 style={{
            color: '#e8f8f9',
            fontSize: 'clamp(1.25rem, 5vw, 1.8rem)',
            fontWeight: '700',
            margin: '0 0 clamp(6px, 2vw, 6px) 0',
            letterSpacing: '0.04em',
          }}>
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h2>
          <p style={{
            color: 'rgba(232,248,249,0.55)',
            fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
            margin: '0 0 clamp(24px, 5vw, 32px) 0',
            letterSpacing: '0.03em',
          }}>
            {isSignUp ? 'Start your journey today.' : 'We\'ve kept your space warm.'}
          </p>

          {/* form */}
          <div style={{ width: '100%' }}>
            {isSignUp && (
              <div style={{ marginBottom: 'clamp(1rem, 3vw, 1.2rem)' }}>
                <label style={labelStyle}>Full Name</label>
                <input type="text" value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle} placeholder="Your name"
                  onFocus={(e) => e.target.style.borderColor = 'rgba(168,230,232,0.8)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(168,230,232,0.4)'}
                />
              </div>
            )}

            <div style={{ marginBottom: 'clamp(1rem, 3vw, 1.2rem)' }}>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle} placeholder="you@example.com"
                onFocus={(e) => e.target.style.borderColor = 'rgba(168,230,232,0.8)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(168,230,232,0.4)'}
              />
            </div>

            <div style={{ marginBottom: 'clamp(1.4rem, 4vw, 1.8rem)' }}>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle} placeholder="••••••••"
                onFocus={(e) => e.target.style.borderColor = 'rgba(168,230,232,0.8)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(168,230,232,0.4)'}
              />
            </div>

            {error && (
              <div style={{
                color: '#ff8a8a', marginBottom: 'clamp(0.75rem, 2vw, 1rem)', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                textAlign: 'center', padding: 'clamp(0.6rem, 2vw, 0.75rem)',
                background: 'rgba(255,107,107,0.1)', borderRadius: 'clamp(8px, 2vw, 10px)',
                border: '1px solid rgba(255,107,107,0.25)',
              }}>{error}</div>
            )}

            {/* sign in button */}
            <button onClick={handleSubmit} style={{
              width: '100%', padding: 'clamp(0.8rem, 3vw, 1rem)',
              background: 'linear-gradient(135deg, #0e8fa3 0%, #06527a 100%)',
              color: '#e8f8f9', border: '1px solid rgba(168,230,232,0.4)',
              borderRadius: 'clamp(8px, 2vw, 12px)', fontSize: 'clamp(0.9rem, 3vw, 1rem)', fontWeight: '700',
              letterSpacing: '0.08em', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(14,143,163,0.35)',
              marginBottom: 'clamp(12px, 3vw, 14px)', fontFamily: 'Georgia, serif',
            }}>
              {isSignUp ? 'Create Account' : 'Sign In'} →
            </button>

            {/* divider */}
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: 'clamp(8px, 2vw, 12px)', margin: 'clamp(4px, 2vw, 6px) 0 clamp(12px, 3vw, 14px)',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(168,230,232,0.2)' }} />
              <span style={{ color: 'rgba(232,248,249,0.4)', fontSize: 'clamp(0.7rem, 2vw, 0.8rem)', letterSpacing: '0.1em' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(168,230,232,0.2)' }} />
            </div>

            {/* google */}
            <button style={{
              width: '100%', padding: 'clamp(0.75rem, 3vw, 0.9rem)',
              background: 'rgba(255,255,255,0.07)',
              color: '#e8f8f9', border: '1px solid rgba(168,230,232,0.3)',
              borderRadius: 'clamp(8px, 2vw, 12px)', fontSize: 'clamp(0.85rem, 3vw, 1rem)', fontWeight: '600',
              letterSpacing: '0.05em', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 'clamp(8px, 2vw, 10px)', marginBottom: 'clamp(10px, 2vw, 12px)', fontFamily: 'Georgia, serif',
            }}>
              <svg width="clamp(14px, 3vw, 18px)" height="clamp(14px, 3vw, 18px)" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
              </svg>
              <span style={{ display: 'inline' }}>Continue with Google</span>
            </button>

            {/* guest */}
            <button onClick={() => {
              localStorage.setItem('userName', 'Guest')
              router.push('/dashboard')
            }} style={{
              width: '100%', padding: 'clamp(0.75rem, 3vw, 0.9rem)',
              background: 'transparent',
              color: 'rgba(232,248,249,0.55)',
              border: '1px solid rgba(168,230,232,0.15)',
              borderRadius: 'clamp(8px, 2vw, 12px)', fontSize: 'clamp(0.85rem, 3vw, 1rem)', fontWeight: '600',
              letterSpacing: '0.05em', cursor: 'pointer',
              fontFamily: 'Georgia, serif',
            }}>
              Continue as Guest
            </button>
          </div>

          {/* toggle */}
          <p style={{
            textAlign: 'center', color: 'rgba(232,248,249,0.55)',
            fontSize: 'clamp(0.85rem, 2vw, 1rem)', margin: 'clamp(16px, 4vw, 20px) 0 0',
          }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setName(''); setEmail(''); setPassword('') }}
              style={{
                color: '#a8e6e8', fontWeight: '700', cursor: 'pointer',
                background: 'none', border: 'none', fontSize: 'inherit',
                fontFamily: 'inherit',
              }}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </main>
  )
}