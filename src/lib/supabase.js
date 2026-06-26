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

/**
 * Save a journal entry (spill, pages, canvas, etc.) to journal_entries.
 * Silently skips for guests (userId falsy).
 *
 * @param {string} userId
 * @param {{ activity: string, content: string, mood?: string }} entry
 */
export async function saveJournalEntry(userId, { activity, content, mood = null }) {
  if (!userId) return

  const { error } = await supabase
    .from('journal_entries')
    .insert({ user_id: userId, activity, content, mood })

  if (error) console.error('[feelbetter] saveJournalEntry:', error.message)
}

/**
 * Upload a voice note blob to Supabase Storage and record it in voice_notes.
 * Silently skips for guests (userId falsy).
 *
 * Storage path: voice-notes/{userId}/{timestamp}.{ext}
 * The bucket "voice-notes" must exist in Supabase Dashboard > Storage.
 *
 * @param {string} userId
 * @param {Blob}   blob   - audio blob from MediaRecorder
 * @param {string} [mood] - optional mood tag
 * @returns {Promise<string|null>} the storage path, or null on failure/guest
 */
export async function uploadVoiceNote(userId, blob, mood = null) {
  if (!userId) return null

  const ext  = blob.type.includes('mp4') ? 'mp4' : 'webm'
  const path = `${userId}/${Date.now()}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('voice-notes')
    .upload(path, blob, { contentType: blob.type })

  if (uploadErr) {
    console.error('[feelbetter] uploadVoiceNote storage:', uploadErr.message)
    return null
  }

  const { error: dbErr } = await supabase
    .from('voice_notes')
    .insert({ user_id: userId, file_path: path, mood })

  if (dbErr) console.error('[feelbetter] uploadVoiceNote db:', dbErr.message)

  return path
}

// ── Read helpers ──────────────────────────────────────────────────────────────

/**
 * Fetch journal entries for a user, newest first.
 * Optionally filter by a specific activity (e.g. "pages-write").
 *
 * @param {string} userId
 * @param {{ activity?: string }} [opts]
 * @returns {Promise<Array>}
 */
export async function fetchJournalEntries(userId, { activity } = {}) {
  if (!userId) return []

  let query = supabase
    .from('journal_entries')
    .select('id, activity, content, mood, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (activity) query = query.eq('activity', activity)

  const { data, error } = await query
  if (error) {
    console.error('[feelbetter] fetchJournalEntries:', error.message)
    return []
  }
  return data || []
}

/**
 * Fetch voice notes for a user, newest first.
 *
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function fetchVoiceNotes(userId) {
  if (!userId) return []

  const { data, error } = await supabase
    .from('voice_notes')
    .select('id, file_path, mood, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[feelbetter] fetchVoiceNotes:', error.message)
    return []
  }
  return data || []
}

/**
 * Generate a signed (temporary) URL for a private voice note file.
 * The URL expires after `expiresIn` seconds (default 1 hour).
 *
 * @param {string} filePath  - the path stored in voice_notes.file_path
 * @param {number} [expiresIn=3600]
 * @returns {Promise<string|null>}
 */
export async function getSignedUrl(filePath, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from('voice-notes')
    .createSignedUrl(filePath, expiresIn)

  if (error) {
    console.error('[feelbetter] getSignedUrl:', error.message)
    return null
  }
  return data?.signedUrl || null
}
