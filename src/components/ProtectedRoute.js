'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isGuest, setIsGuest] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const guest = localStorage.getItem('isGuest') === 'true'
    setIsGuest(guest)
    setChecked(true)
  }, [])

  useEffect(() => {
    if (!loading && checked && !user && !isGuest) {
      router.replace('/login')
    }
  }, [user, loading, isGuest, checked, router])

  // Still checking auth or localStorage
  if (loading || !checked) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #a8d8e0 0%, #caeef5 75%, #ddf5f9 100%)',
        fontFamily: 'Georgia, serif',
        color: '#2a5a66',
        fontSize: '1.1rem',
        letterSpacing: '0.1em',
      }}>
        loading your space...
      </div>
    )
  }

  if (!user && !isGuest) return null

  return children
}
