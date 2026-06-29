# feelbetter

a safe space for your feelings.

feelbetter is an AI-powered mental wellness web app. it gives people a quiet, judgment-free place to check in with how they feel, talk things through, write or speak their thoughts, and do small calming activities. there is no scoring, no streaks-as-pressure, no diagnosis. the app meets the user where they are and responds gently.

**live:** https://feelbetter-mocha.vercel.app

---

## design philosophy

feelbetter is built around one idea: the app should become what the user needs. it never diagnoses, never pushes, never judges. it validates, reflects, and offers — gently. the visual language (soft aqua gradients, organic blob shapes, calm typography) reinforces a feeling of safety and quiet.

this principle shows up in concrete decisions throughout the product:

- the mood check-in offers five honest options (empty, overwhelmed, okay-ish, heavy, full) instead of a happy-to-sad scale, so no feeling is framed as wrong.
- the AI never gives clinical advice. each conversational mode is tuned to a different need — to be validated, to hear an honest perspective, to be gently guided, or simply to have company while sitting with something.
- private content (journal entries, voice notes) is protected behind an optional PIN, and voice recordings are stored privately and served through short-lived signed URLs, never public links.
- nothing is forced. guided activities can be left at any point, and most reflective features keep nothing at all unless the user chooses to save it.

---

## features

### mood check-in
a five-mood check-in with a two-stage overlay that first acknowledges the feeling ("i see you") and then responds to it ("i've got you"). the moods render as an organic blob cluster on desktop and a clean grid on mobile, both hydration-safe. each check-in is saved to the user's history and surfaced as a seven-day trail in the sidebar.

### spill
a space to let something out. spill offers four AI conversation modes, each with a distinct tone:

- validate — warm, affirming, here to make you feel heard
- honest — a gentle but real outside perspective
- guide — light, non-prescriptive direction
- sit — quiet company, no fixing

spill also includes a scream box, a no-words release for moments that do not need a conversation.

### pages
a private journal with two ways to capture a moment: written entries and voice recordings. voice notes are stored in a private storage bucket and played back through signed URLs that expire, so recordings are never publicly accessible.

### compass
a short, structured three-path reflection for when a feeling is hard to name or a decision is hard to face. responses are saved to the user's entries.

### canvas
a free-draw space with mood-based color palettes, for the times when feelings come out more easily as shapes and color than as words.

### whisper a thought
the app offers a single gentle prompt and invites a response. the AI reflects back warmly. nothing is saved — it is entirely ephemeral by design, a thought spoken once and let go.

### tonight's wind-down
a guided wind-down script that plays line by line on a calm timer, designed to help the user slow down before sleep. text-based and unsaved.

### ambient sounds
looping background ambience — ocean, rain, and forest — that can play underneath any activity. one sound plays at a time, and audio is cleaned up automatically when the user leaves.

### breathe
a functional 4-7-8 breathing timer for quick grounding.

### entries and privacy
all saved content lives behind an optional PIN lock. the PIN is never stored directly — it is hashed with PBKDF2. the entries panel supports browsing saved journal entries and voice notes, with a two-step confirmation before any deletion. settings provide flows to set, change, remove, or reset a forgotten PIN.

---

## tech stack

| layer | technology |
|-------|-----------|
| framework | Next.js (App Router, JavaScript) |
| styling | Tailwind CSS |
| database and auth | Supabase (Postgres, Auth, Storage) |
| primary AI | Google Gemini 2.5-flash |
| ML fallback | Flask microservice with a scikit-learn mood classifier |
| auth methods | email/password, Google OAuth (via Supabase), guest mode |
| hosting | Vercel |

### how the AI layer works
gemini is the primary engine for all conversational and reflective features. for mood detection from free text, the app calls gemini first; if that call fails, it falls back to a separate Flask service running a scikit-learn classifier. the Flask service is optional — when its endpoint is not configured, the app skips it entirely and degrades gracefully, never blocking the user or crashing. the Next.js app is deployed independently of the Flask service.

---

## project structure

