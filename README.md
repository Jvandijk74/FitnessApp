# Endurance Coach PWA

A production-ready foundation for a deterministic personal training and endurance coaching platform built with Next.js (App Router), TypeScript, Tailwind CSS, Supabase, and Strava OAuth. The weekly structure is immutable and follows the required cadence: Monday easy run, Tuesday full-body strength, Wednesday tempo run, Thursday strength, Friday easy run + strength, Saturday rest, Sunday long run.

## Features
- PWA-ready Next.js app (installable manifest + service worker).
- Supabase schema covering users, plans, workouts, readiness, insights, and Strava connections.
- Deterministic Coach Engine with auditable progression and strict strength format.
- Dashboard with weekly plan, deterministic insights, run and strength logging, and AI chat scaffold (explanatory only).
- Strava OAuth routes with token exchange and connection persistence.

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set environment variables in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   STRAVA_CLIENT_ID=...
   STRAVA_CLIENT_SECRET=...

   # For AI Coach - choose one option:
   # Option 1: Groq (free, works in production)
   GROQ_API_KEY=your_groq_api_key
   LLM_MODEL=llama-3.1-8b-instant

   # Option 2: Ollama (local only)
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=gemma3:4b
   ```
3. Set up AI Coach (choose one):

   **Option A: Groq (Recommended for production)**
   - Get a free API key at https://console.groq.com
   - Add `GROQ_API_KEY` to your `.env.local`
   - Works in both development and production (Vercel)

   **Option B: Ollama (Local development only)**
   - Install from https://ollama.ai
   - Pull a model: `ollama pull gemma3:4b`
   - Runs on http://localhost:11434 by default
   - Only works locally, not on Vercel
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Generate the database schema on Supabase with `supabase/schema.sql`.

## Testing
- Lint with `npm run lint`.

## Notes
- The Coach Engine never reorders the fixed weekly cadence.
- Strength prescriptions and logging always follow: Exercise, Sets×Reps, Tempo, Rest, Target RPE/RIR.
- AI chat only explains decisions and cannot override the deterministic engine.

## PR workflow
- Work should be committed on the active branch and accompanied by a `make_pr` invocation to generate the pull request body.
- PRs must summarize user-visible changes and include any testing commands that were attempted, even when external limits (e.g., package registry access) prevent them from running successfully.
