import { NextResponse } from 'next/server'

// ── Gemini config (same model + endpoint pattern as /api/spill) ───────────────
// API key stays server-side in .env.local — never sent to the browser.
const GEMINI_MODEL    = 'gemini-2.5-flash'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

// ── The 5 feelbetter moods ────────────────────────────────────────────────────
// These are the only valid values. Gemini must return exactly one of these words.
const VALID_MOODS = new Set(['empty', 'overwhelmed', 'okayish', 'heavy', 'full'])

// ── ML fallback service ───────────────────────────────────────────────────────
// Local Flask server started separately. Expects POST { text }, returns { mood, confidence, source }.
const ML_ENDPOINT = 'http://localhost:5000/predict'

// ── Gemini system instruction ─────────────────────────────────────────────────
// Short and strict: we only want one word back, nothing else.
const SYSTEM_INSTRUCTION =
  'You classify how someone feels into exactly one mood from: empty, overwhelmed, okayish, heavy, full. Reply with ONLY that one word, lowercase, nothing else.'


// ── tryGemini — attempt mood classification via Gemini ───────────────────────
// Returns the mood string if successful, or null if anything goes wrong.
async function tryGemini(text) {
  const apiKey = process.env.GEMINI_API_KEY

  // If the key isn't set, skip Gemini entirely (don't waste time on a doomed call).
  if (!apiKey) {
    console.log('[detect-mood] GEMINI_API_KEY not set — skipping Gemini')
    return null
  }

  console.log('[detect-mood] trying Gemini for mood classification...')

  const requestBody = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text }],
      },
    ],
    generationConfig: {
      // We only need one word, but gemini-2.5-flash is a thinking model that
      // uses tokens internally — keep this high enough for thinking + output.
      maxOutputTokens: 500,
      temperature: 0.1, // very low: we want deterministic classification, not creativity
    },
  }

  const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(requestBody),
  })

  console.log('[detect-mood] Gemini HTTP status:', geminiRes.status, geminiRes.statusText)

  // Non-2xx (e.g. 429 quota, 400 bad request) — treat as failure, fall back to ML.
  if (!geminiRes.ok) {
    const errBody = await geminiRes.text()
    console.warn('[detect-mood] Gemini non-OK response:', errBody)
    return null
  }

  const data = await geminiRes.json()

  // Extract the raw text from Gemini's response envelope.
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text
  console.log('[detect-mood] Gemini raw reply:', JSON.stringify(raw))

  if (!raw) {
    console.warn('[detect-mood] Gemini returned empty text')
    return null
  }

  // Clean up the reply — trim whitespace and lowercase in case Gemini adds extras.
  const mood = raw.trim().toLowerCase()

  // Validate: must be exactly one of the 5 feelbetter moods.
  if (!VALID_MOODS.has(mood)) {
    console.warn(`[detect-mood] Gemini returned invalid mood: "${mood}" — falling back`)
    return null
  }

  console.log('[detect-mood] Gemini classified mood:', mood)
  return mood
}


// ── tryMLFallback — call the local Flask ML service ──────────────────────────
// Returns { mood, confidence, source } if successful, or null if it's unreachable.
async function tryMLFallback(text) {
  console.log('[detect-mood] trying ML fallback at', ML_ENDPOINT)

  const mlRes = await fetch(ML_ENDPOINT, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ text }),
  })

  console.log('[detect-mood] ML service HTTP status:', mlRes.status, mlRes.statusText)

  if (!mlRes.ok) {
    const errBody = await mlRes.text()
    console.warn('[detect-mood] ML service non-OK response:', errBody)
    return null
  }

  const data = await mlRes.json()
  console.log('[detect-mood] ML service response:', data)

  // Validate the ML service returned a recognised mood too.
  if (!data?.mood || !VALID_MOODS.has(data.mood)) {
    console.warn('[detect-mood] ML service returned invalid mood:', data?.mood)
    return null
  }

  return data
}


// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { text } = await request.json()
    console.log('[detect-mood] received text (length:', text?.length, ')')

    // Guard: need actual text to classify.
    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      )
    }

    // ── Step 1: try Gemini first ──────────────────────────────────────────────
    const geminiMood = await tryGemini(text).catch(err => {
      // Catch network errors, timeouts, etc. without crashing the whole handler.
      console.error('[detect-mood] Gemini threw unexpectedly:', err)
      return null
    })

    if (geminiMood) {
      console.log('[detect-mood] ✓ serving from GEMINI — mood:', geminiMood)
      return NextResponse.json({ mood: geminiMood, source: 'gemini' })
    }

    // ── Step 2: Gemini failed — try the local ML service ─────────────────────
    console.log('[detect-mood] Gemini unavailable — trying ML fallback...')

    const mlResult = await tryMLFallback(text).catch(err => {
      console.error('[detect-mood] ML fallback threw unexpectedly:', err)
      return null
    })

    if (mlResult) {
      console.log('[detect-mood] ✓ serving from ML-FALLBACK — mood:', mlResult.mood)
      return NextResponse.json({ mood: mlResult.mood, source: 'ml-fallback' })
    }

    // ── Step 3: both failed ───────────────────────────────────────────────────
    console.error('[detect-mood] both Gemini and ML fallback failed')
    return NextResponse.json(
      { error: 'could not detect mood — please try again' },
      { status: 503 }
    )

  } catch (err) {
    // Top-level catch: malformed JSON body, unexpected crashes, etc.
    console.error('[detect-mood] unhandled error:', err)
    return NextResponse.json(
      { error: 'something went wrong — please try again' },
      { status: 500 }
    )
  }
}
