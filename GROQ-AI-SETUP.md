# 🤖 Groq AI Integration for FitnessApp

Your FitnessApp now has a powerful AI Coach powered by **Groq** and **Llama 3.1**!

## ✅ What's Been Connected

### AI Coach Features
- **Real-time responses** using Groq's ultra-fast LLM API
- **Llama 3.1 8B Instant** model for intelligent coaching
- **Context-aware answers** about your training program
- **Fallback system** for reliability (uses simulated responses if API fails)

### What the AI Coach Can Do
- Explain your training plan and progressive overload
- Answer questions about exercises and techniques
- Provide recovery strategies
- Motivate and encourage you
- Clarify training concepts (RPE, RIR, tempo, etc.)

## 🔧 Configuration

### Environment Variables (Already Set)
```bash
GROQ_API_KEY=gsk_... (already configured in .env.local)
LLM_MODEL=llama-3.1-8b-instant
```

These are already in your `.env.local` file! ✅

### For Vercel Deployment
Add these environment variables in Vercel Dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add these two variables:

```
Key: GROQ_API_KEY
Value: gsk_... (use your actual Groq API key from .env.local)
Environment: Production, Preview, Development

Key: LLM_MODEL
Value: llama-3.1-8b-instant
Environment: Production, Preview, Development
```

3. **Save** and **Redeploy**

## 🚀 How It Works

### Architecture
```
User Question → AICoach Component → /api/coach/chat → LLM Service → Groq API → AI Response
```

### Key Files
- **`components/chat/AICoach.tsx`**: Chat interface
- **`app/api/coach/chat/route.ts`**: API endpoint
- **`lib/coach/llm-service.ts`**: LLM provider abstraction

### Request Flow
1. User types question in AI Coach
2. Frontend sends POST to `/api/coach/chat`
3. API calls `llmService.generateCoachResponse()`
4. LLM service sends request to Groq API
5. Groq returns AI-generated response
6. Response displayed in chat

## 🧪 Testing the AI Coach

### Local Testing
1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/coach

3. Try these questions:
   - "How does progressive overload work?"
   - "What's the difference between RPE and RIR?"
   - "Explain my Monday workout"
   - "How should I approach rest days?"

### Expected Behavior
- ✅ Real AI responses using Groq/Llama 3.1
- ✅ Context-aware answers about YOUR training
- ✅ Fast responses (Groq is ultra-fast!)
- ✅ Fallback to simulated responses if Groq API fails

## 📊 Groq API Info

### Your API Key
- **Provider**: Groq
- **Model**: Llama 3.1 8B Instant
- **Speed**: ~300 tokens/second (ultra-fast!)
- **Cost**: Check your Groq account for usage

### Rate Limits
Groq has generous free tier limits:
- **Requests per minute**: 30
- **Tokens per minute**: 14,400
- **Daily requests**: Varies by plan

If you hit limits, the fallback system kicks in automatically.

## 🔄 Alternative: Ollama (Optional)

If you prefer to run AI locally:

1. Install Ollama: https://ollama.ai
2. Pull a model:
   ```bash
   ollama pull llama2
   ```
3. Update `.env.local`:
   ```bash
   # Comment out Groq
   # GROQ_API_KEY=...

   # Add Ollama config
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama2
   ```

The system automatically switches to Ollama when `GROQ_API_KEY` is not set!

## 🎯 Next Steps

### 1. Test Locally
```bash
npm run dev
# Visit http://localhost:3000/coach
```

### 2. Deploy to Vercel
- Add environment variables (see above)
- Deploy: `vercel --prod`
- Test at your Vercel URL

### 3. Monitor Usage
- Check Groq dashboard for API usage
- Monitor response quality
- Adjust prompts if needed

## 🐛 Troubleshooting

### "Failed to get AI response"
- Check your GROQ_API_KEY is correct
- Verify Groq API is accessible
- Check network connection
- Look at browser console for errors
- Fallback responses will still work!

### Slow Responses
- Groq is typically very fast (~1-2 seconds)
- If slow, check your internet connection
- Verify Groq API status

### API Key Errors
- Make sure key is in `.env.local` AND Vercel
- Check for typos in the key
- Verify key is active in Groq dashboard

## 📝 Customization

### Modify AI Personality
Edit `lib/coach/llm-service.ts`, line ~130:

```typescript
const systemPrompt = `You are an AI Fitness Coach assistant...`
```

### Change Model
Update `.env.local`:
```bash
# Try different Groq models
LLM_MODEL=llama-3.1-70b-versatile  # Larger, smarter
LLM_MODEL=mixtral-8x7b-32768        # Different architecture
```

### Adjust Temperature
Edit `lib/coach/llm-service.ts`, line ~100:
```typescript
temperature: 0.7,  // Lower = more focused, Higher = more creative
```

## 🎉 You're All Set!

Your AI Coach is now powered by Groq and ready to help you with your training!

Try it out at:
- **Local**: http://localhost:3000/coach
- **Production**: https://your-app.vercel.app/coach

Enjoy your intelligent AI fitness coach! 💪🤖
