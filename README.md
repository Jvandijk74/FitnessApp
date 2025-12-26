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
   # Optional but recommended for server-only tasks (never expose to the browser)
   SUPABASE_SERVICE_ROLE_KEY=...
   STRAVA_CLIENT_ID=...
   STRAVA_CLIENT_SECRET=...
   ```
You can copy `.env.example` to `.env.local` and fill in the values from your Supabase project (URL + publishable anon key) and Strava app dashboard (Client ID + generated Client Secret). Keep your real tokens out of source control—especially the Supabase service role key and Strava client secret. When using the provided Supabase project URL and keys, place them in `.env.local` only; do not commit them. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `SUPABASE_URL` and `SUPABASE_ANON_KEY`, which are now automatically read as fallbacks) in your Vercel project settings before deploying so the build can succeed; keep `SUPABASE_SERVICE_ROLE_KEY` scoped to server-only environments.
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Generate the database schema on Supabase with `supabase/schema.sql`.

## Testing
- Lint with `npm run lint`.

## Notes
- The Coach Engine never reorders the fixed weekly cadence.
- Strength prescriptions and logging always follow: Exercise, Sets×Reps, Tempo, Rest, Target RPE/RIR.
- AI chat only explains decisions and cannot override the deterministic engine.

## PR workflow
- Work should be committed on the active branch and accompanied by a `make_pr` invocation to generate the pull request body.
- PRs must summarize user-visible changes and include any testing commands that were attempted, even when external limits (e.g., package registry access) prevent them from running successfully.
