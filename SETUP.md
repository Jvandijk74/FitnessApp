# FitnessApp Setup Guide

## Overview

Your fitness app is now integrated with **Strava** and **Supabase**! This guide will help you get everything up and running.

## Prerequisites

1. **Supabase Account**: You already have your Supabase URL and anon key configured
2. **Strava App**: You have a Strava application with client ID and secret
3. **Node.js**: Make sure you have Node.js 18+ installed

## Setup Steps

### 1. Database Setup

First, create the database tables in your Supabase project:

1. Go to your Supabase dashboard: https://zqpjskpgbrijozczyqya.supabase.co
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the SQL to create all tables and the demo user

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Your environment variables are already configured in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zqpjskpgbrijozczyqya.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_mHLLOatRBng06oab8gWe8g_Bi2SVwAa

STRAVA_CLIENT_ID=182350
STRAVA_CLIENT_SECRET=f7d804a06b83889763a9eadc4e79bf1e5b269656
```

### 4. Configure Strava OAuth Redirect URI

In your Strava application settings (https://www.strava.com/settings/api):

1. Set the **Authorization Callback Domain** to your app's domain
   - For development: `localhost`
   - For production: your actual domain (e.g., `myapp.com`)

2. The callback URL will be: `http://localhost:3000/api/strava/callback` (development)

### 5. Run the Development Server

```bash
npm run dev
```

Your app will be available at http://localhost:3000

## Features

### Strava Integration

- **Connect Account**: Click the "Connect Strava" button on the dashboard
- **OAuth Flow**: You'll be redirected to Strava to authorize the app
- **Sync Activities**: After connecting, click "Sync Activities" to import your recent runs
- **Automatic Import**: Runs from Strava are automatically tagged with `source: 'strava'`

### Supabase Integration

Your app uses Supabase for:
- **User profiles**: Store threshold pace, HR, and other athlete data
- **Training plans**: Generate and store weekly training plans
- **Activity logs**: Track runs and strength training sessions
- **Insights**: Store AI-generated training insights
- **Strava connections**: Securely store OAuth tokens

### Database Tables

- `users`: Athlete profiles
- `plans`: Weekly training plans
- `workouts`: Generic workout records
- `run_logged`: Logged run activities (manual or Strava)
- `strength_exercises`: Strength exercise prescriptions
- `strength_sets_logged`: Individual set data
- `readiness`: Daily readiness scores
- `insights`: AI-generated insights
- `strava_connections`: Strava OAuth tokens

## Demo User

The app currently uses a demo user (`demo-user`) for development. This user is automatically created when you run the schema SQL.

## API Routes

- `GET /api/strava/auth` - Initiate Strava OAuth flow
- `GET /api/strava/callback` - Handle OAuth callback and save tokens

## Next Steps

1. **Run the schema**: Execute the SQL in your Supabase project
2. **Test the connection**: Start the dev server and connect your Strava account
3. **Sync activities**: Import your recent runs from Strava
4. **Customize**: Modify the coach engine, UI components, or add new features

## Troubleshooting

### Strava OAuth fails

- Check that your redirect URI is correctly configured in Strava settings
- Verify your client ID and secret are correct in `.env.local`

### Database errors

- Make sure you've run the schema SQL in your Supabase project
- Check that the demo user exists: `select * from users where id = 'demo-user'`

### Missing activities after sync

- Check the `run_logged` table in Supabase to see if runs were imported
- Verify your Strava account has recent running activities

## Support

For issues or questions, check the code comments or refer to:
- Supabase docs: https://supabase.com/docs
- Strava API docs: https://developers.strava.com/
- Next.js docs: https://nextjs.org/docs
