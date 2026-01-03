#!/bin/bash
# Vercel Deployment Script

echo "🚀 Deploying FitnessApp to Vercel..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "📦 Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "🔐 Setting up environment variables..."
echo "Please make sure you have these in your Vercel project:"
echo ""
echo "NEXT_PUBLIC_SUPABASE_URL=https://zqpjskpgbrijozczyqya.supabase.co"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_mHLLOatRBng06oab8gWe8g_Bi2SVwAa"
echo "STRAVA_CLIENT_ID=182350"
echo "STRAVA_CLIENT_SECRET=b894f8e64e45ccebdd87517dee74a87b9b3a50be"
echo ""

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo "Your app is now live on Vercel!"
