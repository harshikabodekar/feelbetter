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

  
  const moods = ['😊 Happy', '😌 Calm', '😢 Sad', '😤 Frustrated', '😴 Tired', '😍 Grateful']

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-merriweather-sans), sans-serif',
      background: 'linear-gradient(180deg, #c5e9f0 0%, #d8f1f6 50%, #e8f8f9 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px',
    }}>
      {/* Content container */}
      <div
        style={{
          maxWidth: '700px',
          width: '100%',
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
        }}
      >
        {/* Greeting */}
        <h1
          style={{
            fontSize: '3rem',
            color: '#06527a',
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
            color: '#03214a',
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
