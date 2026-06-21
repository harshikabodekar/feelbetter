'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for sign-in / sign-out events (also handles OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, name) => {
    setError('')
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (err) { setError(err.message); return false }
    return true
  }

  const signIn = async (email, password) => {
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); return false }
    return true
  }

  const signOut = async () => {
    localStorage.removeItem('isGuest')
    localStorage.removeItem('guestName')
    await supabase.auth.signOut()
  }

  const signInWithGoogle = async () => {
    setError('')
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (err) setError(err.message)
  }

  const signInAsGuest = () => {
    localStorage.setItem('isGuest', 'true')
    localStorage.setItem('guestName', 'there')
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, signUp, signIn, signOut, signInWithGoogle, signInAsGuest }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
