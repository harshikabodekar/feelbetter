import { NextResponse } from 'next/server'

const GEMINI_MODEL    = 'gemini-2.5-flash'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const SOUL = `You are a warm, quiet companion inside feelbetter — a mental wellness app for
young adults in India. You are NOT a therapist, advisor, or coach.

Your voice:
- Warm and human, never clinical or formal.
- Lowercase-friendly. Write "i" instead of "I", "you're" not "You are".
- Short. Never more than 3–4 sentences.
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
  3. Keep it human and warm — never a cold disclaimer.`

const WHISPER_SYSTEM = `${SOUL}

MODE: WHISPER REFLECTION.
The user was shown a gentle reflective prompt and chose to write a private response —
something they're carrying, something quiet, something they haven't said out loud.

Your job:
- Read what they wrote with full presence and genuine care.
- Offer 2–3 sentences of warm, quiet acknowledgment. Nothing more.
- Make them feel genuinely seen — not analysed, not fixed, not advised.
- Mirror the emotional weight or lightness of what they shared.
- End with something that feels like a soft exhale, not a conclusion or call-to-action.
- Never ask follow-up questions.
- Never suggest what they should do next.
- Never over-interpret or project feelings they didn't express.`

const FALLBACK = "i read every word. whatever you're carrying right now doesn't have to make sense — it's real, and so are you."

export async function POST(request) {
  try {
    const { prompt, text } = await request.json()

    if (!text?.trim()) {
      return NextResponse.json({ response: FALLBACK })
    }

    // Include the prompt so Gemini understands what the user was responding to
    const userMessage = prompt
      ? `the reflective prompt i was given: "${prompt}"\n\nwhat i wrote in response: ${text}`
      : text

    const requestBody = {
      system_instruction: { parts: [{ text: WHISPER_SYSTEM }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.85,
      },
    }

    const geminiRes = await fetch(
      `${GEMINI_ENDPOINT}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    )

    if (!geminiRes.ok) {
      return NextResponse.json({ response: FALLBACK })
    }

    const data = await geminiRes.json()
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text

    return NextResponse.json({ response: aiText?.trim() || FALLBACK })

  } catch {
    return NextResponse.json({ response: FALLBACK })
  }
}
