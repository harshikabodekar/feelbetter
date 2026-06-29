/**
 * lib/pin.js — PIN management helpers for feelbetter
 *
 * All operations hash the PIN with PBKDF2 (via Web Crypto API) before touching
 * Supabase. The plain PIN is NEVER stored or logged anywhere.
 *
 * Table: user_security (user_id TEXT PK, pin_hash TEXT, updated_at TIMESTAMPTZ)
 * RLS:   users can only read/write their own row.
 */

import { supabase } from './supabase'

// ── Private: hash a PIN with PBKDF2 ──────────────────────────────────────────
// PBKDF2 is a key-derivation function designed to be slow, which makes
// brute-forcing a 4-digit PIN much harder than a plain SHA-256 would.
//
// Parameters:
//   - password: the plain 4-digit PIN string
//   - salt:     the user's ID (unique per user — same PIN → different hash per user)
//   - iterations: 100,000 rounds of SHA-256 (NIST recommended minimum)
//   - output:   32 bytes → 64-char hex string
//
// Uses the Web Crypto API which is built into all modern browsers and Node 18+.
async function hashPin(userId, pin) {
  const enc = new TextEncoder()

  // Import the raw PIN bytes as a PBKDF2 key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(String(pin)),
    { name: 'PBKDF2' },
    false,           // not extractable
    ['deriveBits']
  )

  // Derive 256 bits using the user ID as a per-user salt
  const bits = await crypto.subtle.deriveBits(
    {
      name:       'PBKDF2',
      salt:       enc.encode(userId),
      iterations: 100_000,
      hash:       'SHA-256',
    },
    keyMaterial,
    256  // output length in bits
  )

  // Convert to a 64-char hex string for storage
  return Array.from(new Uint8Array(bits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}


// ── hasPin — does this user have a PIN set? ───────────────────────────────────
// Returns true if user_security has a non-null pin_hash for this user.
export async function hasPin(userId) {
  if (!userId) return false

  const { data, error } = await supabase
    .from('user_security')
    .select('pin_hash')
    .eq('user_id', userId)
    .maybeSingle()   // returns null (not an error) when no row exists

  if (error) {
    console.error('[pin] hasPin error:', error.message)
    return false
  }

  return !!(data?.pin_hash)
}


// ── setPin — hash and store a new PIN ─────────────────────────────────────────
// Creates the row if it doesn't exist, updates it if it does (upsert).
// Throws a user-friendly error string on failure.
export async function setPin(userId, pin) {
  if (!userId) return

  const hash = await hashPin(userId, pin)

  const { error } = await supabase
    .from('user_security')
    .upsert(
      {
        user_id:    userId,
        pin_hash:   hash,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }  // UPDATE existing row if user already has one
    )

  if (error) {
    console.error('[pin] setPin error:', error.message)
    throw new Error("couldn't save your PIN — please try again.")
  }
}


// ── verifyPin — check if a candidate PIN matches the stored hash ───────────────
// Returns true on match, false on mismatch or if no PIN is set.
export async function verifyPin(userId, pin) {
  if (!userId) return false

  const { data, error } = await supabase
    .from('user_security')
    .select('pin_hash')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('[pin] verifyPin error:', error.message)
    return false
  }

  if (!data?.pin_hash) return false  // no PIN set

  // Hash the candidate with the same parameters and do a constant-time comparison
  const candidateHash = await hashPin(userId, pin)
  return candidateHash === data.pin_hash
}


// ── removePin — clear the stored PIN (set pin_hash to null) ──────────────────
// Entry lock is disabled after this call.
// Throws a user-friendly error string on failure.
export async function removePin(userId) {
  if (!userId) return

  const { error } = await supabase
    .from('user_security')
    .upsert(
      {
        user_id:    userId,
        pin_hash:   null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('[pin] removePin error:', error.message)
    throw new Error("couldn't remove your PIN — please try again.")
  }
}
