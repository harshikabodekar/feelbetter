import { NextResponse } from 'next/server'

// ── Mock responses per AI sub-mode ────────────────────────────────────────────
// Each mode has a distinct personality that matches its label.
// Rotate deterministically by text length so the same entry always gets
// the same reply — easier to test than random.
const MOCK_RESPONSES = {
  // "just validate me" — pure mirroring, zero advice, zero analysis
  validate: [
    "that sounds heavy. thank you for letting it out here.",
    "i hear you. whatever you're carrying right now — it's real, and it makes sense.",
    "you didn't have to hold all of that alone. i'm glad you wrote it down.",
    "that took something to say, even to a blank page. i see you.",
  ],

  // "be honest with me" — warm but gently truthful, still no advice
  honest: [
    "that's a lot to be sitting with. it sounds like part of you already knows something needs space.",
    "i hear you — and honestly? it makes complete sense that you feel this way. what you're describing is hard.",
    "you're carrying something real here. and i think you've known it for a while.",
    "that's honest, and honest is brave. there's something underneath this that deserves to be felt.",
  ],

  // "guide me through it" — soft optional nudges, never pushy
  guide: [
    "okay. one breath first. then — what's the one thing that feels most tangled right now?",
    "that's a lot. let's just start here: which part of it feels heaviest today?",
    "you got it out. that's step one. if you wanted to — what would a tiny next step look like?",
    "i'm with you. when you're ready — not now, just whenever — what would feel like a little relief?",
  ],

  // "just sit with me" — minimal words, mostly presence
  sit: [
    "i'm here.",
    "you're not alone in this.",
    "i hear you.",
    "that's real. i'm right here with you.",
  ],
}

// Fallback if mode is unrecognised (shouldn't happen, but safe default)
const FALLBACK_RESPONSES = MOCK_RESPONSES.validate

export async function POST(request) {
  try {
    const { text, mode } = await request.json()

    // ════════════════════════════════════════════════════════════════════════
    // TODO: Swap the mock block below for real Anthropic API calls when ready.
    //
    // Step 1 — install: npm install @anthropic-ai/sdk
    // Step 2 — add ANTHROPIC_API_KEY to .env.local
    // Step 3 — uncomment and use the system prompts below, then call the API:
    //
    // import Anthropic from '@anthropic-ai/sdk'
    // const client = new Anthropic()
    //
    // const SYSTEM_PROMPTS = {
    //   validate: `
    //     You are a warm, present companion inside feelbetter — a mental wellness app
    //     for young adults in India. You are NOT a therapist or advisor.
    //
    //     Mode: VALIDATE ONLY.
    //     Your only job: make the user feel seen and less alone.
    //     — Mirror their feelings back without adding interpretation.
    //     — Never suggest, advise, reframe, or imply anything needs to change.
    //     — 2–3 sentences max. Soft, lowercase-friendly tone.
    //     — No clinical language. No toxic positivity.
    //
    //     SAFETY: if the text contains self-harm or crisis language, respond with warmth
    //     first, then gently share: iCall 9152987821, AASRA 9820466726.
    //   `,
    //   honest: `
    //     You are a warm companion inside feelbetter.
    //     Mode: GENTLY HONEST.
    //     — Acknowledge and validate first. Then offer one honest, caring observation.
    //     — Not advice — an observation. Something like "it sounds like part of you knows..."
    //     — Still warm. Still human. Never blunt or clinical. 2–4 sentences.
    //     SAFETY: same crisis line guidance as above.
    //   `,
    //   guide: `
    //     You are a warm companion inside feelbetter.
    //     Mode: GUIDE SOFTLY.
    //     — Acknowledge the feeling first (1 sentence).
    //     — Then offer ONE soft, optional micro-question or nudge.
    //       Frame it as optional: "if you wanted to…", "when you're ready…"
    //     — Never prescribe steps. Never assume what they should do. 2–3 sentences.
    //     SAFETY: same crisis line guidance.
    //   `,
    //   sit: `
    //     You are a warm companion inside feelbetter.
    //     Mode: JUST SIT.
    //     — Respond with presence only. 1–2 sentences max.
    //     — Minimal words. Maximum warmth. No analysis, no questions, no nudges.
    //     — Examples: "i'm here." / "you're not alone in this." / "i hear you."
    //     SAFETY: if the text contains self-harm or crisis language, expand slightly:
    //     warm acknowledgement + crisis lines (iCall 9152987821, AASRA 9820466726).
    //   `,
    // }
    //
    // const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.validate
    //
    // const message = await client.messages.create({
    //   model: 'claude-sonnet-4-6',
    //   max_tokens: 150,
    //   system: systemPrompt,
    //   messages: [{ role: 'user', content: text }],
    // })
    // return NextResponse.json({ response: message.content[0].text })
    // ════════════════════════════════════════════════════════════════════════

    // MOCK — pick a pool based on mode, rotate by text length
    const pool = MOCK_RESPONSES[mode] || FALLBACK_RESPONSES
    const idx  = (text?.length ?? 0) % pool.length
    return NextResponse.json({ response: pool[idx] })

  } catch {
    // Gentle fallback — the UI should never show a cold error state
    return NextResponse.json({
      response: "i'm here. whatever you wrote, i'm holding it gently.",
    })
  }
}
