import { NextResponse } from 'next/server'

// ── Gemini config (same model + endpoint pattern as /api/spill) ───────────────
// API key stays server-side in .env.local — never sent to the browser.
const GEMINI_MODEL    = 'gemini-2.5-flash'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

// ── The 5 feelbetter moods ────────────────────────────────────────────────────
// These are the only valid values. Gemini must return exactly one of these words.
const VALID_MOODS = new Set(['empty', 'overwhelmed', 'okayish', 'heavy', 'full'])

// ── ML fallback service ───────────────────────────────────────────────────────
// Optional: set ML_ENDPOINT in .env.local to enable a deployed Flask fallback.
// Unset in production (Vercel) — the ML fallback is simply skipped.
const ML_ENDPOINT = process.env.ML_ENDPOINT || null

// ── Gemini system instruction ─────────────────────────────────────────────────
// Short and strict: we only want one word back, nothing else.
const SYSTEM_INSTRUCTION =
  'You classify how someone feels into exactly one mood from: empty, overwhelmed, okayish, heavy, full. Reply with ONLY that one word, lowercase, nothing else.'


// ── tryGemini — attempt mood classification via Gemini ───────────────────────
// Returns the mood string if successful, or null if anything goes wrong.
async function tryGemini(text) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const requestBody = {
    system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: [{ role: 'user', parts: [{ text }] }],
    generationConfig: { maxOutputTokens: 500, temperature: 0.1 },
  }

  const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(requestBody),
  })

  if (!geminiRes.ok) return null

  const data = await geminiRes.json()
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!raw) return null

  const mood = raw.trim().toLowerCase()
  if (!VALID_MOODS.has(mood)) return null

  return mood
}


// ── tryMLFallback — call the deployed ML service ─────────────────────────────
// Returns { mood, confidence, source } if successful, or null on any failure.
// Hard timeout: 3 s — if the service doesn't respond, abort and fall through.
async function tryMLFallback(text) {
  const controller = new AbortController()
  const timeoutId  = setTimeout(() => controller.abort(), 3000)

  try {
    const mlRes = await fetch(ML_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ text }),
      signal:  controller.signal,
    })

    if (!mlRes.ok) return null

    const data = await mlRes.json()
    if (!data?.mood || !VALID_MOODS.has(data.mood)) return null

    return data
  } finally {
    clearTimeout(timeoutId)
  }
}


// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const geminiMood = await tryGemini(text).catch(() => null)
    if (geminiMood) {
      return NextResponse.json({ mood: geminiMood, source: 'gemini' })
    }

    const mlResult = ML_ENDPOINT
      ? await tryMLFallback(text).catch(() => null)
      : null

    if (mlResult) {
      return NextResponse.json({ mood: mlResult.mood, source: 'ml-fallback' })
    }

    return NextResponse.json(
      { error: 'could not detect mood — please try again' },
      { status: 503 }
    )

  } catch {
    return NextResponse.json(
      { error: 'something went wrong — please try again' },
      { status: 500 }
    )
  }
}
