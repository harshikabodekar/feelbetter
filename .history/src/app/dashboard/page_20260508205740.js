'use client'

import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [name, setName] = useState('')
  const [selectedMood, setSelectedMood] = useState(null)

  // Get name from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem('userName') || 'Friend'
    setName(storedName)
  }, [])

  // Animated waves on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const waves = [
      { amplitude: 28, frequency: 0.018, speed: 0.03, offset: 0, color: 'rgba(14,143,163,0.5)' },
      { amplitude: 20, frequency: 0.022, speed: 0.045, offset: 2, color: 'rgba(20,180,200,0.35)' },
      { amplitude: 14, frequency: 0.03, speed: 0.06, offset: 4, color: 'rgba(168,230,232,0.25)' },
    ]

    let frame = 0
    let animId

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      waves.forEach(wave => {
        ctx.beginPath()
        ctx.moveTo(0, canvas.height)

        for (let x = 0; x <= canvas.width; x += 2) {
          const y =
            canvas.height / 2 +
            Math.sin(x * wave.frequency + frame * wave.speed + wave.offset) * wave.amplitude +
            Math.sin(x * wave.frequency * 1.7 + frame * wave.speed * 0.8 + wave.offset) * (wave.amplitude * 0.4)

          ctx.lineTo(x, y)
        }

        ctx.lineTo(canvas.width, canvas.height)
        ctx.lineTo(0, canvas.height)
        ctx.closePath()

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, wave.color)
        gradient.addColorStop(1, 'rgba(168,230,232,0.05)')
        ctx.fillStyle = gradient
        ctx.fill()
      })

      frame++
      animId = requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      canvas.width = window.innerWidth
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const moods = ['😊 Happy', '😌 Calm', '😢 Sad', '😤 Frustrated', '😴 Tired', '😍 Grateful']

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-merriweather-sans), sans-serif',
      background: 'linear-gradient(180deg, #03214a 0%, #06527a 35%, #0e8fa3 65%, #a8e6e8 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px',
    }}>
      {/* Canvas for waves background */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      />

      {/* White centered content panel */}
      <div
        style={{
          background: 'white',
          borderRadius: '30px',
          padding: '60px 80px',
          maxWidth: '700px',
          width: '100%',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
        }}
      >
        {/* Greeting */}
        <h1
          style={{
            fontSize: '3rem',
            color: '#0e8fa3',
            margin: '0 0 10px 0',
            fontWeight: '700',
            letterSpacing: '0.05em',
          }}
        >
          Hey, {name}!
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            color: '#06527a',
            margin: '0 0 50px 0',
            fontWeight: '500',
            opacity: 0.8,
          }}
        >
          Welcome back to FeelBetter
        </p>

        {/* Mood question */}
        <h2
          style={{
            fontSize: '1.8rem',
            color: '#06527a',
            margin: '0 0 30px 0',
            fontWeight: '600',
            letterSpacing: '0.02em',
          }}
        >
          What is your mood right now?
        </h2>

        {/* Mood buttons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '15px',
            marginTop: '30px',
          }}
        >
          {moods.map(mood => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              style={{
                padding: '20px 25px',
                fontSize: '1rem',
                fontWeight: '600',
                border: '2px solid',
                borderColor: selectedMood === mood ? '#0e8fa3' : '#a8e6e8',
                borderRadius: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: selectedMood === mood ? 'rgba(14, 143, 163, 0.15)' : 'white',
                color: '#0e8fa3',
                boxShadow: selectedMood === mood ? '0 4px 12px rgba(14, 143, 163, 0.2)' : 'none',
              }}
              onMouseEnter={e => {
                e.target.style.borderColor = '#0e8fa3'
                e.target.style.background = 'rgba(14, 143, 163, 0.08)'
              }}
              onMouseLeave={e => {
                if (selectedMood !== mood) {
                  e.target.style.borderColor = '#a8e6e8'
                  e.target.style.background = 'white'
                }
              }}
            >
              {mood}
            </button>
          ))}
        </div>

        {/* Submit button */}
        {selectedMood && (
          <button
            style={{
              marginTop: '40px',
              padding: '15px 50px',
              fontSize: '1.1rem',
              fontWeight: '600',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #0e8fa3 0%, #06527a 100%)',
              color: 'white',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(14, 143, 163, 0.3)',
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 6px 20px rgba(14, 143, 163, 0.5)'
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 4px 15px rgba(14, 143, 163, 0.3)'
            }}
          >
            Continue
          </button>
        )}
      </div>
    </main>
  )
}
