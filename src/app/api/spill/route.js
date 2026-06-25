import { NextResponse } from 'next/server'

// ── Mock responses — warm, present, non-fixing ────────────────────────────────
// These match feelbetter's tone: lowercase-friendly, short, validating, no advice.
// Rotate based on text length so the same entry always gets the same reply
// (deterministic is nicer than random during testing).
const MOCK_RESPONSES = [
  "that sounds heavy. thank you for letting it out here.",
  "i hear you. whatever you're carrying right now — it's real, and it makes sense.",
  "you didn't have to hold all of that alone. i'm glad you wrote it down.",
  "that took something to say, even to a blank page. i see you.",
]

export async function POST(request) {
  try {
    const { text } = await request.json()

    // ════════════════════════════════════════════════════════════════════════
    // TODO: Swap the mock block below for a real Anthropic call when ready.
    //
    // Step 1 — install: npm install @anthropic-ai/sdk
    // Step 2 — add ANTHROPIC_API_KEY to .env.local
    // Step 3 — replace the mock block with:
    //
    // import Anthropic from '@anthropic-ai/sdk'
    // const client = new Anthropic()   // reads ANTHROPIC_API_KEY automatically
    //
    // const SYSTEM_PROMPT = `
    //   You are a warm, present companion inside feelbetter — a mental wellness app
    //   for young adults in India. You are NOT a therapist or chatbot.
    //
    //   Your only job: make the user feel seen and less alone.
    //
    //   Rules:
    //   • Mirror + validate first. Never fix, advise, or reframe unless invited.
    //   • Keep it short — 2 to 4 sentences max. Soft, lowercase-friendly.
    //   • No clinical language ("anxiety", "depression", "symptoms").
    //   • No toxic positivity ("at least…", "look on the bright side").
    //   • First sentence: acknowledge what they said.
    //     Second sentence: validate the feeling.
    //     Optional third: one small warm presence — not an instruction.
    //
    //   SAFETY — if the text contains self-harm, suicidal ideation, or crisis language:
    //   Respond with warmth first ("i hear you, and i'm really glad you said something").
    //   Then gently share these India crisis lines:
    //     iCall: 9152987821
    //     AASRA: 9820466726
    //   Never shame, never minimize, never panic in your tone.
    // `
    //
    // const message = await client.messages.create({
    //   model: 'claude-sonnet-4-6',
    //   max_tokens: 150,
    //   system: SYSTEM_PROMPT,
    //   messages: [{ role: 'user', content: text }],
    // })
    // return NextResponse.json({ response: message.content[0].text })
    // ════════════════════════════════════════════════════════════════════════

    // MOCK — rotate through warm replies based on text length
    const idx = (text?.length ?? 0) % MOCK_RESPONSES.length
    return NextResponse.json({ response: MOCK_RESPONSES[idx] })

  } catch {
    // Gentle fallback so the UI never shows a cold error state
    return NextResponse.json({
      response: "i'm here. whatever you wrote, i'm holding it gently.",
    })
  }
}
