
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

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (isSignUp && !name) {
      setError('Please enter your name')
      return
    }

    console.log(isSignUp ? 'Sign up' : 'Login', { name, email, password })
    // TODO: Add actual authentication logic
    router.push('/dashboard')
  }

  const handleGuestLogin = () => {
    router.push('/dashboard')
  }

  const handleGoogleAuth = () => {
    console.log('Google Auth clicked')
    // TODO: Implement Google OAuth
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "var(--font-merriweather-sans), sans-serif",
      background: 'linear-gradient(180deg, #03214a 0%, #06527a 35%, #0e8fa3 65%, #a8e6e8 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px',
    }}>
      {/* Animated blurred background shapes */}
      <div style={{
        position: 'absolute',
        width: '800px',
        height: '300px',
        background: 'rgba(168, 230, 232, 0.2)',
        borderRadius: '0',
        filter: 'blur(60px)',
        top: '-150px',
        left: '-200px',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '800px',
        background: 'rgba(14, 143, 163, 0.15)',
        borderRadius: '0',
        filter: 'blur(60px)',
        bottom: '-200px',
        right: '-150px',
        zIndex: 1,
      }} />

      {/* Large Horizontal Glass Rectangle with Two Columns */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        borderRadius: '30px',
        width: '100%',
        maxWidth: '900px',
        height: 'auto',
        minHeight: '550px',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)',
        zIndex: 10,
        position: 'relative',
        display: 'flex',
      }}>
        {/* Left Column - Login Form */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '50px 40px',
          borderRight: '1px solid rgba(168, 230, 232, 0.2)',
        }}>
          {/* Header */}
          <div style={{
            marginBottom: '2rem',
            textAlign: 'center',
            width: '100%',
          }}>
            <h1 style={{
              fontSize: '2.2rem',
              color: '#e8f8f9',
              marginBottom: '0.5rem',
              fontWeight: '700',
              letterSpacing: '0.05em',
              textShadow: '0 2px 10px rgba(14, 143, 163, 0.3)',
              margin: '0 0 0.5rem 0',
            }}>
              FeelBetter
            </h1>
            <p style={{
              color: 'rgba(232, 248, 249, 0.8)',
              fontSize: '0.9rem',
              margin: '0',
              letterSpacing: '0.1em',
            }}>
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            {isSignUp && (
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#e8f8f9',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  letterSpacing: '0.05em',
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    border: '1px solid rgba(168, 230, 232, 0.5)',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#e8f8f9',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                    e.target.style.borderColor = 'rgba(168, 230, 232, 0.8)'
                  }}
                  onBlur={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.borderColor = 'rgba(168, 230, 232, 0.5)'
                  }}
                  placeholder="John Doe"
                />
              </div>
            )}

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#e8f8f9',
                fontSize: '0.9rem',
                fontWeight: '500',
                letterSpacing: '0.05em',
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  border: '1px solid rgba(168, 230, 232, 0.5)',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#e8f8f9',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                  e.target.style.borderColor = 'rgba(168, 230, 232, 0.8)'
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.target.style.borderColor = 'rgba(168, 230, 232, 0.5)'
                }}
                placeholder="you@example.com"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#e8f8f9',
                fontSize: '0.9rem',
                fontWeight: '500',
                letterSpacing: '0.05em',
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  border: '1px solid rgba(168, 230, 232, 0.5)',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#e8f8f9',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                  e.target.style.borderColor = 'rgba(168, 230, 232, 0.8)'
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.target.style.borderColor = 'rgba(168, 230, 232, 0.5)'
                }}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div style={{
                color: '#ff6b6b',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                textAlign: 'center',
                padding: '0.75rem',
                background: 'rgba(255, 107, 107, 0.15)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 107, 107, 0.3)',
              }}>
                {error}
              </div>
            )}

            {/* Primary Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.9rem',
                background: 'linear-gradient(135deg, rgba(14, 143, 163, 0.8) 0%, rgba(6, 82, 122, 0.8) 100%)',
                color: '#e8f8f9',
                border: '1px solid rgba(168, 230, 232, 0.5)',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: '600',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(14, 143, 163, 0.3)',
                marginBottom: '1rem',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, rgba(14, 143, 163, 1) 0%, rgba(6, 82, 122, 1) 100%)'
                e.target.style.boxShadow = '0 6px 20px rgba(14, 143, 163, 0.5)'
                e.target.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, rgba(14, 143, 163, 0.8) 0%, rgba(6, 82, 122, 0.8) 100%)'
                e.target.style.boxShadow = '0 4px 15px rgba(14, 143, 163, 0.3)'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '1rem 0',
            gap: '10px',
            width: '100%',
          }}>
            <div style={{
              flex: 1,
              height: '1px',
              background: 'rgba(168, 230, 232, 0.3)',
            }} />
            <span style={{
              color: 'rgba(232, 248, 249, 0.6)',
              fontSize: '0.85rem',
              fontWeight: '500',
            }}>
              OR
            </span>
            <div style={{
              flex: 1,
              height: '1px',
              background: 'rgba(168, 230, 232, 0.3)',
            }} />
          </div>

          {/* Google Auth Button */}
          <button
            onClick={handleGoogleAuth}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#e8f8f9',
              border: '1px solid rgba(168, 230, 232, 0.5)',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: '600',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '1rem',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.15)'
              e.target.style.borderColor = 'rgba(168, 230, 232, 0.8)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)'
              e.target.style.borderColor = 'rgba(168, 230, 232, 0.5)'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🔐</span>
            Continue with Google
          </button>

          {/* Guest Button */}
          <button
            onClick={handleGuestLogin}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'rgba(232, 248, 249, 0.8)',
              border: '1px solid rgba(168, 230, 232, 0.3)',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: '600',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '1rem',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.12)'
              e.target.style.borderColor = 'rgba(168, 230, 232, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.08)'
              e.target.style.borderColor = 'rgba(168, 230, 232, 0.3)'
            }}
          >
            Continue as Guest
          </button>

          {/* Toggle Sign Up/Login */}
          <p style={{
            textAlign: 'center',
            color: 'rgba(232, 248, 249, 0.7)',
            fontSize: '0.9rem',
            margin: '0',
          }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setName('')
                setEmail('')
                setPassword('')
              }}
              style={{
                color: '#a8e6e8',
                textDecoration: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                fontSize: 'inherit',
                fontFamily: 'inherit',
                transition: 'color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#e8f8f9'
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#a8e6e8'
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Right Column - Text */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '50px 40px',
        }}>
          <p style={{
            fontSize: '2rem',
            color: '#e8f8f9',
            fontWeight: '700',
            lineHeight: '1.6',
            margin: '0',
            textShadow: '0 2px 20px rgba(14, 143, 163, 0.4)',
            letterSpacing: '0.02em',
            textAlign: 'center',
          }}>
            All of your feelings are valid and you are right and safe
          </p>
        </div>
      </div>
    </main>
  )
}
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#e8f8f9',
                fontSize: '0.9rem',
                fontWeight: '500',
                letterSpacing: '0.05em',
              }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  border: '1px solid rgba(168, 230, 232, 0.5)',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#e8f8f9',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                  e.target.style.borderColor = 'rgba(168, 230, 232, 0.8)'
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.target.style.borderColor = 'rgba(168, 230, 232, 0.5)'
                }}
                placeholder="John Doe"
              />
            </div>
          )}

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#e8f8f9',
              fontSize: '0.9rem',
              fontWeight: '500',
              letterSpacing: '0.05em',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem',
                border: '1px solid rgba(168, 230, 232, 0.5)',
                borderRadius: '10px',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#e8f8f9',
                transition: 'all 0.3s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                e.target.style.borderColor = 'rgba(168, 230, 232, 0.8)'
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                e.target.style.borderColor = 'rgba(168, 230, 232, 0.5)'
              }}
              placeholder="you@example.com"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#e8f8f9',
              fontSize: '0.9rem',
              fontWeight: '500',
              letterSpacing: '0.05em',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem',
                border: '1px solid rgba(168, 230, 232, 0.5)',
                borderRadius: '10px',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#e8f8f9',
                transition: 'all 0.3s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                e.target.style.borderColor = 'rgba(168, 230, 232, 0.8)'
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                e.target.style.borderColor = 'rgba(168, 230, 232, 0.5)'
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{
              color: '#ff6b6b',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              textAlign: 'center',
              padding: '0.75rem',
              background: 'rgba(255, 107, 107, 0.15)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 107, 107, 0.3)',
            }}>
              {error}
            </div>
          )}

          {/* Primary Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.9rem',
              background: 'linear-gradient(135deg, rgba(14, 143, 163, 0.8) 0%, rgba(6, 82, 122, 0.8) 100%)',
              color: '#e8f8f9',
              border: '1px solid rgba(168, 230, 232, 0.5)',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: '600',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(14, 143, 163, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, rgba(14, 143, 163, 1) 0%, rgba(6, 82, 122, 1) 100%)'
              e.target.style.boxShadow = '0 6px 20px rgba(14, 143, 163, 0.5)'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, rgba(14, 143, 163, 0.8) 0%, rgba(6, 82, 122, 0.8) 100%)'
              e.target.style.boxShadow = '0 4px 15px rgba(14, 143, 163, 0.3)'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '1.5rem 0',
          gap: '10px',
        }}>
          <div style={{
            flex: 1,
            height: '1px',
            background: 'rgba(168, 230, 232, 0.3)',
          }} />
          <span style={{
            color: 'rgba(232, 248, 249, 0.6)',
            fontSize: '0.85rem',
            fontWeight: '500',
          }}>
            OR
          </span>
          <div style={{
            flex: 1,
            height: '1px',
            background: 'rgba(168, 230, 232, 0.3)',
          }} />
        </div>

        {/* Google Auth Button */}
        <button
          onClick={handleGoogleAuth}
          style={{
            width: '100%',
            padding: '0.9rem',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#e8f8f9',
            border: '1px solid rgba(168, 230, 232, 0.5)',
            borderRadius: '10px',
            fontSize: '0.95rem',
            fontWeight: '600',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '1rem',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.15)'
            e.target.style.borderColor = 'rgba(168, 230, 232, 0.8)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)'
            e.target.style.borderColor = 'rgba(168, 230, 232, 0.5)'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>🔐</span>
          Continue with Google
        </button>

        {/* Guest Button */}
        <button
          onClick={handleGuestLogin}
          style={{
            width: '100%',
            padding: '0.9rem',
            background: 'rgba(255, 255, 255, 0.08)',
            color: 'rgba(232, 248, 249, 0.8)',
            border: '1px solid rgba(168, 230, 232, 0.3)',
            borderRadius: '10px',
            fontSize: '0.95rem',
            fontWeight: '600',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.12)'
            e.target.style.borderColor = 'rgba(168, 230, 232, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.08)'
            e.target.style.borderColor = 'rgba(168, 230, 232, 0.3)'
          }}
        >
          Continue as Guest
        </button>

        {/* Toggle Sign Up/Login */}
        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          color: 'rgba(232, 248, 249, 0.7)',
          fontSize: '0.9rem',
          margin: '1.5rem 0 0 0',
        }}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
              setName('')
              setEmail('')
              setPassword('')
            }}
            style={{
              color: '#a8e6e8',
              textDecoration: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#e8f8f9'
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#a8e6e8'
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </main>
  )
}