```
feelbetter/
├── public/
│   ├── ocean.mp3
│   ├── rain.mp3
│   ├── forest.mp3
│   └── (icons, svgs, splash assets)
├── src/
│   ├── app/
│   │   ├── layout.js              # root layout, fonts, AuthProvider
│   │   ├── globals.css            # global styles, background gradient
│   │   ├── page.js                # splash / landing
│   │   ├── login/
│   │   │   └── page.js            # email, Google OAuth, guest entry
│   │   ├── dashboard/
│   │   │   └── page.js            # mood check-in, sidebar, whisper,
│   │   │                          # wind-down, ambient sounds, breathe
│   │   ├── settings/
│   │   │   └── page.js            # PIN set / change / remove / reset
│   │   ├── activities/
│   │   │   ├── page.js            # activities hub
│   │   │   ├── spill/page.js      # 4 AI modes + scream box
│   │   │   ├── pages/page.js      # written + voice journal
│   │   │   ├── compass/page.js    # 3-path reflection
│   │   │   ├── canvas/page.js     # mood-palette drawing
│   │   │   └── echo/page.js       # reserved (coming soon)
│   │   └── api/
│   │       ├── spill/route.js         # gemini conversation
│   │       ├── detect-mood/route.js   # gemini + ML fallback
│   │       └── whisper/route.js       # gemini reflection
│   └── context/
│       └── AuthContext.js         # session, guest mode, sign-in/out
├── .env.local                     # secrets (gitignored)
├── .gitignore
└── next.config.mjs
```

---

## database

Supabase Postgres holds four tables, each scoped to the authenticated user:

| table | purpose |
|-------|---------|
| mood_entries | each mood check-in and its timestamp |
| journal_entries | written journal content from pages and compass |
| voice_notes | metadata and storage references for voice recordings |
| user_security | PBKDF2 PIN hash and related security state |

voice recordings live in a private Supabase storage bucket and are served through signed, expiring URLs.

> security note: every table and the voice storage bucket should enforce row-level security so that a user can only ever read or write their own rows (a policy of the form `auth.uid() = user_id`). verify these policies are enabled before sharing the app widely.

---

## getting started

### prerequisites
- Node.js 18 or newer
- a Supabase project
- a Google Gemini API key
- (optional) the Flask ML service running locally if you want the mood-classifier fallback

### 1. clone and install
```bash
git clone <your-repo-url>
cd feelbetter
npm install
```

### 2. environment variables
create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

optional, only if you run the Flask ML fallback:

```
ML_ENDPOINT=http://localhost:5000/predict
```

if `ML_ENDPOINT` is not set, the app simply skips the ML fallback and relies on gemini.

> note: Google OAuth is configured inside the Supabase dashboard (Authentication → Providers → Google), not through app environment variables. the app calls Supabase's OAuth flow directly.

### 3. run locally
```bash
npm run dev
```

open http://localhost:3000.

### 4. production build
```bash
npm run build
```

run this before deploying to catch any build-time issues early.

---

## deployment

feelbetter deploys to Vercel from the `master` branch.

1. push your code to GitHub.
2. import the repository into Vercel and let it auto-detect Next.js.
3. add the three required environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`) in the Vercel project settings before the first deploy.
4. deploy. once connected, every push to `master` triggers an automatic redeploy.

after the first deploy, add your live Vercel URL to the allowed redirect URLs in both the Supabase auth settings and the Google Cloud console so that Google sign-in works on the production domain.

the Flask ML service is not hosted on Vercel (Vercel does not run Python servers). it can be deployed separately on a Python-friendly host and wired in later through `ML_ENDPOINT`; the app runs fully without it.

---

## status and roadmap

feelbetter is live and feature-complete for its core experience. a few items are intentionally reserved for later:

- echo activity (placeholder, disabled in the UI)
- a small number of secondary settings actions (export, profile editing)
- hosting the Flask ML fallback in production
- refining the desktop scale-transform so the layout reserves no extra vertical space

---

## a note on intent

feelbetter is a supportive tool, not a substitute for professional care. it is designed to help people pause, name a feeling, and feel a little less alone in a given moment. it does not diagnose, treat, or provide crisis support.
