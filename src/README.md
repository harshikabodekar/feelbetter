# feelbetter

> a safe space for your feelings — breathe, vent, and simply feel without judgment.

feelbetter is an AI-powered mental wellness web app that meets you where you are emotionally. pick how you feel, and the app gently becomes what you need — a space to release, reflect, draw, or simply sit with the quiet.

---

## features

### mood check-in
five moods — *empty, overwhelmed, okay-ish, heavy, full* — each opening a calm full-screen experience that mirrors your feeling, then gently shifts toward something healing. the dashboard stays calm and never tints — only mood screens change.

### know your exact mood
not sure what you're feeling? write freely and let the AI name it for you. powered by Google Gemini (primary) with a scikit-learn ML classifier (fallback) — so the feature works even if the AI is unavailable.

### activities

| activity | what it does |
|----------|-------------|
| **spill** | let it out unfiltered — talk to an AI companion (4 modes: validate / honest / guide / sit with me), or use the scream box for raw release that's never saved |
| **pages** | a quiet journal — write freely or record a voice note |
| **compass** | gentle guided self-discovery — slow questions that trace a feeling to its root, then reflect your own words back |
| **canvas** | draw how you feel when words fail — a free scribble space with mood-based colors |

### your entries
everything you choose to save, organized by activity. voice notes play back privately. all entries are PIN-protected.

### privacy PIN
lock your entries behind a 4-digit PIN. set, change, or remove it from settings. stored as a secure hash — never plain text.

### breathe
a 4·7·8 breathing cycle with a calm animated circle.

### ambient sounds
ocean waves, rain, forest, silence — soft background audio while you use the app.

### whisper a thought
a gentle ephemeral space — write something, get a warm reflection. nothing is saved.

### tonight's wind-down
a guided text-based wind-down on a soft timer — for when you need help settling into sleep.

---

## tech stack

**frontend**
- Next.js 14 (App Router)
- React
- Tailwind CSS + custom glassmorphism styling
- fully responsive — desktop, tablet, mobile

**backend**
- Supabase (auth, database, storage)
- Google OAuth
- Row Level Security — all data private per user

**AI**
- Google Gemini API — powers the spill companion + mood detection

**ML**
- Flask + scikit-learn microservice — 5-mood text classifier (93.7% accuracy), used as AI fallback

---

## design philosophy

feelbetter is built around one idea: the app should become what the user needs. it never diagnoses, never pushes, never judges. it validates, reflects, and offers — gently. the visual language (soft aqua gradients, organic blob shapes, calm typography) reinforces a feeling of safety and quiet.

---

## project structure