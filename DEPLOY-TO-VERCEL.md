# 🚀 Deploy FitnessApp to Vercel - Step by Step

## ✅ Pre-Deployment Checklist

All files are committed and pushed: ✅
- Latest code on branch: `claude/enhance-training-analytics-NxcpP`
- All environment variables documented: ✅
- Build tested successfully: ✅

## 🎯 Quick Deploy (5 Minutes)

### Step 1: Go to Vercel Dashboard
1. Visit: **https://vercel.com/new**
2. Sign in with GitHub if needed
3. Click **"Import Git Repository"**

### Step 2: Import Your Repository
1. Find **"FitnessApp"** in the list
2. Click **"Import"**
3. Select branch: **`claude/enhance-training-analytics-NxcpP`**

### Step 3: Configure Project
**Framework Preset:** Next.js (auto-detected) ✅
**Root Directory:** ./ (default) ✅
**Build Command:** `next build` (auto-detected) ✅
**Output Directory:** `.next` (auto-detected) ✅

### Step 4: Add Environment Variables

**CRITICAL:** Click **"Environment Variables"** and add ALL of these:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://zqpjskpgbrijozczyqya.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_mHLLOatRBng06oab8gWe8g_Bi2SVwAa

# Strava OAuth
STRAVA_CLIENT_ID=182350
STRAVA_CLIENT_SECRET=b894f8e64e45ccebdd87517dee74a87b9b3a50be

# Groq AI (for AI Coach)
GROQ_API_KEY=gsk_... (copy from .env.local)
LLM_MODEL=llama-3.1-8b-instant
```

**💡 Tip:** Copy these values from your local `.env.local` file for accuracy.

**Important:** For each variable:
- ✅ Check **Production**
- ✅ Check **Preview**
- ✅ Check **Development**

### Step 5: Deploy!
1. Click **"Deploy"** button
2. Wait 2-3 minutes for build
3. You'll get a URL like: `https://fitness-app-xxx.vercel.app`

## 🎉 Post-Deployment

### 1. Update Strava Redirect URL
After deployment:
1. Go to https://www.strava.com/settings/api
2. Update **Authorization Callback Domain** to your new Vercel URL:
   ```
   https://your-app-name.vercel.app
   ```
3. Save changes

### 2. Test Your Deployment

Visit your Vercel URL and test:
- ✅ Homepage loads
- ✅ Navigate to `/create-training`
- ✅ Create a workout template
- ✅ View on `/plan` page
- ✅ Go to `/coach` and ask AI a question
- ✅ Check `/analytics` page

### 3. Verify Database Connection
- Templates should save to Supabase
- Exercises should load (60+ exercises)
- Workout logging should work

## 📊 What's Deployed

Your production deployment includes:

### Core Features
- ✅ Create Training page with 60+ exercises
- ✅ Custom workout templates
- ✅ Training Plan with week navigation
- ✅ Progressive overload tracking
- ✅ Volume tracking by muscle group

### AI Features
- ✅ Groq AI-powered coaching (Llama 3.1)
- ✅ Real-time AI responses
- ✅ Context-aware training guidance

### Analytics
- ✅ Pace tracking per week
- ✅ Performance insights
- ✅ Strava integration

### Database
- ✅ Supabase integration
- ✅ Exercise library (60+ exercises)
- ✅ Template storage
- ✅ Workout logging

## 🔧 Troubleshooting

### Build Fails?
- Check all environment variables are set
- Verify no typos in variable names
- Check build logs in Vercel dashboard

### "Cannot connect to database"?
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
- Run the database reset script in Supabase

### AI Coach not working?
- Verify `GROQ_API_KEY` is set correctly
- Check Groq API status
- Fallback responses should still work

### Strava OAuth fails?
- Update redirect URL in Strava settings
- Must use production Vercel URL (not localhost)
- Check `STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET`

## 🎯 Environment Variables Reference

| Variable | Value | Purpose |
|----------|-------|---------|
| NEXT_PUBLIC_SUPABASE_URL | https://zqpjskpgbrijozczyqya.supabase.co | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | sb_publishable_... | Supabase anonymous key |
| STRAVA_CLIENT_ID | 182350 | Strava OAuth app ID |
| STRAVA_CLIENT_SECRET | b894f8e64e45ccebdd87517dee74a87b9b3a50be | Strava OAuth secret |
| GROQ_API_KEY | gsk_... (from .env.local) | Groq AI API key |
| LLM_MODEL | llama-3.1-8b-instant | AI model to use |

**Note:** All actual credentials are in your local `.env.local` file.

## 🔄 Redeploying After Changes

After making code changes:
1. Commit and push to your branch
2. Vercel auto-deploys on push! ✨
3. Or click "Redeploy" in Vercel dashboard

## 📱 Share Your App

Once deployed, share your app:
- Production URL: `https://your-app.vercel.app`
- Dashboard: `https://your-app.vercel.app/dashboard`
- Create Training: `https://your-app.vercel.app/create-training`
- AI Coach: `https://your-app.vercel.app/coach`

## 🎊 You're Live!

Your FitnessApp is now deployed and accessible worldwide! 🌍

Features available:
- 🏋️ Custom workout builder
- 📊 Training analytics
- 🤖 AI coaching
- 💪 Progressive overload tracking
- 📈 Performance insights

Enjoy your deployed app! 🚀
