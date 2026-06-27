import { NextResponse } from 'next/server'

// ── Gemini model + endpoint ────────────────────────────────────────────────────
// We use the free gemini-1.5-flash model via the REST API (no npm package needed).
// The key is read server-side from .env.local — never exposed to the browser.
const GEMINI_MODEL   = 'gemini-2.5-flash'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

// ── feelbetter soul — shared across all system prompts ────────────────────────
// This preamble is prepended to every mode-specific instruction so the core
// voice stays consistent no matter which mode the user picked.
const SOUL = `
You are a warm, quiet companion inside feelbetter — a mental wellness app for
young adults in India. You are NOT a therapist, advisor, or coach.

Your voice:
- Warm and human, never clinical or formal.
- Lowercase-friendly. You can write "i" instead of "I", "you're" not "You are".
- Short. Never more than 3–4 sentences (mode may tighten this further).
- Zero toxic positivity. Never say "everything happens for a reason",
  "look on the bright side", or imply they should feel differently.
- No therapy jargon. No diagnosing or labelling their emotions.
- If their writing is messy or fragmented — that's fine. Meet them where they are.

SAFETY — this is critical:
If the user's text contains any hint of self-harm, suicidal thoughts, wanting
to hurt themselves or others, or sounds like a genuine crisis:
  1. First acknowledge their pain with warmth — do NOT launch straight into resources.
  2. Then gently, caringly share that they don't have to face this alone, and
     invite them to reach out to iCall (9152987821) or AASRA (9820466726).
  3. Keep it human and warm — never a cold disclaimer.
`

// ── Mode-specific system prompts ──────────────────────────────────────────────
// Each builds on SOUL above and sharpens the behaviour for that mode.
const SYSTEM_PROMPTS = {

  // "just validate me" — pure mirroring, zero advice, zero analysis
  validate: `${SOUL}
MODE: VALIDATE ONLY.
Your one job is to make them feel seen and less alone. That's it.
  - Mirror their feelings back in your own words. Don't just echo — let them
    feel you actually read what they wrote.
  - Zero advice. Zero fixing. Zero reframing. Zero implying anything needs to change.
  - Zero questions. Just presence and recognition.
  - 2–3 sentences max.
`,

  // "be honest with me" — gently truthful, still warm, one soft observation
  honest: `${SOUL}
MODE: GENTLY HONEST.
  - First sentence: acknowledge and validate what they're feeling (don't skip this).
  - Then offer ONE honest, caring observation — not advice. Something like:
    "it sounds like part of you already knows...", or "there's something here
    that seems like it's been there a while..."
  - Still warm. Never blunt, never clinical, never preachy.
  - 2–4 sentences total.
`,

  // "guide me through it" — soft optional nudge, never prescriptive
  guide: `${SOUL}
MODE: GUIDE SOFTLY.
  - First sentence: acknowledge the feeling. Don't skip straight to the nudge.
  - Then offer ONE soft, optional micro-question or gentle next step.
  - Always frame it as optional: "if you wanted to…", "when you're ready…",
    "you don't have to, but…"
  - Never prescribe steps. Never assume you know what they should do.
  - 2–3 sentences total.
`,

  // "just sit with me" — minimal words, pure presence
  sit: `${SOUL}
MODE: JUST SIT.
  - Respond with presence only. Minimal words. Maximum warmth.
  - 1–2 sentences absolute max.
  - No analysis. No questions. No nudges. No advice.
  - Pure companioning. Examples: "i'm here.", "you're not alone in this.",
    "i hear you.", "that's real. i'm right here."
  - Exception: if there's a safety concern (see SAFETY above), it's okay to
    expand very slightly to acknowledge their pain + share the crisis lines.
`,
}

// Warm fallback shown if the API call fails for any reason.
// The UI should never show a cold error to the user.
const FALLBACK = "i'm here. whatever you wrote, i'm holding it gently."

export async function POST(request) {
  try {
    // ── DEBUG 1: confirm the API key is loaded from .env.local ──────────────
    console.log('[spill] GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY)

    // Read the user's spilled text and chosen sub-mode from the request body.
    // `mode` will be one of: "validate" | "honest" | "guide" | "sit"
    const { text, mode } = await request.json()
    console.log('[spill] received → mode:', mode, '| text length:', text?.length)

    // Guard: if either value is missing, return the fallback gracefully.
    if (!text || !mode) {
      console.log('[spill] missing text or mode — returning fallback')
      return NextResponse.json({ response: FALLBACK })
    }

    // Pick the system prompt for this mode (default to "validate" if unknown).
    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.validate

    // ── Build the request body once so we can log it ────────────────────────
    const requestBody = {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.88,
      },
    }

    // ── DEBUG 2: show the URL (key redacted) + body shape before the call ───
    const url = `${GEMINI_ENDPOINT}?key=${process.env.GEMINI_API_KEY}`
    console.log('[spill] calling Gemini →', GEMINI_ENDPOINT)
    console.log('[spill] request body (system prompt omitted for brevity):', JSON.stringify({
      ...requestBody,
      system_instruction: { parts: [{ text: '(see SYSTEM_PROMPTS)' }] },
    }))

    // ── Call Gemini REST API ───────────────────────────────────────────────
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    // ── DEBUG 3: HTTP status from Gemini ────────────────────────────────────
    console.log('[spill] Gemini HTTP status:', geminiRes.status, geminiRes.statusText)

    // ── Parse the Gemini response ──────────────────────────────────────────
    // The response shape is:
    //   { candidates: [{ content: { parts: [{ text: "..." }] } }] }
    const data = await geminiRes.json()

    // ── DEBUG 4: full raw response from Gemini ───────────────────────────────
    console.log('[spill] Gemini raw response:', JSON.stringify(data, null, 2))

    // Extract the text from the first candidate's first part.
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text
    console.log('[spill] extracted aiText:', aiText)

    // If Gemini returned something, send it. Otherwise use the fallback.
    if (aiText && aiText.trim()) {
      return NextResponse.json({ response: aiText.trim() })
    }

    // Gemini returned an empty or unexpected shape — use fallback.
    console.log('[spill] aiText was empty — returning fallback')
    return NextResponse.json({ response: FALLBACK })

  } catch (err) {
    // ── DEBUG 5: log the actual error before returning the fallback ──────────
    console.error('[spill] caught error:', err)
    return NextResponse.json({ response: FALLBACK })
  }
}
