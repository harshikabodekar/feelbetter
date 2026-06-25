import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Mood helpers ──────────────────────────────────────────────────────────────

/**
 * Write one mood check-in row to mood_entries.
 * Silently skips if userId is falsy (guest / anonymous mode).
 *
 * @param {string} userId  - user.id from Supabase auth
 * @param {string} mood    - "empty" | "overwhelmed" | "okayish" | "heavy" | "full"
 * @param {number} state   - 1 = first overlay screen, 2 = second screen
 */
export async function saveMood(userId, mood, state = 1) {
  if (!userId) return // guest or anonymous mode — skip silently

  const { error } = await supabase
    .from('mood_entries')
    .insert({ user_id: userId, mood, state })

  if (error) console.error('[feelbetter] saveMood:', error.message)
}

/**
 * Pull mood entries from the past 7 days for a user, ordered oldest → newest.
 * Returns an array of mood strings, e.g. ["heavy", "okayish", "full"].
 * Returns [] for guests or on error.
 *
 * @param {string} userId  - user.id from Supabase auth
 * @returns {Promise<string[]>}
 */
export async function fetchLast7Days(userId) {
  if (!userId) return []

  // "7 days ago" timestamp
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('mood_entries')
    .select('mood, created_at')
    .eq('user_id', userId)
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(7) // cap at 7 so the sidebar dots don't overflow

  if (error) {
    console.error('[feelbetter] fetchLast7Days:', error.message)
    return []
  }

  return (data || []).map(row => row.mood)
}
