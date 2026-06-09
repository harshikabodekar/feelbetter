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
  },
  {
    id: 'overwhelmed',
    emoji: '🌊',
    name: 'Overwhelmed',
    description: 'when everything is too much, all at once',
  },
  {
    id: 'okayish',
    emoji: '🌥️',
    name: 'Okay-ish',
    description: 'neither here nor there, just existing',
  },
  {
    id: 'heavy',
    emoji: '🌧️',
    name: 'Heavy',
    description: 'when your chest feels too full of something you cannot name',
  },
  {
    id: 'full',
    emoji: '🌸',
    name: 'Full',
    description: 'overflowing with something good',
  },
]

export default function Dashboard() {
  const [name, setName] = useState('Friend')
  const [selectedMood, setSelectedMood] = useState(null)
  const [hoveredMood, setHoveredMood] = useState(null)
  const [greeting, setGreeting] = useState('')
  const [theme, setTheme] = useState(themes.default)

  const greetingRef = useRef(null)
  const subtitleRef = useRef(null)
  const questionRef = useRef(null)
  const moodGridRef = useRef(null)
  const router = useRouter()

  // time-aware greeting
  useEffect(() => {
    const hour = new Date().getHours()
    const storedName = localStorage.getItem('userName') || 'Friend'
    setName(storedName)

    if (hour >= 5 && hour < 12) {
      setGreeting(`Good morning, ${storedName}.`)
    } else if (hour >= 12 && hour < 17) {
      setGreeting(`Hey ${storedName}. How's the middle of the day treating you?`)
    } else if (hour >= 17 && hour < 22) {
      setGreeting(`Good evening, ${storedName}.`)
    } else {
      setGreeting(`Hey. It's quiet out there. How are you doing?`)
    }
  }, [])

  // entrance animations
  useEffect(() => {
    if (!greeting) return
    const tl = gsap.timeline()

    tl.fromTo(greetingRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 1.4, ease: 'power2.out' }
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' },
      '-=0.8'
    )
    .fromTo(questionRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
      '-=0.6'
    )
    .fromTo(moodGridRef.current.children,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' },
      '-=0.4'
    )
  }, [greeting])

  // mood changes theme
  const handleMoodSelect = (mood) => {
    setSelectedMood(mood.id)
    setTheme(themes[mood.id].state1)
  }

  const handleContinue = () => {
    if (selectedMood) {
      localStorage.setItem('selectedMood', selectedMood)
      router.push('/activities')
    }
  }

  // current display theme — hovered mood previews, selected mood locks in
  const displayTheme = hoveredMood
    ? themes[hoveredMood].state1
    : theme

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      background: displayTheme.background,
      transition: 'background 1.2s ease',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px',
    }}>

      {/* soft glow center */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${displayTheme.cardBg} 0%, transparent 70%)`,
        transition: 'background 1.2s ease',
        pointerEvents: 'none',
      }} />

      {/* main content */}
      <div style={{
        maxWidth: '680px',
        width: '100%',
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
      }}>

        {/* greeting */}
        <h1 ref={greetingRef} style={{
          fontSize: '2.8rem',
          color: displayTheme.text,
          margin: '0 0 10px 0',
          fontWeight: '700',
          letterSpacing: '0.03em',
          opacity: 0,
          transition: 'color 1.2s ease',
          textShadow: '0 2px 20px rgba(0,0,0,0.15)',
        }}>
          {greeting}
        </h1>

        {/* subtitle */}
        <p ref={subtitleRef} style={{
          fontSize: '1rem',
          color: displayTheme.textMuted,
          margin: '0 0 48px 0',
          letterSpacing: '0.08em',
          opacity: 0,
          transition: 'color 1.2s ease',
        }}>
          how are you feeling right now?
        </p>

        {/* mood question */}
        <h2 ref={questionRef} style={{
          fontSize: '1.1rem',
          color: displayTheme.textMuted,
          margin: '0 0 28px 0',
          fontWeight: '400',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          opacity: 0,
          transition: 'color 1.2s ease',
        }}>
          pick what feels closest
        </h2>

        {/* mood cards */}
        <div ref={moodGridRef} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '14px',
          marginBottom: '32px',
        }}>
          {moods.map((mood) => {
            const isSelected = selectedMood === mood.id
            const isHovered = hoveredMood === mood.id
            const previewTheme = themes[mood.id].state1

            return (
              <div
                key={mood.id}
                onClick={() => handleMoodSelect(mood)}
                onMouseEnter={() => setHoveredMood(mood.id)}
                onMouseLeave={() => setHoveredMood(null)}
                style={{
                  padding: '22px 20px',
                  borderRadius: '18px',
                  cursor: 'pointer',
                  border: `1.5px solid ${isSelected ? displayTheme.primary : displayTheme.cardBorder}`,
                  background: isSelected
                    ? `${previewTheme.cardBg}`
                    : isHovered
                      ? `${previewTheme.cardBg}`
                      : displayTheme.cardBg,
                  backdropFilter: 'blur(12px)',
                  transition: 'all 0.4s ease',
                  transform: isSelected ? 'scale(1.03)' : isHovered ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isSelected
                    ? `0 8px 24px rgba(0,0,0,0.15)`
                    : isHovered
                      ? `0 4px 16px rgba(0,0,0,0.1)`
                      : 'none',
                  // Full mood gets its own column span
                  gridColumn: mood.id === 'full' ? 'span 2' : 'span 1',
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                  {mood.emoji}
                </div>
                <p style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: isSelected || isHovered ? previewTheme.text : displayTheme.text,
                  margin: '0 0 6px 0',
                  transition: 'color 0.4s ease',
                }}>
                  {mood.name}
                </p>
                <p style={{
                  fontSize: '0.8rem',
                  color: isSelected || isHovered ? previewTheme.textMuted : displayTheme.textMuted,
                  margin: '0',
                  fontStyle: 'italic',
                  lineHeight: '1.4',
                  transition: 'color 0.4s ease',
                }}>
                  {mood.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* continue button */}
        {selectedMood && (
          <button
            onClick={handleContinue}
            style={{
              padding: '14px 48px',
              fontSize: '1rem',
              fontWeight: '700',
              border: `1.5px solid ${displayTheme.primary}`,
              borderRadius: '30px',
              cursor: 'pointer',
              background: displayTheme.cardBg,
              backdropFilter: 'blur(12px)',
              color: displayTheme.text,
              letterSpacing: '0.1em',
              transition: 'all 0.3s ease',
              fontFamily: 'Georgia, serif',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 6px 20px rgba(0,0,0,0.15)`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            continue →
          </button>
        )}

      </div>
    </main>
  )
// }